import { IsString, IsNumber, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePartDto {
    @ApiProperty({ example: 'Part A' })
    @IsString()
    name: string;

    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    category_id?: number;
}
