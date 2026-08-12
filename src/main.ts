import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			// transformOptions: {
			// 	enableImplicitConversion : true
			// },
			exceptionFactory: (errors) => {
				const result = {};
				errors.forEach((error) => {
					const field = error.property;
					// Extrae los mensajes de error de cada validación fallida de ese campo
					const messages = error.constraints ? Object.values(error.constraints) : [];
					result[field] = messages;
				});
				// Devuelve un BadRequestException con el objeto estructurado por campo
				return new BadRequestException({
					statusCode: 400,
					error: 'Bad Request',
					messages: result,
				});
			},
		})
	)	
	app.setGlobalPrefix('api');
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
