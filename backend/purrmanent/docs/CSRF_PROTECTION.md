# CSRF Protection

## Overview

This application implements CSRF (Cross-Site Request Forgery) protection using a custom header validation approach. This protects against attacks where a malicious website tricks a logged-in user's browser into making unwanted authenticated requests.

## How It Works

The `CsrfGuard` (registered globally in `auth.module.ts`) requires all state-changing HTTP requests (POST, PUT, PATCH, DELETE) to include the `X-Requested-With` header.

### Why This Works

1. **Simple HTML forms cannot set custom headers** - An attacker's malicious HTML form can only submit standard form data, not custom headers.

2. **CORS blocks cross-origin header injection** - JavaScript from an unauthorized origin cannot set custom headers on cross-origin requests due to CORS preflight checks.

3. **Legitimate requests can easily comply** - The frontend application (running on an allowed origin) can set the header on all API requests.

### Attack Prevention

**Before (Vulnerable):**
```html
<!-- Attacker's malicious page -->
<form action="https://api.example.com/api/onboarding/submit" method="POST">
  <input name="catName" value="AttackerCat">
  <input name="catPersonality" value="playful">
  <!-- ... other fields ... -->
</form>
<script>document.forms[0].submit();</script>
```

This would succeed because:
- The session cookie has `sameSite: 'none'` in production
- The form POST includes the victim's session cookie automatically
- No CSRF protection was in place

**After (Protected):**

The same attack now fails with `403 Forbidden: CSRF protection: X-Requested-With header required for state-changing requests` because the HTML form cannot set the required header.

### Legitimate Usage

Frontend applications should include the header on all API requests:

```typescript
// Using fetch
fetch('/api/onboarding/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  credentials: 'include',
  body: JSON.stringify(data),
});

// Using axios (sets X-Requested-With automatically)
axios.post('/api/onboarding/submit', data, {
  withCredentials: true,
});
```

## Implementation Details

### Guard Order

Guards are applied in registration order (see `auth.module.ts`):

1. **CsrfGuard** - Validates the custom header (blocks cross-site form POSTs)
2. **AuthGuard** - Validates the session (resolves `req.user`)

This order is important: CSRF protection runs before authentication to reject malicious requests early.

### Exemptions

- **Safe methods** (GET, HEAD, OPTIONS) are always allowed without the header, per RFC 7231 (these methods must not have side effects)
- **Public routes** (decorated with `@Public()`) skip both guards (e.g., login, registration)

### Why Not Token-Based CSRF?

Traditional CSRF tokens (stored in cookies, validated from form fields) are more complex and require:
- Token generation and storage
- Token synchronization between server and client
- Token validation on every request
- Token refresh logic

The custom header approach is simpler, equally secure for JSON APIs, and leverages existing CORS protection.

## Testing

To verify CSRF protection is working:

1. **Test legitimate requests** - Ensure frontend requests with the header succeed
2. **Test form POST attacks** - Verify that form POSTs without the header are rejected
3. **Test safe methods** - Verify GET requests work without the header
4. **Test public routes** - Verify login/registration work without the header

## References

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Custom Header CSRF Protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#use-of-custom-request-headers)
