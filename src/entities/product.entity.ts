import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany, Decimal128 } from 'typeorm';
import { User } from './user.entity';
import { Purchase } from './purchase.entity';

@Entity('products')
export class Product {
  @PrimaryColumn()
  id: string;

  @Column()
  productName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @OneToMany(() => Purchase, (purchase) => purchase.product, { cascade: true })
  purchases: Purchase[];
}
