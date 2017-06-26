module Private
  class AssetsController < BaseController
    skip_before_action :auth_member!, only: [:index]

    def index
      @krw_assets  = Currency.assets('krw')
      @btc_proof   = Proof.current :btc
      @krw_proof   = Proof.current :krw

      if current_user
        @btc_account = current_user.accounts.with_currency(:btc).first
        @krw_account = current_user.accounts.with_currency(:krw).first
      end
    end

    def partial_tree
      account    = current_user.accounts.with_currency(params[:id]).first
      @timestamp = Proof.with_currency(params[:id]).last.timestamp
      @json      = account.partial_tree.to_json.html_safe
      respond_to do |format|
        format.js
      end
    end

  end
end
