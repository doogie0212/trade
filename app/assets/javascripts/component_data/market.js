this.MarketData = flight.component(function() {
  this.load = function(event, data) {
    this.trigger('market::candlestick::request');
    return this.reqK(gon.market.id, data['x']);
  };
  this.reqK = function(market, minutes, limit) {
    var tid, url;
    if (limit == null) {
      limit = 768;
    }
    tid = gon.trades.length > 0 ? gon.trades[0].tid : 0;
    if (this.last_tid) {
      tid = this.last_tid + 1;
    }
    url = "/api/v2/k_with_pending_trades.json?market=" + market + "&limit=" + limit + "&period=" + minutes + "&trade_id=" + tid;
    return $.getJSON(url, (function(_this) {
      return function(data) {
        return _this.handleData(data, minutes);
      };
    })(this));
  };
  this.checkTrend = function(pre, cur) {
    var _, cur_close, pre_close;
    _ = cur[0], _ = cur[1], _ = cur[2], _ = cur[3], cur_close = cur[4], _ = cur[5];
    _ = pre[0], _ = pre[1], _ = pre[2], _ = pre[3], pre_close = pre[4], _ = pre[5];
    return cur_close >= pre_close;
  };
  this.createPoint = function(i, trade) {
    var gap, p, ref, v, x;
    gap = Math.floor((trade.date - this.next_ts) / (this.minutes * 60));
    if (gap > 100) {
      console.log("failed to update, too wide gap.");
      window.clearInterval(this.interval);
      this.trigger('market::candlestick::request');
      return i;
    }
    while (trade.date >= this.next_ts) {
      x = this.next_ts * 1000;
      this.last_ts = this.next_ts;
      this.next_ts = this.last_ts + this.minutes * 60;
      ref = trade.date < this.next_ts ? [parseFloat(trade.price), parseFloat(trade.amount)] : [this.points.close[i][1], 0], p = ref[0], v = ref[1];
      this.points.close.push([x, p]);
      this.points.candlestick.push([x, p, p, p, p]);
      this.points.volume.push({
        x: x,
        y: v,
        color: p >= this.points.close[i][1] ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'
      });
      i += 1;
    }
    return i;
  };
  this.updatePoint = function(i, trade) {
    var p, v;
    p = parseFloat(trade.price);
    v = parseFloat(trade.amount);
    this.points.close[i][1] = p;
    if (p > this.points.candlestick[i][2]) {
      this.points.candlestick[i][2] = p;
    } else if (p < this.points.candlestick[i][3]) {
      this.points.candlestick[i][3] = p;
    }
    this.points.candlestick[i][4] = p;
    this.points.volume[i].y += v;
    return this.points.volume[i].color = i > 0 && this.points.close[i][1] >= this.points.close[i - 1][1] ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
  };
  this.refreshUpdatedAt = function() {
    return this.updated_at = Math.round(new Date().valueOf() / 1000);
  };
  this.processTrades = function() {
    var i;
    i = this.points.candlestick.length - 1;
    $.each(this.tradesCache, (function(_this) {
      return function(ti, trade) {
        if (trade.tid > _this.last_tid) {
          if (_this.last_ts <= trade.date && trade.date < _this.next_ts) {
            _this.updatePoint(i, trade);
          } else if (_this.next_ts <= trade.date) {
            i = _this.createPoint(i, trade);
          }
          _this.last_tid = trade.tid;
          return _this.refreshUpdatedAt();
        }
      };
    })(this));
    return this.tradesCache = [];
  };
  this.prepare = function(k) {
    var candlestick, close, close_price, cur, high, i, j, len, low, open, ref, time, trend, vol, volume;
    ref = [[], [], []], volume = ref[0], candlestick = ref[1], close_price = ref[2];
    for (i = j = 0, len = k.length; j < len; i = ++j) {
      cur = k[i];
      time = cur[0], open = cur[1], high = cur[2], low = cur[3], close = cur[4], vol = cur[5];
      time = time * 1000;
      trend = i >= 1 ? this.checkTrend(k[i - 1], cur) : true;
      close_price.push([time, close]);
      candlestick.push([time, open, high, low, close]);
      volume.push({
        x: time,
        y: vol,
        color: trend ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)'
      });
    }
    return {
      minutes: this.minutes,
      candlestick: candlestick.slice(0, -1),
      volume: volume.slice(0, -1),
      close: close_price.slice(0, -1)
    };
  };
  this.handleData = function(data, minutes) {
    this.minutes = minutes;
    this.tradesCache = data.trades.concat(this.tradesCache);
    this.points = this.prepare(data.k);
    this.last_tid = 0;
    if (this.points.candlestick.length > 0) {
      this.last_ts = this.points.candlestick[this.points.candlestick.length - 1][0] / 1000;
    } else {
      this.last_ts = 0;
    }
    this.next_ts = this.last_ts + 60 * minutes;
    return this.deliverTrades('market::candlestick::response');
  };
  this.deliverTrades = function(event) {
    this.processTrades();
    this.trigger(event, {
      minutes: this.points.minutes,
      candlestick: this.points.candlestick.slice(1),
      close: this.points.close.slice(1),
      volume: this.points.volume.slice(1)
    });
    this.points.close = this.points.close.slice(-2);
    this.points.candlestick = this.points.candlestick.slice(-2);
    return this.points.volume = this.points.volume.slice(-2);
  };
  this.hardRefresh = function(threshold) {
    var ts;
    ts = Math.round(new Date().valueOf() / 1000);
    if (ts > this.updated_at + threshold) {
      this.refreshUpdatedAt();
      return this.reqK(gon.market.id, this.minutes);
    }
  };
  this.startDeliver = function(event, data) {
    var deliver;
    if (this.interval != null) {
      window.clearInterval(this.interval);
    }
    deliver = (function(_this) {
      return function() {
        if (_this.tradesCache.length > 0) {
          return _this.deliverTrades('market::candlestick::trades');
        } else {
          return _this.hardRefresh(300);
        }
      };
    })(this);
    return this.interval = setInterval(deliver, 999);
  };
  this.cacheTrades = function(event, data) {
    return this.tradesCache = Array.prototype.concat(this.tradesCache, data.trades);
  };
  return this.after('initialize', function() {
    console.log('(test)MarketData component is successfully loaded');
    this.tradesCache = [];
    this.on(document, 'market::trades', this.cacheTrades);
    this.on(document, 'switch::range_switch', this.load);
    return this.on(document, 'market::candlestick::created', this.startDeliver);
  });
});
