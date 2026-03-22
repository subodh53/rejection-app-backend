import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateCategoryDto {
    @ApiPropertyOptional({ example: 'Automotive' })
    @IsOptional()
    @IsString()
    name?: string;
}