import { IsOptional, IsString, IsNumber } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateDefectDto {
    @ApiPropertyOptional({ example: 'Crack' })
    @IsOptional()
    @IsString()
    name?: string;
}
