import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Column,
  Entity,
} from 'typeorm';

@Entity('category')
class Category {
  @PrimaryGeneratedColumn({ type: 'uuid' })
  id: string;

  @Column()
  title: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}

export default Category;
