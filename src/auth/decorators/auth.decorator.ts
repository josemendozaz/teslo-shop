
import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './role-protected.decorator';
import { ValidRoles } from '../interfaces';
import { UserRoleGuard } from '../guards';

export function Auth(...roles: ValidRoles[]) {
	return applyDecorators(
		RoleProtected(...roles),
		UseGuards(AuthGuard(), UserRoleGuard),
		// SetMetadata('roles', roles),
		// ApiBearerAuth(),
		// ApiUnauthorizedResponse({ description: 'Unauthorized' }),
	);
}
