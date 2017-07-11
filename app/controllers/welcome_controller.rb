class WelcomeController < ApplicationController
  layout 'welcome'

  def index
      @bid = params[:bid]
      @ask = params[:ask]

      @market        = current_market

      @bids   = @market.bids
      @asks   = @market.asks
      @trades = @market.trades

      # default to limit order
      @order_bid = OrderBid.new ord_type: 'limit'
      @order_ask = OrderAsk.new ord_type: 'limit'

      gon.jbuilder
  end
end
