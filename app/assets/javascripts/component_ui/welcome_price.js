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
    this.select('high').text(formatter.mask_fixed_price(ticker.high));
    this.select('low').text(formatter.mask_fixed_price(ticker.low));
    this.select('last').text(formatter.mask_fixed_price(ticker.last));
  };
  return this.after('initialize', function() {
    console.log("(test)welcomePriceUI component is sucessfully loaded");

    var ref, state;
    this.on(document, 'market::ticker', this.refresh);
  });
});
