module Private
  class SettingsController < BaseController
    skip_before_filter :verify_authenticity_token, :only => [:nice_cert_success]
    def index
      unless current_user.activated?
        flash.now[:info] = t('.activated')
      end
      unless current_user.id_document_verified?
        url = 'https://dgzv48s23a.execute-api.ap-northeast-2.amazonaws.com/test/encode'
        body = RestClient.get(url)
        json = JSON.parse(body)
        session[:nice_request_no] = json['requestNo']
        @encode_data = json['encodeData']
      end
    end

    def nice_cert_success
      puts params
      # encode_data = params[:EncodeData]
      encode_data = 'AgAFQkEzMDAMHOoi/h+02J5WSsHLQHlbxov6x2EAI1b1UbYj5AxN25q7Jgw25stMmHtUkQef+v6YMEgWh4Zbfqwr9K6yv++v1tDjMpNp3Nm97bTkbCI+4CwYD1wytmmVaVCKKHCuoP66Yii9ijH/5veke+9W6luyNWmydN2Fy0dRwDtV796Hg9j3g907pvHXEEb0JfMez0dMIN8zWMBH1/TWWz2XNkESfbCWKYebH0Lusql4aprsOaGkz5DkV1lieMDJ35bAR8U/dDOUFA7KvuE+BKyj6kcIA0QRPaoStGttwRFTz69mED/dh76QU52SNhvCMmT1sZiwqLYBy6SHqJe29IbdXrQDutPBVjYGPXt2quC9T1OtLUZWWqHT8WRFb1JMu5YTbDkCRr69pqKQcU1cPZNpXDlg3ZzQFNimpCVPtB+Zk1fKDzmGRwtuL51IaVcJBTPs/7+r6AzWqVi7ZZPgaDR7RB7wWrTlBMWagzXOf60o6a+6yqJ9YRqiofxn2o6qmveEXXHA1XVsal54syw+CGkx1EZVeGtHoLwrcSeWjdSg6ZR1vDi17Qt9XHjnUJttZI0b6OM='
      decode_url = "https://dgzv48s23a.execute-api.ap-northeast-2.amazonaws.com/test/decode"
      body = RestClient.get decode_url, {params: {EncodeData: encode_data}}
      puts body
      json = JSON.parse(body)
      @decode_data = json['decodeData']
      puts @decode_data
    end

    def nice_cert_fail
      redirect_to root_path
    end
  end
end
