/*global Backbone, jQuery, _, ENTER_KEY */
var app = app || {};

(function ($) {
  'use strict';

  // The Application
  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Backbone.View.extend({
    el: '#map',

    events: {
      'keypress #near-input': 'setRadius'
    },

    initialize: function() {
      this.myLocation = this.$("#pac-input")[0];
      this.myNear = this.$("#near-input")[0];
      this.myMap = this.$("#map_canvas")[0];
      this.mapSetting();
      this.setInput();
      this.markers = [];
      this.circle;

      this.listenTo(app.togo, 'change:location', this.newLocation);
      this.listenTo(app.togo, 'change:location', this.searchPlaces);
      this.listenTo(app.togo, 'change:near', this.searchPlaces);
      // this.listendTo(app.togos, 'add', this.addOne);
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

    setRadius: function(e) {
      if (e.which === ENTER_KEY) {
        app.togo.changeNear(parseInt($("#near-input").val()));
      }
    },

    // addOne: function (where) {
    //   var view = new app.TogoView( {model: where});
    // }

    clearMarkers : function() {
      for (var i =0; i< this.markers.length; i++ ) {
        if(this.markers[i]) {
          this.markers[i].setMap(null);
        }
      }
      this.markers = [];
    },

    searchPlaces: function() {

      var place = app.togo.get("location");
      var radius = app.togo.get("near");
      if (place.geometry && radius) {
        this.map.panTo(place.geometry.location);
        this.map.setZoom(15);
        if(this.circle) { this.circle.setMap(null); }

        this.circle = new google.maps.Circle({
          strokeColor: '#C9DBFF',
          strokeOpacity: 0.9,
          strokeWeight: 2,
          fillColor: '#C9DBFF',
          fillOpacity: 0.35,
          map: this.map,
          center: place.geometry.location,
          radius: radius
        });

        this.map.fitBounds(this.circle.getBounds());
        this.search(place, radius);
      } else {
        document.getElementById('pac-input').placeholder = 'Enter a city';
        document.getElementById('near-input').placeholder = 'within(m)';
      }
    },

    search: function(place, radius) {
      var control = this;
      var search = {
        location: this.map.getCenter(),
        radius: radius,
        types: ['lodging']
      };
      var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';

      this.places.nearbySearch(search, function(results, status){
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          control.clearMarkers();

          for (var i=0; i<results.length; i++) {
            var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
            var markerIcon = MARKER_PATH + markerLetter + '.png';

            control.markers[i] = new google.maps.Marker({
              position: results[i].geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });

            control.markers[i].placeResult = results[i];

            // addResult(results[i], i);
            setTimeout(control.dropMarker(i), i * 100);

          }
          // control.map.fitBounds(control.bounds);
        }
      });
    },

    dropMarker: function(i) {
      var control = this;
      return function() {
        control.markers[i].setMap(control.map);
      }
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

        // this.infowindow.setContent('<div><strong>' + this.place.name + '</strong><br>' + app.togo.get("address"));
        // this.infowindow.open(this.map, this.marker);
    },

    setInput : function() {
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.myLocation);
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.myNear);

      var autocomplete = new google.maps.places.Autocomplete(this.myLocation);
      autocomplete.bindTo('bounds', this.map);
      this.places = new google.maps.places.PlacesService(this.map);

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
