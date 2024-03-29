import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as path from 'path';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { Readable } from 'stream';
import * as papa from 'papaparse';
import { Repository } from 'typeorm';
import { Post } from 'src/post/post.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async findAll(currentUser: any): Promise<any> {
    try {
      const { id } = currentUser.user;
      const user = await this.userRepository.findOne({ where: { id: id } });

      const listUser = await this.userRepository.find();
      return {
        current_user: user,
        list_user: listUser,
      };
    } catch (error) {
      throw new Error('Find User Failed');
    }
  }

  async findById(currentUser: any): Promise<any> {
    try {
      const { id } = currentUser.user;

      const user = await this.userRepository.findOne({
        where: { id },
        relations: [
          'posts',
          'posts.user',
          'posts.comments',
          'posts.comments.user',
          'posts.reactions',
        ],
      });

      let totalReactionsCount = 0;
      user.posts.forEach((post: any) => {
        post.reactionsCount = calculateReactionsCount(post.reactions);
        Object.values(post.reactionsCount).forEach((count: number) => {
          totalReactionsCount += count;
        });
      });
      (user as any).reactionsCount = totalReactionsCount;

      return { user };
    } catch (error) {
      throw new Error('Find User Failed');
    }
  }

  async create(user: any): Promise<any> {
    try {
      const { username, password, email } = user;

      const isEmail = await this.userRepository.findOne({ where: { email } });
      if (isEmail) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Email already exists',
        };
      }

      const isUser = await this.userRepository.findOne({ where: { username } });
      if (isUser) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Username already exists',
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;

      await this.userRepository.save(this.userRepository.create(user));

      return {
        status: HttpStatus.OK,
        message: 'Create User Success',
      };
    } catch (error) {
      console.error('Error during user creation:', error);
      throw new Error('Create Failed');
    }
  }

  async delete(payload: any, currentUser: any): Promise<any> {
    try {
      const { id } = payload;
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['posts'],
      });

      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User Not Found',
        };
      }

      if (currentUser?.user?.id != user.id) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Only change your information',
        };
      }

      const { avatar } = user;
      if (avatar) {
        const uploadDir = path.join(__dirname, '../../', 'avatars');
        const existingAvatarPath = path.join(uploadDir, path.basename(avatar));
        fs.unlinkSync(existingAvatarPath);
      }

      await Promise.all(
        user.posts.map((post) => this.postRepository.remove(post)),
      );
      await this.userRepository.remove(user);

      return {
        status: HttpStatus.OK,
        message: 'Delete User Success',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Delete Failed',
      };
    }
  }

  async uploadImage(image: any, currentUser: any): Promise<any> {
    try {
      const { id } = currentUser.user;
      const uploadDir = path.join(__dirname, '../../', 'avatars');

      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User Not Found',
        };
      }

      if (currentUser.user.id != user.id) {
        return {
          status: HttpStatus.FORBIDDEN,
          message: 'Only change your information',
        };
      }
      const { username, avatar } = user;
      const baseUrl = 'http://localhost:3000/avatars/';

      if (avatar) {
        const existingAvatarPath = path.join(uploadDir, path.basename(avatar));
        if (fs.existsSync(existingAvatarPath)) {
          fs.unlinkSync(existingAvatarPath);
        }
      }

      const fileName = `${username}_${Date.now()}${path.extname(
        image?.originalname,
      )}`;

      user.avatar = `${baseUrl}${fileName}`;
      await this.userRepository.save(user);

      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, image.buffer);
      return {
        status: HttpStatus.OK,
        message: 'Upload image success',
      };
    } catch (error) {
      throw new Error('Upload Failed');
    }
  }

  async sendEmail(payload: any): Promise<any> {
    try {
      const { email } = payload;
      const user = await this.userRepository.findOne({ where: { email } });

      if (!user || !email) {
        return {
          message: 'Email not found',
          status: HttpStatus.NOT_FOUND,
        };
      }

      const newPassword = `${Math.floor(100000 + Math.random() * 900000)}`;
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepository.save(user);

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Send mail by Kiennn 🚀 🚀 🚀 ',
        text: 'HapoSoft',
        html: ` Your new password is: ${newPassword}`,
      });

      return {
        message: `Password change success, please check your email: ${email} `,
        status: HttpStatus.OK,
      };
    } catch (error) {
      return {
        message: error.message || 'Internal Server Error',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async createFromCsv(file: any) {
    try {
      const stream = Readable.from(file, { encoding: 'utf-8' });
      let userData: any = {};

      await new Promise<void>((resolve) => {
        papa.parse(stream, {
          header: false,
          worker: true,
          delimiter: ',',
          step: function (row: any) {
            if (row.data && row.data.length === 2) {
              const [property, value] = row.data.map((item: any) =>
                item.trim(),
              );
              userData[property] = value;
            }
          },
          complete: function () {
            resolve();
          },
        });
      });

      const username = userData.username;

      const isUser = await this.userRepository.findOne({ where: { username } });
      if (isUser) {
        return false;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      userData.password = hashedPassword;
      await this.userRepository.save(this.userRepository.create(userData));
      return true;
    } catch (error) {
      console.error('Error processing CSV: ', error);
    }
  }
}
function calculateReactionsCount(reactions: any) {
  const reactionsCount = {};

  reactions.forEach((reaction) => {
    reactionsCount[reaction.type] = (reactionsCount[reaction.type] || 0) + 1;
  });

  return reactionsCount;
}
