import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { UpsertCategoryDto } from './dto/upsert-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    void this.categoriesService;
    return { message: 'not implemented' };
  }

  @Patch('reorder')
  @Roles('owner', 'admin')
  reorder(@Body() dto: ReorderCategoriesDto) {
    void this.categoriesService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: UpsertCategoryDto) {
    void this.categoriesService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: UpsertCategoryDto) {
    void this.categoriesService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@Param('id') id: string) {
    void this.categoriesService;
    return { message: 'not implemented' };
  }
}
