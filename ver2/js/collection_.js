//*global Backbone */
var app = app || {};

(function () {
  'user strict';

  var Togos = Backbone.Collection.extend({
    model: app.Where,

    selectedMarker: function() {
      return this.where({selected: true});
    },

		// Todos are sorted by their original insertion order.
		comparator: function(a,b) {
      return -a.get('id').localeCompare(b.get('id'));
    }

  });
  app.togos = new Togos();

})();
