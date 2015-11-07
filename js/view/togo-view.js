var app = app || {};

(function ($) {
  'use strict';

  app.TogoView = Backbone.View.extend({
    el: '#right-panel',

    initialize:   function() {
      this.listenTo(app.togos, 'reset', this.resetMarker);
      this.listenTo(this.model, 'clickMarker', this.calculateAndDisplayRoute);
      this.listenTo(this.model, 'unset', this.clearDirections);
      this.render();
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.map = app.togo.get("map");
      this.onSetMarker();
    },

    resetMarker: function() {
      this.marker.setMap(null);
      if(this.directionsDisplay) {
        this.directionsDisplay.setMap(null);
        this.directionsDisplay.setPanel(null);
      }
    },

    onSetMarker: function() {
      var control = this;
      var char = this.model.attributes.id;
      var markerIcon = MARKER_PATH + char + '.png';
      this.marker = new google.maps.Marker({
        position: this.model.attributes.location,
        animation: google.maps.Animation.DROP,
        icon: markerIcon
      });
      this.marker.placeResult = this.model.attributes.info;
      this.marker.addListener('click', function() {
        control.model.trigger('clickMarker');
      });

      setTimeout(this.marker.setMap(this.map), char.charCodeAt(0)-'A'.charCodeAt(0));
    },

    clearDirections: function() {
      if(this.directionsDisplay) {
        this.directionsDisplay.setMap(null);
        this.directionsDisplay.setPanel(null);
      }
    },

    unClickedMarkers: function(where) {
      where.trigger('unset');
    },

    calculateAndDisplayRoute: function() {
      app.togos.each(this.unClickedMarkers, this);
      var control = this;
      this.directionsService = new google.maps.DirectionsService;
      this.directionsDisplay = new google.maps.DirectionsRenderer;

      this.directionsDisplay.setMap(this.map);
      this.directionsDisplay.setPanel(this.el);

      var origin_place_id = app.togo.get("location").place_id;
      var destination_place_id = this.marker.placeResult.place_id;
      if (!origin_place_id || !destination_place_id) { return;}
      this.directionsService.route({
        origin: {'placeId': origin_place_id},
        destination: {'placeId': destination_place_id},
        travelMode: google.maps.TravelMode.DRIVING
      }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            control.directionsDisplay.setDirections(response);
          } else {
            window.alert("Directions request failed due to" + status);
          }
      });
    }

  });
})(jQuery);
