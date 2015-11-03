var app = app || {};

(function () {
  'use strict';

  app.Where = Backbone.Model.extend({
    defaults: {
      place: '',
      name: '',
      distance: 0
    }
  });
})();
