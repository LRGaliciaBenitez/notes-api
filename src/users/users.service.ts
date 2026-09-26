import { 
  ConflictException,
  ForbiddenException,
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';
import { Prisma } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
   constructor(
    private readonly prisma: PrismaService,
   ){}

    async getUsers() {
      return this.prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          role: true
        }
      });
      
    }

    async getUserById(
      id:number,
      userId:number,
      role:string,
    ) {
      const user =await this.prisma.user.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          age: true
        }
      });
       
      if(!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if(id !== userId && role !== 'MASTER') {
        throw new ForbiddenException(
          'No tienes permiso para consultar este usuario',
        )
      }

      return user;
    }

    async getMyProfile(
      userId: number
    ) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          role: true,
        }
      })

      if(!user) {
        throw new NotFoundException(`user with id ${userId} not found`);
      }

      return user;
    }

    async createUser(createUserDto: CreateUserDto) {
      const { name, email, password, age } = createUserDto;

      const hashedPassword = await bcrypt.hash(password, 10);

      try {
        return await this.prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            age,
          },
          select: {
            id: true,
            name: true,
            email: true,
            age: true
          }
        });
      } catch(error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new ConflictException('El email ya está registrado')
        }

        throw error;
        
      }
    }

    async deleteUser(
      id: number, 
      userId: number,
      role: string,
    ) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });

      if(!user) {
        throw new NotFoundException(`User with id ${id} not found`)
      }

      if(id !== userId && role !== 'MASTER') {
        throw new ForbiddenException(
          'No tienes permiso para eliminar este usuario'
        )
      }

      return this.prisma.user.delete({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
        },
      });
    }

    async updateUser(
      id: number, 
      data: UpdateUserDto,
      userId: number,
      role: string,
    ) {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id
        },
      });

      if(!user) {
        throw new NotFoundException(`User with id ${id} not found`)
      }

      if(id !== userId && role !== 'MASTER') {
        throw new ForbiddenException(
          'No tienes permiso para modificar este usuario'
        )
      }

      return this.prisma.user.update({
        where: {
          id:id 
        },
        data, 
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
        }
      });
    }

    async updateRole(
      id:number,
      role: Role,
    ) {

      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });

      if(!user) {
        throw new NotFoundException(
          `User with id ${id} not found`
        )
      }

      return this.prisma.user.update({
        where: {
          id,
        },
        data: {
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          age: true,
          role: true,
        }
      })
    }
}
