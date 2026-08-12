# MoodBite Authentication Testing Playbook

This file records the required verification flow for custom email/password authentication and Emergent-managed Google Auth.

## Emergent-managed Google Auth flow

1. The login button redirects to:
   `https://auth.emergentagent.com/?redirect=${encodeURIComponent(window.location.origin + '/profile')}`
2. The callback returns to the frontend with `#session_id=...`.
3. The frontend detects the fragment synchronously through `useLocation().hash` and renders the callback handler before protected routes run.
4. The callback handler exchanges the one-time session ID through backend `POST /api/auth/google/session`.
5. The backend calls the managed `/session-data` endpoint and stores the returned session token in MongoDB.
6. The backend sets the persistent `session_token` as an HttpOnly cookie.
7. `GET /api/auth/me` is the source of truth for authentication.

## Test user and session setup

Create a custom test user and session in MongoDB when browser automation cannot complete Google OAuth:

```javascript
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: null,
  providers: ['test'],
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token_hash: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
```

Production code stores a SHA-256 token hash. Tests should create sessions through backend helpers or hash the bearer token before inserting it.

## Backend verification

- Register creates one user with a secure password hash and no returned MongoDB `_id`.
- Duplicate registration returns a safe conflict response.
- Login succeeds with valid credentials and returns identical 401 copy for unknown email and wrong password.
- `GET /api/auth/me` works through the HttpOnly cookie and bearer fallback.
- Refresh rotates the persistent session and access cookie.
- Logout revokes the MongoDB session and clears cookies.
- Forgot password always returns 202 and never reveals account existence.
- Reset tokens are hashed, expiring, single-use, and revoke all existing sessions.
- Protected routes return 401 for missing, expired, or revoked sessions.
- Google callback rejects missing/replayed session IDs and never calls the managed session endpoint from the browser.

## Browser verification

- `/login` and `/signup` render without authenticated navigation.
- Successful signup redirects to the intended protected route.
- Session persists after reload.
- Logout returns to `/login` and protected routes redirect.
- Password visibility controls, validation, loading, errors, and success states work.
- Google button starts the real managed OAuth redirect.
- Auth callback does not race with the global `/auth/me` check under React StrictMode.

## Required data rules

- User documents expose `user_id`, never MongoDB `_id`.
- Session documents use the same `user_id` value.
- MongoDB reads returning API data always use `{"_id": 0}` projections.
- Datetimes are timezone-aware at application boundaries.
- Update `/app/memory/test_credentials.md` with password-based test accounts and linked Google identities.

## Testing-agent instruction

The testing agent must read this file before testing any auth-gated MoodBite flow.