-- Add edit token support to applications table
-- Allows applicants to edit their application via secure link for 7 days

ALTER TABLE applications
ADD COLUMN edit_token UUID UNIQUE,
ADD COLUMN edit_token_expires_at TIMESTAMPTZ,
ADD COLUMN last_edited_at TIMESTAMPTZ;

-- Index for fast token lookup
CREATE INDEX idx_applications_edit_token ON applications(edit_token) WHERE edit_token IS NOT NULL;
