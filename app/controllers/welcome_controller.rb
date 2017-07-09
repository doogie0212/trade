class WelcomeController < ApplicationController
  layout 'welcome'

  def index
      @bid = params[:bid]
      @ask = params[:ask]

      @market        = current_market
      @markets       = Market.all.sort
      @market_groups = @markets.map(&:quote_unit).uniq

      @bids   = @market.bids
      @asks   = @market.asks
      @trades = @market.trades

      # default to limit order
      @order_bid = OrderBid.new ord_type: 'limit'
      @order_ask = OrderAsk.new ord_type: 'limit'

      set_member_data if current_user
      gon.jbuilder
  end
end
