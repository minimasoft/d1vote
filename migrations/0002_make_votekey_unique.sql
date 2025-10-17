
-- Enforce uniqueness on the votekey column
CREATE UNIQUE INDEX IF NOT EXISTS idx_votekeys_votekey_unique ON votekeys(votekey);
