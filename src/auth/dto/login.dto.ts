import { IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'admin@123' })
    @IsString()
    password: string;
}