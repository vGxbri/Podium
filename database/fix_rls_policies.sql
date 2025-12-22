-- =========================================================
-- FIX: RLS Policies for group_members
-- Run this script in Supabase SQL Editor to fix infinite recursion
-- =========================================================

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.group_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.group_members;
DROP POLICY IF EXISTS "Admins can update members" ON public.group_members;

-- Also drop group policies that cause recursion
DROP POLICY IF EXISTS "Users can view groups they belong to" ON public.groups;
DROP POLICY IF EXISTS "Users can create groups" ON public.groups;
DROP POLICY IF EXISTS "Admins can update their groups" ON public.groups;
DROP POLICY IF EXISTS "Owners can delete their groups" ON public.groups;

-- Drop awards policies that reference group_members
DROP POLICY IF EXISTS "Users can view awards in their groups" ON public.awards;
DROP POLICY IF EXISTS "Admins can create awards" ON public.awards;
DROP POLICY IF EXISTS "Admins can update awards" ON public.awards;
DROP POLICY IF EXISTS "Admins can delete awards" ON public.awards;

-- =========================================================
-- Create helper function to check group membership
-- This function is SECURITY DEFINER so it bypasses RLS
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_group_member(check_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = check_group_id
    AND user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_group_admin(check_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = check_group_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_group_owner(check_group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = check_group_id
    AND user_id = auth.uid()
    AND role = 'owner'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get user's group IDs (for use in RLS policies)
CREATE OR REPLACE FUNCTION public.get_my_group_ids()
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT group_id FROM public.group_members
  WHERE user_id = auth.uid()
  AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =========================================================
-- Recreate Groups Policies using helper functions
-- =========================================================

CREATE POLICY "Users can view groups they belong to"
  ON public.groups FOR SELECT
  TO authenticated
  USING (
    public.is_group_member(id)
    OR is_public = true
  );

CREATE POLICY "Admins can update their groups"
  ON public.groups FOR UPDATE
  TO authenticated
  USING (public.is_group_admin(id));

CREATE POLICY "Owners can delete their groups"
  ON public.groups FOR DELETE
  TO authenticated
  USING (public.is_group_owner(id));

-- Allow any authenticated user to create groups
CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);
-- =========================================================
-- Recreate Group Members Policies using helper functions
-- =========================================================

CREATE POLICY "Users can view members of their groups"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id));

CREATE POLICY "Admins can add members"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_group_admin(group_id)
    OR user_id = auth.uid() -- Users can join themselves via invite
  );

CREATE POLICY "Admins can update members"
  ON public.group_members FOR UPDATE
  TO authenticated
  USING (public.is_group_admin(group_id));

-- =========================================================
-- Recreate Awards Policies using helper functions
-- =========================================================

CREATE POLICY "Users can view awards in their groups"
  ON public.awards FOR SELECT
  TO authenticated
  USING (public.is_group_member(group_id));

CREATE POLICY "Admins can create awards"
  ON public.awards FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_group_admin(group_id)
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins can update awards"
  ON public.awards FOR UPDATE
  TO authenticated
  USING (public.is_group_admin(group_id));

CREATE POLICY "Admins can delete awards"
  ON public.awards FOR DELETE
  TO authenticated
  USING (public.is_group_admin(group_id));

-- =========================================================
-- Grant execute permissions on helper functions
-- =========================================================

GRANT EXECUTE ON FUNCTION public.is_group_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_group_owner(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_group_ids() TO authenticated;

-- =========================================================
-- Fix: Trigger function needs SECURITY DEFINER to bypass RLS
-- =========================================================

-- Recreate the function that adds group creator as owner
CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists
DROP TRIGGER IF EXISTS group_creator_trigger ON public.groups;
CREATE TRIGGER group_creator_trigger
  AFTER INSERT ON public.groups
  FOR EACH ROW EXECUTE FUNCTION add_group_creator_as_owner();
