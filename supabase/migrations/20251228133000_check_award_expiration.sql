-- Function to check and expiration of an award securely
-- This allows any authenticated user to trigger the completion if the deadline has passed
CREATE OR REPLACE FUNCTION public.check_award_expiration(check_award_id UUID)
RETURNS JSONB AS $$
DECLARE
  award_record RECORD;
  ref_time TIMESTAMPTZ;
BEGIN
  -- Get the award
  SELECT * INTO award_record FROM public.awards WHERE id = check_award_id;
  
  IF award_record IS NULL THEN
    RETURN '{"success": false, "error": "Award not found"}'::jsonb;
  END IF;

  -- Check if already completed
  IF award_record.status = 'completed' THEN
    RETURN '{"success": true, "status": "already_completed"}'::jsonb;
  END IF;

  -- Check if voting and expired
  ref_time := NOW();
  IF award_record.status = 'voting' AND award_record.voting_end_at IS NOT NULL AND award_record.voting_end_at <= ref_time THEN
    
    -- Perform completion logic (same as declareWinner logic but in SQL)
    -- We can call an internal function or just do it here.
    -- Ideally we'd reuse code, but for now let's implement the winner selection here.
    
    -- Get max votes
    DECLARE
        max_votes INTEGER;
    BEGIN
        SELECT MAX(vote_count) INTO max_votes FROM public.nominees WHERE award_id = check_award_id;

        IF max_votes > 0 THEN
            -- Mark ALL ties as winners
            UPDATE public.nominees 
            SET is_winner = true 
            WHERE award_id = check_award_id AND vote_count = max_votes;

            -- Get one winner id for the award record (just to not be null)
            DECLARE
                any_winner_id UUID;
            BEGIN
                SELECT user_id INTO any_winner_id FROM public.nominees 
                WHERE award_id = check_award_id AND is_winner = true 
                LIMIT 1;

                -- Update award
                UPDATE public.awards 
                SET status = 'completed', 
                    winner_id = any_winner_id, 
                    completed_at = ref_time
                WHERE id = check_award_id;
                
                RETURN '{"success": true, "status": "completed_with_winners"}'::jsonb;
            END;
        ELSE
             -- No votes => DESERTED
            UPDATE public.awards 
            SET status = 'completed', 
                completed_at = ref_time,
                winner_id = NULL
            WHERE id = check_award_id;
            
            RETURN '{"success": true, "status": "completed_no_winner"}'::jsonb;
        END IF; 
    END;
    
  END IF;

  RETURN '{"success": false, "status": "not_expired"}'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
