-- =============================================
-- TRANSACTIONS TABLE (booking history)
-- =============================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) DEFAULT 'booking' CHECK (type IN ('booking', 'topup', 'refund')),
  description TEXT,
  balance_after DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins full access to transactions"
  ON transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Users can view their own transactions
CREATE POLICY "Users view own transactions"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

-- Users can insert their own transactions
CREATE POLICY "Users insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
