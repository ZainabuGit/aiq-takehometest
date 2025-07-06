import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.username, sub: user.id };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }
}
