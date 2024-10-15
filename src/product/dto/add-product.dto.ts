import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class AddProductDto {
    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsPositive()
    @IsNotEmpty()
    price: number;

    @IsPositive()
    @IsNotEmpty()
    quantity: number;
  }