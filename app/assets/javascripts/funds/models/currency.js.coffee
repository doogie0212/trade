class Currency extends PeatioModel.Model
  @configure 'Currency', 'key', 'code', 'coin', 'blockchain', 'precision'

  @initData: (records) ->
    PeatioModel.Ajax.disable ->
      $.each records, (idx, record) ->
        currency = Currency.create(record.attributes)

window.Currency = Currency
