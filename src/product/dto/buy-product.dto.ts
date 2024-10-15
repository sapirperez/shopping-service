import { IsNotEmpty, IsPositive } from 'class-validator';

export class BuyProductDto {
    @IsPositive()
    @IsNotEmpty()
    quantity: number;
  }