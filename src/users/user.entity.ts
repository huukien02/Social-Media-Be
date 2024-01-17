import { Comment } from 'src/comment/comment.entity';
import { Post } from 'src/post/post.entity';
import { Reaction } from 'src/post/post.reaction.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Friendship } from './friendship.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ nullable: true, default: null })
  avatar: string | null;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Reaction, (reaction) => reaction.user)
  reactions: Reaction[];

  // friend
  @OneToMany(() => Friendship, (friendship) => friendship.user)
  friendships: Friendship[];
  friends: any;

}
