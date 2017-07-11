this.MemberData = flight.component(function() {
  return this.after('initialize', function() {
    var channel;
    if (!gon.current_user) {
      return;
    }
    channel = this.attr.pusher.subscribe("private-" + gon.current_user.sn);
    channel.bind('account', (function(_this) {
      return function(data) {
        gon.accounts[data.currency] = data;
        return _this.trigger('account::update', gon.accounts);
      };
    })(this));
    channel.bind('order', (function(_this) {
      return function(data) {
        return _this.trigger("order::" + data.state, data);
      };
    })(this));
    channel.bind('trade', (function(_this) {
      return function(data) {
        return _this.trigger('trade', data);
      };
    })(this));
    this.trigger('account::update', gon.accounts);
    if (gon.my_orders) {
      this.trigger('order::wait::populate', {
        orders: gon.my_orders
      });
    }
    if (gon.my_trades) {
      return this.trigger('trade::populate', {
        trades: gon.my_trades
      });
    }
  });
});
