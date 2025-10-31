import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { ZerodhaClient } from './brokers/zerodha.js';
import { AlpacaClient } from './brokers/alpaca.js';
import { PaperTradeClient } from './brokers/paper.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize broker clients
const brokers = {
  zerodha: new ZerodhaClient(),
  alpaca: new AlpacaClient(),
  paper: new PaperTradeClient()
};

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'broker-service' });
});

// Place order endpoint
app.post('/place-order', async (req, res) => {
  try {
    const { 
      userId, 
      signalId, 
      symbol, 
      side, 
      quantity, 
      orderType = 'market',
      price,
      broker = 'paper',
      isPaperTrade = true 
    } = req.body;

    // Validate required fields
    if (!userId || !symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Select broker client
    const brokerClient = isPaperTrade ? brokers.paper : brokers[broker];
    if (!brokerClient) {
      return res.status(400).json({ error: 'Invalid broker' });
    }

    // Create trade record
    const { data: trade, error: tradeError } = await supabase
      .from('trades')
      .insert({
        user_id: userId,
        signal_id: signalId,
        symbol,
        side,
        quantity,
        price: price || 0,
        order_type: orderType,
        broker: isPaperTrade ? 'paper' : broker,
        is_paper_trade: isPaperTrade,
        status: 'pending'
      })
      .select()
      .single();

    if (tradeError) throw tradeError;

    // Place order with broker
    const orderResult = await brokerClient.placeOrder({
      symbol,
      side,
      quantity,
      orderType,
      price
    });

    // Update trade with broker response
    const { error: updateError } = await supabase
      .from('trades')
      .update({
        broker_order_id: orderResult.orderId,
        status: orderResult.status,
        filled_quantity: orderResult.filledQuantity || 0,
        filled_price: orderResult.filledPrice,
        filled_at: orderResult.status === 'filled' ? new Date().toISOString() : null,
        metadata: orderResult.metadata || {}
      })
      .eq('id', trade.id);

    if (updateError) throw updateError;

    res.json({
      success: true,
      tradeId: trade.id,
      brokerOrderId: orderResult.orderId,
      status: orderResult.status,
      message: `Order ${orderResult.status} successfully`
    });

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({ 
      error: 'Failed to place order', 
      details: error.message 
    });
  }
});

// Simulate order endpoint (for paper trading)
app.post('/simulate-order', async (req, res) => {
  try {
    const orderData = { ...req.body, isPaperTrade: true };
    
    // Use the same place-order logic but force paper trading
    req.body = orderData;
    
    // Delegate to place-order endpoint
    return app._router.handle(
      { ...req, method: 'POST', url: '/place-order' },
      res
    );
    
  } catch (error) {
    console.error('Simulate order error:', error);
    res.status(500).json({ 
      error: 'Failed to simulate order', 
      details: error.message 
    });
  }
});

// Get user trades
app.get('/trades/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: trades, error } = await supabase
      .from('trades')
      .select(`
        *,
        signals (symbol, company_name, confidence)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({ trades });

  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trades', 
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Broker service running on port ${port}`);
});