# CSRF Protection Implementation

## Summary
This patch mitigates Cross-Site Request Forgery (CSRF) attacks by implementing Origin/Referer validation for all state-changing HTTP requests.

## Changes Made

### 1. Created CsrfGuard (`backend/purrmanent/src/modules/auth/csrf.guard.ts`)
A new global guard that validates the Origin or Referer header for all state-changing requests (POST, PUT, PATCH, DELETE).

**Key Features:**
- Validates Origin/Referer against configured allowed origins (FRONTEND_ORIGINS + BETTER_AUTH_URL)
- Exempts safe methods (GET, HEAD, OPTIONS) that don't modify state
- Exempts public routes (decorated with @Public())
- Throws ForbiddenException for invalid or missing Origin/Referer

**Logic Flow:**
1. Check if route is public → allow
2. Check if method is safe (GET, HEAD, OPTIONS) → allow
3. Extract Origin from request (prefers Origin header, falls back to Referer)
4. Validate Origin is in allowed list → allow or reject

### 2. Updated AuthModule (`backend/purrmanent/src/modules/auth/auth.module.ts`)
Registered CsrfGuard as a global APP_GUARD, ordered before AuthGuard.

**Guard Execution Order:**
1. CsrfGuard (validates Origin/Referer)
2. AuthGuard (validates session)

This order ensures CSRF validation happens before authentication, preventing unnecessary session lookups for forged requests.

## Security Impact

### Attack Scenario (Blocked)
**Before:** An attacker could create a malicious HTML form that submits to `/api/coach/chat` and force a logged-in victim's browser to send authenticated requests with attacker-controlled content.

**After:** The CsrfGuard validates that the Origin/Referer header matches an allowed origin. Cross-site requests from attacker domains are rejected with a 403 Forbidden error.

### Why This Works
1. **SameSite=None cookies** allow cross-site cookie transmission, but browsers still send Origin/Referer headers
2. **Simple HTML forms** can't suppress or forge Origin/Referer headers (browser security policy)
3. **JavaScript fetch/XHR** from attacker domains are blocked by CORS (already configured)
4. **Origin validation** is a standard CSRF defense recommended by OWASP

### Protected Endpoints
All authenticated state-changing endpoints are now protected:
- POST /api/coach/chat
- POST /api/coach/confirm-action
- POST /api/cats
- POST /api/checklist/custom
- POST /api/crisis/identify
- POST /api/crisis/step
- POST /api/crisis/resolve
- POST /api/health/record
- POST /api/onboarding/submit
- POST /api/push/subscribe
- PUT /api/cats/:id
- PUT /api/checklist/items/:id
- DELETE /api/push/unsubscribe
- And all other authenticated POST/PUT/PATCH/DELETE endpoints

### Exempted Endpoints
Public endpoints remain accessible without Origin validation:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/send-verification

These endpoints don't require CSRF protection because:
1. They don't modify existing user data
2. They establish new sessions rather than using existing ones
3. Login CSRF is a separate, less severe vulnerability class

## Testing Recommendations

### Manual Testing
1. **Legitimate Request:** Send POST from frontend → should succeed
2. **Cross-Site Request:** Create HTML form on different domain → should fail with 403
3. **Missing Headers:** Send POST without Origin/Referer → should fail with 403
4. **Safe Methods:** Send GET requests → should succeed (no CSRF check)
5. **Public Routes:** Send POST to /api/auth/login → should succeed (exempted)

### Automated Testing
Consider adding integration tests:
```typescript
describe('CsrfGuard', () => {
  it('should block POST requests with invalid origin', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/coach/chat')
      .set('Origin', 'https://attacker.com')
      .set('Cookie', validSessionCookie)
      .send({ message: 'test' });
    
    expect(response.status).toBe(403);
    expect(response.body.message).toContain('CSRF validation failed');
  });

  it('should allow POST requests with valid origin', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/coach/chat')
      .set('Origin', 'https://purrmanent.app')
      .set('Cookie', validSessionCookie)
      .send({ message: 'test' });
    
    expect(response.status).not.toBe(403);
  });
});
```

## Configuration Requirements

Ensure the following environment variables are properly configured:
- `FRONTEND_ORIGINS`: Comma-separated list of allowed frontend origins (e.g., `https://purrmanent.app,https://www.purrmanent.app`)
- `BETTER_AUTH_URL`: Backend URL (e.g., `https://api.purrmanent.app`)

The guard automatically reads these values and validates incoming requests against them.

## Compliance

This implementation follows OWASP recommendations for CSRF prevention:
- **Primary Defense:** Origin/Referer validation
- **Defense in Depth:** Works alongside existing CORS configuration
- **Minimal Impact:** No changes required to frontend code (browsers automatically send Origin/Referer)

## References
- OWASP CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- NestJS Guards: https://docs.nestjs.com/guards
- MDN Origin Header: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin
