import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user = await this.prisma.user.findUnique({
            where: {
                email,
            }
        })

        if(!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const isPasswordValid = await bcrypt.compare(
            password, 
            user.password
        )

        if(!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        }

        const accessToken = this.jwtService.sign(payload);

        const refreshTokenJti = randomUUID();

        const refreshPayload = {
            ...payload,
            jti: refreshTokenJti,
        };

        const refreshToken = this.jwtService.sign(
            refreshPayload,
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d',
            }
        )

        const refreshTokenHash = await bcrypt.hash(
            refreshToken,
            10,
        )

        await this.prisma.session.create({
            data: {
                refreshTokenHash,
                refreshTokenJti,
                userId: user.id,
                expiresAt: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                )
            }
        })

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        }
    }

    async refresh(refreshToken: string) {
        let payload: any;

        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException(
                'Refresh token inválido'
            );
        }

        const session = await this.prisma.session.findFirst({
            where: {
                refreshTokenJti: payload.jti,
                userId: payload.sub,
                revokedAt: null,
            },
        });

        if(!session) {
            throw new UnauthorizedException(
                'Refresh token inválido o revocado',
            );
        }

        const isValid = await bcrypt.compare(
            refreshToken,
            session.refreshTokenHash,
        )

        if(!isValid) {
            throw new UnauthorizedException(
                'Refresh token inválido',
            )
        }

        if(session.expiresAt < new Date()) {
            throw new UnauthorizedException(
                'Refresh token expirado',
            )
        }

        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            },
        });

        if(!user) {
            throw new UnauthorizedException(
                'Usuario no encontrado',
            );
        }

        const newPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const newAccessToken = this.jwtService.sign(newPayload);

        const newRefreshTokenJti = randomUUID();

        const newRefreshPayload = {
            ...newPayload,
            jti: newRefreshTokenJti,
        }

        const newRefreshToken = this.jwtService.sign(
            newRefreshPayload,
            {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d',
            },
        );

        const newRefreshTokenHash = await bcrypt.hash(
            newRefreshToken,
            10,
        );

        await this.prisma.session.update({
            where: {
                id: session.id
            },
            data: {
                refreshTokenHash: newRefreshTokenHash,
                refreshTokenJti: newRefreshTokenJti,
                expiresAt: new Date(
                    Date.now() + 7 * 24 * 60 * 60 * 1000,
                ),
            },
        });

        return {
            access_token: newAccessToken,
            refresh_token: newRefreshToken,
        }
    }

    async logout(refreshToken: string) {
        let payload: any;

        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch {
            throw new UnauthorizedException(
                'Refresh token inválido',
            );
        }

        const session = await this.prisma.session.findFirst({
            where: {
                refreshTokenJti: payload.jti,
                userId: payload.sub,
                revokedAt: null,
            },
        });

        if(!session) {
            throw new UnauthorizedException(
                'Sesión inválida o ya cerrada',
            );
        }

        const isValid = await bcrypt.compare(
            refreshToken,
            session.refreshTokenHash,
        );

        if(!isValid) {
            throw new UnauthorizedException(
                'Refresh token inválido',
            );
        }

        await this.prisma.session.update({
            where: {
                id: session.id,
            },
            data: {
                revokedAt: new Date(),
            },
        });

        return {
            message: 'Sesión cerrada correctamente',
        };
    }
}
