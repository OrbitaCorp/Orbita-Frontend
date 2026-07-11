import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Get('barcodes')
  barcodes() {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: CreateProductDto) {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Put(':id')
  @Roles('owner', 'admin')
  update(@Param('id') id: string, @Body() dto: CreateProductDto) {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@Param('id') id: string) {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Post(':id/images')
  @Roles('owner', 'admin')
  addImage(@Param('id') id: string) {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Delete(':id/images/:imageId')
  @Roles('owner', 'admin')
  removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    void this.productsService;
    return { message: 'not implemented' };
  }

  @Patch(':id/images/reorder')
  @Roles('owner', 'admin')
  reorderImages(@Param('id') id: string, @Body() dto: ReorderImagesDto) {
    void this.productsService;
    return { message: 'not implemented' };
  }
}
