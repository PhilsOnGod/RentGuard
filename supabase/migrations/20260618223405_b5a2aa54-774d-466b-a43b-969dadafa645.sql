
-- Helper: is the caller a participant of the conversation referenced by the first folder of the path?
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = _conversation_id
      AND (_user_id = c.tenant_id OR _user_id = c.owner_id)
  )
$$;

DROP POLICY IF EXISTS "chat_attach_select" ON storage.objects;
DROP POLICY IF EXISTS "chat_attach_insert" ON storage.objects;
DROP POLICY IF EXISTS "chat_attach_delete" ON storage.objects;

CREATE POLICY "chat_attach_select" ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (
    public.is_conversation_participant((storage.foldername(name))[1]::uuid, auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  )
);

CREATE POLICY "chat_attach_insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-attachments'
  AND owner = auth.uid()
  AND public.is_conversation_participant((storage.foldername(name))[1]::uuid, auth.uid())
);

CREATE POLICY "chat_attach_delete" ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-attachments'
  AND (owner = auth.uid() OR public.has_role(auth.uid(), 'admin'))
);
