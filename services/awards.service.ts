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
        user:profiles (*)
      `)
      .eq('award_id', awardId)
      .order('vote_count', { ascending: false });

    if (nomineesError) throw nomineesError;

    return {
      ...award,
      nominees: (nominees || []).map(n => ({
        ...n,
        user: n.user as any,
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
  async updateAwardStatus(awardId: string, status: AwardStatus): Promise<Award> {
    const updates: Partial<Award> = { status };
    
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
  async addNominee(awardId: string, userId: string, reason?: string): Promise<Nominee> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('nominees')
      .insert({
        award_id: awardId,
        user_id: userId,
        nominated_by: user.id,
        nomination_reason: reason || null,
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
        throw new Error('You have already voted for this award');
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
      .order('vote_count', { ascending: false })
      .limit(1);

    if (nomineesError) throw nomineesError;

    if (!nominees || nominees.length === 0) {
      throw new Error('No nominees found');
    }

    const winner = nominees[0];

    // Update nominee as winner
    await supabase
      .from('nominees')
      .update({ is_winner: true })
      .eq('id', winner.id);

    // Update award with winner
    const { data, error } = await supabase
      .from('awards')
      .update({
        winner_id: winner.user_id,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', awardId)
      .select()
      .single();

    if (error) throw error;
    return data;
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
};
