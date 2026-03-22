import {
  IsArray,
  IsString,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class EntryRowDto {
    @ApiProperty()
    @IsInt()
    part_id: number;

    @ApiProperty({ example: 100 })
    @IsInt()
    @Min(0)
    production_qty: number;

    @ApiProperty({ example: 10 })
    @IsInt()
    @Min(0)
    rejection_qty: number;
    
    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    defect_id?: number;
}

export class CreateEntryDto {
    @ApiProperty()
    @IsInt()
    stage_id: number;

    @ApiProperty({ example: '2026-03-22' })
    @IsString()
    date: string;

    @ApiProperty({ type: [EntryRowDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => EntryRowDto)
    entries: EntryRowDto[];
}