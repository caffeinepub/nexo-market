# Specification

## Summary
**Goal:** Fix persistent “Access Denied” by allowing initial owner/admin bootstrap and admin granting for the additional email `afriyaafathima@gmail.com`, with clear, English error messaging and no privilege escalation once an admin exists.

**Planned changes:**
- Backend: Extend the existing first-admin bootstrap allowlist to include `afriyaafathima@gmail.com` alongside `mohamed.afrith.s.ciet@gmail.com`, and only permit bootstrap when there are zero admins.
- Frontend: Update Admin Login page gating so the “Claim Owner Admin Access” action is shown for signed-in users whose profile email matches either allowed owner email, and only when backend bootstrapping is permitted.
- Both: Ensure the existing “Add admin by email” flow can grant admin to `afriyaafathima@gmail.com` when a matching profile exists; if no profile exists, return/show an explicit English error instructing the user to sign in and complete profile setup first.
- Frontend: When bootstrap is rejected because an admin already exists, show an English message instructing the user to contact an existing admin.

**User-visible outcome:** The account with email `afriyaafathima@gmail.com` can claim initial admin access only during first-time setup (no admins yet), and can be granted admin later via the existing admin-by-email flow with clear guidance if the user profile doesn’t exist or an admin already exists.
