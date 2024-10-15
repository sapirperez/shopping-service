import { Controller, Get, Post, Query, Headers, Body, Param, Put, UseInterceptors, Delete } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductAccessMiddleware } from 'src/product-access.middleware';
import { AddProductDto, UpdateProductDto, BuyProductDto } from './dto';
import { IAddProductResponse, IProductsResponse } from './interfaces';
import { Product } from 'src/entities/product.entity';
import { IStatusResponse } from 'src/shared/interfaces/status-response.interface';

@Controller('product')
export class ProductController {
    constructor(private productService: ProductService) {}

    @Get()
    getProducts(
        @Query('orderby') orderBy?: string, 
        @Query('searchPhrase') searchPhrase?: string
    ): Promise<IProductsResponse> {
      return this.productService.getProducts(orderBy, searchPhrase);
    }

    @Post()
    addProduct(
        @Headers('userId') userId: string, 
        @Body() addProductDto: AddProductDto
    ): Promise<IAddProductResponse> {
        return this.productService.addProduct(userId, addProductDto);
    }

    @Post(':productId')
    buyProduct(
        @Headers('userId') userId: string, 
        @Param('productId') productId: string, 
        @Body() buyProductDto: BuyProductDto
    ): Promise<IStatusResponse> {
        return this.productService.buyProduct(userId, productId, buyProductDto);
    }

    @UseInterceptors(ProductAccessMiddleware)
    @Put(':productId')
    updateProduct(@Param('productId') productId: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
        return this.productService.updateProduct(productId, updateProductDto);
    }

    @UseInterceptors(ProductAccessMiddleware)
    @Delete(':productId')
    deleteProduct(@Param('productId') productId: string): Promise<IStatusResponse> {
        return this.productService.deleteProduct(productId);
    }

}
