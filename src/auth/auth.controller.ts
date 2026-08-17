import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { Auth, GetUser, RawHeaders } from './decorators';
import { User } from './entities';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}
	
	@Post('register')
	create(@Body() createUserDto: CreateUserDto) {
		return this.authService.create( createUserDto );
	}

	@Post('login')
	login(@Body() loginUserDto: LoginUserDto ){
		return this.authService.login( loginUserDto );
	}

	@Get('check-status')
	@Auth()
	checkAuthStatus(
		@GetUser() user: User
	){
		return this.authService.checkAuthStatus( user );
	}


	@Get('private')
	@UseGuards( AuthGuard() )
	testingPrivateRoute(
		// @Req() request: Express.Request
		@GetUser() user: User,
		@GetUser('email') userEmail: string,
		@RawHeaders() rawHeaders: string[],
		@Headers() headers: IncomingHttpHeaders
	) {
		console.log({ user });
		return {
			ok: true,
			message: 'Hello Word!',
			user,
			userEmail,
			rawHeaders,
			headers
		}
	}

	@Get('private2')
	// @SetMetadata('roles', ['admin','super-user'])
	@RoleProtected( ValidRoles.superUser )
	// @RoleProtected( ValidRoles.superUser, ValidRoles.admin, ValidRoles.user )
	@UseGuards( AuthGuard(), UserRoleGuard )
	privateRoute2(
		@GetUser() user: User,
	) {
		return {
			ok: true,
			user,
		}
	}
	@Get('private3')
	@Auth( ValidRoles.admin, ValidRoles.superUser )
	privateRoute3(
		@GetUser() user: User,
	) {
		return {
			ok: true,
			user,
		}
	}	
}
