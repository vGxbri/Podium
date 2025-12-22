-- =========================================================
-- DEBUG: Force reset RLS policies for groups
-- Run this in Supabase SQL Editor
-- =========================================================

-- Step 1: Temporarily disable RLS on groups to verify it's the issue
-- ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies on groups
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'groups'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.groups', pol.policyname);
    END LOOP;
END $$;

-- Step 3: Verify no policies exist
SELECT 'Existing policies after cleanup:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'groups';

-- Step 4: Create simple policies that should work

-- SELECT: Anyone authenticated can see groups they're in OR public groups
CREATE POLICY "groups_select_policy"
  ON public.groups FOR SELECT
  TO authenticated
  USING (true); -- Temporarily allow all to debug

-- INSERT: Any authenticated user can create groups (with their user id as created_by)
CREATE POLICY "groups_insert_policy"
  ON public.groups FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- UPDATE: Admins can update their groups  
CREATE POLICY "groups_update_policy"
  ON public.groups FOR UPDATE
  TO authenticated
  USING (true); -- Temporarily allow all to debug

-- DELETE: Owners can delete their groups
CREATE POLICY "groups_delete_policy"
  ON public.groups FOR DELETE
  TO authenticated
  USING (true); -- Temporarily allow all to debug

-- Step 5: Verify policies were created
SELECT 'New policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'groups';

-- Step 6: Make sure RLS is enabled
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Step 7: Also fix group_members policies for the trigger
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.group_members', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "group_members_select_policy"
  ON public.group_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "group_members_insert_policy"
  ON public.group_members FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow all inserts (trigger needs this)

CREATE POLICY "group_members_update_policy"
  ON public.group_members FOR UPDATE
  TO authenticated
  USING (true);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Step 8: Make trigger function SECURITY DEFINER
CREATE OR REPLACE FUNCTION add_group_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Done! Try creating a group now.' as result;
