import { Product } from "src/entities/product.entity";

export interface IProductsResponse {
    products: Product[];
    total: number;
}
