import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from 'src/products/entities';
import { ProductsService } from 'src/products/products.service';
import { DataSource, Repository } from 'typeorm';
import { initialData } from './data/see-data';

@Injectable()
export class SeedService {

	private readonly logger = new Logger('ProductsService');

	constructor(
		private readonly productsService: ProductsService,
	) {}


	async runSeed() {
		await this.insertNewProducts();
		return 'SEED execute';
	}

	private async insertNewProducts() {
		const query = await this.productsService.deleteAllProducts();
		const products = initialData.products;
		const insertPromises: Promise<any>[] = [];
		products.forEach( product => {
			insertPromises.push( this.productsService.create( product ) )
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
