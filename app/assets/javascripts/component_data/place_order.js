this.PlaceOrderData = flight.component(function() {
  this.onInput = function(event, data) {
    var ref;
    ref = data.variables, this.input = ref.input, this.known = ref.known, this.output = ref.output;
    this.order[this.input] = data.value;
    if (!(this.order[this.input] && this.order[this.known])) {
      return;
    }
    return this.trigger("place_order::output::" + this.output, this.order);
  };
  this.onReset = function(event, data) {
    var ref;
    ref = data.variables, this.input = ref.input, this.known = ref.known, this.output = ref.output;
    this.order[this.input] = this.order[this.output] = null;
    this.trigger("place_order::reset::" + this.output);
    return this.trigger("place_order::order::updated", this.order);
  };
  return this.after('initialize', function() {
    this.order = {
      price: null,
      volume: null,
      total: null
    };
    this.on('place_order::input', this.onInput);
    return this.on('place_order::reset', this.onReset);
  });
});
