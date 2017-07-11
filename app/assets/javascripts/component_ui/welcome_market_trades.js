window.WelcomeMarketTradesUI = flight.component(function() {
  flight.compose.mixin(this, [NotificationMixin]);
  this.attributes({
    defaultHeight: 156,
    tradeSelector: 'tr',
    newTradeSelector: 'tr.new',
    allSelector: 'a.all',
    allTableSelector: 'table.all-trades tbody',
    newMarketTradeContent: 'table.all-trades tr.new div',
    tradesLimit: 10
  });
  this.showAllTrades = function(event) {
    this.select('allSelector').addClass('active');
    return this.select('allTableSelector').show();
  };
  this.showMyTrades = function(event) {
    this.select('allSelector').removeClass('active');
    this.select('allTableSelector').hide();
  };
  this.bufferMarketTrades = function(event, data) {
    return this.marketTrades = this.marketTrades.concat(data.trades);
  };
  this.clearMarkers = function(table) {
    table.find('tr.new').removeClass('new');
    return table.find('tr').slice(this.attr.tradesLimit).remove();
  };
  this.notifyMyTrade = function(trade) {
    var market, message;
    market = gon.markets[trade.market];
    message = gon.i18n.notification.new_trade.replace(/%{kind}/g, gon.i18n[trade.kind]).replace(/%{id}/g, trade.id).replace(/%{price}/g, trade.price).replace(/%{volume}/g, trade.volume).replace(/%{base_unit}/g, market.base_unit.toUpperCase()).replace(/%{quote_unit}/g, market.quote_unit.toUpperCase());
    return this.notify(message);
  };
  this.handleMarketTrades = function(event, data) {
    var el, i, len, ref, trade;
    ref = data.trades;
    for (i = 0, len = ref.length; i < len; i++) {
      trade = ref[i];
      this.marketTrades.unshift(trade);
      trade.classes = 'new';
      el = this.select('allTableSelector').prepend(JST['templates/welcome_market_trade'](trade));
    }
    this.marketTrades = this.marketTrades.slice(0, this.attr.tradesLimit);
    this.select('newMarketTradeContent').slideDown('slow');
    return setTimeout((function(_this) {
      return function() {
        return _this.clearMarkers(_this.select('allTableSelector'));
      };
    })(this), 900);
  };
  return this.after('initialize', function() {
    this.marketTrades = [];
    this.on(document, 'market::trades', this.handleMarketTrades);
    this.on(this.select('allSelector'), 'click', this.showAllTrades);
  });
});
