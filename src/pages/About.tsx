
import { Navigation } from "@/components/Navigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 animate-fadeIn">About GreenHaven</h1>
          
          <div className="prose prose-lg space-y-6 animate-fadeIn" style={{ animationDelay: "0.2s" }}>
            <p className="text-lg text-muted-foreground">
              Welcome to GreenHaven, where we believe in bringing the beauty and tranquility of nature into your living spaces. Our journey began with a simple idea: to make it easier for people to create their own indoor sanctuaries.
            </p>
            
            <p className="text-lg text-muted-foreground">
              We carefully curate our collection of plants and décor items, working with sustainable suppliers and artisans who share our commitment to quality and environmental responsibility.
            </p>

            <div className="glass-panel p-6 rounded-lg my-8">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To inspire and enable everyone to create their own green haven, promoting well-being through the connection with nature and thoughtful design.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
