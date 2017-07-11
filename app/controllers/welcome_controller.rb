class WelcomeController < ApplicationController
  layout 'welcome'

  def index
      @market        = current_market

      @bids   = @market.bids
      @asks   = @market.asks
      @trades = @market.trades

      gon.jbuilder
  end
end
