# 📚 Phase 2 – Strategy Library  
### The Modular "Strategy Brain" of BoltzTrader

---

## 🎯 **Goal**

Establish a **modular strategy intelligence layer** — a curated library of algorithmic strategies (momentum, breakout, mean-reversion, volume pressure, sentiment fusion, etc.) that the AI can **select, mix, and evolve dynamically** based on real-time market conditions.

This phase transforms BoltzTrader from a *signal-driven system* into a *strategic decision-making engine* capable of autonomous adaptation.

---

## 🧩 **Concept Overview**

The Strategy Library acts as **BoltzTrader's trading brain** — a set of independent, pluggable strategy nodes.  
Each node represents a *distinct trading philosophy* that processes inputs (indicators, sentiment, breakouts) and outputs actionable trade signals.

Instead of one fixed AI model, BoltzTrader now has **a pool of strategic modules** that can be activated or combined depending on the market's behavior.

---

## 🧠 **Strategy Node Types**

| Strategy | Description | Input Signals | Example Condition |
|-----------|--------------|---------------|-------------------|
| **Momentum** | Follows strong directional trends | RSI, EMA, Volume | "Price > EMA50 & RSI > 60 → Long Bias" |
| **Breakout** | Detects price breaking key levels | Support/Resistance, Volume | "Close > Resistance + High Volume → Buy Breakout" |
| **Mean-Reversion** | Trades oversold/overbought reversals | RSI, Bollinger Bands | "RSI < 30 → Expect bounce upward" |
| **Volume-Pressure** | Focuses on liquidity spikes and exhaustion | Volume Delta, OBV | "Sudden +30% volume + rising OBV → bullish pressure" |
| **Sentiment-Fusion** | Combines emotional tone with technicals | News, Tweets, Indicators | "Positive sentiment + bullish chart → Confirmed signal" |

Each strategy node has:
- **Inputs:** market data, indicators, and sentiment metrics  
- **Logic Core:** conditional rules and learned thresholds  
- **Outputs:** trade signal with confidence score  

---

## ⚙️ **How the Strategy Library Works**

1. **Data Flow In**  
   Market data and signals flow from the Phase 1 LangGraph nodes (Data, Indicator, Sentiment, Breakout).

2. **Strategy Evaluation**  
   Each strategy node evaluates the incoming signals against its own rules.

3. **Confidence Scoring**  
   Every node produces a confidence score (0–1) based on its conditions and historical performance.

4. **Strategy Fusion Layer**  
   The system compares and blends top-performing strategies, weighted by confidence and volatility fit.

5. **Selection & Execution**  
   The Strategy Node with the highest contextual fit passes its signal to the **Execution Node**.

6. **Feedback & Reinforcement**  
   Post-trade outcomes are tracked by the **Monitor Node**, updating strategy weights dynamically.

---

## 🧠 **Core Components**

| Component | Purpose |
|------------|----------|
| **Strategy Registry** | Central store of all strategy modules and metadata |
| **Evaluation Engine** | Executes each strategy's logic in parallel using async workers |
| **Fusion Layer** | Combines outputs using confidence weighting & sentiment alignment |
| **Performance Tracker** | Continuously benchmarks live & historical strategy success |
| **Adaptive Router** | Chooses best strategy mix based on volatility and sentiment regimes |

---

## 🔄 **Learning & Adaptation Loop**

```text
Data → Indicators → Strategy Pool → Fusion Layer → Execution
                           ↑                           ↓
                     Performance Tracker ← Monitor Node
```

* After each trade, **Performance Tracker** records accuracy, win/loss ratio, and Sharpe score.
* Results flow back into the Strategy Pool → strategies are **reinforced or penalized** based on outcomes.
* Underperforming strategies are pruned or downgraded; strong ones gain higher priority.

---

## 🧩 **Implementation Notes**

* **Language:** Python (FastAPI microservice) or TypeScript (Supabase Edge Function).
* **Storage:** Supabase (strategy definitions, performance logs).
* **Execution:** Celery/Redis for distributed strategy evaluation.
* **Fusion Engine:** Weighted averaging or Bayesian voting for multi-strategy blending.
* **Backtesting Integration:** Each strategy auto-tested nightly on rolling 90-day windows.

---

## 📊 **Comparison Table**

| Aspect                   | Existing System        | Proposed System                                                               | Benefit                       |
| ------------------------ | ---------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| **Strategy Engine**      | Fixed ensemble model   | Dynamic modular strategy pool — each strategy is a pluggable node             | Adds strategic flexibility    |
| **Strategy Types**       | Generic signals        | Advanced modules: Momentum, Mean-Reversion, Volume-Pressure, Sentiment-Fusion | Broader market adaptability   |
| **Backtesting**          | Static, user-initiated | Continuous benchmarking across all strategies                                 | Auto-optimized performance    |
| **Customizability**      | Developer defined      | User & AI can compose strategies dynamically                                 | Self-evolving portfolios      |
| **Performance Tracking** | Manual                 | Continuous feedback from backtest engine                                      | Instant performance analytics |

---

## 💡 **Key Benefit**

> The AI transitions from *predictive* to *strategic*.
> It can **generate, test, and evolve** strategies — not just emit signals.

This unlocks **adaptive trading**, where BoltzTrader autonomously selects and optimizes strategies that have historically performed best under the **current volatility, sentiment, and regime**.

---

## 🚀 **Outcome**

✅ A **Modular Strategy Library** — BoltzTrader's strategic brain is now flexible, self-evolving, and context-aware.