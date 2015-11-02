//*global Backbone */
var app = app || {};

(function () {
  'user strict';

  var Togos = Backbone.Collection.extend({
    model: app.Togo,

    location: function(input) {
      this.save({
        location: input
      });
    },

    address: function(address) {
      this.save({
        address: address
      });
    }

  });



  app.togos = new Togos();

})();
