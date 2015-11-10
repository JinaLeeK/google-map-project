//*global Backbone */
var app = app || {};

(function () {
  'user strict';

  var Togos = Backbone.Collection.extend({
    model: app.Where,

    selectedMarker: function() {
      return this.where({selected: true});
    },

  });
  app.togos = new Togos();

})();
