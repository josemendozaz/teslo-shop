import { Type } from "class-transformer";
import { IsIn, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsOptional({ message : 'El limite es opcional'})
    @IsPositive({ message: 'El limite debe ser un número positivo'})
    @Type( () => Number) /// Esto es un equivalente al enableImplicitConversions: true
    limit?: number;

    @IsOptional({ message : 'El offset es opcional'})
    @Min(1, { message: 'El limite debe ser un número positivo'})
    @Type( () => Number)
    offset?: number;

    @IsOptional({ message : 'El offset es opcional'})
    @IsIn(['asc', 'desc'], {
        message: 'El orden debe ser "asc (ascendente) o desc (descendente)"',
    })
    orderby?: string;
}