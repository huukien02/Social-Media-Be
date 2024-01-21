import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterConfigModule } from './Multer/ multer.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { ConfigurationModule } from './config/configuration.module';
import { PostModule } from './post/post.module';
import { User } from './users/user.entity';
import { Post } from './post/post.entity';
import { Comment } from './comment/comment.entity';
import { CommentModule } from './comment/comment.module';
import { Reaction } from './post/post.reaction.entity';
import { Friendship } from './users/friendship.entity';
@Module({
  imports: [
    ConfigurationModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Post, Comment, Reaction, Friendship],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'avatars'),
      serveRoot: '/avatars',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'posts_images'),
      serveRoot: '/posts_images',
    }),
    MailerModule.forRoot({
      transport: {
        service: process.env.MAILER_SERVICE,
        auth: {
          user: process.env.MAILER_USER,
          pass: process.env.MAILER_PASSWORD,
        },
      },
      defaults: {
        from: process.env.MAILER_FROM,
      },
    }),
    TypeOrmModule.forFeature([User, Post]),
    MulterConfigModule,
    AuthModule,
    UsersModule,
    PostModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
