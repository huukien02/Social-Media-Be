import { ApiProperty } from '@nestjs/swagger';

export class payLoadDto {
  @ApiProperty()
  id: number;
}

export class LoginDto {
  @ApiProperty({ example: 'kien_lh', description: 'Username for login' })
  username: string;

  @ApiProperty({ example: 'your_password', description: 'Password for login' })
  password: string;
}
export class CommentDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the post to which the comment belongs',
  })
  postId: number;

  @ApiProperty({
    example: 'This is a comment content',
    description: 'Content of the comment',
  })
  content: string;
}

export class PayLoadCreateDto {
  @ApiProperty({
    example: 'user01',
    description: 'Username of the user',
  })
  username: string;

  @ApiProperty({
    example: 'password',
    description: 'Password of the user',
  })
  password: string;

  @ApiProperty({
    example: 'user01@email.com',
    description: 'Email of the user',
  })
  email: string;
}
