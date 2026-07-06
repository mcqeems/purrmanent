import {
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    const config = {
      get: (key: string) => {
        if (key === 'FRONTEND_ORIGINS') return 'http://localhost:3000';
        if (key === 'BETTER_AUTH_URL') return 'http://localhost:3001';
        return '';
      },
    } as unknown as ConfigService;
    guard = new CsrfGuard(config, reflector);
  });

  const createMockContext = (
    method: string,
    headers: Record<string, string> = {},
    isPublic = false,
  ) => {
    const mockRequest = { method, headers };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(isPublic);

    return mockContext;
  };

  describe('Public routes', () => {
    it('should allow public routes without any header', () => {
      const context = createMockContext('POST', {}, true);
      expect(guard.canActivate(context as never)).toBe(true);
    });
  });

  describe('Safe methods', () => {
    it('should allow GET requests', () => {
      const context = createMockContext('GET');
      expect(guard.canActivate(context as never)).toBe(true);
    });

    it('should allow HEAD requests', () => {
      const context = createMockContext('HEAD');
      expect(guard.canActivate(context as never)).toBe(true);
    });

    it('should allow OPTIONS requests', () => {
      const context = createMockContext('OPTIONS');
      expect(guard.canActivate(context as never)).toBe(true);
    });
  });

  describe('X-Requested-With header', () => {
    it('should allow POST with X-Requested-With header', () => {
      const context = createMockContext('POST', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context as never)).toBe(true);
    });

    it('should allow PUT with X-Requested-With header', () => {
      const context = createMockContext('PUT', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context as never)).toBe(true);
    });

    it('should allow DELETE with X-Requested-With header', () => {
      const context = createMockContext('DELETE', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context as never)).toBe(true);
    });
  });

  describe('Origin header validation', () => {
    it('should allow POST with valid Origin header', () => {
      const context = createMockContext('POST', {
        origin: 'http://localhost:3000',
      });
      expect(guard.canActivate(context as never)).toBe(true);
    });

    it('should block POST with disallowed Origin', () => {
      const context = createMockContext('POST', {
        origin: 'https://evil.com',
      });
      expect(() => guard.canActivate(context as never)).toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Blocking', () => {
    it('should block POST without X-Requested-With or Origin', () => {
      const context = createMockContext('POST');
      expect(() => guard.canActivate(context as never)).toThrow(
        ForbiddenException,
      );
    });

    it('should block PUT without any CSRF defense', () => {
      const context = createMockContext('PUT');
      expect(() => guard.canActivate(context as never)).toThrow(
        ForbiddenException,
      );
    });
  });
});
