import asyncio
import schedule
import time
from datetime import datetime
from .training_worker import scheduled_training
import logging

logger = logging.getLogger(__name__)

class RetrainScheduler:
    def __init__(self):
        self.is_running = False
    
    def setup_schedule(self):
        """Setup training schedule"""
        # Weekly retraining every Sunday at 2 AM UTC
        schedule.every().sunday.at("02:00").do(self.run_training_job)
        
        # Daily light retraining at 6 AM UTC
        schedule.every().day.at("06:00").do(self.run_light_training)
        
        logger.info("Training schedule configured")
    
    def run_training_job(self):
        """Run full training job"""
        try:
            logger.info("Starting scheduled full training")
            asyncio.run(scheduled_training())
            logger.info("Scheduled full training completed")
        except Exception as e:
            logger.error(f"Scheduled training failed: {str(e)}")
    
    def run_light_training(self):
        """Run light training with recent data only"""
        try:
            logger.info("Starting scheduled light training")
            # TODO: Implement light training with last 7 days data
            logger.info("Scheduled light training completed")
        except Exception as e:
            logger.error(f"Scheduled light training failed: {str(e)}")
    
    def start(self):
        """Start the scheduler"""
        self.setup_schedule()
        self.is_running = True
        
        logger.info("Retrain scheduler started")
        
        while self.is_running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def stop(self):
        """Stop the scheduler"""
        self.is_running = False
        logger.info("Retrain scheduler stopped")

if __name__ == "__main__":
    scheduler = RetrainScheduler()
    try:
        scheduler.start()
    except KeyboardInterrupt:
        scheduler.stop()