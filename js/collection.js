//*global Backbone */
var app = app || {};

(function () {
  'user strict';

  var Togos = Backbone.Collection.extend({
    model: app.Where,

    selectedMarker: function() {
      return this.where({visible: true});
    },

    unselectedMarker: function() {
      return this.where({visible: false});
    }


  });
  app.togos = new Togos();

})();
