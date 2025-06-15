
-- Create a table for contact messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_reply TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own messages
CREATE POLICY "Users can create contact messages" 
  ON public.contact_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users can view their own messages
CREATE POLICY "Users can view their own messages" 
  ON public.contact_messages 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Admin can view all messages
CREATE POLICY "Admin can view all messages" 
  ON public.contact_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'sujalkhadgi13@gmail.com'
    )
  );

-- Policy: Admin can update all messages (for replies)
CREATE POLICY "Admin can update all messages" 
  ON public.contact_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'sujalkhadgi13@gmail.com'
    )
  );
