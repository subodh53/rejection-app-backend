import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateStageDto {
    @ApiProperty({ example: 'Stage 1' })
    @IsString()
    name: string;
}
