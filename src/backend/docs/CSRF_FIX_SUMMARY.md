# CSRF Vulnerability Fix - Summary

## Vulnerability
Cross-site form POST to `/api/onboarding/submit` and other state-changing endpoints could submit attacker-chosen data under a logged-in victim's session.

### Root Cause
1. Session cookies configured with `sameSite: 'none'` in production (allows cross-site requests)
2. No CSRF protection on state-changing endpoints
3. `express.urlencoded()` enabled (allows HTML form submissions)
4. Cookie-based authentication (session automatically included in cross-site requests)

## Solution
Implemented a global CSRF guard that requires the `X-Requested-With` custom header on all state-changing HTTP methods (POST, PUT, PATCH, DELETE).

### Why This Works
- **HTML forms cannot set custom headers** - Attacker's malicious forms are blocked
- **CORS prevents cross-origin header injection** - Unauthorized origins cannot set the header via JavaScript
- **Legitimate requests can easily comply** - Frontend applications on allowed origins can set the header

### Files Changed

1. **`backend/purrmanent/src/modules/auth/csrf.guard.ts`** (NEW)
   - Implements `CsrfGuard` that validates `X-Requested-With` header
   - Exempts safe methods (GET, HEAD, OPTIONS)
   - Respects `@Public()` decorator for auth routes

2. **`backend/purrmanent/src/modules/auth/auth.module.ts`** (MODIFIED)
   - Registered `CsrfGuard` as global `APP_GUARD`
   - Positioned before `AuthGuard` to reject malicious requests early
   - Added documentation about guard order

3. **`backend/purrmanent/src/modules/onboarding/onboarding.controller.ts`** (MODIFIED)
   - Added documentation comment explaining CSRF protection

4. **`backend/purrmanent/docs/CSRF_PROTECTION.md`** (NEW)
   - Comprehensive documentation of CSRF protection mechanism
   - Usage examples for frontend developers
   - Testing guidelines

5. **`backend/purrmanent/src/modules/auth/csrf.guard.spec.ts`** (NEW)
   - Unit tests for `CsrfGuard`
   - Covers all scenarios: public routes, safe methods, state-changing methods

## Impact

### Protected Endpoints
All state-changing endpoints are now protected:
- `/api/onboarding/submit` (the reported vulnerability)
- `/api/cats` (POST, PUT, DELETE)
- `/api/checklist/*` (POST, PUT)
- `/api/health/record` (POST, PUT, DELETE)
- `/api/coach/*` (POST)
- `/api/crisis/*` (POST)
- `/api/notification/*` (POST, DELETE)
- All other POST/PUT/PATCH/DELETE endpoints

### Unaffected Endpoints
- **GET requests** - No CSRF protection needed (safe methods)
- **Auth endpoints** - Marked with `@Public()`, exempt from guard
- **better-auth routes** - Mounted on Express before NestJS guards, handle own CSRF

### Frontend Changes Required
Frontend applications must include the `X-Requested-With` header on API requests:

```typescript
// Option 1: Use axios (sets header automatically)
axios.post('/api/onboarding/submit', data, { withCredentials: true });

// Option 2: Set header manually with fetch
fetch('/api/onboarding/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'include',
  body: JSON.stringify(data),
});
```

## Testing
Run the unit tests:
```bash
npm test csrf.guard.spec.ts
```

Manual testing:
1. Verify legitimate frontend requests succeed
2. Verify HTML form POSTs without header are rejected (403 Forbidden)
3. Verify GET requests work without header
4. Verify login/registration work without header

## Security Considerations

### Why Not Token-Based CSRF?
Traditional CSRF tokens (double-submit cookie, synchronizer token) are more complex and require:
- Token generation and storage
- Token synchronization between server and client
- Token validation on every request
- Token refresh logic

The custom header approach is:
- **Simpler** - No token management needed
- **Equally secure** - Leverages browser same-origin policy and CORS
- **Standard practice** - Recommended by OWASP for JSON APIs
- **Framework-agnostic** - Works with any frontend framework

### Defense in Depth
This fix is part of a layered security approach:
1. **CORS** - Restricts which origins can make cross-origin requests
2. **CSRF Guard** - Requires custom header on state-changing requests
3. **Authentication** - Validates session on all protected routes
4. **Input Validation** - Validates request body with Zod schemas
5. **Rate Limiting** - Prevents abuse via throttling

## References
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Custom Header CSRF Protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#use-of-custom-request-headers)
- [NestJS Guards](https://docs.nestjs.com/guards)
