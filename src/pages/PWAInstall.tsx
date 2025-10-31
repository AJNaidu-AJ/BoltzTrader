import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Zap, Bell, Wifi } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsInstalled(true);
    }
  };

  const features = [
    {
      icon: Smartphone,
      title: "Home Screen Access",
      description: "Launch BoltzTrader directly from your device's home screen like a native app",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Cached resources mean faster loading and smoother performance",
    },
    {
      icon: Wifi,
      title: "Offline Support",
      description: "Access cached signals and data even without an internet connection",
    },
    {
      icon: Bell,
      title: "Push Notifications",
      description: "Receive instant alerts for high-confidence trading signals",
    },
  ];

  if (isInstalled) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">App Already Installed</CardTitle>
            <CardDescription>
              BoltzTrader is already installed on your device. You can launch it from your home screen.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="border-primary/20">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="h-10 w-10 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl mb-2">Install BoltzTrader</CardTitle>
              <CardDescription className="text-base">
                Get the best trading signals experience with our Progressive Web App
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {deferredPrompt ? (
              <Button size="lg" onClick={handleInstall} className="w-full max-w-sm">
                <Download className="mr-2 h-5 w-5" />
                Install Now
              </Button>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground max-w-md">
                  To install BoltzTrader on your device:
                </p>
                <div className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                  <p className="font-medium">On iPhone/iPad:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Tap the Share button in Safari</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                  <p className="font-medium mt-3">On Android:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Tap the menu button (three dots)</li>
                    <li>Tap "Install app" or "Add to Home screen"</li>
                    <li>Tap "Install" to confirm</li>
                  </ol>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg mb-1">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Additional Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Why Install?</CardTitle>
            <CardDescription>
              Installing BoltzTrader as a PWA gives you a native app-like experience with these benefits:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>No app store downloads required - install directly from your browser</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Automatic updates - always get the latest features without manual updates</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Works across all devices - same experience on phone, tablet, and desktop</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Minimal storage footprint - much smaller than traditional apps</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <span>Enhanced security - runs in browser sandbox with HTTPS encryption</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PWAInstall;
