import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { aiService } from '@/services/ai';

export const useAIChat = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const chatMutation = useMutation({
    mutationFn: (message: string) => aiService.chat(message),
    onSuccess: (response, message) => {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ]);
    }
  });

  const sendMessage = (message: string) => {
    chatMutation.mutate(message);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    messages,
    sendMessage,
    clearChat,
    isLoading: chatMutation.isPending
  };
};

export const useSignalExplanation = () => {
  return useMutation({
    mutationFn: (signal: any) => aiService.generateSignalExplanation(signal)
  });
};