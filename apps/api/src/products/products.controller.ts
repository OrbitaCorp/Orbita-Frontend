import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequirePermission } from '../common/decorators/require-permission.decorator';
import { CurrentBusiness } from '../common/decorators/current-business.decorator';
import { AuthContext } from '../common/types/auth-context.type';
import { assertMemberContext } from '../common/utils/assert-member-context';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { ReorderImagesDto } from './dto/reorder-images.dto';
import { AddImageDto } from './dto/add-image.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('catalog.view')
  findAll(@CurrentBusiness() ctx: AuthContext, @Query() query: FindProductsQueryDto) {
    const member = assertMemberContext(ctx);
    return this.productsService.findAll(member.businessId, query);
  }

  // Declarado antes de ':id' — si no, Nest interpreta "barcodes" como un :id.
  @Get('barcodes')
  @RequirePermission('catalog.view')
  barcodes(
    @CurrentBusiness() ctx: AuthContext,
    @Query('variantIds') variantIds?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const member = assertMemberContext(ctx);
    const ids = variantIds ? variantIds.split(',').filter(Boolean) : undefined;
    return this.productsService.barcodes(member.businessId, ids, categoryId);
  }

  @Get(':id')
  @RequirePermission('catalog.view')
  findOne(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    return this.productsService.findOne(member.businessId, id);
  }

  @Post()
  @RequirePermission('catalog.manage')
  create(@CurrentBusiness() ctx: AuthContext, @Body() dto: CreateProductDto) {
    const member = assertMemberContext(ctx);
    return this.productsService.create(member.businessId, dto);
  }

  @Put(':id')
  @RequirePermission('catalog.manage')
  update(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: CreateProductDto) {
    const member = assertMemberContext(ctx);
    return this.productsService.update(member.businessId, id, dto);
  }

  @Delete(':id')
  @RequirePermission('catalog.manage')
  remove(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string) {
    const member = assertMemberContext(ctx);
    return this.productsService.remove(member.businessId, id);
  }

  @Post(':id/images')
  @RequirePermission('catalog.manage')
  @UseInterceptors(FileInterceptor('file'))
  addImage(
    @CurrentBusiness() ctx: AuthContext,
    @Param('id') id: string,
    @Body() dto: AddImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const member = assertMemberContext(ctx);
    if (!file) throw new BadRequestException('Falta el archivo "file"');
    return this.productsService.addImage(member.businessId, id, dto, file);
  }

  @Delete(':id/images/:imageId')
  @RequirePermission('catalog.manage')
  removeImage(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Param('imageId') imageId: string) {
    const member = assertMemberContext(ctx);
    return this.productsService.removeImage(member.businessId, id, imageId);
  }

  @Patch(':id/images/reorder')
  @RequirePermission('catalog.manage')
  reorderImages(@CurrentBusiness() ctx: AuthContext, @Param('id') id: string, @Body() dto: ReorderImagesDto) {
    const member = assertMemberContext(ctx);
    return this.productsService.reorderImages(member.businessId, id, dto);
  }
}
