BEGIN TRANSACTION;

-- Remove duplicate rows, keeping the first row for each votekey (by rowid)
DELETE FROM votekeys
WHERE rowid NOT IN (
  SELECT MIN(rowid) FROM votekeys GROUP BY votekey
);

-- Enforce uniqueness on the votekey column
CREATE UNIQUE INDEX IF NOT EXISTS idx_votekeys_votekey_unique ON votekeys(votekey);

COMMIT;