/* =========================================================
   Financial Market Dashboard – app.js
   Simulated real-time market data with lightweight-charts
   ========================================================= */

(function () {
  'use strict';

  // === Instruments ===
  const instruments = [
    { symbol: 'SPX',    name: 'S&P 500',    price: 5120.00, type: 'index',     volatility: 0.0008 },
    { symbol: 'NDX',    name: 'NASDAQ 100',  price: 18250.00, type: 'index',    volatility: 0.0012 },
    { symbol: 'DJI',    name: 'Dow Jones',   price: 38900.00, type: 'index',    volatility: 0.0007 },
    { symbol: 'BTC',    name: 'Bitcoin',     price: 67500.00, type: 'crypto',   volatility: 0.0025 },
    { symbol: 'ETH',    name: 'Ethereum',    price: 3450.00,  type: 'crypto',   volatility: 0.003 },
    { symbol: 'GOLD',   name: 'Gold',        price: 2340.00,  type: 'commodity', volatility: 0.0006 },
    { symbol: 'OIL',    name: 'Crude Oil',   price: 78.50,    type: 'commodity', volatility: 0.0015 },
    { symbol: 'EURUSD', name: 'EUR/USD',     price: 1.0850,   type: 'forex',    volatility: 0.0004 },
  ];

  // Track live prices and history
  instruments.forEach(inst => {
    inst.livePrice = inst.price;
    inst.prevPrice = inst.price;
    inst.change = 0;
    inst.changePct = 0;
    inst.high = inst.price;
    inst.low = inst.price;
    inst.open = inst.price;
    inst.history = [];
    inst.candleData = {};
  });

  let selectedIndex = 0;
  let chart = null;
  let mainSeries = null;
  let chartType = 'candlestick';
  let currentTimeframe = 'realtime';

  // === DOM refs ===
  const clockEl = document.getElementById('clock');
  const tickerBar = document.getElementById('ticker-bar');
  const instrumentList = document.getElementById('instrument-list');
  const chartContainer = document.getElementById('chart-container');
  const chartTitle = document.getElementById('chart-title');
  const priceInfo = document.getElementById('price-info');
  const detailGrid = document.getElementById('detail-grid');
  const timeframeGroup = document.getElementById('timeframe-group');

  // ============================================================
  //  1. Clock
  // ============================================================
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = h + ':' + m + ':' + s;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ============================================================
  //  2. Generate historical candle data
  // ============================================================
  function generateCandles(basePrice, count, intervalMs, volatility) {
    const candles = [];
    let price = basePrice * (0.95 + Math.random() * 0.1);
    const now = Date.now();
    const startTime = now - count * intervalMs;

    for (let i = 0; i < count; i++) {
      const time = Math.floor((startTime + i * intervalMs) / 1000);
      const move = price * volatility;
      const open = price;
      const close = open + (Math.random() - 0.48) * move * 4;
      const high = Math.max(open, close) + Math.random() * move * 2;
      const low = Math.min(open, close) - Math.random() * move * 2;
      candles.push({
        time,
        open: +open.toFixed(4),
        high: +high.toFixed(4),
        low: +low.toFixed(4),
        close: +close.toFixed(4),
      });
      price = close;
    }
    return candles;
  }

  const timeframeConfig = {
    'realtime': { count: 120,  intervalMs: 1000 },
    '1m':      { count: 200,  intervalMs: 60000 },
    '5m':      { count: 200,  intervalMs: 300000 },
    '60m':     { count: 200,  intervalMs: 3600000 },
    '1d':      { count: 365,  intervalMs: 86400000 },
    '1w':      { count: 200,  intervalMs: 604800000 },
    '1M':      { count: 120,  intervalMs: 2592000000 },
  };

  function getCandlesForInstrument(inst, tf) {
    const key = tf;
    if (!inst.candleData[key]) {
      const cfg = timeframeConfig[tf] || timeframeConfig['1d'];
      inst.candleData[key] = generateCandles(inst.price, cfg.count, cfg.intervalMs, inst.volatility);
    }
    return inst.candleData[key];
  }

  // Pre-generate data for all instruments
  instruments.forEach(inst => {
    Object.keys(timeframeConfig).forEach(tf => {
      getCandlesForInstrument(inst, tf);
      // Set live price from the last candle of the realtime data
      const rtCandles = inst.candleData['realtime'];
      if (rtCandles && rtCandles.length > 0) {
        inst.livePrice = rtCandles[rtCandles.length - 1].close;
        inst.open = rtCandles[0].open;
        inst.high = Math.max(...rtCandles.map(c => c.high));
        inst.low = Math.min(...rtCandles.map(c => c.low));
        inst.prevPrice = inst.livePrice;
      }
    });
  });

  // ============================================================
  //  3. Ticker Bar
  // ============================================================
  function buildTickerBar() {
    tickerBar.innerHTML = '';
    instruments.forEach((inst, idx) => {
      const el = document.createElement('div');
      el.className = 'ticker-item' + (idx === selectedIndex ? ' active' : '');
      el.dataset.index = idx;
      el.innerHTML = renderTickerItem(inst);
      el.addEventListener('click', () => selectInstrument(idx));
      tickerBar.appendChild(el);
    });
  }

  function renderTickerItem(inst) {
    const dir = inst.changePct >= 0 ? 'up' : 'down';
    const sign = inst.changePct >= 0 ? '+' : '';
    return '<span class="ticker-name">' + inst.symbol + '</span>' +
      '<span class="ticker-price">' + formatPrice(inst.livePrice, inst) + '</span>' +
      '<span class="ticker-change ' + dir + '">' + sign + inst.changePct.toFixed(2) + '%</span>';
  }

  // ============================================================
  //  4. Instrument List (Sidebar)
  // ============================================================
  function buildInstrumentList() {
    instrumentList.innerHTML = '';
    instruments.forEach((inst, idx) => {
      const li = document.createElement('li');
      li.className = 'instrument-item' + (idx === selectedIndex ? ' active' : '');
      li.dataset.index = idx;
      li.innerHTML = renderInstrumentItem(inst);
      li.addEventListener('click', () => selectInstrument(idx));
      instrumentList.appendChild(li);
    });
  }

  function renderInstrumentItem(inst) {
    const dir = inst.changePct >= 0 ? 'up' : (inst.changePct < 0 ? 'down' : 'flat');
    const sign = inst.changePct >= 0 ? '+' : '';
    return '<div class="inst-info">' +
      '<span class="inst-symbol">' + inst.symbol + '</span>' +
      '<span class="inst-name">' + inst.name + '</span>' +
      '</div>' +
      '<div class="inst-price-col">' +
      '<span class="inst-price ' + dir + '">' + formatPrice(inst.livePrice, inst) + '</span>' +
      '<span class="inst-change ' + dir + '">' + sign + inst.changePct.toFixed(2) + '%</span>' +
      '</div>';
  }

  // ============================================================
  //  5. Chart (lightweight-charts)
  // ============================================================
  function initChart() {
    if (chart) {
      chart.remove();
    }
    chart = LightweightCharts.createChart(chartContainer, {
      layout: {
        background: { type: 'solid', color: '#0a0e17' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.5)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.5)' },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: currentTimeframe === 'realtime',
      },
    });

    updateChartSeries();

    chart.subscribeCrosshairMove(param => {
      if (!param || !param.time) {
        updatePriceInfo(instruments[selectedIndex]);
        return;
      }
      const data = param.seriesData && param.seriesData.get(mainSeries);
      if (data) {
        updatePriceInfoFromCandle(data);
      }
    });
  }

  function updateChartSeries() {
    if (mainSeries) {
      chart.removeSeries(mainSeries);
      mainSeries = null;
    }

    const inst = instruments[selectedIndex];
    const candles = getCandlesForInstrument(inst, currentTimeframe);

    if (chartType === 'candlestick') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      });
      mainSeries.setData(candles);
    } else {
      mainSeries = chart.addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
      });
      mainSeries.setData(candles.map(c => ({ time: c.time, value: c.close })));
    }

    chart.timeScale().fitContent();
    chartTitle.textContent = inst.name;
    updatePriceInfo(inst);
  }

  // ============================================================
  //  6. Price Info Bar
  // ============================================================
  function updatePriceInfo(inst) {
    const candles = getCandlesForInstrument(inst, currentTimeframe);
    if (candles.length === 0) return;
    const last = candles[candles.length - 1];
    updatePriceInfoFromCandle(last);
  }

  function updatePriceInfoFromCandle(c) {
    const inst = instruments[selectedIndex];
    const changeVal = c.close - c.open;
    const changePct = (changeVal / c.open) * 100;
    const dir = changeVal >= 0 ? 'up' : 'down';

    priceInfo.innerHTML =
      '<span><span class="price-label">O</span><span class="price-value">' + formatPrice(c.open, inst) + '</span></span>' +
      '<span><span class="price-label">H</span><span class="price-value">' + formatPrice(c.high, inst) + '</span></span>' +
      '<span><span class="price-label">L</span><span class="price-value">' + formatPrice(c.low, inst) + '</span></span>' +
      '<span><span class="price-label">C</span><span class="price-value ' + dir + '">' + formatPrice(c.close, inst) + '</span></span>' +
      '<span><span class="price-label">Chg</span><span class="price-value ' + dir + '">' +
      (changeVal >= 0 ? '+' : '') + formatPrice(changeVal, inst) + ' (' + (changePct >= 0 ? '+' : '') + changePct.toFixed(2) + '%)</span></span>';
  }

  // ============================================================
  //  7. Detail Panel (Market Overview)
  // ============================================================
  function buildDetailPanel() {
    detailGrid.innerHTML = '';
    instruments.forEach((inst, idx) => {
      const card = document.createElement('div');
      card.className = 'detail-card';
      card.dataset.index = idx;
      card.innerHTML = renderDetailCard(inst);
      card.addEventListener('click', () => selectInstrument(idx));
      detailGrid.appendChild(card);
    });
  }

  function renderDetailCard(inst) {
    const dir = inst.changePct >= 0 ? 'up' : 'down';
    const sign = inst.changePct >= 0 ? '+' : '';
    const badgeClass = inst.type;

    return '<div class="detail-card-header">' +
      '<span class="detail-symbol">' + inst.symbol + '</span>' +
      '<span class="detail-badge ' + badgeClass + '">' + inst.type + '</span>' +
      '</div>' +
      '<div class="detail-row">' +
      '<span class="detail-label">Price</span>' +
      '<span class="detail-value ' + dir + '">' + formatPrice(inst.livePrice, inst) + '</span>' +
      '</div>' +
      '<div class="detail-row">' +
      '<span class="detail-label">Change</span>' +
      '<span class="detail-value ' + dir + '">' + sign + inst.changePct.toFixed(2) + '%</span>' +
      '</div>' +
      '<div class="detail-row">' +
      '<span class="detail-label">High</span>' +
      '<span class="detail-value">' + formatPrice(inst.high, inst) + '</span>' +
      '</div>' +
      '<div class="detail-row">' +
      '<span class="detail-label">Low</span>' +
      '<span class="detail-value">' + formatPrice(inst.low, inst) + '</span>' +
      '</div>' +
      '<div class="mini-chart"><canvas class="sparkline" data-symbol="' + inst.symbol + '"></canvas></div>';
  }

  function drawSparklines() {
    const canvases = detailGrid.querySelectorAll('.sparkline');
    canvases.forEach(canvas => {
      const symbol = canvas.dataset.symbol;
      const inst = instruments.find(i => i.symbol === symbol);
      if (!inst) return;

      const candles = getCandlesForInstrument(inst, 'realtime');
      const prices = candles.slice(-60).map(c => c.close);
      if (prices.length < 2) return;

      const ctx = canvas.getContext('2d');
      const w = canvas.parentElement.offsetWidth;
      const h = canvas.parentElement.offsetHeight || 32;
      canvas.width = w;
      canvas.height = h;

      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const range = max - min || 1;

      const color = inst.changePct >= 0 ? '#22c55e' : '#ef4444';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      prices.forEach((p, i) => {
        const x = (i / (prices.length - 1)) * w;
        const y = h - ((p - min) / range) * (h - 4) - 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Fill gradient
      const lastX = w;
      const lastY = h - ((prices[prices.length - 1] - min) / range) * (h - 4) - 2;
      ctx.lineTo(lastX, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = inst.changePct >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
      ctx.fill();
    });
  }

  // ============================================================
  //  8. Instrument Selection
  // ============================================================
  function selectInstrument(idx) {
    selectedIndex = idx;
    // Update active states
    tickerBar.querySelectorAll('.ticker-item').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    instrumentList.querySelectorAll('.instrument-item').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });
    updateChartSeries();
  }

  // ============================================================
  //  9. Timeframe Switching
  // ============================================================
  timeframeGroup.addEventListener('click', e => {
    const btn = e.target.closest('.tf-btn');
    if (!btn) return;
    timeframeGroup.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTimeframe = btn.dataset.tf;

    // Update time scale settings
    chart.applyOptions({
      timeScale: {
        timeVisible: true,
        secondsVisible: currentTimeframe === 'realtime',
      },
    });

    updateChartSeries();
  });

  // ============================================================
  //  10. Chart Type Toggle
  // ============================================================
  document.querySelectorAll('.ct-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ct-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chartType = btn.dataset.type;
      updateChartSeries();
    });
  });

  // ============================================================
  //  11. Real-time Price Simulation
  // ============================================================
  function simulateTick() {
    instruments.forEach(inst => {
      inst.prevPrice = inst.livePrice;
      const move = inst.livePrice * inst.volatility * (Math.random() - 0.48);
      inst.livePrice = +(inst.livePrice + move).toFixed(4);
      inst.change = inst.livePrice - inst.open;
      inst.changePct = (inst.change / inst.open) * 100;
      inst.high = Math.max(inst.high, inst.livePrice);
      inst.low = Math.min(inst.low, inst.livePrice);
    });

    // Append new candle to realtime data of selected instrument
    const inst = instruments[selectedIndex];
    const rtCandles = inst.candleData['realtime'];
    if (rtCandles && rtCandles.length > 0) {
      const last = rtCandles[rtCandles.length - 1];
      const now = Math.floor(Date.now() / 1000);

      // Update last candle or add new one
      if (now - last.time < 1) {
        last.close = inst.livePrice;
        last.high = Math.max(last.high, inst.livePrice);
        last.low = Math.min(last.low, inst.livePrice);
      } else {
        const newCandle = {
          time: now,
          open: last.close,
          high: Math.max(last.close, inst.livePrice),
          low: Math.min(last.close, inst.livePrice),
          close: inst.livePrice,
        };
        rtCandles.push(newCandle);
      }

      // Update chart if viewing realtime
      if (currentTimeframe === 'realtime' && mainSeries) {
        const lastCandle = rtCandles[rtCandles.length - 1];
        if (chartType === 'candlestick') {
          mainSeries.update(lastCandle);
        } else {
          mainSeries.update({ time: lastCandle.time, value: lastCandle.close });
        }
      }
    }

    updateTickerPrices();
    updateSidebarPrices();
    updateDetailPrices();
    updatePriceInfo(instruments[selectedIndex]);
  }

  function updateTickerPrices() {
    const items = tickerBar.querySelectorAll('.ticker-item');
    items.forEach((el, idx) => {
      const inst = instruments[idx];
      el.innerHTML = renderTickerItem(inst);

      // Flash animation
      if (inst.livePrice > inst.prevPrice) {
        el.classList.remove('flash-down');
        el.classList.add('flash-up');
      } else if (inst.livePrice < inst.prevPrice) {
        el.classList.remove('flash-up');
        el.classList.add('flash-down');
      }
      setTimeout(() => {
        el.classList.remove('flash-up', 'flash-down');
      }, 500);
    });
  }

  function updateSidebarPrices() {
    const items = instrumentList.querySelectorAll('.instrument-item');
    items.forEach((el, idx) => {
      const inst = instruments[idx];
      el.innerHTML = renderInstrumentItem(inst);
      el.className = 'instrument-item' + (idx === selectedIndex ? ' active' : '');

      if (inst.livePrice > inst.prevPrice) {
        el.classList.add('flash-up');
      } else if (inst.livePrice < inst.prevPrice) {
        el.classList.add('flash-down');
      }
      setTimeout(() => {
        el.classList.remove('flash-up', 'flash-down');
      }, 500);
    });
  }

  function updateDetailPrices() {
    const cards = detailGrid.querySelectorAll('.detail-card');
    cards.forEach((card, idx) => {
      const inst = instruments[idx];
      card.innerHTML = renderDetailCard(inst);
    });
  }

  // ============================================================
  //  12. Format Price
  // ============================================================
  function formatPrice(val, inst) {
    if (!inst) return val.toFixed(2);
    if (inst.symbol === 'EURUSD') return val.toFixed(4);
    if (inst.type === 'crypto') return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (val >= 1000) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val.toFixed(2);
  }

  // ============================================================
  //  13. Window Resize
  // ============================================================
  window.addEventListener('resize', () => {
    if (chart) {
      chart.applyOptions({
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
      });
    }
    drawSparklines();
  });

  // ============================================================
  //  14. Initialize
  // ============================================================
  buildTickerBar();
  buildInstrumentList();
  initChart();
  buildDetailPanel();

  // Draw sparklines after DOM renders
  requestAnimationFrame(() => {
    drawSparklines();
  });

  // Start real-time simulation
  setInterval(simulateTick, 1000);

  // Redraw sparklines periodically
  setInterval(drawSparklines, 5000);

})();
