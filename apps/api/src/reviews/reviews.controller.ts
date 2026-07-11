import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { FullModeOnly } from '../common/decorators/full-mode-only.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { HideReviewDto } from './dto/hide-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @FullModeOnly()
  create(@Body() dto: CreateReviewDto) {
    void this.reviewsService;
    return { message: 'not implemented' };
  }

  @Get('eligibility')
  @FullModeOnly()
  eligibility() {
    void this.reviewsService;
    return { message: 'not implemented' };
  }

  @Patch(':id/hide')
  @Roles('owner', 'admin')
  @FullModeOnly()
  hide(@Param('id') id: string, @Body() dto: HideReviewDto) {
    void this.reviewsService;
    return { message: 'not implemented' };
  }
}
