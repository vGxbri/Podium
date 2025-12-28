-- Give users permission to view their own votes
-- This is necessary for the UI to show "Voted" state even when anonymous voting is on
CREATE POLICY "Users can view own votes"
  ON public.votes FOR SELECT
  TO authenticated
  USING (voter_id = auth.uid());
