import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown } from 'lucide-react';

export function LearningIndicator() {
  const [learningStatus, setLearningStatus] = useState<'learning' | 'improving' | 'stable'>('stable');
  const [recentFeedback, setRecentFeedback] = useState({ positive: 0, negative: 0, neutral: 0 });

  useEffect(() => {
    // Mock learning status updates
    const interval = setInterval(() => {
      const statuses = ['learning', 'improving', 'stable'] as const;
      setLearningStatus(statuses[Math.floor(Math.random() * statuses.length)]);
      
      setRecentFeedback({
        positive: Math.floor(Math.random() * 10),
        negative: Math.floor(Math.random() * 5),
        neutral: Math.floor(Math.random() * 3)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (learningStatus) {
      case 'learning': return 'text-blue-600';
      case 'improving': return 'text-green-600';
      case 'stable': return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (learningStatus) {
      case 'learning': return <Brain className="h-4 w-4 animate-pulse" />;
      case 'improving': return <TrendingUp className="h-4 w-4" />;
      case 'stable': return <TrendingDown className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        {getStatusIcon()}
        <h3 className="font-semibold text-sm">AI Learning Status</h3>
      </div>
      
      <div className={`text-sm font-medium mb-2 ${getStatusColor()}`}>
        {learningStatus.charAt(0).toUpperCase() + learningStatus.slice(1)}
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <div className="text-green-600 font-bold">{recentFeedback.positive}</div>
          <div className="text-gray-500">Positive</div>
        </div>
        <div className="text-center">
          <div className="text-red-600 font-bold">{recentFeedback.negative}</div>
          <div className="text-gray-500">Negative</div>
        </div>
        <div className="text-center">
          <div className="text-gray-600 font-bold">{recentFeedback.neutral}</div>
          <div className="text-gray-500">Neutral</div>
        </div>
      </div>
    </div>
  );
}