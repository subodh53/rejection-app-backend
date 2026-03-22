import { IsString, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateDefectDto {
    @ApiProperty({ example: 'Crack' })
    @IsString()
    name: string;
}
