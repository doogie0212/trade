window.GlobalData = flight.component(function() {
  this.refreshDocumentTitle = function(event, data) {
    var brand, market, price, symbol;
    symbol = gon.currencies[gon.market.bid.currency].symbol;
    price = data.last;
    market = [gon.market.ask.currency, gon.market.bid.currency].join("/").toUpperCase();
    brand = "Peatio Exchange";
    return document.title = "" + symbol + price + " " + market + " - " + brand;
  };
  this.refreshDepth = function(data) {
    var asks, asks_sum, bids, bids_sum, la, lb, mid, offset, ref;
    asks = [];
    bids = [];
    ref = [0, 0], bids_sum = ref[0], asks_sum = ref[1];
    _.each(data.asks, function(arg) {
      var price, volume;
      price = arg[0], volume = arg[1];
      if (asks.length === 0 || price < _.last(asks)[0] * 100) {
        return asks.push([parseFloat(price), asks_sum += parseFloat(volume)]);
      }
    });
    _.each(data.bids, function(arg) {
      var price, volume;
      price = arg[0], volume = arg[1];
      if (bids.length === 0 || price > _.last(bids)[0] / 100) {
        return bids.push([parseFloat(price), bids_sum += parseFloat(volume)]);
      }
    });
    la = _.last(asks);
    lb = _.last(bids);
    if (la && lb) {
      mid = (_.first(bids)[0] + _.first(asks)[0]) / 2;
      offset = Math.min.apply(Math, [Math.max(mid * 0.1, 1), (mid - lb[0]) * 0.8, (la[0] - mid) * 0.8]);
    } else if ((la == null) && lb) {
      mid = _.first(bids)[0];
      offset = Math.min.apply(Math, [Math.max(mid * 0.1, 1), (mid - lb[0]) * 0.8]);
    } else if (la && (lb == null)) {
      mid = _.first(asks)[0];
      offset = Math.min.apply(Math, [Math.max(mid * 0.1, 1), (la[0] - mid) * 0.8]);
    }
    return this.trigger('market::depth::response', {
      asks: asks,
      bids: bids,
      high: mid + offset,
      low: mid - offset
    });
  };
  this.refreshTicker = function(data) {
    var buy, last, last_buy, last_last, last_sell, market, sell, ticker, tickers;
    if (!this.last_tickers) {
      for (market in data) {
        ticker = data[market];
        data[market]['buy_trend'] = data[market]['sell_trend'] = data[market]['last_trend'] = true;
      }
      this.last_tickers = data;
    }
    tickers = (function() {
      var results;
      results = [];
      for (market in data) {
        ticker = data[market];
        buy = parseFloat(ticker.buy);
        sell = parseFloat(ticker.sell);
        last = parseFloat(ticker.last);
        last_buy = parseFloat(this.last_tickers[market].buy);
        last_sell = parseFloat(this.last_tickers[market].sell);
        last_last = parseFloat(this.last_tickers[market].last);
        if (buy !== last_buy) {
          data[market]['buy_trend'] = ticker['buy_trend'] = buy > last_buy;
        } else {
          ticker['buy_trend'] = this.last_tickers[market]['buy_trend'];
        }
        if (sell !== last_sell) {
          data[market]['sell_trend'] = ticker['sell_trend'] = sell > last_sell;
        } else {
          ticker['sell_trend'] = this.last_tickers[market]['sell_trend'];
        }
        if (last !== last_last) {
          data[market]['last_trend'] = ticker['last_trend'] = last > last_last;
        } else {
          ticker['last_trend'] = this.last_tickers[market]['last_trend'];
        }
        if (market === gon.market.id) {
          this.trigger('market::ticker', ticker);
        }
        results.push({
          market: market,
          data: ticker
        });
      }
      return results;
    }).call(this);
    this.trigger('market::tickers', {
      tickers: tickers,
      raw: data
    });
    return this.last_tickers = data;
  };
  return this.after('initialize', function() {
    var global_channel, market_channel;
    this.on(document, 'market::ticker', this.refreshDocumentTitle);
    global_channel = this.attr.pusher.subscribe("market-global");
    market_channel = this.attr.pusher.subscribe("market-" + gon.market.id + "-global");
    global_channel.bind('tickers', (function(_this) {
      return function(data) {
        return _this.refreshTicker(data);
      };
    })(this));
    market_channel.bind('update', (function(_this) {
      return function(data) {
        gon.asks = data.asks;
        gon.bids = data.bids;
        _this.trigger('market::order_book::update', {
          asks: data.asks,
          bids: data.bids
        });
        return _this.refreshDepth({
          asks: data.asks,
          bids: data.bids
        });
      };
    })(this));
    market_channel.bind('trades', (function(_this) {
      return function(data) {
        return _this.trigger('market::trades', {
          trades: data.trades
        });
      };
    })(this));
    if (gon.ticker) {
      this.trigger('market::ticker', gon.ticker);
    }
    if (gon.tickers) {
      this.refreshTicker(gon.tickers);
    }
    if (gon.asks && gon.bids) {
      this.trigger('market::order_book::update', {
        asks: gon.asks,
        bids: gon.bids
      });
      this.refreshDepth({
        asks: gon.asks,
        bids: gon.bids
      });
    }
    if (gon.trades) {
      return this.trigger('market::trades', {
        trades: gon.trades.reverse()
      });
    }
  });
});
