/*global Backbone, jQuery, _, ENTER_KEY */
// function : autocomplete, search places, directions
var app = app || {};

(function ($) {
  'use strict';

  // The Application
  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Backbone.View.extend({
    el: '#map',

    events: {
      'keypress #near-input': 'setRadius',
      'change #countries': 'countryChange',
    },

    initialize: function() {
      this.myCountry = this.$("#countries")[0];
      this.myLocation = this.$("#pac-input")[0];
      this.myNear = this.$("#near-input")[0];
      this.myMap = this.$("#map_canvas")[0];

      this.listenTo(app.togos, 'add', this.addone);
      this.listenTo(app.togo, 'change:location', this.changeLocation);
      this.listenTo(app.togo, 'change:location', this.searchPlaces);
      this.listenTo(app.togo, 'change:near', this.searchPlaces);

      this.render();
    },

    render: function() {
      this.mapSetup();
      this.autoCompleteSetup();
      this.markerSetup();
      this.searchPlacesSetup();
    },

    searchPlacesSetup: function() {
      this.places = new google.maps.places.PlacesService(this.map);
    },

    markerSetup: function() {
      this.marker = new google.maps.Marker({
          map: this.map,
          anchorPoint: new google.maps.Point(0, -29),
          title: 'start point'
      });
    },

    autoCompleteSetup: function() {
      this.autocomplete = new google.maps.places.Autocomplete(this.myLocation);
      this.autocomplete.bindTo('bounds', this.map);
      this.autocomplete.addListener('place_changed', this.getPlace, this.autocomplete);
    },

    countryChange: function() {
      var country = this.myCountry.value;

      if (country === 'all') {
        this.autocomplete.setComponentRestrictions([]);
        this.map.setCenter({lat: 15, lng:0});
        this.map.setZoom(2);
      } else {
        this.autocomplete.setComponentRestrictions({'country' : country});
        this.map.setCenter(countries[country].center);
        this.map.setZoom(countries[country].zoom);
      }

      document.getElementById('pac-input').value = '';
      document.getElementById('near-input').value = '';
      document.getElementById('pac-input').placeholder = 'Enter a city';
      document.getElementById('near-input').placeholder = 'within(m)';
      app.togos.reset();
      this.marker.setVisible(false);
    },

    mapSetup: function() {
      this.map = new google.maps.Map(this.myMap, {
          zoom: 2,
          center: {lat:15, lng:0},
          mapTypeId : google.maps.MapTypeId.ROADMAP
      });

      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.myCountry);
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.myLocation);
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.myNear);

    },

    getPlace: function() {
      app.togos.reset();

      var place = this.getPlace();
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
    },

    addone: function(where) {
      new app.TogoView({model: where});
    },

    setRadius: function(e) {
      if (e.which === ENTER_KEY) {
        app.togo.changeNear(parseInt($("#near-input").val()));
      }
    },

    searchPlaces: function() {
      var place = app.togo.get("location");
      var radius = app.togo.get("near");

      if (place.geometry && radius) {
        app.togos.reset();
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
        app.togo.changeMap(this.map);
        this.search(place, radius);
      } else {
        document.getElementById('pac-input').placeholder = 'Enter a city';
        document.getElementById('near-input').placeholder = 'within(m)';
      }
    },

    search: function(place, radius) {
      var _this = this;
      var search = {
        location: this.map.getCenter(),
        radius: radius,
        types: ['lodging']
      };

      this.places.nearbySearch(search, function(results, status){
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          for (var i=0; i<results.length; i++) {
            var char = String.fromCharCode('A'.charCodeAt(0) + i);
            app.togos.add(_this.newAttributes(char,results[i]));
          }
        }
      });
    },

    newAttributes: function(char, result) {
      console.log(result);
      return {
        id: char,
        info: result,
        location: result.geometry.location,
        visible: false
      };
    },

    changeLocation: function() {
      this.marker.setVisible(false);
      // this.infowindow.close();

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
});
})(jQuery);
