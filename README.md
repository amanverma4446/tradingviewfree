# FreeTrade Lab — TradingView-style Backtester MVP

## Deploy to GitHub Pages
1. Create a GitHub repository (e.g. `freetrade-lab`).
2. Upload `index.html` and `README.md` to the repository root.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
5. Wait for GitHub to publish the site; its URL appears in Pages settings.

The app has no backend/API key. Charts load the Lightweight Charts library from a CDN, so an internet connection is needed for chart rendering. CSV parsing and backtests run locally in the browser.

## CSV format
Required: `Date` + `Time`, or `Datetime`/`Timestamp`, plus `Open`, `High`, `Low`, `Close`. `Volume`/`Tick Volume` is optional. Comma-separated MT5 bar exports are supported. Export bars, not trade history.

## Strategy interfaces
Visual rule builder supports comparisons across Close/Open/High/Low, EMA20/50, SMA20, RSI14, ATR14, previous High/Low/Close. Conditions are combined with AND.
Code editor is a limited DSL, not full Pine Script:
```text
long = close > ema(close, 20) && ema(close, 20) > ema(close, 50)
short = close < ema(close, 20) && ema(close, 20) < ema(close, 50)
```
Supports `open`, `high`, `low`, `close`, `volume`, `prevClose`, `prevHigh`, `prevLow`, `ema(close,n)`, `sma(close,n)`, `rsi(n)`, `atr(n)`, basic arithmetic, comparisons, `&&`, `||`, and parentheses.

## Important assumptions / limitations
- Signals are evaluated at bar close. Entry is simulated near close with spread and slippage.
- SL/TP are checked using OHLC bars. If both are hit within a candle, the stop is checked first.
- One position at a time. No multi-timeframe logic, pending orders, partial exits, swaps, session filters, margin calls, or tick-by-tick execution.
- Risk sizing assumes price distance × contract units per lot. Verify the contract size and point-value model for your broker/symbol. Contract size 100 is common for gold but is not universal.
- Spread is entered in price units (e.g. 0.30 for XAUUSD). Commission is round-turn per lot.
- Demo data is synthetic, not real prices. Backtests are simulations and do not guarantee future results.
- Uploaded CSVs are not sent to a server by this app.
