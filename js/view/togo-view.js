var app = app || {};

(function ($) {
  'use strict';

  app.TogoView = Backbone.View.extend({
    initialize:   function() {
      this.listenTo(app.togos, 'reset', this.clearMarker);
      this.render();
    },


    render: function() {
      this.marker;
      this.map = app.togo.get("map");
      this.visibleMarker();
    },

    clearMarker: function() {
      this.marker.setMap(null);
    },

    visibleMarker: function() {
      var char = this.model.attributes.id;
      var markerIcon = MARKER_PATH + char + '.png';
      this.marker = new google.maps.Marker({
        position: this.model.attributes.location,
        animation: google.maps.Animation.DROP,
        icon: markerIcon
      });
      this.marker.placeResult = this.model.attributes.info;
      setTimeout(this.marker.setMap(this.map), char.charCodeAt(0)-'A'.charCodeAt(0));
    }
  });
})(jQuery);
