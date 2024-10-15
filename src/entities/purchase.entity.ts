import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';

@Entity('purchases')
export class Purchase {
    @PrimaryColumn()
    id: string;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @ManyToOne(() => User, (user) => user.purchases)
    user: User;

    @ManyToOne(() => Product, (product) => product.purchases, { onDelete: 'CASCADE' })
    product: Product;
}
