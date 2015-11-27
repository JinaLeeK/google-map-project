var app = app || {};

(function () {
  'use strict';

  app.Where = Backbone.Model.extend({
    defaults: {
      id: '',
      info: {},
      location: {},
      travelmode: '',
      selected: false,
      completed: false
    },
    modeChange: function(input) {
      this.set({
        travelmode: input
      })
    },
    toggleCompleted: function(){
      this.set({
        completed: !this.get('completed')
      });
    }
  });
})();
