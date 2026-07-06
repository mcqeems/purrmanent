import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard';
import { IS_PUBLIC_KEY } from './auth.decorators';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new CsrfGuard(reflector);
  });

  const createMockContext = (
    method: string,
    headers: Record<string, string> = {},
    isPublic = false,
  ): ExecutionContext => {
    const mockRequest = { method, headers };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(isPublic);

    return mockContext;
  };

  describe('Public routes', () => {
    it('should allow public routes without header', () => {
      const context = createMockContext('POST', {}, true);
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Safe methods', () => {
    it('should allow GET requests without header', () => {
      const context = createMockContext('GET');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow HEAD requests without header', () => {
      const context = createMockContext('HEAD');
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow OPTIONS requests without header', () => {
      const context = createMockContext('OPTIONS');
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('State-changing methods', () => {
    it('should block POST without X-Requested-With header', () => {
      const context = createMockContext('POST');
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'CSRF protection: X-Requested-With header required for state-changing requests',
      );
    });

    it('should allow POST with X-Requested-With header', () => {
      const context = createMockContext('POST', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block PUT without X-Requested-With header', () => {
      const context = createMockContext('PUT');
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow PUT with X-Requested-With header', () => {
      const context = createMockContext('PUT', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block PATCH without X-Requested-With header', () => {
      const context = createMockContext('PATCH');
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow PATCH with X-Requested-With header', () => {
      const context = createMockContext('PATCH', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should block DELETE without X-Requested-With header', () => {
      const context = createMockContext('DELETE');
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow DELETE with X-Requested-With header', () => {
      const context = createMockContext('DELETE', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('Case sensitivity', () => {
    it('should handle uppercase method names', () => {
      const context = createMockContext('post', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context)).toBe(true);
    });

    it('should handle mixed-case method names', () => {
      const context = createMockContext('Post', {
        'x-requested-with': 'XMLHttpRequest',
      });
      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
