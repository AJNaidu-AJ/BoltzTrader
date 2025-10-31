import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Zap, 
  Target, 
  ArrowRight, 
  BarChart3, 
  Brain, 
  Shield, 
  CheckCircle2,
  Sparkles,
  Activity,
  LineChart
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(34,197,94,0.1),transparent_50%)]" />
        
        <div className="container relative mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="premium" className="mb-4 animate-fade-in">
              <Sparkles className="h-3 w-3 mr-1" />
              AI-Powered Trading Intelligence
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight animate-fade-in">
              Trade with
              <span className="text-gradient block mt-2">
                Confidence & Precision
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
              Real-time AI signals with confidence scores and transparent explanations.
              Make data-driven decisions faster than ever.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in">
              <Link to="/signup">
                <Button size="lg" variant="premium" className="text-base px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="glass" className="text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 pt-12 text-sm text-muted-foreground animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Sub-2s Latency</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>95%+ Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Demo Widget */}
      <div className="container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Activity className="h-3 w-3 mr-1" />
              Live Signals
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See BoltzTrader in Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Top performing signals updated in real-time
            </p>
          </div>
          
          <Card className="glass-card border-2 overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-card/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Top 3 Signals</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
                  <span>Live</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { symbol: "AAPL", name: "Apple Inc.", confidence: 0.92, change: "+2.8%", sector: "Technology" },
                  { symbol: "MSFT", name: "Microsoft Corp.", confidence: 0.88, change: "+2.1%", sector: "Technology" },
                  { symbol: "NVDA", name: "NVIDIA Corp.", confidence: 0.85, change: "+3.2%", sector: "Technology" },
                ].map((signal, i) => (
                  <div 
                    key={i} 
                    className="group flex items-center justify-between p-5 border border-border rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-md bg-card/50 hover:bg-card"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Badge variant="premium" className="shadow-sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Top
                      </Badge>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">{signal.symbol}</span>
                          <span className="text-success font-semibold">{signal.change}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{signal.name}</span>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{signal.sector}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">
                          Confidence
                        </div>
                        <div className="font-bold text-lg">
                          {(signal.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-3 gradient-success rounded-full transition-all duration-500 shadow-sm" 
                          style={{ width: `${signal.confidence * 100}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16 lg:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose BoltzTrader?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built for traders who demand speed, transparency, and accuracy
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Sub-2-second latency for real-time market signals and updates. Never miss a trading opportunity.",
                gradient: "from-yellow-500/10 to-orange-500/10"
              },
              {
                icon: Brain,
                title: "AI-Powered Analysis",
                description: "Advanced machine learning algorithms analyze millions of data points to generate high-confidence signals.",
                gradient: "from-purple-500/10 to-pink-500/10"
              },
              {
                icon: Target,
                title: "Transparent Signals",
                description: "Every signal comes with clear explanations and reasoning. Understand the 'why' behind each recommendation.",
                gradient: "from-blue-500/10 to-cyan-500/10"
              },
              {
                icon: BarChart3,
                title: "Multi-Timeframe",
                description: "Analyze markets across 5m, 15m, and 1h timeframes for comprehensive trading strategies.",
                gradient: "from-green-500/10 to-emerald-500/10"
              },
              {
                icon: LineChart,
                title: "Sector Analysis",
                description: "Track sector trends and correlations with interactive heatmaps and market breadth indicators.",
                gradient: "from-red-500/10 to-rose-500/10"
              },
              {
                icon: Shield,
                title: "Proven Accuracy",
                description: "95%+ signal accuracy with transparent historical performance tracking and backtesting.",
                gradient: "from-indigo-500/10 to-blue-500/10"
              },
            ].map((feature, i) => (
              <Card 
                key={i} 
                className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50 hover:border-primary/50"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="flex flex-col space-y-4">
                    <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your Plan
            </h2>
            <p className="text-lg text-muted-foreground">
              Start free, upgrade when you're ready
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: "Retail Trader",
                price: "Free",
                description: "Perfect for getting started",
                features: [
                  "10 AI queries per day",
                  "Basic signal access",
                  "5-minute delayed data",
                  "Email notifications",
                  "Community support"
                ],
                cta: "Start Free",
                variant: "outline" as const
              },
              {
                name: "Power User",
                price: "$49",
                period: "/month",
                description: "For serious traders",
                features: [
                  "Unlimited AI queries",
                  "Real-time signals",
                  "Multi-timeframe analysis",
                  "Advanced charts",
                  "Priority support",
                  "API access"
                ],
                cta: "Get Started",
                variant: "premium" as const,
                popular: true
              },
              {
                name: "Professional",
                price: "$199",
                period: "/month",
                description: "For trading teams",
                features: [
                  "Everything in Power User",
                  "Team collaboration",
                  "Custom integrations",
                  "Dedicated support",
                  "Advanced analytics",
                  "White-label options"
                ],
                cta: "Contact Sales",
                variant: "outline" as const
              },
            ].map((plan, i) => (
              <Card 
                key={i} 
                className={`relative hover:shadow-xl transition-all duration-300 ${plan.popular ? 'border-primary shadow-lg scale-[1.05]' : 'border-border/50'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge variant="premium" className="shadow-lg">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="block">
                    <Button variant={plan.variant} className="w-full" size="lg">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="container mx-auto px-6 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="glass-card border-2 overflow-hidden relative">
            <div className="absolute inset-0 gradient-primary opacity-5" />
            <CardContent className="relative p-12 text-center space-y-6">
              <div className="inline-block p-3 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Trading?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of traders using BoltzTrader to make smarter, 
                faster, and more confident trading decisions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/signup">
                  <Button size="lg" variant="premium" className="text-base px-8">
                    Start Your Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="glass" className="text-base px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-bold text-lg mb-4">BoltzTrader</h3>
              <p className="text-sm text-muted-foreground">
                AI-powered trading intelligence for modern traders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/analysis" className="hover:text-foreground transition-colors">Analysis</Link></li>
                <li><Link to="/sectors" className="hover:text-foreground transition-colors">Sectors</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 BoltzTrader. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
