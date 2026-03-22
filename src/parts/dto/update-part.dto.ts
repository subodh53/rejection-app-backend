import { IsOptional, IsString, IsNumber } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePartDto {
    @ApiPropertyOptional({ example: 'Part A' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    category_id?: number;
}
