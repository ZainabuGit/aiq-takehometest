import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private jwtService: JwtService) {}

    @Post('login')
    async login(@Body() body: LoginDto) {
        console.log("login controller");
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('refresh')
    async refresh(@Body() body: { refresh_token: string }) {
        try {
            const payload = this.jwtService.verify(body.refresh_token, {
                secret: 'secretKey', // ideally use a separate secret for refresh
            });

            const newAccessToken = this.jwtService.sign(
                { username: payload.username, sub: payload.sub },
                { expiresIn: '15m' }
            );

            return { access_token: newAccessToken };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

}
