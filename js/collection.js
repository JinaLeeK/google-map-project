//*global Backbone */
var app = app || {};

(function () {
  'user strict';

  var Togos = Backbone.Collection.extend({
    model: app.Where


  });



  app.togos = new Togos();

})();
