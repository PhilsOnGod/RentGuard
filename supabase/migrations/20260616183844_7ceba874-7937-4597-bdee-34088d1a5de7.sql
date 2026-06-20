
-- 1. Add coordinates to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS latitude numeric(9,6),
  ADD COLUMN IF NOT EXISTS longitude numeric(9,6);

-- Backfill approximate coordinates for seeded cities
UPDATE public.properties SET latitude = 6.4474, longitude = 3.4553 WHERE latitude IS NULL AND city ILIKE 'Lekki%';
UPDATE public.properties SET latitude = 6.5074, longitude = 3.3792 WHERE latitude IS NULL AND city ILIKE 'Yaba%';
UPDATE public.properties SET latitude = 6.4361, longitude = 3.4283 WHERE latitude IS NULL AND city ILIKE 'Victoria Island%';
UPDATE public.properties SET latitude = 6.4281, longitude = 3.4219 WHERE latitude IS NULL AND city ILIKE 'Ikoyi%';
UPDATE public.properties SET latitude = 6.6018, longitude = 3.3515 WHERE latitude IS NULL AND city ILIKE 'Ikeja%';
UPDATE public.properties SET latitude = 6.5244, longitude = 3.3792 WHERE latitude IS NULL AND state ILIKE 'Lagos%';
UPDATE public.properties SET latitude = 9.0579, longitude = 7.4951 WHERE latitude IS NULL AND city ILIKE 'Wuse%';
UPDATE public.properties SET latitude = 9.0833, longitude = 7.4833 WHERE latitude IS NULL AND city ILIKE 'Maitama%';
UPDATE public.properties SET latitude = 9.0765, longitude = 7.3986 WHERE latitude IS NULL AND state ILIKE 'FCT%' OR state ILIKE 'Abuja%';
UPDATE public.properties SET latitude = 4.8156, longitude = 7.0498 WHERE latitude IS NULL AND state ILIKE 'Rivers%';
UPDATE public.properties SET latitude = 7.3775, longitude = 3.9470 WHERE latitude IS NULL AND state ILIKE 'Oyo%';

-- 2. Conversations table (one per tenant <-> property pair)
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, tenant_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their conversations"
  ON public.conversations FOR SELECT TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = owner_id);

CREATE POLICY "Tenants can start conversations"
  ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Participants can update conversations"
  ON public.conversations FOR UPDATE TO authenticated
  USING (auth.uid() = tenant_id OR auth.uid() = owner_id);

CREATE INDEX conversations_tenant_idx ON public.conversations(tenant_id, last_message_at DESC);
CREATE INDEX conversations_owner_idx ON public.conversations(owner_id, last_message_at DESC);

-- 3. Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL CHECK (length(body) > 0 AND length(body) <= 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages"
  ON public.messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.tenant_id OR auth.uid() = c.owner_id)
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (auth.uid() = c.tenant_id OR auth.uid() = c.owner_id)
    )
  );

CREATE INDEX messages_conversation_idx ON public.messages(conversation_id, created_at);

-- Trigger to bump conversation.last_message_at
CREATE OR REPLACE FUNCTION public.tg_bump_conversation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations SET last_message_at = NEW.created_at WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER messages_bump_conversation
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.tg_bump_conversation();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
