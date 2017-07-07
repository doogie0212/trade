this.WelcomePriceUI = flight.component(function() {
  this.attributes({
    vol: 'span.vol',
    amount: 'span.amount',
    high: '.high',
    low: '.low',
    last: '.last',
    change: 'span.change',
    sound: 'input[name="sound-checkbox"]'
  });

  this.refresh = function(event, ticker) {
    this.select('high').text(ticker.high);
    this.select('low').text(ticker.low);
    this.select('last').text(ticker.last);
  };
  return this.after('initialize', function() {
    var ref, state;
    this.on(document, 'market::ticker', this.refresh);
  });
});
