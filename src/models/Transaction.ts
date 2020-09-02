import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  JoinColumn,
  Entity,
  ManyToOne,
} from 'typeorm';
import Category from './Category';

@Entity('transactions')
class Transaction {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Column()
  title: string;

  @Column()
  type: 'income' | 'outcome';

  @Column({ type: 'money' })
  value: number;

  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

export default Transaction;
