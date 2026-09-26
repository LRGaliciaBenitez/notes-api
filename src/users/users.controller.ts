import { 
  Body,
  Controller, 
  Delete, 
  Get, 
  Param, 
  Post,
  Patch,
  Req,
  UseGuards
 } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles('MASTER')
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.usersService.createUser(body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(
    @Param('id') id: string,
    @Req() request:any,
  ) {
      return this.usersService.getUserById(
        Number(id),
        request.user.sub,
        request.user.role,
      );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteUser(
    @Param('id') id:string,
    @Req() request: any,
  ) {
    return this.usersService.deleteUser(
      Number(id),
      request.user.sub,
      request.user.role,
    );
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateUser(
    @Param('id') id:string,
    @Body() body: UpdateUserDto,
    @Req() request: any,
  ){
    return this.usersService.updateUser(
      Number(id), 
      body,
      request.user.sub,
      request.user.role,
    )
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('MASTER')
  async updateRole(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
    @Req() request: any,
  ) {
    return this.usersService.updateRole(
      Number(id),
      body.role,
      request.user.sub,
    )
  }
}
