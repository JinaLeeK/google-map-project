var app = app || {};

(function () {
  'use strict';

  app.Where = Backbone.Model.extend({
    defaults: {
      id: '',
      info: {},
      location: {},
      visible: false
    }
  });
})();
