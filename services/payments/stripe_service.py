import stripe
import os
from typing import Dict, Any
from datetime import datetime

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class StripePaymentService:
    def __init__(self):
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
    def create_checkout_session(self, strategy_id: str, price: float, user_email: str) -> Dict[str, Any]:
        """Create Stripe checkout session for strategy purchase"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f'Trading Strategy #{strategy_id}',
                            'description': 'Premium trading strategy from BoltzTrader marketplace'
                        },
                        'unit_amount': int(price * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{os.getenv('FRONTEND_URL')}/marketplace?success=true&session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{os.getenv('FRONTEND_URL')}/marketplace?canceled=true",
                customer_email=user_email,
                metadata={
                    'strategy_id': strategy_id,
                    'type': 'strategy_purchase'
                }
            )
            return {
                'success': True,
                'checkout_url': session.url,
                'session_id': session.id
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_creator_payout(self, creator_stripe_account: str, amount: float, strategy_name: str) -> Dict[str, Any]:
        """Create payout to strategy creator (70% revenue share)"""
        try:
            transfer = stripe.Transfer.create(
                amount=int(amount * 100),
                currency='usd',
                destination=creator_stripe_account,
                description=f'Revenue share for strategy: {strategy_name}',
                metadata={
                    'type': 'creator_payout',
                    'strategy_name': strategy_name
                }
            )
            return {
                'success': True,
                'transfer_id': transfer.id,
                'amount': amount
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_monthly_payouts(self, creator_sales: Dict[str, Dict]) -> Dict[str, Any]:
        """Process monthly payouts for all creators"""
        results = []
        
        for creator_id, sales_data in creator_sales.items():
            total_sales = sales_data['total_sales']
            creator_share = total_sales * 0.7
            
            if creator_share >= 50:
                payout_result = self.create_creator_payout(
                    sales_data['stripe_account'],
                    creator_share,
                    f"Monthly payout - {datetime.now().strftime('%B %Y')}"
                )
                results.append({
                    'creator_id': creator_id,
                    'amount': creator_share,
                    'result': payout_result
                })
        
        return {'payouts': results}

payment_service = StripePaymentService()