import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from 'src/products/entities';
import { ProductsService } from 'src/products/products.service';
import { DataSource, Repository } from 'typeorm';
import { initialData } from './data/see-data';
import { User } from 'src/auth/entities';
import { ValidRoles } from 'src/auth/interfaces';

@Injectable()
export class SeedService {

	private readonly logger = new Logger('ProductsService');

	constructor(
		private readonly productsService: ProductsService,
		@InjectRepository( User )
		private readonly userRepository : Repository<User>
	) {}


	async runSeed() {
		await this.deleteTables();
		const adminUser = await this.insertUsers();
		await this.insertNewProducts( adminUser );
		return 'SEED execute';
	}

	private async deleteTables() {
		//// Borra todos los productos
		await this.productsService.deleteAllProducts();
		//// Borra todos los usuarios
		const queryBuilder = this.userRepository.createQueryBuilder();
		await queryBuilder
			.delete()
			// .where({})
			.execute();
	}

	private async insertUsers() {
		const seedUsers = initialData.users;
		const users: User[] = [];
		seedUsers.forEach(user=>{
			const dbUser = this.userRepository.create({ ///// el .create no inserta en BD, solo lo prepara con los IDs
				...user,
				roles: user.roles as ValidRoles[] 
			});
			users.push( dbUser )  
		});
		const dbUsers = await this.userRepository.save( users );
		return dbUsers[ 0 ];
	}

	private async insertNewProducts( user: User ) {
		const query = await this.productsService.deleteAllProducts();
		const products = initialData.products;
		const insertPromises: Promise<any>[] = [];
		products.forEach( product => {
			insertPromises.push( this.productsService.create( product, user ) )
		});
		await Promise.all( insertPromises );
		return true;
	}

	handlerDBExeption( error : any ) {
		const match = error.detail ? error.detail?.match(/\((.*?)\)=/) : null;
		const field = match ? match[1] : 'campo desconocido';
		if ( error.code === '23505') {
			throw new BadRequestException({
				success: false,
				message: `El valor introducido ya existe para el campo: ${field}`,
				field: field
			});
		} else if ( error.code === '23502' ) {
			throw new BadRequestException({
				success: false,
				message: `Se encontró un valor nulo para la columna "${field}" de la relación producto, lo cual viola la condición not null`,
				field: field
			});	
		}
		console.log( error );
		this.logger.error( error.message );
		throw new InternalServerErrorException('Unexpeted error, check server logs')
	}	
}
