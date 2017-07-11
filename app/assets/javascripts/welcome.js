//= require es5-shim.min
//= require es5-sham.min
//= require jquery
//= require jquery_ujs
//= require jquery.mousewheel
//= require jquery-timing.min
//= require jquery.nicescroll.min
//= require bootstrap
//= require bootstrap-switch.min

//= require moment
//= require bignumber
//= require underscore
//= require cookies.min
//= require flight.min
//= require pusher.min

//= require ./lib/sfx
//= require ./lib/notifier
//= require ./lib/pusher_connection

//= require highstock
//= require_tree ./highcharts/

//= require_tree ./helpers
//= require_tree ./component_mixin
//= require_tree ./component_data
//= require_tree ./component_ui
//= require_tree ./templates

//= require_self

$(function() {
  //test-case
  console.log("(test)welcome.js jquery loaded");
  window.notifier = new Notifier();
  BigNumber.config({
    ERRORS: false
  });
  WelcomePriceUI.attachTo('#welcome_price');
  WelcomeOrderBookUI.attachTo('#order_book');
  WelcomeMarketTradesUI.attachTo('#market_trades_wrapper');
  MarketData.attachTo(document);
  GlobalData.attachTo(document, {
    pusher: window.pusher
  });
  if (gon.accounts) {
    MemberData.attachTo(document, {
      pusher: window.pusher
    });
  }
  WelcomeCandlestickUI.attachTo('#candlestick');
  SwitchUI.attachTo('#range_switch, #indicator_switch, #main_indicator_switch, #type_switch');
  return $('.panel-body-content').niceScroll({
    autohidemode: true,
    cursorborder: "none"
  });
});
