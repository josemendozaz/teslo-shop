import { Product } from "../../products/entities";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ValidRoles } from "../interfaces";

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	id!: string;

	@Column('text', {
		unique: true
	})
	email!: string

	@Column('text', {
		select: false
	})
	password!: string;

	@Column('text')
	fullName!: string;

	@Column('bool', {
		default: true
	})
	isActive!: boolean;

	@Column('text', {
		array: true,
		default: [ValidRoles.user]
	})
	roles!: ValidRoles[];

	@OneToMany(
		() => Product,
		( product ) => product.user,
	)
	product!: Product;  

	@BeforeInsert()
	checkFieldBeforeInsert() {
		this.email = this.email.toLowerCase().trim();
	}
	@BeforeUpdate()
	checkFieldBeforeUpdate() {
		this.checkFieldBeforeInsert();
	}    
}
