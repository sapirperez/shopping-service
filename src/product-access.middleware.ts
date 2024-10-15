import { HttpException, HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product/product.service';

@Injectable()
export class ProductAccessMiddleware implements NestMiddleware {
    constructor(private productService: ProductService) {}
    async use(req: Request, res: Response, next: NextFunction) {
        const userId = req.headers['userid'] as string;
        const productId = req.params.productId;
        const product = await this.productService.getProductById(productId);

        if (product.user.id !== userId) {
            throw new HttpException("You can only access products added by you", HttpStatus.FORBIDDEN);
        }
        next();
    }
}
