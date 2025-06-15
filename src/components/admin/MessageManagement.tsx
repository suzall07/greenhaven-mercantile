
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const MessageManagement = () => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all contact messages
  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-contact-messages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Reply to message mutation
  const replyMutation = useMutation({
    mutationFn: async ({ messageId, reply }: { messageId: string; reply: string }) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          admin_reply: reply,
          replied_at: new Date().toISOString(),
          is_read: true
        })
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reply sent successfully!",
      });
      setReplyingTo(null);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('contact_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contact-messages'] });
    }
  });

  const handleReply = (messageId: string) => {
    if (!replyText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      });
      return;
    }

    replyMutation.mutate({ messageId, reply: replyText.trim() });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact Messages</h2>
        <Badge variant="secondary">
          {messages?.filter(m => !m.is_read).length || 0} unread
        </Badge>
      </div>

      {messages && messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className={`${!message.is_read ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{message.name}</CardTitle>
                    <CardDescription>{message.email}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                    {!message.is_read && (
                      <Badge variant="destructive" className="text-xs">New</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Message:</h4>
                  <p className="bg-muted p-3 rounded text-sm">{message.message}</p>
                </div>

                {message.admin_reply && (
                  <div>
                    <h4 className="font-medium mb-2">Your Reply:</h4>
                    <p className="bg-primary/10 p-3 rounded text-sm">{message.admin_reply}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Replied on {new Date(message.replied_at!).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {!message.is_read && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsReadMutation.mutate(message.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      Mark as Read
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(replyingTo === message.id ? null : message.id);
                      setReplyText(message.admin_reply || "");
                    }}
                  >
                    {message.admin_reply ? 'Edit Reply' : 'Reply'}
                  </Button>
                </div>

                {replyingTo === message.id && (
                  <div className="space-y-3 border-t pt-4">
                    <Textarea
                      placeholder="Type your reply here..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleReply(message.id)}
                        disabled={replyMutation.isPending}
                      >
                        {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No messages yet.
        </div>
      )}
    </div>
  );
};
