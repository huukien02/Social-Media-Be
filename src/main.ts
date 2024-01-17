import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  // Tạo một document Swagger
  const config = new DocumentBuilder()
    .setTitle('My-App')
    .setDescription('No description :)')
    .setVersion('1.0')
    .addTag('Kiennn 👻 👻 👻')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
