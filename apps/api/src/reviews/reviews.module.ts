import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ProductReviewsController } from './product-reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [ReviewsController, ProductReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
