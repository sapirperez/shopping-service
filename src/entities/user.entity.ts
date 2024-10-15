import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Product } from './product.entity';
import { Purchase } from './purchase.entity';

@Entity('users')
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  userName: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];

  @OneToMany(() => Purchase, (purchase) => purchase.user)
  purchases: Purchase[];
}
