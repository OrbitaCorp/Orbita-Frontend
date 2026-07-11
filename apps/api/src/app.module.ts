import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';

import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { BranchesModule } from './branches/branches.module';
import { MembersModule } from './members/members.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { CashModule } from './cash/cash.module';
import { MercadopagoModule } from './mercadopago/mercadopago.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ReturnsModule } from './returns/returns.module';
import { ConversationsModule } from './conversations/conversations.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AuditModule } from './audit/audit.module';
import { ReportsModule } from './reports/reports.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PlatformModule } from './platform/platform.module';
import { DomainsModule } from './domains/domains.module';
import { StorefrontModule } from './storefront/storefront.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    AuthModule,
    BusinessesModule,
    BranchesModule,
    MembersModule,
    RolesModule,
    CategoriesModule,
    TagsModule,
    ProductsModule,
    InventoryModule,
    CustomersModule,
    OrdersModule,
    PaymentsModule,
    CashModule,
    MercadopagoModule,
    DiscountsModule,
    ReturnsModule,
    ConversationsModule,
    MessageTemplatesModule,
    ReviewsModule,
    AuditModule,
    ReportsModule,
    SubscriptionsModule,
    PlatformModule,
    DomainsModule,
    StorefrontModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
