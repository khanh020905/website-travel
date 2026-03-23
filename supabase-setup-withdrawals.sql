-- =============================================
-- WITHDRAWALS TABLE (withdrawal requests)
-- =============================================

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  bank_name TEXT NOT NULL,
  bank_account_number TEXT NOT NULL,
  user_display_name TEXT,
  user_email TEXT,
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins full access to withdrawals"
  ON withdrawals FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can view their own withdrawals
CREATE POLICY "Users view own withdrawals"
  ON withdrawals FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own withdrawals
CREATE POLICY "Users insert own withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE withdrawals;

-- Update transactions type constraint to include 'withdrawal'
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('booking', 'topup', 'refund', 'daily_gift', 'withdrawal'));
