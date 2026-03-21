-- =============================================
-- INVITE CODES TABLE
-- =============================================

-- Create invite_codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(6) NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'revoked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast code lookups
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_status ON invite_codes(status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins full access to invite_codes"
  ON invite_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Anyone can SELECT active codes (needed for validation during registration)
CREATE POLICY "Anyone can check invite codes"
  ON invite_codes FOR SELECT
  USING (true);

-- Anyone can UPDATE invite codes (to mark as used during registration)
CREATE POLICY "Anyone can use invite codes"
  ON invite_codes FOR UPDATE
  USING (status = 'active')
  WITH CHECK (status = 'used');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE invite_codes;
