import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from 'src/entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { ProductAccessMiddleware } from 'src/product-access.middleware';
@Module({
    imports: [
        UserModule,
        TypeOrmModule.forFeature([Product]),
    ],
    controllers: [ProductController],
    providers: [ProductService],
    exports: [ProductService]
  })
  export class ProductModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(ProductAccessMiddleware)
        .forRoutes({ path: 'product/:productId', method: RequestMethod.PUT },
            { path: 'product/:productId', method: RequestMethod.DELETE }
        );
    }
}