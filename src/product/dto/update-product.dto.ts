import { IsOptional, IsPositive } from 'class-validator';

export class UpdateProductDto {
    @IsOptional()
    @IsPositive()
    price?: number;

    @IsOptional()
    @IsPositive()
    quantity?: number;
  }