import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ValidRoles } from '../auth/interfaces';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities';

@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}
	
	@Post()
	@Auth( ValidRoles.admin )
	create(
		@Body() createProductDto: CreateProductDto,
		@GetUser() user: User,
	) {
		return this.productsService.create(createProductDto, user );
	}
	
	@Get()
	findAll( @Query() paginationDto: PaginationDto) {
		console.log( paginationDto );
		return this.productsService.findAll( paginationDto );
	}
	
	@Get(':term')
	findOne(@Param('term') term: string) {
		return this.productsService.findOne(term);
	}
	
	@Patch(':id')
	@Auth( ValidRoles.admin )
	update(
		@Param('id', ParseUUIDPipe) id: string,
		@Body() updateProductDto: UpdateProductDto,
		@GetUser() user: User,
	) {
		return this.productsService.update(id, updateProductDto, user);
	}
	
	@Delete(':id')
	@Auth( ValidRoles.admin )
	remove(@Param('id', ParseUUIDPipe) id: string) {
		return this.productsService.remove(id);
	}
}
