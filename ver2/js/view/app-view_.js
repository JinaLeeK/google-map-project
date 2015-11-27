/*global Backbone, jQuery, _, ENTER_KEY */
// function : autocomplete, search places, directions
var app = app || {};

(function ($) {
  'use strict';

  // The Application
  // Our overall **AppView** is the top-level piece of UI.
  app.AppView = Backbone.View.extend({
    el: '#container',

    events: {
      'keypress #near-input': 'setRadius',
      'change #countries': 'countryChange',
      'change #mode': 'changeTravelMode',
    },

    initialize: function() {
      this.mapArea = this.$("#map_canvas")[0];
      this.myCountry = this.$("#countries")[0];
      this.myLocation = this.$("#pac-input")[0];
      this.myNear = this.$("#near-input")[0];
      this.myMode = this.$("#mode")[0];
      this.$hotelList = this.$("#hotelList");
      this.$list = this.$("#results");
      this.$reviewArea = this.$("#hotel-content");

      this.listenTo(app.togos, 'change:completed', this.selectedColor);
      this.listenTo(app.togos, 'add', this.addone);
      this.listenTo(app.togo, 'change:place', this.changeLocation);
      this.listenTo(app.togo, 'change:place', this.searchPlaces);
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

    selectedColor: function() {
      this.$list.find(".color").removeClass("color");
      var selectedMarker = app.togos.selectedMarker();
      this.$list.find('.'+selectedMarker[0].id).addClass("color");

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

      this.$list.html('');

      this.marker.setVisible(false);
    },

    mapSetup: function() {
      this.map = new google.maps.Map(this.mapArea, {
          zoom: 2,
          center: {lat:15, lng:0},
          mapTypeId : google.maps.MapTypeId.ROADMAP
      });
    },

    getPlace: function() {
      app.togos.reset();

      var place = this.getPlace();
      if (!place.geometry) {
        window.alert("Autocomplete's returned place contains no geometry");
        return;
      }
        app.togo.changePlace(place);
    },

    addone: function(where) {
      var view = new app.TogoView({model: where});
      this.$list.append(view.addListContent());
    },

    setRadius: function(e) {
      if (e.which === ENTER_KEY) {
        app.togo.changeNear(parseInt($("#near-input").val()));
      }
    },

    changeTravelMode: function() {
      var mode = this.myMode.value;
      app.togos.each(function(where) {
        where.modeChange(mode);
      }, this);
    },

    searchPlaces: function() {
      var place = app.togo.get("place");
      var radius = app.togo.get("near");

      if (place.geometry && radius) {
        app.togos.reset();
        this.$list.html('');
        this.map.panTo(place.geometry.location);
        this.map.setZoom(10);
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
      var place = {};

      this.places.nearbySearch(search, function(results, status){
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          var num = 0;
          results.forEach(function(result) {
            var char = String.fromCharCode('A'.charCodeAt(0) + num);
            _this.getInfoDetail(char, result);
            num++;
          })
        }
      })
    },

    getInfoDetail(char, result) {
      var _this = this;
      this.places.getDetails( {placeId: result.place_id}, function(place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          app.togos.add(_this.newAttributes(char, place));
        }
      })
    },

    newAttributes: function(char, result) {
      return {
        id: char,
        info: result,
        location: result.geometry.location,
        travelmode: this.myMode.value
      };
    },

    changeLocation: function() {
      this.marker.setVisible(false);
      this.$list.html('');

      this.place = app.togo.get("place");
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

    },
});
})(jQuery);
