import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from './interfaces';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities';

@Injectable()
export class AuthService {

	private readonly logger = new Logger('ProductsService');

	constructor(
		@InjectRepository( User )
		private readonly userRepository: Repository<User>,
		private readonly jwtService: JwtService
	){}

	async create(createUserDto: CreateUserDto) {
		try {
			const { password, ...userData } = createUserDto;
			const user = this.userRepository.create({
				...userData,
				password: bcrypt.hashSync( password, 10 )
			});
			await this.userRepository.save( user );
			// @ts-expect-error
			delete user.password;
			return {
				...user,
				token: this.getJwtToken({ id: user.id, email: user.email })
			};
		} catch (error) {
			this.handlerDBExeption( error );
		}
	}

	async login( loginUserDto: LoginUserDto ) {
		const { password, email } = loginUserDto;
		const user = await this.userRepository.findOne({ 
			where: { email },
			select: { email: true, password: true, id: true }
		})
		if (!user) throw new UnauthorizedException('Credenciales no validas (email)')
		if ( !bcrypt.compareSync( password, user.password ) )  throw new UnauthorizedException('Credenciales no validas (password)')
			// @ts-expect-error
			delete user.password;
			// delete user.id;
		return {
			...user,
			token: this.getJwtToken({ id: user.id, email: user.email })
		};
	}
	
	private getJwtToken( payload: JwtPayload ){
		const token = this.jwtService.sign( payload );
		return token;
	}

	async checkAuthStatus( user: User ) {
		return {
			...user,
			token: this.getJwtToken({id: user.id, email: user.email})
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
