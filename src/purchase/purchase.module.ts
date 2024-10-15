import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ProductModule } from 'src/product/product.module';
import { PurchaseController } from './purchase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Purchase } from 'src/entities/purchase.entity';
import { UserModule } from 'src/user/user.module';
import { ProductAccessMiddleware } from 'src/product-access.middleware';

@Module({
    imports: [
      UserModule,
      ProductModule,
      TypeOrmModule.forFeature([Purchase]),
    ],
    controllers: [PurchaseController],
    providers: [PurchaseService],
    exports: [PurchaseService]
  })
  export class PurchaseModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(ProductAccessMiddleware)
        .forRoutes({ path: 'purchase/:productId', method: RequestMethod.GET });
    }
  }