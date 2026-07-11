import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    void this.rolesService;
    return { message: 'not implemented' };
  }
}
