import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
	( data, ctx: ExecutionContext ) => {
		const req = ctx.switchToHttp().getRequest();
		const rawHeaders = req.rawHeaders;
		if ( !rawHeaders ) throw new InternalServerErrorException('Raw Hedaers no found in request');
		return ( !data ) 
			? rawHeaders
			: rawHeaders[ data ];     
	}
);