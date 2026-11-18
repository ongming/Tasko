import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleScope } from './entities/role.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Get()
  async getRoles(@Query('scope') scope?: RoleScope) {
    if (scope) {
      return this.roleRepository.find({ where: { scope } });
    }
    return this.roleRepository.find();
  }
}
