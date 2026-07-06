# CSRF Protection Implementation - Complete Summary

## Changes Made

### Backend Changes

#### 1. Created CSRF Guard (`backend/purrmanent/src/modules/auth/csrf.guard.ts`)
- Implements `CsrfGuard` that validates `X-Requested-With` header on state-changing requests
- Exempts safe methods (GET, HEAD, OPTIONS) per RFC 7231
- Respects `@Public()` decorator for auth routes
- Throws `403 Forbidden` with clear error message when header is missing

#### 2. Registered CSRF Guard (`backend/purrmanent/src/modules/auth/auth.module.ts`)
- Added `CsrfGuard` as global `APP_GUARD`
- Positioned before `AuthGuard` to reject malicious requests early
- Added comprehensive documentation about guard order and behavior

#### 3. Documented Onboarding Controller (`backend/purrmanent/src/modules/onboarding/onboarding.controller.ts`)
- Added comment explaining CSRF and authentication protection

#### 4. Created Unit Tests (`backend/purrmanent/src/modules/auth/csrf.guard.spec.ts`)
- Comprehensive test suite for `CsrfGuard`
- Tests public routes, safe methods, state-changing methods, and edge cases

#### 5. Created Documentation
- `backend/purrmanent/docs/CSRF_PROTECTION.md` - Detailed explanation of CSRF protection mechanism
- `backend/purrmanent/docs/CSRF_FIX_SUMMARY.md` - Complete fix summary with examples

### Frontend Changes

#### 1. Updated API Client (`frontend/purrmanent/lib/api/client.ts`)
- Added `X-Requested-With: XMLHttpRequest` header to all API requests
- Added documentation explaining CSRF protection
- No breaking changes - header is added automatically to all requests

## How It Works

### Attack Prevention Flow

**Before (Vulnerable):**
```
1. Victim logs into app.example.com
2. Session cookie set with sameSite: 'none'
3. Victim visits attacker.com
4. Attacker's page submits HTML form to api.example.com/api/onboarding/submit
5. Browser includes session cookie automatically
6. Backend accepts request and creates records under victim's account
```

**After (Protected):**
```
1. Victim logs into app.example.com
2. Session cookie set with sameSite: 'none'
3. Victim visits attacker.com
4. Attacker's page submits HTML form to api.example.com/api/onboarding/submit
5. Browser includes session cookie automatically
6. CsrfGuard checks for X-Requested-With header
7. Header is missing (HTML forms cannot set custom headers)
8. Backend rejects request with 403 Forbidden
9. Attack fails - no records created
```

### Legitimate Request Flow

```
1. User interacts with frontend at app.example.com
2. Frontend calls apiFetch('/onboarding/submit', { method: 'POST', body: data })
3. apiFetch adds X-Requested-With: XMLHttpRequest header
4. Request sent to api.example.com/api/onboarding/submit
5. CsrfGuard validates header is present
6. AuthGuard validates session
7. Request succeeds - records created
```

## Security Properties

### Why This Approach Works

1. **HTML forms cannot set custom headers**
   - The browser's form submission API does not allow setting custom headers
   - Attackers cannot bypass this limitation

2. **CORS prevents cross-origin header injection**
   - JavaScript from unauthorized origins cannot set custom headers on cross-origin requests
   - CORS preflight checks block unauthorized origins
   - Only allowed origins (configured in FRONTEND_ORIGINS) can set the header

3. **Simple and robust**
   - No token generation, storage, or synchronization needed
   - No token expiration or refresh logic
   - Leverages existing browser security mechanisms (same-origin policy, CORS)

### Defense in Depth

This fix is part of a layered security approach:

1. **CORS** - Restricts which origins can make cross-origin requests
2. **CSRF Guard** - Requires custom header on state-changing requests (NEW)
3. **Authentication** - Validates session on all protected routes
4. **Input Validation** - Validates request body with Zod schemas
5. **Rate Limiting** - Prevents abuse via throttling

## Testing

### Backend Tests
```bash
cd backend/purrmanent
npm test csrf.guard.spec.ts
```

### Manual Testing

1. **Test legitimate requests succeed:**
   ```bash
   curl -X POST http://localhost:3001/api/onboarding/submit \
     -H "Content-Type: application/json" \
     -H "X-Requested-With: XMLHttpRequest" \
     -H "Cookie: session=..." \
     -d '{"catName":"Test","catPersonality":"playful",...}'
   ```
   Expected: 200 OK (or 401 if not authenticated)

2. **Test form POST without header fails:**
   ```bash
   curl -X POST http://localhost:3001/api/onboarding/submit \
     -H "Content-Type: application/json" \
     -H "Cookie: session=..." \
     -d '{"catName":"Test","catPersonality":"playful",...}'
   ```
   Expected: 403 Forbidden with message "CSRF protection: X-Requested-With header required for state-changing requests"

3. **Test GET requests work without header:**
   ```bash
   curl http://localhost:3001/api/cats \
     -H "Cookie: session=..."
   ```
   Expected: 200 OK with cat list

4. **Test public routes work without header:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password"}'
   ```
   Expected: 200 OK (or 401 if credentials invalid)

### Frontend Testing

1. **Test onboarding flow:**
   - Complete onboarding questionnaire
   - Submit form
   - Verify submission succeeds
   - Check browser network tab - verify X-Requested-With header is present

2. **Test other state-changing operations:**
   - Create/edit/delete cat
   - Create/edit/delete health record
   - Move checklist items
   - Send coach message
   - All should work normally

## Rollout Plan

### Phase 1: Deploy Backend (DONE)
- Deploy CSRF guard to backend
- Guard is active but frontend already sends header
- No breaking changes

### Phase 2: Deploy Frontend (DONE)
- Deploy updated API client with X-Requested-With header
- All requests now include header
- Full CSRF protection active

### Phase 3: Monitor
- Monitor error logs for CSRF protection errors
- Check for any legitimate requests being blocked
- Verify no increase in 403 errors from legitimate users

## Rollback Plan

If issues arise:

1. **Quick rollback:** Remove CsrfGuard from auth.module.ts providers
   ```typescript
   providers: [
     authInstanceProvider,
     AuthService,
     // { provide: APP_GUARD, useClass: CsrfGuard }, // COMMENTED OUT
     { provide: APP_GUARD, useClass: AuthGuard },
   ],
   ```

2. **Full rollback:** Revert all changes
   - Backend: Remove csrf.guard.ts and auth.module.ts changes
   - Frontend: Remove X-Requested-With header from client.ts

## Future Enhancements

1. **Add CSRF token support** (if needed for non-JSON clients)
   - Generate CSRF token on login
   - Store in httpOnly cookie
   - Validate token from header or body

2. **Add Origin/Referer validation** (additional layer)
   - Validate Origin header matches allowed origins
   - Fallback to Referer header if Origin not present

3. **Add metrics/monitoring**
   - Track CSRF protection rejections
   - Alert on unusual patterns
   - Dashboard for security events

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Custom Header CSRF Protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#use-of-custom-request-headers)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [MDN: X-Requested-With](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
