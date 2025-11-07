export function evaluatePerformance(aiReturn: number, benchmarkReturn: number) {
  const alpha = aiReturn - benchmarkReturn;
  const reward = Math.tanh(alpha * 5); // normalized reinforcement signal between -1 and 1
  const outcome =
    alpha > 0.01 ? 'positive' :
    alpha < -0.01 ? 'negative' :
    'neutral';

  return { alpha, reward, outcome };
}