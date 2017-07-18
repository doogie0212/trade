var COLOR, COLOR_OFF, COLOR_ON, DATETIME_LABEL_FORMAT, DATETIME_LABEL_FORMAT_FOR_TOOLTIP, INDICATOR, RANGE_DEFAULT;

if (gon.local === "zh-CN") {
  DATETIME_LABEL_FORMAT_FOR_TOOLTIP = {
    millisecond: ['%m月%e日, %H:%M:%S.%L', '%m月%e日, %H:%M:%S.%L', '-%H:%M:%S.%L'],
    second: ['%m月%e日, %H:%M:%S', '%m月%e日, %H:%M:%S', '-%H:%M:%S'],
    minute: ['%m月%e日, %H:%M', '%m月%e日, %H:%M', '-%H:%M'],
    hour: ['%m月%e日, %H:%M', '%m月%e日, %H:%M', '-%H:%M'],
    day: ['%m月%e日, %H:%M', '%m月%e日, %H:%M', '-%H:%M'],
    week: ['%Y年%m月%e日', '%Y年%m月%e日', '-%m月%e日'],
    month: ['%Y年%m月', '%Y年%m月', '-%m'],
    year: ['%Y', '%Y', '-%Y']
  };
}

DATETIME_LABEL_FORMAT = {
  second: '%H:%M:%S',
  minute: '%H:%M',
  hour: '%H:%M',
  day: '%m-%d',
  week: '%m-%d',
  month: '%Y-%m',
  year: '%Y'
};

RANGE_DEFAULT = {
  fill: 'none',
  stroke: 'none',
  'stroke-width': 0,
  r: 8,
  style: {
    color: '#333'
  },
  states: {
    hover: {
      fill: '#eee',
      style: {
        color: '#ccc'
      }
    },
    select: {
      fill: '#eee',
      style: {
        color: '#eee'
      }
    }
  }
};

COLOR_ON = {
  candlestick: {
    color: '#e84855',
    upColor: '#fff',
    lineColor: '#e84855',
    upLineColor: '#36d495'
  },
  close: {
    color: null
  }
};

COLOR_OFF = {
  candlestick: {
    color: 'invalid',
    upColor: 'invalid',
    lineColor: 'invalid',
    upLineColor: 'invalid'
  },
  close: {
    color: 'invalid'
  }
};

COLOR = {
  candlestick: _.extend({}, COLOR_OFF.candlestick),
  close: _.extend({}, COLOR_OFF.close)
};

INDICATOR = {
  MA: false,
  EMA: false
};

this.WelcomeCandlestickUI = flight.component(function() {
  this.mask = function() {
    return this.$node.find('.mask').show();
  };
  this.unmask = function() {
    return this.$node.find('.mask').hide();
  };
  this.request = function() {
    return this.mask();
  };
  this.init = function(event, data) {
    var ref;
    this.running = true;
    if ((ref = this.$node.find('#candlestick_chart').highcharts()) != null) {
      ref.destroy();
    }
    this.initHighStock(data);
    return this.trigger('market::candlestick::created', data);
  };
  this.switchType = function(event, data) {
    var chart, colors, j, key, len, ref, s, type, val;
    for (key in COLOR) {
      val = COLOR[key];
      _.extend(COLOR[key], COLOR_OFF[key]);
    }
    _.extend(COLOR[data.x], COLOR_ON[data.x]);
    if (chart = this.$node.find('#candlestick_chart').highcharts()) {
      for (type in COLOR) {
        colors = COLOR[type];
        ref = chart.series;
        for (j = 0, len = ref.length; j < len; j++) {
          s = ref[j];
          if ((s.userOptions.algorithm == null) && (s.userOptions.id === type)) {
            s.update(colors, false);
          }
        }
      }
      return this.trigger("switch::main_indicator_switch::init");
    }
  };
  this.switchMainIndicator = function(event, data) {
    var chart, indicator, j, key, l, len, len1, ref, ref1, s, val, visible;
    for (key in INDICATOR) {
      val = INDICATOR[key];
      INDICATOR[key] = false;
    }
    INDICATOR[data.x] = true;
    if (chart = this.$node.find('#candlestick_chart').highcharts()) {
      ref = chart.series;
      for (j = 0, len = ref.length; j < len; j++) {
        s = ref[j];
        if (s.userOptions.linkedTo === 'close') {
          s.setVisible(true, false);
        }
      }
      for (indicator in INDICATOR) {
        visible = INDICATOR[indicator];
        ref1 = chart.series;
        for (l = 0, len1 = ref1.length; l < len1; l++) {
          s = ref1[l];
          if ((s.userOptions.algorithm != null) && (s.userOptions.algorithm === indicator)) {
            s.setVisible(visible, false);
          }
        }
      }
      return chart.redraw();
    }
  };
  this.default_range = function(unit) {
    return 1000 * 60 * unit * 100;
  };
  this.initHighStock = function(data) {
    var component, dataGrouping, range, timeUnits, title, tooltipTemplate, unit;
    component = this;
    range = this.default_range(data['minutes']);
    unit = $("[data-unit=" + data['minutes'] + "]").text();
    title = (gon.market.base_unit.toUpperCase()) + "/" + (gon.market.quote_unit.toUpperCase()) + " - " + unit;
    timeUnits = {
      millisecond: 1,
      second: 1000,
      minute: 60000,
      hour: 3600000,
      day: 24 * 3600000,
      week: 7 * 24 * 3600000,
      month: 31 * 24 * 3600000,
      year: 31556952000
    };
    dataGrouping = {
      enabled: false
    };
    tooltipTemplate = JST["templates/tooltip"];
    if (DATETIME_LABEL_FORMAT_FOR_TOOLTIP) {
      dataGrouping['dateTimeLabelFormats'] = DATETIME_LABEL_FORMAT_FOR_TOOLTIP;
    }
    return this.$node.find('#candlestick_chart').highcharts("StockChart", {
      chart: {
        events: {
          load: (function(_this) {
            return function() {
              return _this.unmask();
            };
          })(this)
        },
        animation: true,
      },
      credits: {
        enabled: false
      },
      tooltip: {
        enabled: false,
        crosshairs: [
          {
            width: 0.5,
            dashStyle: 'solid',
            color: '#9698a5'
          }, false
        ],
        valueDecimals: gon.market.bid.fixed,
        borderWidth: 0,
        backgroundColor: 'rgba(0,0,0,0)',
        borderRadius: 2,
        shadow: false,
        shared: true,
        positioner: function(w, h, point) {
          var chart_h, chart_w, grid_h, x, y;
          chart_w = $(this.chart.renderTo).width();
          chart_h = $(this.chart.renderTo).height();
          grid_h = Math.min(20, Math.ceil(chart_h / 10));
          x = Math.max(10, point.plotX - w - 20);
          y = Math.max(0, Math.floor(point.plotY / grid_h) * grid_h - 20);
          return {
            x: x,
            y: y
          };
        },
        useHTML: true,
        formatter: function() {
          var chart, dateFormat, dateTimeLabelFormats, fun, index, k, key, series, v;
          chart = this.points[0].series.chart;
          series = this.points[0].series;
          index = this.points[0].point.index;
          key = this.points[0].key;
          for (k in timeUnits) {
            v = timeUnits[k];
            if (v >= series.xAxis.closestPointRange || (v <= timeUnits.day && key % v > 0)) {
              dateFormat = dateTimeLabelFormats = series.options.dataGrouping.dateTimeLabelFormats[k][0];
              title = Highcharts.dateFormat(dateFormat, key);
              break;
            }
          }
          fun = function(h, s) {
            h[s.options.id] = s.data[index];
            return h;
          };
          return tooltipTemplate({
            title: title,
            indicator: INDICATOR,
            format: function(v, fixed) {
              if (fixed == null) {
                fixed = 3;
              }
              return Highcharts.numberFormat(v, fixed);
            },
            points: _.reduce(chart.series, fun, {})
          });
        }
      },
      plotOptions: {
        candlestick: {
          turboThreshold: 0,
          followPointer: true,
          color: '#e84855',
          upColor: '#000000',
          lineColor: '#e84855',
          upLineColor: '#36d495',
          dataGrouping: dataGrouping
        },
        column: {
          turboThreshold: 0,
          dataGrouping: dataGrouping
        },
        trendline: {
          lineWidth: 1
        },
        histogram: {
          lineWidth: 1,
          tooltip: {
            pointFormat: "<li><span style='color: {series.color};'>{series.name}: <b>{point.y}</b></span></li>"
          }
        }
      },
      scrollbar: {
        enabled: false,
        buttonArrowColor: '#333',
        barBackgroundColor: '#202020',
        buttonBackgroundColor: '#202020',
        trackBackgroundColor: '#202020',
        barBorderColor: '#2a2a2a',
        buttonBorderColor: '#2a2a2a',
        trackBorderColor: '#2a2a2a'
      },
      rangeSelector: {
        enabled: false
      },
      navigator: {
        enabled: false,
        maskFill: 'rgba(32, 32, 32, 0.6)',
        outlineColor: '#333',
        outlineWidth: 1,
        xAxis: {
          dateTimeLabelFormats: DATETIME_LABEL_FORMAT
        }
      },
      xAxis: {
        type: 'datetime',
        dateTimeLabelFormats: DATETIME_LABEL_FORMAT,
        lineColor: '#eee',
        tickColor: '#eee',
        tickWidth: 2,
        range: range,
        events: {
          afterSetExtremes: function(e) {
            if (e.trigger === 'navigator' && e.triggerOp === 'navigator-drag') {
              if (component.liveRange(this.chart) && !component.running) {
                return component.trigger("switch::range_switch::init");
              }
            }
          }
        }
      },
      yAxis: [
        {
          labels: {
            enabled: true,
            align: 'left',
            format: '{value}'
          },
          gridLineColor: '#eee',
          gridLineDashStyle: 'Solid',
          top: "0%",
          height: "100%",
          lineColor: '#eee',
          lineWidth: 1,
          minRange: gon.ticker.last ? parseFloat(gon.ticker.last) / 25 : null
        }, {
          labels: {
            enabled: true,
            align: 'left'
          },
          top: "100%",
          gridLineColor: null,
          height: "0%"
        }, {
          visible: false,
          labels: {
            enabled: false
          },
          top: "100%",
          gridLineColor: '#eee',
          height: "0%"
        }
      ],
      series: [
        _.extend({
          id: 'candlestick',
          name: gon.i18n.chart.candlestick,
          type: "line",
          data: data['candlestick'],
          showInLegend: false,
          lineWidth: 3,
          color: '#24356e'
        })
      ]
    });
  };
  this.formatPointArray = function(point) {
    return {
      x: point[0],
      open: point[1],
      high: point[2],
      low: point[3],
      close: point[4]
    };
  };
  this.createPointOnSeries = function(chart, i, px, point) {
    return chart.series[i].addPoint(point, true, true);
  };
  this.createPoint = function(chart, data, i) {
    this.createPointOnSeries(chart, 0, data.candlestick[i][0], data.candlestick[i]);
    this.createPointOnSeries(chart, 1, data.close[i][0], data.close[i]);
    this.createPointOnSeries(chart, 2, data.volume[i].x, data.volume[i]);
    return chart.redraw(true);
  };
  this.updatePointOnSeries = function(chart, i, px, point) {
    var last;
    if (chart.series[i].points) {
      last = chart.series[i].points[chart.series[i].points.length - 1];
      if (px === last.x) {
        return last.update(point, false);
      } else {
        return console.log("Error update on series " + i + ": px=" + px + " lastx=" + last.x);
      }
    }
  };
  this.updatePoint = function(chart, data, i) {
    this.updatePointOnSeries(chart, 0, data.candlestick[i][0], this.formatPointArray(data.candlestick[i]));
    this.updatePointOnSeries(chart, 1, data.close[i][0], data.close[i][1]);
    this.updatePointOnSeries(chart, 2, data.volume[i].x, data.volume[i]);
    return chart.redraw(true);
  };
  this.process = function(chart, data) {
    var current, current_point, i, j, ref, results;
    results = [];
    for (i = j = 0, ref = data.candlestick.length - 1; 0 <= ref ? j <= ref : j >= ref; i = 0 <= ref ? ++j : --j) {
      current = chart.series[0].points.length - 1;
      current_point = chart.series[0].points[current];
      if (data.candlestick[i][0] > current_point.x) {
        results.push(this.createPoint(chart, data, i));
      } else {
        results.push(this.updatePoint(chart, data, i));
      }
    }
    return results;
  };
  this.updateByTrades = function(event, data) {
    var chart;
    chart = this.$node.find('#candlestick_chart').highcharts();
    if (this.liveRange(chart)) {
      return this.process(chart, data);
    } else {
      return this.running = false;
    }
  };
  this.liveRange = function(chart) {
    var p1, p2;
    p1 = chart.series[0].points[chart.series[0].points.length - 1].x;
    p2 = chart.series[10].points[chart.series[10].points.length - 1].x;
    return p1 === p2;
  };
  return this.after('initialize', function() {
    console.log("(test)welcomeCandleStickUI component is sucessfully loaded");

    this.on(document, 'market::candlestick::request', this.request);
    this.on(document, 'market::candlestick::response', this.init);
    this.on(document, 'market::candlestick::trades', this.updateByTrades);
    this.on(document, 'switch::main_indicator_switch', this.switchMainIndicator);
    return this.on(document, 'switch::type_switch', this.switchType);
  });
});
