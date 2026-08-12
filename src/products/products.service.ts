import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {

	private readonly logger = new Logger('ProductsService');

	constructor(
		@InjectRepository( Product )
		private readonly productRepository: Repository<Product>
	) {}
  
	async create(createProductDto: CreateProductDto) {
		try {
			const product = this.productRepository.create( createProductDto );
			await this.productRepository.save( product );
			return product;
		} catch (error) {
			this.handlerDBExeption( error );
		}
	}
	
	//TODO: PAGINAR
	findAll( paginationDto: PaginationDto ) {
		const { limit = 10, offset = 0 } = paginationDto;
		const products = this.productRepository.find({
			take : limit,
			skip : (offset - 1) * limit,
			order: {
				id: 'DESC'
			}
		});
		return products;
	}
	
	async findOne(term: string) {
		let product: Product|undefined|null = undefined;

		if ( isUUID( term ) ) {
			product = await this.productRepository.findOneBy({ id : term });
		} else {
			// product = await this.productRepository.findOneBy({ slug : term });
			const queryBuilder = this.productRepository.createQueryBuilder();
			product = await queryBuilder
				.where('UPPER(title) =:title or slug =:slug', {
					title: term.toLocaleUpperCase(),
					slug: term.toLocaleLowerCase()
				}).getOne(); // `select * from products where slug ='xx' or title=''`
		}
		if ( !product ) throw new NotFoundException(`El Producto con id, nombre o número "${ term }" no encontrado`);
		return product;
	}
	
	async update(id: string, updateProductDto: UpdateProductDto) {
		const product = await this.productRepository.preload({
			id: id,
			...updateProductDto
		})
		if ( !product ) throw new NotFoundException(`Producto con id "${ id }" no encontrado`)
		try {
			await  this.productRepository.save( product );
			return product;
		} catch (error) {
			this.handlerDBExeption( error );			
		}
	}
	
	async remove(id: string) {
		const product = await this.productRepository.delete({ id : id })
		if ( product.affected === 0 ) 
			throw new BadRequestException(`Producto con id "${ id }" no encontrado`);
		return `Producto con id "${ id }" eliminado correctamente`;
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
