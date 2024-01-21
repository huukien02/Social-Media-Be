// multer.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: (req: any, file: any, callback: any) => {
          let folderPath = '';

          if (file.fieldname === 'avatar') {
            folderPath = './avatars';
          } else if (file.fieldname === 'postImage') {
            folderPath = './posts_images';
          }

          callback(null, folderPath);
        },
        filename: (req: any, file: any, callback: any) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, file.fieldname + '-' + uniqueSuffix);
        },
      }),
    }),
  ],
})
export class MulterConfigModule {}
