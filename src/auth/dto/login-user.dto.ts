import { IsString, IsEmail, MinLength, MaxLength, Matches } from "class-validator";

export class LoginUserDto {
	@IsString()
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(7, {
		message: 'La contraseña debe tener al menos 7 caracteres'
	})
	@MaxLength(12)
	@Matches(
		/^(?:(?=.*[A-Z])(?=.*[a-z])|(?=.*[A-Z])(?=.*\d)|(?=.*[A-Z])(?=.*[`~!@#$%^&*()_\-+={}\[\]\\:;"'<,>.?\/])|(?=.*[a-z])(?=.*\d)|(?=.*[a-z])(?=.*[`~!@#$%^&*()_\-+={}\[\]\\:;"'<,>.?\/])|(?=.*\d)(?=.*[`~!@#$%^&*()_\-+={}\[\]\\:;"'<,>.?\/])).{7,}$/, {
		message: 'La contraseña debe tener al menos 7 caracteres y cumplir con al menos 3 de los siguientes 4 grupos: letras mayúsculas, letras minúsculas, números y símbolos permitidos (` ~ ! @ # $ % ^ & * ( ) _ + - = { } | [ ] \ : " ; < > ? , . /)'
	})
	password!: string;
}