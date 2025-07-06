import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  const mockUser = { id: 1, username: 'admin' };
  const accessToken = 'mock-access-token';
  const refreshToken = 'mock-refresh-token';

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn().mockResolvedValue({
      access_token: accessToken,
      refresh_token: refreshToken,
    }),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue(accessToken),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/login', () => {
    it('should return tokens for valid user', async () => {
      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await controller.login({ username: 'admin', password: 'pass' });

      expect(authService.validateUser).toHaveBeenCalledWith('admin', 'pass');
      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      mockAuthService.validateUser.mockResolvedValue(null);

      await expect(
          controller.login({ username: 'fake', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token for valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 1, username: 'admin' });

      const result = await controller.refresh({ refresh_token: 'valid-token' });

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token', { secret: 'secretKey' });
      expect(jwtService.sign).toHaveBeenCalledWith(
          { username: 'admin', sub: 1 },
          { expiresIn: '15m' },
      );
      expect(result).toEqual({ access_token: accessToken });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
          controller.refresh({ refresh_token: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
