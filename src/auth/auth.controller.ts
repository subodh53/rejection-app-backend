import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @ApiOperation({ summary: 'Login user and return JWT token' })
    @ApiBody({
        schema: {
            example: {
                username: 'admin',
                password: 'admin@123',
            },
        },
    })
    async login(@Body() body: LoginDto) {
        return this.authService.login(body.username, body.password);
    }
}
