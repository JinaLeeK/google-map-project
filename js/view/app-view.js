/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
  'use strict';

  // The Application
  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Backbone.View.extend({
    el: '#map',

    events: {
    },

    initialize: function() {
      this.myInput = this.$("#pac-input")[0];
      this.myMap = this.$("#map_canvas")[0];
      this.mapSetting();
      this.setInput();

      this.listenTo(app.togo, 'change:location', this.newLocation);
      // this.listenTo(app.togo, 'all', this.render);
    },

    render: function() {
      // this.place = togo.get("location");
      // if (app.togos.length){
      //
      // } else {
      // this.showMap(new google.maps.LatLng(33.640728, -84.427700));
      // }
    },

    mapSetting: function() {
      this.map = this.showMap(new google.maps.LatLng(33.640728, -84.427700));
      this.marker = new google.maps.Marker({
          map: this.map,
          anchorPoint: new google.maps.Point(0, -29)
        });
      this.infowindow = new google.maps.InfoWindow();
    },

    newLocation: function() {
      this.marker.setVisible(false);
      this.infowindow.close();

      this.place = app.togo.get("location");
      if (this.place.geometry.viewport) {
        this.map.fitBounds(this.place.geometry.viewport);
      } else {
        this.map.setCenter(this.place.geometry.location);
        this.map.setZoom(17);
      }
      this.marker.setIcon({
        url: this.place.icon,
        size: new google.maps.Size(71,71),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(17,34),
        scaledSize: new google.maps.Size(35,35)
      });
        this.marker.setPosition(this.place.geometry.location);
        this.marker.setVisible(true);

        this.infowindow.setContent('<div><strong>' + this.place.name + '</strong><br>' + app.togo.get("address"));
        this.infowindow.open(this.map, this.marker);
    },

    setInput : function() {
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.myInput);

      var autocomplete = new google.maps.places.Autocomplete(this.myInput);
      autocomplete.bindTo('bounds', this.map);


      autocomplete.addListener('place_changed', function() {
        var place = autocomplete.getPlace();

        if (!place.geometry) {
          window.alert("Autocomplete's returned place contains no geometry");
          return;
        }

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
        }
        app.togo.changeAddress(address);
        app.togo.changeLocation(place);
      })
    },

    showMap : function(latlng) {

      var myOptions = {
        zoom: 12,
        center: latlng,
        mapTypeId : google.maps.MapTypeId.ROADMAP
      };

      return new google.maps.Map(this.myMap, myOptions);
  }
});
})(jQuery);
