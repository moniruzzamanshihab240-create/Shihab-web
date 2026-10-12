# Security Specification

## 1. Data Invariants
- Each user profile `/users/{userId}` is strictly owned by `request.auth.uid == userId`.
- Users cannot read or modify another user's profile.
- Subcollection `/users/{userId}/securityLogs/{logId}` can only be read and created by the authenticated owner (`request.auth.uid == userId`).
- Profiles cannot have arbitrary shadow fields injected during creation or updates.
- UIDs must match `request.auth.uid` to prevent identity spoofing.

## 2. Dirty Dozen Attack Payloads
1. Attempting to write a user document where `userId != request.auth.uid` (Identity Spoofing).
2. Attempting to read another user's profile without authentication (Unauthenticated Read).
3. Attempting to read another user's profile with different authenticated UID (PII Breach).
4. Attempting to inject `isAdmin: true` into `users/{userId}` (Privilege Escalation).
5. Attempting to pass a non-string or 10MB string as `displayName` (Denial of Wallet).
6. Attempting to update `createdAt` after document initialization (Immutability Bypass).
7. Attempting to create a security log under another user's subcollection (Cross-tenant Log Poisoning).
8. Attempting to delete another user's document (Unauthorized Deletion).
9. Attempting to execute blanket unconstrained list queries on `/users` (Data Scraping).
10. Attempting to bypass path variable validation with invalid characters (Path Traversal/Poisoning).
11. Attempting to update without matching existing owner ID (Ownership Hijacking).
12. Attempting to bypass rate limits or authentication via direct client writes to unauthorized paths.

## 3. Defense Implementation
- Strict `isOwner(userId)` checks: `isSignedIn() && request.auth.uid == userId`.
- `isValidId(userId)` regex validation `^[a-zA-Z0-9_\\-]+$`.
- Explicit schema blueprint validation `isValidUserProfile(incoming())`.
- Default-deny catch-all rule at root.
