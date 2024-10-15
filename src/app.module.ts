import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { PurchaseModule } from './purchase/purchase.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ 
    TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'Aa123456',
    database: 'shopping-app',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
  }),
  ProductModule,
  PurchaseModule,
  UserModule
]
})
export class AppModule {}
