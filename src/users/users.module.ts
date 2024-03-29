import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { AuthService } from 'src/auth/auth.service';
import { Post } from 'src/post/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Post])],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
})
// export class UsersModule {}
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'users/create', method: RequestMethod.ALL },
        { path: 'users/create/from-csv', method: RequestMethod.ALL },
        { path: 'users/send-email', method: RequestMethod.ALL },
      )
      .forRoutes('users');
  }
}

