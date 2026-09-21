import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
    )

    const request = context.switchToHttp().getRequest();

    const userRole = request.user.role;

    const hasRole = requiredRoles.includes(userRole);

    if(!hasRole) {
        throw new ForbiddenException(
            'No tienes permiso para acceder a este recurso'
        )
    }

    return true;
  }
}