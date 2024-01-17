import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async loginByUserName(body: any): Promise<any> {
    try {
      const { username, password } = body;

      const user = await this.userRepository.findOne({ where: { username } });

      if (!user) {
        return { status: HttpStatus.UNAUTHORIZED, message: 'Username Failed' };
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return { status: HttpStatus.UNAUTHORIZED, message: 'Password Failed' };
      }

      const token = jwt.sign({ user }, process.env.PRIVATE_KEY_ACCESS_TOKEN, {
        expiresIn: '1h',
      });

      return {
        status: HttpStatus.OK,
        accessToken: token,
        isLogin: true,
        message: 'Login Success',
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Login Failed',
      };
    }
  }

  async verifyAccessToken(accessToken: string): Promise<any> {
    try {
      const decoded = jwt.verify(
        accessToken,
        process.env.PRIVATE_KEY_ACCESS_TOKEN,
      );
      return decoded;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }
}
