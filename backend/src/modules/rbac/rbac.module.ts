import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { RolePermission } from './entities/role-permission.entity.js';
import { RbacSeederService } from './rbac-seeder.service.js';
import { RbacController } from './rbac.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  controllers: [RbacController],
  providers: [RbacSeederService],
  exports: [RbacSeederService, TypeOrmModule],
})
export class RbacModule {}
