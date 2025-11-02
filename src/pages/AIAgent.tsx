import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Bot, Zap } from 'lucide-react';
import { boltzCopilot } from '@/lib/openai';

const AIAgent: React.FC = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'BoltzCopilot AI Agent online. How can I assist with your trading operations?', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { role: 'user' as const, content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    try {
      const response = await boltzCopilot.processMessage(input);
      const assistantMessage = { role: 'assistant' as const, content: response, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = { role: 'assistant' as const, content: 'Error processing request. Please try again.', timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickCommands = [
    'explain last trade',
    'show volatility trend', 
    'portfolio summary',
    'risk status',
    'compare momentum vs breakout'
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">AI Agent</h1>
          <p className="text-muted-foreground">
            Natural language interface for trading system control
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                BoltzCopilot Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-muted/30 rounded">
                {messages.map((msg, i) => (
                  <div key={i} className={`p-3 rounded-lg max-w-[80%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-background border'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.role === 'user' ? (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {msg.role === 'user' ? 'You' : 'BoltzCopilot'}
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                ))}
                {loading && (
                  <div className="bg-background border p-3 rounded-lg max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      <span className="text-xs opacity-70">BoltzCopilot</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me about your trading system..."
                  className="flex-1 px-3 py-2 border rounded-md"
                  disabled={loading}
                />
                <Button onClick={handleSend} disabled={loading || !input.trim()}>
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Commands */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Commands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickCommands.map((command, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setInput(command)}
                >
                  {command}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Trade Analysis:</strong> Explain reasoning behind trades and strategy decisions
              </div>
              <div>
                <strong>Risk Monitoring:</strong> Real-time risk assessment and policy status
              </div>
              <div>
                <strong>Performance Review:</strong> Strategy comparison and portfolio analytics
              </div>
              <div>
                <strong>System Control:</strong> Natural language commands for system operations
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAgent;