class WelcomeController < ApplicationController
  layout 'welcome'

  def index
      @market        = current_market
      @markets       = Market.all.sort
      @market_groups = @markets.map(&:quote_unit).uniq

      @bids   = @market.bids
      @asks   = @market.asks
      @trades = @market.trades

      gon.jbuilder
  end
end
