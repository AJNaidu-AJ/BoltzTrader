import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MessageSquare, Star, X } from 'lucide-react';

interface FeedbackData {
  type: 'bug' | 'feature' | 'improvement' | 'general';
  rating: number;
  message: string;
  page_url: string;
  user_agent: string;
}

export const FeedbackWidget = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    type: 'general',
    rating: 0,
    message: '',
    page_url: window.location.href,
    user_agent: navigator.userAgent
  });
  const [loading, setLoading] = useState(false);

  const submitFeedback = async () => {
    if (!feedback.message?.trim()) {
      toast({ title: "Error", description: "Please provide feedback message", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('user_feedback')
        .insert({
          user_id: user?.id,
          type: feedback.type,
          rating: feedback.rating,
          message: feedback.message,
          page_url: feedback.page_url,
          user_agent: feedback.user_agent,
          status: 'new'
        });

      toast({ title: "Success", description: "Thank you for your feedback!" });
      
      setFeedback({
        type: 'general',
        rating: 0,
        message: '',
        page_url: window.location.href,
        user_agent: navigator.userAgent
      });
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 cursor-pointer transition-colors ${
            star <= (feedback.rating || 0) 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
        />
      ))}
    </div>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Feedback</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label>Feedback Type</Label>
            <Select
              value={feedback.type}
              onValueChange={(value: FeedbackData['type']) => 
                setFeedback(prev => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">🐛 Bug Report</SelectItem>
                <SelectItem value="feature">✨ Feature Request</SelectItem>
                <SelectItem value="improvement">🚀 Improvement</SelectItem>
                <SelectItem value="general">💬 General Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rating (Optional)</Label>
            <div className="mt-2">
              {renderStars()}
            </div>
          </div>

          <div>
            <Label>Message</Label>
            <Textarea
              value={feedback.message}
              onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us what you think..."
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={submitFeedback} disabled={loading} className="flex-1">
              {loading ? 'Sending...' : 'Send Feedback'}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Your feedback helps us improve BoltzTrader</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};