class WelcomeController < ApplicationController
  layout 'welcome'

  def index
      gon.jbuilder
  end
end
