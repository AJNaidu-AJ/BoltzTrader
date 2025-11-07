import { syncFeedbackToAI } from './trainingAdapter';

async function main() {
  console.log('🕓 Nightly AI Feedback Sync started at', new Date().toISOString());
  
  try {
    await syncFeedbackToAI();
    console.log('✅ AI Feedback Sync completed successfully');
  } catch (error) {
    console.error('❌ AI Feedback Sync failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Cron Sync Failed:', err);
    process.exit(1);
  });
}

export { main as cronSync };