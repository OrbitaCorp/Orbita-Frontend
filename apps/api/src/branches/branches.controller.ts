import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { BranchesService } from './branches.service';
import { UpsertBranchDto } from './dto/upsert-branch.dto';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll() {
    void this.branchesService;
    return { message: 'not implemented' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    void this.branchesService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: UpsertBranchDto) {
    void this.branchesService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: UpsertBranchDto) {
    void this.branchesService;
    return { message: 'not implemented' };
  }
}
