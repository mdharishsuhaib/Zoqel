-- V10: Ensure demo-workspace isolation
-- Creates a fixed demo user (if not exists) always pinned to demo-workspace.
-- Ensures demo-workspace exists independently of any real user workspace.

-- Create demo user (idempotent)
INSERT INTO app_users (id, full_name, email, password_hash, workspace_id, created_at)
VALUES (
    'demo-user-fixed',
    'Zoqel Demo',
    'demo@zoqel.internal',
    -- bcrypt of a random string (account is accessed only via /api/auth/demo, not login)
    '$2a$04$demoHashPlaceholderNotUsedForLoginXXXXXXXXXXXXXXXXXXXX',
    'demo-workspace',
    NOW()
)
ON CONFLICT (id) DO UPDATE SET workspace_id = 'demo-workspace';

-- Ensure demo-workspace row exists (V9 creates it but guard against re-runs)
INSERT INTO workspaces (id, name, business_type)
VALUES ('demo-workspace', 'Zoqel Demo Workspace', 'SaaS')
ON CONFLICT (id) DO NOTHING;

-- Remove demo-workspace from all real registered users
-- (Real users created after V9 have NULL workspace_id until onboarding,
-- but if any were accidentally assigned demo-workspace, fix them)
UPDATE app_users
SET workspace_id = NULL
WHERE workspace_id = 'demo-workspace'
  AND email != 'demo@zoqel.internal';
