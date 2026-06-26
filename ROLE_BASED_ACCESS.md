# SentinelStream - Role-Based Access Control (RBAC)

## Overview

SentinelStream implements a comprehensive Role-Based Access Control (RBAC) system with three user roles, each designed for specific operational needs in fraud detection and transaction monitoring.

## User Roles and Permissions

### 1. Viewer (Read-Only Console)
**Access Level:** Basic - Read-only access

**Permissions:**
- View dashboard analytics and statistics
- View transactions list and details
- View fraud alerts list
- Download reports
- View system settings (read-only)

**Restrictions:**
- Cannot create transactions
- Cannot resolve fraud alerts
- Cannot edit system settings
- Cannot generate or delete reports
- Cannot manage API keys

**Use Case:** For stakeholders who need visibility into fraud detection activities without the ability to modify data or settings.

---

### 2. Analyst (Resolve Alerts, Add Tx)
**Access Level:** Intermediate - Read + Write access

**Permissions:**
- All Viewer permissions, plus:
- Create new transactions
- Resolve fraud alerts (individually or in bulk)
- Generate compliance reports
- Delete reports
- View and analyze transaction trends

**Restrictions:**
- Cannot edit system settings (fraud thresholds, suspicious locations)
- Cannot manage API keys
- Cannot modify user roles

**Use Case:** For fraud analysts and operational staff who actively investigate alerts and manage transactions.

---

### 3. Admin (Full Access, Edit Settings)
**Access Level:** Full - Complete system control

**Permissions:**
- All Analyst permissions, plus:
- Edit system settings (fraud thresholds, high-risk thresholds, suspicious locations)
- Manage API keys (create, revoke)
- Configure session timeout and 2FA settings
- Full control over platform configuration

**Use Case:** For system administrators and managers who need complete control over the platform configuration and security settings.

---

## Sample Login Credentials

The following sample users are pre-configured in the system for testing and demonstration purposes:

### Viewer Account
```
Email: viewer@sentinelstream.com
Password: Viewer123!
Role: Viewer
```

### Analyst Account
```
Email: analyst@sentinelstream.com
Password: Analyst123!
Role: Analyst
```

### Admin Account
```
Email: admin@sentinelstream.com
Password: Admin123!
Role: Admin
```

---

## How to Seed Sample Users

If the sample users are not present in your database, run the seed script:

```bash
# From the project root directory
python -m app.database.seed_users
```

This will create the three sample users with the credentials listed above.

---

## API Endpoint Permissions Summary

| Endpoint | Viewer | Analyst | Admin |
|----------|--------|---------|-------|
| GET /dashboard/ | ✅ | ✅ | ✅ |
| GET /stats/ | ✅ | ✅ | ✅ |
| GET /transactions/ | ✅ | ✅ | ✅ |
| POST /transactions/ | ❌ | ✅ | ✅ |
| PUT /transactions/{id}/status | ❌ | ✅ | ✅ |
| GET /alerts/ | ✅ | ✅ | ✅ |
| PUT /alerts/{id}/resolve | ❌ | ✅ | ✅ |
| POST /alerts/resolve-multiple | ❌ | ✅ | ✅ |
| GET /settings/rules | ✅ | ✅ | ✅ |
| POST /settings/rules | ❌ | ❌ | ✅ |
| GET /settings/keys | ❌ | ❌ | ✅ |
| POST /settings/keys | ❌ | ❌ | ✅ |
| DELETE /settings/keys/{id} | ❌ | ❌ | ✅ |
| GET /reports/ | ✅ | ✅ | ✅ |
| POST /reports/generate | ❌ | ✅ | ✅ |
| GET /reports/{id}/download | ✅ | ✅ | ✅ |
| DELETE /reports/{id} | ❌ | ✅ | ✅ |

---

## Frontend UI Controls by Role

### Dashboard
- **All Roles:** View analytics, charts, and transaction tables
- **Analyst & Admin:** Create transaction form visible
- **Viewer:** Create transaction form hidden

### Alerts Page
- **All Roles:** View alerts list and details
- **Analyst & Admin:** Resolve buttons enabled, bulk resolve available
- **Viewer:** Resolve buttons disabled, shows "View Only" badge

### Settings Page
- **All Roles:** Can view current settings
- **Admin:** Full edit access to fraud rules and API keys
- **Viewer & Analyst:** Access denied message displayed

### Reports Page
- **All Roles:** View and download reports
- **Analyst & Admin:** Generate and delete buttons visible
- **Viewer:** Generate and delete buttons hidden

---

## Security Notes

⚠️ **Important Security Reminders:**

1. **Change Default Passwords:** The sample credentials provided are for testing purposes only. Change these passwords in production environments.

2. **Password Requirements:** All passwords must:
   - Be at least 8 characters long
   - Contain uppercase and lowercase letters
   - Include at least one number
   - Include at least one special character

3. **JWT Token Expiration:** Access tokens expire after 180 minutes (3 hours) by default. Users must re-authenticate after expiration.

4. **Role Hierarchy:** The system enforces a strict role hierarchy:
   - Viewer (Level 1) < Analyst (Level 2) < Admin (Level 3)
   - Higher roles inherit all permissions of lower roles

5. **API Security:** All API endpoints (except login/register) require a valid JWT token in the Authorization header.

---

## Testing Role-Based Access

To test the RBAC system:

1. **Login as Viewer:**
   - Navigate to Settings (should see access denied)
   - Try to resolve an alert (should be disabled)
   - Try to create a transaction (form should be hidden)

2. **Login as Analyst:**
   - Navigate to Settings (should see access denied)
   - Try to resolve an alert (should work)
   - Create a transaction (should work)
   - Try to edit fraud thresholds (should fail with 403 error)

3. **Login as Admin:**
   - Navigate to Settings (full access)
   - Edit fraud thresholds (should work)
   - Manage API keys (should work)
   - All Analyst features should work

---

## Implementation Details

### Backend (FastAPI)
- Role checking implemented in `app/utils/auth.py`
- Helper functions: `require_admin()`, `require_analyst_or_admin()`, `require_viewer_or_above()`
- JWT tokens include role information in the payload
- All protected endpoints use role-checking dependencies

### Frontend (React)
- Auth context in `src/context/AuthContext.jsx` provides role helpers
- Permission checks: `canCreateTransactions`, `canResolveAlerts`, `canEditSettings`, `canGenerateReports`
- UI components conditionally render based on user role
- Client-side checks for better UX (server-side enforcement provides security)

---

## Troubleshooting

### "Access Denied" Errors
If you receive access denied errors:
1. Verify you're logged in with the correct role
2. Check that your JWT token is valid and not expired
3. Ensure the endpoint supports your user role

### Permission Changes Not Reflecting
If role changes don't appear immediately:
1. Clear your browser localStorage (token and user data)
2. Logout and login again to get a fresh JWT token
3. Check the backend logs for any authentication errors

### Seeded Users Not Working
If sample users don't work:
1. Run the seed script: `python -m app.database.seed_users`
2. Verify the database connection is working
3. Check that the user table exists and is properly migrated

---

## Support

For issues or questions about the RBAC system:
1. Check the API documentation in the README
2. Review the implementation in `app/utils/auth.py`
3. Examine the frontend auth context in `src/context/AuthContext.jsx`

---

**Last Updated:** June 2026  
**Version:** 1.0.0
