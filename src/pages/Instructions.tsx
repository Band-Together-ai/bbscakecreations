import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Home, Lock, Star, MessageCircle, Heart } from "lucide-react";

const Instructions = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-fredoka gradient-ocean bg-clip-text text-transparent mb-4">
            How to Use the App
          </h1>
          <p className="text-xl text-dolphin">
            Everything you need to know about Brandia's Baking App
          </p>
        </div>

        {/* Install to Home Screen */}
        <Card className="mb-8 shadow-wave">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-fredoka text-ocean-deep text-2xl">
              <Smartphone className="w-6 h-6 text-ocean-wave" />
              Install to Your Home Screen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              You can add this app to your phone's home screen for quick access—just like a real app!
            </p>

            <div className="space-y-4">
              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="text-2xl">🍎</span> iPhone/iPad (Safari)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Open this website in Safari (not Chrome or other browsers)</li>
                  <li>Tap the Share button <span className="inline-block">⎙</span> at the bottom of your screen</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" in the top right corner</li>
                  <li>The app icon will appear on your home screen!</li>
                </ol>
              </div>

              <div className="bg-muted/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="text-2xl">🤖</span> Android (Chrome)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Open this website in Chrome</li>
                  <li>Tap the three-dot menu (⋮) in the top right</li>
                  <li>Tap "Add to Home screen" or "Install app"</li>
                  <li>Tap "Add" or "Install"</li>
                  <li>The app icon will appear on your home screen!</li>
                </ol>
              </div>

              <div className="bg-seaweed/10 p-4 rounded-lg border-l-4 border-seaweed">
                <p className="text-sm">
                  <strong>Pro Tip:</strong> Once installed, the app will work offline and load faster, just like a native app from the app store!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How the App Works */}
        <Card className="mb-8 shadow-wave">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-fredoka text-ocean-deep text-2xl">
              <Home className="w-6 h-6 text-ocean-wave" />
              How the App Works
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              💬 Click any section below to chat with Sasha and learn more!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-ocean-wave hover:bg-ocean-foam/20 cursor-pointer transition-all group"
              onClick={() => navigate('/chat', { state: { initialMessage: 'Tell me more about browsing recipes and how the recipe collection works!' } })}
            >
              <Star className="w-5 h-5 text-coral mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold mb-1 group-hover:text-ocean-wave transition-colors">
                  Browse Recipes 
                  <span className="text-xs text-ocean-wave ml-2">→ Ask Sasha</span>
                </h4>
                <p className="text-muted-foreground text-sm">
                  Explore Brandia's collection of from-scratch cake recipes. Each recipe includes beautiful photos and detailed instructions.
                </p>
              </div>
            </div>

            <div 
              className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-ocean-wave hover:bg-ocean-foam/20 cursor-pointer transition-all group"
              onClick={() => navigate('/chat', { state: { initialMessage: 'Explain the difference between free and subscription recipes. What do I get with each?' } })}
            >
              <Lock className="w-5 h-5 text-ocean-wave mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold mb-1 group-hover:text-ocean-wave transition-colors">
                  Free vs. Subscription Recipes
                  <span className="text-xs text-ocean-wave ml-2">→ Ask Sasha</span>
                </h4>
                <p className="text-muted-foreground text-sm">
                  During our launch phase, all recipes are free! Normally, the first 3 recipes are always free, and the rest require a subscription to view full ingredients and instructions.
                </p>
              </div>
            </div>

            <div 
              className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-ocean-wave hover:bg-ocean-foam/20 cursor-pointer transition-all group"
              onClick={() => navigate('/chat', { state: { initialMessage: 'Tell me everything you can do as my AI baking assistant! What questions can I ask you?' } })}
            >
              <MessageCircle className="w-5 h-5 text-seaweed mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold mb-1 group-hover:text-ocean-wave transition-colors">
                  Chat with Sasha (AI Assistant)
                  <span className="text-xs text-ocean-wave ml-2">→ Ask Sasha</span>
                </h4>
                <p className="text-muted-foreground text-sm">
                  Ask Sasha baking questions, get recipe modifications, troubleshoot problems, or learn new techniques. She's your personal baking coach!
                </p>
              </div>
            </div>

            <div 
              className="flex items-start gap-3 p-3 rounded-lg border border-transparent hover:border-ocean-wave hover:bg-ocean-foam/20 cursor-pointer transition-all group"
              onClick={() => navigate('/chat', { state: { initialMessage: 'How does the tip jar work? How can I support Brandia?' } })}
            >
              <Heart className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <h4 className="font-semibold mb-1 group-hover:text-ocean-wave transition-colors">
                  Support Brandia
                  <span className="text-xs text-ocean-wave ml-2">→ Ask Sasha</span>
                </h4>
                <p className="text-muted-foreground text-sm">
                  If you love a recipe, you can send a tip via Venmo. Every contribution helps keep the baking magic alive!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Features */}
        <Card className="mb-8 shadow-wave">
          <CardHeader>
            <CardTitle className="font-fredoka text-ocean-deep text-2xl">
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-coral mt-1">✓</span>
                <span className="text-muted-foreground">
                  <strong>From-Scratch Recipes:</strong> No box mixes, no shortcuts—just real ingredients and real baking.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral mt-1">✓</span>
                <span className="text-muted-foreground">
                  <strong>Gluten-Free Options:</strong> Many recipes can be adapted to be gluten-free without sacrificing texture or flavor.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral mt-1">✓</span>
                <span className="text-muted-foreground">
                  <strong>Beautiful Photos:</strong> See exactly what your cake should look like with high-quality images.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral mt-1">✓</span>
                <span className="text-muted-foreground">
                  <strong>Download Recipes:</strong> Save recipes to your device for offline access (subscription required).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-coral mt-1">✓</span>
                <span className="text-muted-foreground">
                  <strong>Community Forum:</strong> Share your baking creations and connect with other bakers (coming soon).
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Tips for Best Experience */}
        <Card className="shadow-wave">
          <CardHeader>
            <CardTitle className="font-fredoka text-ocean-deep text-2xl">
              Tips for Best Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Use Safari on iPhone or Chrome on Android for the best experience</li>
              <li>• Install the app to your home screen for quick access</li>
              <li>• Turn on notifications to get alerts about new recipes (coming soon)</li>
              <li>• Rate and review recipes to help other bakers</li>
              <li>• Chat with Sasha when you have questions—she's here to help!</li>
              <li>• Support Brandia with tips if you enjoy the recipes</li>
            </ul>
          </CardContent>
        </Card>

        {/* Need Help? */}
        <div className="mt-12 text-center bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
          <h3 className="text-2xl font-fredoka text-ocean-deep mb-3">
            Need Help?
          </h3>
          <p className="text-muted-foreground mb-4">
            Have questions or running into issues? Chat with Sasha or reach out to Brandia directly.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/chat" 
              className="inline-block px-6 py-3 gradient-ocean text-white rounded-full font-medium hover:scale-105 transition-transform"
            >
              Chat with Sasha
            </a>
            <a 
              href="/about" 
              className="inline-block px-6 py-3 bg-white border-2 border-ocean-wave text-ocean-deep rounded-full font-medium hover:scale-105 transition-transform"
            >
              About Brandia
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
