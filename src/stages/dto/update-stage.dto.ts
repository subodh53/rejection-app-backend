import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateStageDto {
    @ApiPropertyOptional({ example: 'Stage 1' })
    @IsOptional()
    @IsString()
    name?: string;
}
