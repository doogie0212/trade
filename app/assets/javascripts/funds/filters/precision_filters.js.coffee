angular.module('precisionFilters', []).filter 'round_down', ->
  (number, currency) ->
    precision = gon.currencies[currency].precision
    precision = if typeof precision == 'number' then precision else 5

    bigNumber = new BigNumber(number)

    bigNumber.round(precision, BigNumber.ROUND_DOWN).toFormat(precision)
