import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { Repository } from 'typeorm';
import { IProductStatistics, ITotalStatistics } from './interfaces';
import { ProductService } from 'src/product/product.service';

@Injectable()
export class PurchaseService {
    static readonly TOP = 5;

    constructor(
        @InjectRepository(Purchase)
        private purchaseRepository: Repository<Purchase>,
        private productService: ProductService
      ) {}
      
    async productStatistics(productId :string): Promise<IProductStatistics> {
        const product = await this.productService.getProductById(productId);
        const query = this.purchaseRepository.createQueryBuilder('purchase')
            .innerJoin('purchase.product', 'product')
            .innerJoin('purchase.user', 'user')
            .where('product.id = :productId', { productId });           
  
        const moneyPaid = (await query.select('SUM(purchase.price)').getRawOne()).sum;
        const numOfItemsSold = (await query.select('SUM(purchase.quantity)').getRawOne()).sum;
        const customersNames = await query.select('user.userName', 'username').distinct().getRawMany();
            
        return {
            productId,
            productName: product.productName,
            numOfItemsSold,
            numOfItemsLeft: product.quantity,
            moneyPaid,
            customersNames
        };
    }

    async totalStatistics(): Promise<ITotalStatistics>{
        const numberOfProducts = (await this.productService.getProducts()).total;
        const availableProducts = await this.productService.getAvailableProducts();
        const allMoneyPaid = (await this.purchaseRepository.createQueryBuilder('purchase')
            .select('SUM(purchase.price)').getRawOne()).sum;
        const topSellerProducts = await this.purchaseRepository.createQueryBuilder('purchase')
            .innerJoin('purchase.product', 'product')
            .select(['product.productName AS name', 'SUM(purchase.quantity) AS count'])
            .groupBy('product.id')
            .orderBy('count', 'DESC')
            .limit(PurchaseService.TOP).getRawMany();
        const topSellers = await this.purchaseRepository.createQueryBuilder('purchase')
            .innerJoin('purchase.product', 'product')
            .innerJoin('product.user', 'user', 'product.userId = user.id')
            .select(['user.userName as name', 'SUM(purchase.quantity) AS count'])
            .groupBy('user.id')
            .orderBy('count', 'DESC')
            .limit(PurchaseService.TOP).getRawMany();
        const topBuyers = await this.purchaseRepository.createQueryBuilder('purchase')
            .innerJoin('purchase.user', 'user')
            .select(['user.userName AS name', 'SUM(purchase.quantity) AS count'])
            .groupBy('user.id')
            .orderBy('count', 'DESC')
            .limit(PurchaseService.TOP).getRawMany();

        const allProducts: Product[] = (await this.productService.getProducts()).products;
        const allProductsStatistics: IProductStatistics[] = await Promise.all(allProducts.map(async (product: Product) => 
            await this.productStatistics(product.id)
        ));
        return {
            numberOfProducts,
            ...availableProducts,
            allMoneyPaid,
            topSellerProducts,
            topSellers,
            topBuyers,
            allProductsStatistics
        };
    }
}
