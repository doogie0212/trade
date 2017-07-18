module Private
  class SettingsController < BaseController
    skip_before_filter :verify_authenticity_token, :only => [:nice_cert_callback]

    layout :resolve_layout

    def index
      unless current_user.activated?
        flash.now[:info] = t('.activated')
      end
      redirect_to settings_path, notice: params[:notice] if params[:notice]
      redirect_to settings_path, alert: params[:alert] if params[:alert]
    end

    def nice_cert_request
      unless current_user.id_document_verified?
        callback = "#{request.base_url}/settings/nice_cert_callback"
        url = "https://dgzv48s23a.execute-api.ap-northeast-2.amazonaws.com/test/encode?callback=#{callback}"
        body = RestClient.get(url)
        json = JSON.parse(body)
        session[:nice_request_no] = json['requestNo']
        @encode_data = json['encodeData']
      end
    end

    def nice_cert_callback
      encode_data = params[:EncodeData]
      # test data
      # encode_data = 'AgAFQkEzMDAMHOoi/h+02J5WSsHLQHlbxov6x2EAI1b1UbYj5AxN25q7Jgw25stMmHtUkQef+v6YMEgWh4Zbfqwr9K6yv++v1tDjMpNp3Nm97bTkbCI+4CwYD1wytmmVaVCKKHCuoP66Yii9ijH/5veke+9W6luyNWmydN2Fy0dRwDtV796Hg9j3g907pvHXEEb0JfMez0dMIN8zWMBH1/TWWz2XNkESfbCWKYebH0Lusql4aprsOaGkz5DkV1lieMDJ35bAR8U/dDOUFA7KvuE+BKyj6kcIA0QRPaoStGttwRFTz69mED/dh76QU52SNhvCMmT1sZiwqLYBy6SHqJe29IbdXrQDutPBVjYGPXt2quC9T1OtLUZWWqHT8WRFb1JMu5YTbDkCRr69pqKQcU1cPZNpXDlg3ZzQFNimpCVPtB+Zk1fKDzmGRwtuL51IaVcJBTPs/7+r6AzWqVi7ZZPgaDR7RB7wWrTlBMWagzXOf60o6a+6yqJ9YRqiofxn2o6qmveEXXHA1XVsal54syw+CGkx1EZVeGtHoLwrcSeWjdSg6ZR1vDi17Qt9XHjnUJttZI0b6OM='
      decode_url = "https://dgzv48s23a.execute-api.ap-northeast-2.amazonaws.com/test/decode"
      body = RestClient.get decode_url, {params: {EncodeData: encode_data}}
      json = JSON.parse(body)
      decode_data = json['decodeData']

      @error_code = decode_data['ERR_CODE']

      @error = @error_code && @error_code != 0
      if @error
        @message = "실명인증에 오류가 발생하였습니다. (에러코드: #{@error}). 문제가 계속 될 경우 관리자에게 문의하여 주세요."
        @type = "alert"
      else
        request_no = decode_data['REQ_SEQ']
        @message = "실명인증이 완료되었습니다."
        @type = "notice"

        if request_no != session[:nice_request_no]
          @message = "세션값이 다릅니다. 올바른 경로로 접근하시기 바랍니다."
          @type = "alert"
        else
          di = decode_data['DI']
          ci = decode_data['CI']
          auth_type = decode_data['AUTH_TYPE']
          name = decode_data['NAMW']
          utf8_name = decode_data['UTF8_NAME']
          gender = decode_data['GENDER']
          nationalinfo = decode_data['NATIONALINFO']
          mobile_no = decode_data['MOBILE_NO']
          mobile_co = decode_data['MOBILE_CO']

          cert = NiceCert.find_by_di(di)

          if cert
            if cert.member_id == current_user.id
              id_document = current_user.id_document || current_user.create_id_document
              id_document.approve!
            else
              @message = "이미 인증한 계정이 있습니다."
              @type = "alert"
            end
          else
            cert = NiceCert.new
            cert.member_id = current_user.id
            cert.di = di
            cert.ci = ci
            cert.auth_type = auth_type
            cert.name = name
            cert.utf8_name = utf8_name
            cert.gender = gender
            cert.nationalinfo = nationalinfo
            cert.mobile_no = mobile_no
            cert.mobile_co = mobile_co

            unless cert.save
              @message = "실명인증에 실패하였습니다. 다시 시도하여 주세요."
              @type = "alert"
            else
              id_document = current_user.id_document || current_user.create_id_document
              id_document.approve!
            end
          end
        end
      end
    end

    def resolve_layout
      case action_name
        when "nice_cert_request"
          false
        when "nice_cert_success"
          false
        when 'nice_cert_fail'
          false
      end
    end
  end
end
