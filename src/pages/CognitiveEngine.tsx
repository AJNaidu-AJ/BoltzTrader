import React from 'react';
import { CognitiveNetwork } from '@/components/cognitive/CognitiveNetwork';

const CognitiveEngine: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">🧠 Cognitive Engine</h1>
        <p className="text-gray-600 mt-2">
          LangGraph Node Network - Autonomous AI Trading Brain
        </p>
      </div>
      
      <CognitiveNetwork />
    </div>
  );
};

export default CognitiveEngine;