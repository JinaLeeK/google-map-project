var app = app || {};

(function () {
  'use strict';

  app.Where = Backbone.Model.extend({
    defaults: {
      id: '',
      info: {},
      location: {},
      travelmode: '',
      selected: false
    },
    modeChange: function(input) {
      this.set({
        travelmode: input
      })
    },
  });
})();
