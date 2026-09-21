import { Body ,Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/login.dto/login.dto';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService, 
        private readonly usersService: UsersService
    ) {}

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.authService.login(body)
    }

    @Post('refresh')
    refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refresh(body.refresh_token);
    }

    @Post('logout')
    logout(@Body() body: RefreshTokenDto) {
        return this.authService.logout(body.refresh_token);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() request: any) {
        return this.usersService.getMyProfile(request.user.sub);
    }
}