# 🧪 BoltzTrader Sample Tests - Stock Search & Data

## 🎯 **Quick Test Scenarios**

### **Test 1: Stock Search Functionality**

**Go to**: `https://boltz-trader.vercel.app/dashboard`

**Test Cases:**
1. **Search Indian Stocks**:
   - Search: `RELIANCE`
   - Expected: Reliance Industries data appears
   - Search: `TCS`
   - Expected: Tata Consultancy Services data
   - Search: `INFY`
   - Expected: Infosys data

2. **Search US Stocks**:
   - Search: `AAPL`
   - Expected: Apple Inc. data
   - Search: `MSFT`
   - Expected: Microsoft data
   - Search: `TSLA`
   - Expected: Tesla data

3. **Search Crypto**:
   - Search: `BTCUSDT`
   - Expected: Bitcoin price data
   - Search: `ETHUSDT`
   - Expected: Ethereum price data

### **Test 2: Live Market Data**

**Go to**: `https://boltz-trader.vercel.app/global-markets`

**Test Cases:**
1. **Market Overview Cards**:
   - Check if market cards show current prices
   - Verify percentage changes (green/red colors)
   - Test real-time updates

2. **Interactive Charts**:
   - Click on different stocks
   - Check if charts load properly
   - Test different timeframes (5m, 15m, 1h)

3. **Market Heatmap**:
   - Verify sector-wise performance
   - Check color coding (green=up, red=down)
   - Test hover interactions

### **Test 3: AI Signal Generation**

**Go to**: `https://boltz-trader.vercel.app/terminal`

**Test Cases:**
1. **AI Copilot**:
   - Type: "What's the trend for RELIANCE?"
   - Type: "Show me top performing stocks"
   - Type: "Explain market sentiment"

2. **Signal Confidence**:
   - Check if AI signals show confidence scores
   - Verify signal reasoning is displayed
   - Test signal updates in real-time

### **Test 4: Trading Terminal**

**Go to**: `https://boltz-trader.vercel.app/terminal`

**Test Cases:**
1. **7-Panel Layout**:
   - Dashboard panel loads
   - Strategies panel shows data
   - Risk panel displays metrics
   - Orders panel is functional
   - Monitor panel tracks performance
   - Copilot panel responds
   - LangGraph panel visualizes

2. **Real-time Updates**:
   - Check if data updates automatically
   - Verify WebSocket connections
   - Test performance (should be smooth)

### **Test 5: Broker Integration**

**Go to**: `https://boltz-trader.vercel.app/brokers`

**Test Cases:**
1. **Zerodha Connection**:
   - Click "Connect Zerodha"
   - Should redirect to Zerodha login
   - Test authentication flow
   - Check if account data loads

2. **Account Information**:
   - Verify balance display
   - Check holdings information
   - Test order placement (sandbox mode)

---

## 🚀 **Quick Test Commands**

### **1. Test Stock Search (Dashboard)**
```
1. Go to: https://boltz-trader.vercel.app/dashboard
2. Look for search box
3. Type: "RELIANCE"
4. Press Enter
5. Expected: Stock data appears with price, charts, signals
```

### **2. Test AI Copilot (Terminal)**
```
1. Go to: https://boltz-trader.vercel.app/terminal
2. Find AI Copilot panel
3. Type: "analyze AAPL"
4. Press Enter
5. Expected: AI responds with analysis
```

### **3. Test Live Charts (Global Markets)**
```
1. Go to: https://boltz-trader.vercel.app/global-markets
2. Look for market charts
3. Click on any stock symbol
4. Expected: Interactive chart loads with real-time data
```

### **4. Test Strategy Performance**
```
1. Go to: https://boltz-trader.vercel.app/strategy-library
2. Look for strategy list
3. Click "Test Strategies"
4. Expected: Shows strategy performance with confidence scores
```

---

## 📊 **Expected Results**

### **Working Features:**
- ✅ Landing page loads
- ✅ Authentication works
- ✅ Dashboard shows mock data
- ✅ Charts render properly
- ✅ Navigation works
- ✅ Terminal interface loads

### **Features Needing API Keys:**
- ⚠️ Real stock data (needs market data API)
- ⚠️ AI responses (needs OpenAI API key)
- ⚠️ Live trading (needs broker API keys)
- ⚠️ Real-time updates (needs WebSocket data)

### **Mock Data Available:**
- ✅ Sample stock symbols (AAPL, MSFT, RELIANCE, TCS)
- ✅ Demo charts and visualizations
- ✅ Simulated AI signals
- ✅ Mock portfolio data
- ✅ Sample performance metrics

---

## 🎯 **Test Priority Order**

1. **Basic Navigation** (5 minutes)
   - Test all page links work
   - Verify responsive design
   - Check loading speeds

2. **UI Components** (10 minutes)
   - Test charts render
   - Check buttons work
   - Verify forms function

3. **Mock Data Display** (10 minutes)
   - Search for sample stocks
   - View demo charts
   - Check signal displays

4. **Advanced Features** (15 minutes)
   - Test terminal interface
   - Try AI copilot (if OpenAI key added)
   - Test broker connections (if keys added)

---

## 🔧 **If Issues Found:**

### **Common Fixes:**
1. **Charts not loading**: Check browser console for errors
2. **Search not working**: Verify mock data is available
3. **AI not responding**: Add OpenAI API key to Vercel
4. **Broker errors**: Check API credentials in Vercel
5. **Slow loading**: Check network connection

### **Debug Steps:**
1. Open browser developer tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify environment variables in Vercel dashboard

**Start with Test 1 (Stock Search) - it's the most basic and should work with mock data!** 🚀