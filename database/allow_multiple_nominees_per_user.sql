-- Drop the unique constraint that prevents a user from being nominated multiple times for the same award.
-- This is necessary for Photo/Video awards where a single user can submit multiple entries.

ALTER TABLE public.nominees
DROP CONSTRAINT IF EXISTS nominees_award_id_user_id_key;
