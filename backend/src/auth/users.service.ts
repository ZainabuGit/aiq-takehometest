import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    private users = [
        {
            id: 1,
            username: 'admin',
            password: bcrypt.hashSync('password123', 10), // hashed password
        },
    ];

    async findOne(username: string) {
        return this.users.find(user => user.username === username);
    }
}
