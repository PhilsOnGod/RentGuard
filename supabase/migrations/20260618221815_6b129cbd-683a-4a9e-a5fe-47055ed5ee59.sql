-- 1) profiles: restrict SELECT to authenticated users (phone column was leaking to anon)
DROP POLICY IF EXISTS "Profiles are public" ON public.profiles;
CREATE POLICY "Authenticated can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2) properties: keep public listings browsable but hide contact phones from anon via column grants
REVOKE SELECT ON public.properties FROM anon;
GRANT SELECT (
  id, address, city, state, lga, property_type, bedrooms, annual_rent_naira,
  description, landlord_name, agent_name, status, verified_at, verified_by,
  admin_notes, created_at, updated_at, latitude, longitude, submitted_by
) ON public.properties TO anon;
GRANT SELECT ON public.properties TO authenticated;

-- 3) user_roles: restrictive INSERT policy so only admins can grant roles
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
CREATE POLICY "Only admins can insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) realtime.messages: restrict private channel subscriptions to conversation participants
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Conversation participants can subscribe" ON realtime.messages;
CREATE POLICY "Conversation participants can subscribe"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.conversations c
    WHERE realtime.topic() = 'thread-' || c.id::text
      AND (auth.uid() = c.tenant_id OR auth.uid() = c.owner_id)
  )
);