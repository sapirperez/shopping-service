import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { ProductAccessMiddleware } from 'src/product-access.middleware';
import { IProductStatistics, ITotalStatistics } from './interfaces';

@Controller('purchase')
export class PurchaseController {
    constructor(private purchaseService: PurchaseService) {}
    
    @UseInterceptors(ProductAccessMiddleware)
    @Get(':productId')
    productStatistics(@Param('productId') productId: string): Promise<IProductStatistics> {
        return this.purchaseService.productStatistics(productId);
    }

    @Get()
    totalStatistics(): Promise<ITotalStatistics> {
        return this.purchaseService.totalStatistics();
    }
}
