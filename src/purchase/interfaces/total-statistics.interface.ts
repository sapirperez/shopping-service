import { IProductStatistics } from "./product-statistics.interface";
import { ITopInfo } from "./top-info.interface";

export interface ITotalStatistics {
    numberOfProducts: number;
    numberOfAvailableProducts: number;
    quantitySumOfAllProducts: number;
    allMoneyPaid: number;
    topSellerProducts: ITopInfo[];
    topSellers: ITopInfo[];
    topBuyers: ITopInfo[];
    allProductsStatistics: IProductStatistics[];
}