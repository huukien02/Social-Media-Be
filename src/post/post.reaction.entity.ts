import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Post } from './post.entity';

@Entity()
export class Reaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @ManyToOne(() => Post, (post) => post.reactions)
  post: Post;

  @ManyToOne(() => User, (user) => user.reactions)
  user: User;

  @Column({ nullable: true })
  userId: number;
}
