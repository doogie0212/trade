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
  WelcomeOrderUI.attachTo('#welcome_order');
  GlobalData.attachTo(document, {
    pusher: window.pusher
  });
  if (gon.accounts) {
    MemberData.attachTo(document, {
      pusher: window.pusher
    });
  }
  WelcomeCandlestickUI.attachTo('#welcome_candlestick');
  return $('.panel-body-content').niceScroll({
    autohidemode: true,
    cursorborder: "none"
  });
});
