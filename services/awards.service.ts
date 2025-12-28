import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from '../lib/supabase';
import {
  Award,
  AwardStatus,
  AwardWithNominees,
  CreateAwardInput,
  Nominee,
  NomineeWithProfile,
  UpdateAwardInput,
} from '../types/database';

export const awardsService = {
  /**
   * Get awards for a group
   */
  async getGroupAwards(groupId: string): Promise<Award[]> {
    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .eq('group_id', groupId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get an award by ID with nominees
   */
  async getAwardById(awardId: string): Promise<AwardWithNominees | null> {
    // Get the award
    const { data: award, error: awardError } = await supabase
      .from('awards')
      .select(`
        *,
        group:groups (*)
      `)
      .eq('id', awardId)
      .single();

    if (awardError) {
      if (awardError.code === 'PGRST116') return null;
      throw awardError;
    }

    // Get nominees with user profiles
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select(`
        *,
        user:profiles!nominees_user_id_fkey (*)
      `)
      .eq('award_id', awardId)
      .order('vote_count', { ascending: false });

    if (nomineesError) throw nomineesError;

    return {
      ...award,
      // Hide winner_id if not revealed for non-admins? 
      // Actually frontend should handle UI hiding, but better to be safe? 
      // For now let's just pass it and trust UI since RLS isn't complex enough yet.
      nominees: (nominees || []).map(n => ({
        ...n,
        user: n.user as any,
        // Hide winner status if not revealed
        is_winner: award.is_revealed ? n.is_winner : false, 
      })) as NomineeWithProfile[],
    };
  },

  /**
   * Create a new award with nominees
   */
  async createAward(input: CreateAwardInput): Promise<Award> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Create the award
    const { data: award, error: awardError } = await supabase
      .from('awards')
      .insert({
        group_id: input.group_id,
        name: input.name,
        description: input.description || null,
        icon: input.icon || '🏆',
        category_id: input.category_id || null,
        vote_type: input.vote_type || 'person',
        status: 'draft',
        created_by: user.id,
        voting_settings: {
          allow_self_vote: false,
          max_votes_per_user: 1,
          anonymous_voting: true,
          show_results_before_end: false,
        },
      })
      .select()
      .single();

    if (awardError) throw awardError;

    // Add nominees
    if (input.nominee_ids.length > 0) {
      const nomineesData = input.nominee_ids.map(userId => ({
        award_id: award.id,
        user_id: userId,
        nominated_by: user.id,
      }));

      const { error: nomineesError } = await supabase
        .from('nominees')
        .insert(nomineesData);

      if (nomineesError) throw nomineesError;
    }

    return award;
  },

  /**
   * Update an award
   */
  async updateAward(awardId: string, input: UpdateAwardInput): Promise<Award> {
    const { data, error } = await supabase
      .from('awards')
      .update(input)
      .eq('id', awardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an award
   */
  async deleteAward(awardId: string): Promise<void> {
    const { error } = await supabase
      .from('awards')
      .delete()
      .eq('id', awardId);

    if (error) throw error;
  },

  /**
   * Change award status
   */
  async updateAwardStatus(awardId: string, status: AwardStatus, votingEndsAt?: string): Promise<Award> {
    const updates: Partial<Award> = { status };
    
    if (status === 'voting' && votingEndsAt) {
      updates.voting_end_at = votingEndsAt;
    }
    
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('awards')
      .update(updates)
      .eq('id', awardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Add a nominee to an award
   */
  async addNominee(awardId: string, userId: string, reason?: string, contentUrl?: string): Promise<Nominee> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('nominees')
      .insert({
        award_id: awardId,
        user_id: userId,
        nominated_by: user.id,
        nomination_reason: reason || null,
        content_url: contentUrl || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Remove a nominee from an award
   */
  async removeNominee(nomineeId: string): Promise<void> {
    const { error } = await supabase
      .from('nominees')
      .delete()
      .eq('id', nomineeId);

    if (error) throw error;
  },

  /**
   * Cast a vote
   */
  async vote(awardId: string, nomineeId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get award details to check type
    const { data: award, error: awardFetchError } = await supabase
      .from('awards')
      .select('vote_type')
      .eq('id', awardId)
      .single();

    if (awardFetchError) throw awardFetchError;

    // Only prevent self-voting if NOT a photo, video, audio or text award
    if (!['photo', 'video', 'audio', 'text'].includes(award.vote_type)) {
      // Check if user is a nominee for this award
      const { data: nomineeCheck, error: checkError } = await supabase
        .from('nominees')
        .select('id')
        .eq('award_id', awardId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (checkError) throw checkError;

      if (nomineeCheck) {
        throw new Error('No puedes votar en un premio donde estás nominado.');
      }
    }

    const { error } = await supabase
      .from('votes')
      .insert({
        award_id: awardId,
        voter_id: user.id,
        nominee_id: nomineeId,
        points: 1,
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Ya has votado para este premio.');
      }
      throw error;
    }
  },

  /**
   * Get user's vote for an award
   */
  async getMyVote(awardId: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('votes')
      .select('nominee_id')
      .eq('award_id', awardId)
      .eq('voter_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data?.nominee_id || null;
  },

  /**
   * Determine and set the winner
   */
  async declareWinner(awardId: string): Promise<Award> {
    // Get nominee with highest votes
    const { data: nominees, error: nomineesError } = await supabase
      .from('nominees')
      .select('*')
      .eq('award_id', awardId)
      .order('vote_count', { ascending: false });

    if (nomineesError) throw nomineesError;

    if (!nominees || nominees.length === 0) {
      throw new Error('No se han encontrado nominados.');
    }

    // Find max votes
    const maxVotes = Math.max(...nominees.map(n => Number(n.vote_count) || 0));

    // Check if there are valid votes
    if (maxVotes > 0) {
      // Find all winners
      const winners = nominees.filter(n => (Number(n.vote_count) || 0) === maxVotes);
      const winnerIds = winners.map(n => n.id);

      // Update all winners
      const { error: updateError } = await supabase
        .from('nominees')
        .update({ is_winner: true })
        .in('id', winnerIds);
        
      if (updateError) throw updateError;

      // Update award with one of the winners (just to confirm completion)
      const { data, error } = await supabase
        .from('awards')
        .update({
          winner_id: winners[0].user_id,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', awardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // No votes - Award Deserted
      const { data, error } = await supabase
        .from('awards')
        .update({
          winner_id: null,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', awardId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  /**
   * Get global award categories
   */
  async getCategories(groupId?: string) {
    let query = supabase
      .from('award_categories')
      .select('*');

    if (groupId) {
      // Get global + group-specific categories
      query = query.or(`is_global.eq.true,group_id.eq.${groupId}`);
    } else {
      // Get only global categories
      query = query.eq('is_global', true);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Reveal the winner
   */
  async revealWinner(awardId: string): Promise<Award> {
    const { data, error } = await supabase
      .from('awards')
      .update({ is_revealed: true })
      .eq('id', awardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Upload nominee media
   */
  async uploadNomineeMedia(awardId: string, uri: string, mimeType?: string, originalFileName?: string): Promise<string> {
    const fileExt = originalFileName ? originalFileName.split('.').pop()?.toLowerCase() || 'bin' : uri.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${awardId}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    let contentType = mimeType;
    // If mimeType is missing OR is generic octet-stream, try to detect from extension
    if (!contentType || contentType === 'application/octet-stream') {
       // Fallback detection
       if (['jpg', 'jpeg', 'png', 'webp'].includes(fileExt)) contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
       else if (['mp4', 'mov', 'avi'].includes(fileExt)) contentType = `video/${fileExt === 'mov' ? 'quicktime' : fileExt}`;
       else if (['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'wma'].includes(fileExt)) {
          // Precise audio mime types
          if (fileExt === 'mp3') contentType = 'audio/mpeg';
          else if (fileExt === 'm4a') contentType = 'audio/mp4';
          else if (fileExt === 'wav') contentType = 'audio/wav';
          else if (fileExt === 'aac') contentType = 'audio/aac';
          else contentType = `audio/${fileExt}`;
       }
       else contentType = 'application/octet-stream';
    }

    // Read file as base64 using Expo FileSystem
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    const { error } = await supabase.storage
      .from('awards')
      .upload(filePath, decode(base64), {
        contentType,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('awards')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },
  
  /**
   * Check if award invalid and expire it if needed
   */
  async checkExpiration(awardId: string): Promise<void> {
    const { error } = await supabase.rpc('check_award_expiration', { 
      check_award_id: awardId 
    });
    
    if (error) throw error;
  },
};
