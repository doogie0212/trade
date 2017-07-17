class CreateNiceCerts < ActiveRecord::Migration
  def change
    create_table :nice_certs do |t|
      t.integer :member_id
      t.string :di
      t.string :ci
      t.string :auth_type
      t.string :name
      t.string :utf8_name
      t.string :gender
      t.string :nationalinfo
      t.string :mobile_no
      t.string :mobile_co

      t.timestamps
    end

    add_index :nice_certs, :di
  end
end
