# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :nice_cert do
    member_id 1
    di "MyString"
    ci "MyString"
    auth_type "MyString"
    name "MyString"
    utf8_name "MyString"
    gender "MyString"
    nationalinfo "MyString"
    mobile_no "MyString"
    mobile_co "MyString"
  end
end
