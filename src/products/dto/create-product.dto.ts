import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {
	@IsString({ message : 'Debe ser un String' })
	@MinLength(1, {message: 'Debe tener al menos un caracter'})
	title!: string;

	@IsNumber({}, { message: 'El precio debe ser un número válido' })
	@IsPositive({ message: 'El precio debe ser un número positivo'})
	@IsOptional({ message : 'El Precio es opcional'})
	price?: number;

	@IsString({ message: 'La descripción debe ser una cadena de carácteres'})
	@IsOptional({ message : 'La descripción es opcional'})
	description?: string;

	@IsString({ message: 'La descripción debe ser una cadena de carácteres'})
	@IsOptional({ message : 'La descripción es opcional'})
	slug?: string;

	@IsInt({ message: 'El stock debe ser un número entero'})
	@IsPositive({ message: 'El stock debe ser un número positivo'})
	@IsOptional({ message : 'El stock es opcional'})
	stock?: number;

	@IsString({ each: true, message: 'El sizes debe ser una cadena de carácteres'})
	@IsArray({ message: 'El sizes debe ser un array de carácteres'})
	sizes!: string[];

	@IsIn(['men', 'women', 'kid', 'unisex'], {
		message: 'El género debe ser uno de los siguientes: men, women, kid, unisex',
	})
	gender!: string;

	@IsString({ each: true, message: 'Los tags deben ser una cadena de carácteres'})
	@IsArray({ message: 'Los tags deben ser un array de carácteres'})
	@IsOptional({ message : 'Los tags es opcional'})
	tags?: string[];

	@IsString({ each: true, message: 'Las imagenes deben ser una cadena de carácteres'})
	@IsArray({ message: 'Las imagenes deben ser un array de carácteres'})
	@IsOptional({ message : 'Las imagenes es opcional'})
	images?: string[];

}
