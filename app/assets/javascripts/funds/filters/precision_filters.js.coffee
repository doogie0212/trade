angular.module('precisionFilters', []).filter 'round_down', ->
  (number, currency) ->
    precision = gon.currencies.find((a) -> a.code == currency).precision
    precision = if typeof precision == 'number' then precision else 5

    BigNumber(number).round(precision, BigNumber.ROUND_DOWN).toF(precision)
