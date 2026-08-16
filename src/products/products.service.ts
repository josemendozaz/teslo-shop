import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage } from './entities';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class ProductsService {

	private readonly logger = new Logger('ProductsService');

	constructor(
		@InjectRepository( Product )
		private readonly productRepository: Repository<Product>,
		@InjectRepository( ProductImage )
		private readonly productImageRepository: Repository<ProductImage>,
		private readonly dataSource: DataSource
	) {}
  
	async create(createProductDto: CreateProductDto) {
		const { images = [], ...productDetails } = createProductDto;
		try {
			const product = this.productRepository.create( {
				...productDetails,
				images: images.map(
					image => this.productImageRepository.create({ url: image }) 
				)
			} );
			await this.productRepository.save( product );
			return {...product, images: images};
		} catch (error) {
			this.handlerDBExeption( error );
		}
	}
	
	//TODO: PAGINAR
	async findAll( paginationDto: PaginationDto ) {
		const { limit = 10, offset = 0, orderby = 'asc' } = paginationDto;
		// Normalize order value to a type acceptable by TypeORM ("ASC" | "DESC")
		const orderValue: 'ASC' | 'DESC' = orderby.toString().toLowerCase() === 'desc' ? 'DESC' : 'ASC';
		const products = this.productRepository.find({
			take : limit,
			skip : (offset - 1) * limit,
			relations: {
				images: true,
			},
			order: {
				id: orderValue
			}
		});
		return (await products).map( ({ images, ...rest }) => ({
			...rest,
			images: images!.map( img => img.url )
		}));
	}
	
	async findOne(term: string) {
		let product: Product|undefined|null = undefined;

		if ( isUUID( term ) ) {
			product = await this.productRepository.findOneBy({ id : term });
		} else {
			// product = await this.productRepository.findOneBy({ slug : term });
			const queryBuilder = this.productRepository.createQueryBuilder('prod');
			product = await queryBuilder
				.where('UPPER(title) =:title or slug =:slug', {
					title: term.toLocaleUpperCase(),
					slug: term.toLocaleLowerCase()
				})
				.leftJoinAndSelect('prod.images', 'productImages')
				.getOne(); // `select * from products where slug ='xx' or title=''`
		}
		if ( !product ) throw new NotFoundException(`El Producto con id, nombre o número "${ term }" no encontrado`);
		return {...product, images: product.images?.map( image => image.url )};
	}
	
	async update(id: string, updateProductDto: UpdateProductDto) {

		const { images, ...toUpdate } = updateProductDto;

		const product = await this.productRepository.preload({ id: id, ...toUpdate })
		if ( !product ) throw new NotFoundException(`Producto con id "${ id }" no encontrado`)

		///// Create Query runner
		const queryRunner = this.dataSource.createQueryRunner();

		await queryRunner.connect();
		await queryRunner.startTransaction();
		
		try {
			if ( images ) {
				await queryRunner.manager.delete(ProductImage, {
					product : { id }
				})
				product.images	= images.map(
					image => this.productImageRepository.create( { url: image } )
				);
			} else {

			}
	
			await queryRunner.manager.save( product );
			await queryRunner.commitTransaction();
			await queryRunner.release();

			// await  this.productRepository.save( product );
			return this.findOne( id );
		} catch (error) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
			this.handlerDBExeption( error );			
		}
	}
	
	async remove(id: string) {
		const product = await this.productRepository.delete({ id : id })
		if ( product.affected === 0 ) 
			throw new BadRequestException(`Producto con id "${ id }" no encontrado`);
		return `Producto con id "${ id }" eliminado correctamente`;
	}

	async deleteAllProducts() {
		const query = this.productRepository.createQueryBuilder('product')
		try {
			return await query
				.delete()
				.where('id IS NOT NULL')
				.execute();
		} catch (error) {
			this.handlerDBExeption( error )
		}
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
