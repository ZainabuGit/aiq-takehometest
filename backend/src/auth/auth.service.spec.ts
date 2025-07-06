import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    username: 'admin',
    password: bcrypt.hashSync('password123', 10), // hashed password
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(() => {
    authService = new AuthService(
        mockJwtService as any,
        mockUsersService as any,
    );
  });

  describe('validateUser', () => {
    it('should return user object without password if credentials are valid', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await authService.validateUser('admin', 'password123');

      expect(result).toEqual({
        id: 1,
        username: 'admin',
      });
    });

    it('should return null if user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await authService.validateUser('admin', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is incorrect', async () => {
      const wrongPasswordUser = { ...mockUser, password: bcrypt.hashSync('wrong', 10) };
      mockUsersService.findOne.mockResolvedValue(wrongPasswordUser);

      const result = await authService.validateUser('admin', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      const mockPayload = { username: 'admin', sub: 1 };
      mockJwtService.sign = jest
          .fn()
          .mockImplementation((payload, options) => `${payload.username}-token-${options.expiresIn}`);

      const result = await authService.login({ id: 1, username: 'admin' });

      expect(result.access_token).toBe('admin-token-15m');
      expect(result.refresh_token).toBe('admin-token-7d');
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
    });
  });
});
