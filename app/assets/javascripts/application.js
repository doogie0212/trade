//= require es5-shim.min
//= require es5-sham.min
//= require jquery
//= require jquery_ujs
//= require jquery-timing.min
//= require bootstrap
//= require bootstrap-switch.min
//= require scrollIt
//= require moment
//= require bignumber
//= require underscore
//= require ZeroClipboard
//= require flight.min
//= require pusher.min
//= require list
//= require jquery.mousewheel
//= require jquery-timing.min
//= require qrcode
//= require cookies.min

//= require ./lib/notifier
//= require ./lib/pusher_connection
//= require ./lib/tiny-pubsub
//= require highstock
//= require_tree ./highcharts/

//= require_tree ./helpers
//= require_tree ./component_mixin
//= require_tree ./component_data
//= require_tree ./component_ui
//= require_tree ./templates

$(function() {
  BigNumber.config({
    ERRORS: false
  });
  if ($('#assets-index').length) {
    $.scrollIt({
      topOffset: -180,
      activeClass: 'active'
    });
    $('a.go-verify').on('click', function(e) {
      var partial_tree, root, uri;
      e.preventDefault();
      root = $('.tab-pane.active .root.json pre').text();
      partial_tree = $('.tab-pane.active .partial-tree.json pre').text();
      if (partial_tree) {
        uri = 'http://syskall.com/proof-of-liabilities/#verify?partial_tree=' + partial_tree + '&expected_root=' + root;
        return window.open(encodeURI(uri), '_blank');
      }
    });
  }
  $('[data-clipboard-text], [data-clipboard-target]').each(function() {
    var placement, zero;
    zero = new ZeroClipboard($(this), {
      forceHandCursor: true
    });
    zero.on('complete', function() {
      return $(zero.htmlBridge).attr('title', gon.clipboard.done).tooltip('fixTitle').tooltip('show');
    });
    zero.on('mouseout', function() {
      return $(zero.htmlBridge).attr('title', gon.clipboard.click).tooltip('fixTitle');
    });
    placement = $(this).data('placement') || 'bottom';
    return $(zero.htmlBridge).tooltip({
      title: gon.clipboard.click,
      placement: placement
    });
  });
  $('.qrcode-container').each(function(index, el) {
    var $el;
    $el = $(el);
    return new QRCode(el, {
      text: $el.data('text'),
      width: $el.data('width'),
      height: $el.data('height')
    });
  });
  FlashMessageUI.attachTo('.flash-message');
  SmsAuthVerifyUI.attachTo('#edit_sms_auth');
  return TwoFactorAuth.attachTo('.two-factor-auth-container');
});
