import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { DataSource, Repository } from 'typeorm';
import { IAddProductResponse, IProductsResponse } from './interfaces';
import { UserService } from 'src/user/user.service';
import { User } from 'src/entities/user.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { AddProductDto } from './dto/add-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BuyProductDto } from './dto/buy-product.dto';
import { IStatusResponse } from 'src/shared/interfaces/status-response.interface';
const { v4: uuidv4 } = require('uuid');

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private userService: UserService,
        private dataSource: DataSource
      ) {}

    async getProductById(id: string): Promise<Product> {
        const product = await this.productRepository.findOneBy({ id });
        if (!product) {
            throw new HttpException("Product not found", HttpStatus.NOT_FOUND);
        }
        return product;
    }

    async getProducts(orderBy?: string, searchPhrase?: string): Promise<IProductsResponse> {
        const productsQuery = this.productRepository.createQueryBuilder('product');
        if(orderBy) {
            if(['productName', 'price'].includes(orderBy)) {
                productsQuery.orderBy(`product.${orderBy}`);
            } else {
                throw new HttpException('orderBy must be one of the following values: productName, price', HttpStatus.BAD_REQUEST);
            }
        }
        
        if(searchPhrase) {
            productsQuery.where('product.productName LIKE :searchPhrase', { searchPhrase: `%${searchPhrase}%` })
        }
        const total = await productsQuery.getCount();
        const products = await productsQuery.getMany();
        return { total, products };
    }

    async getAvailableProducts() {
        const availableProductsQuery = this.productRepository
            .createQueryBuilder('product')
            .where('quantity > 0');
        const numberOfAvailableProducts: number = await availableProductsQuery.getCount();
        const quantitySumOfAllProducts: number = (
            await availableProductsQuery
            .select('SUM(product.quantity)')
            .getRawOne()
        ).sum;
        return {
            numberOfAvailableProducts,
            quantitySumOfAllProducts
        }
    }

    async addProduct(userId: string, addProductDto: AddProductDto): Promise<IAddProductResponse> {
        const user = await this.userService.getUserById(userId);
        const newProduct: Product = new Product();
        newProduct.id = uuidv4();
        newProduct.productName = addProductDto.productName;
        newProduct.price = addProductDto.price;
        newProduct.quantity = addProductDto.quantity;
        newProduct.user = user;

        const response = await this.productRepository.save(newProduct);
        return { productId: response.id };
    }

    async updateProduct(productId: string, updateProductDto: UpdateProductDto): Promise<Product> {
        const product = await this.getProductById(productId);
        product.quantity = updateProductDto.quantity ?? product.quantity;
        product.price = updateProductDto.price ?? product.price;

        return this.productRepository.save(product);
    }

    async deleteProduct(productId: string): Promise<IStatusResponse> {
        try {
            await this.productRepository.delete(productId);
            return {
                message: "Product deletion was successfull"
            };
        } catch(e) {
            throw new HttpException(`Product deletion failed: ${e.message}`, e.status);
        }
    }

    async buyProduct(userId: string, productId: string, buyProductDto: BuyProductDto): Promise<IStatusResponse> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        
        try {
            const product = await queryRunner.manager.findOne(Product, { where: { id: productId } });
            if(!product) {
                throw new HttpException("Product not found", HttpStatus.NOT_FOUND);
            }
            if(product.user.id === userId) {
                throw new HttpException("you cannot buy the products added by you", HttpStatus.FORBIDDEN);
            }
            const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
            if(!user) {
                throw new HttpException("user not found", HttpStatus.NOT_FOUND);
            }
            
            const quantityLeft = product.quantity - buyProductDto.quantity;
            if(quantityLeft < 0) {
                throw new HttpException("There is not enough quantity of the product", HttpStatus.FORBIDDEN);
            }
            product.quantity = quantityLeft;
            await queryRunner.manager.save(product);

            const purchase: Purchase = new Purchase();
            purchase.id = uuidv4();
            purchase.price = product.price * buyProductDto.quantity;
            purchase.quantity = buyProductDto.quantity;
            purchase.product = product;
            purchase.user = user;
            await queryRunner.manager.save(purchase);

            await queryRunner.commitTransaction();
            return {
                message: "The purchase was successful"
            };
        } catch(e) {
            await queryRunner.rollbackTransaction();
            throw new HttpException(`The purchase failed: ${e.message}`, e.status);
        } finally {
            await queryRunner.release();
        }
    }
}
