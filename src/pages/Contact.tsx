
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Get current user
  const [user, setUser] = useState<any>(null);
  
  // Check for current user on component mount
  useState(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setEmail(user.email || "");
      }
    };
    getCurrentUser();
  });

  // Fetch user's messages if logged in
  const { data: userMessages, refetch } = useQuery({
    queryKey: ['contact-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure user has a profile if logged in
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          const { error: createProfileError } = await supabase
            .from('profiles')
            .insert([{ id: user.id, email: user.email }]);
          
          if (createProfileError) {
            console.error('Profile creation error:', createProfileError);
          }
        }
      }

      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            user_id: user?.id || null,
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your message has been sent successfully!",
      });

      // Reset form
      setName("");
      setMessage("");
      if (!user) {
        setEmail("");
      }

      // Refetch messages if user is logged in
      if (user) {
        refetch();
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 animate-fadeIn">Contact Us</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="glass-panel p-6 rounded-lg animate-fadeIn" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-2xl font-semibold mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name
                  </label>
                  <Input 
                    id="name" 
                    placeholder="Your name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!!user}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    className="min-h-[150px]"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>

            {/* Message History for logged in users */}
            {user && (
              <div className="glass-panel p-6 rounded-lg animate-fadeIn" style={{ animationDelay: "0.4s" }}>
                <h2 className="text-2xl font-semibold mb-6">Your Messages</h2>
                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {userMessages && userMessages.length > 0 ? (
                    userMessages.map((msg) => (
                      <div key={msg.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">Your Message</h3>
                          <span className="text-sm text-muted-foreground">
                            {new Date(msg.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm bg-muted p-3 rounded">{msg.message}</p>
                        
                        {msg.admin_reply && (
                          <>
                            <div className="flex justify-between items-start mt-4">
                              <h4 className="font-medium text-primary">Admin Reply</h4>
                              {msg.replied_at && (
                                <span className="text-sm text-muted-foreground">
                                  {new Date(msg.replied_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-sm bg-primary/10 p-3 rounded">{msg.admin_reply}</p>
                          </>
                        )}
                        
                        {!msg.admin_reply && (
                          <p className="text-sm text-muted-foreground italic">
                            Waiting for admin response...
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No messages yet. Send your first message!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="py-6 px-4 bg-secondary/10 mt-12">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sujal Khadgi. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
