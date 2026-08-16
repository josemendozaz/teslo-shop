import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";

@Entity( { name: 'products' } )
export class Product {

	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('text', {
		unique: true,
	})
	title!: string;

	@Column('float',{
		default: 0,
	})
	price!: number;

	@Column({
		type: 'text',
		nullable: true
	})
	description!: string;

	@Column('text', {
		unique: true,
	})
	slug!: string;

	@Column('int', {
		default: 0
	})
	stock!: number;

	@Column('text', {
		array: true
	})
	sizes!: string[];

	@Column('text')
	gender!: string;

	@Column('text', {
		array: true,
		default: []
	})
	tags?: string[];

	@OneToMany(
		() => ProductImage,
		( productImage ) => productImage.product,
		{ cascade : true, eager: true } // para los find, insertará las relaciones  (no sirve para los queryBuilders)
	)
	images?: ProductImage[];

	@BeforeInsert()
	checkSlugInsert() {
		this.slug = this.slug || this.title;
		this.slug = this.transformSlug(this.slug);
	}

	@BeforeUpdate()
	checkSlugUpdate() {
		this.slug = this.slug || this.title;
		this.slug = this.transformSlug(this.slug);
	}
	
	// Método privado reutilizable para limpiar y formatear el slug
    private transformSlug(value: string): string {
        return value
            .toLocaleLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }
}
