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
      'change #mode': 'changeTravelMode',
      'click .destroy': 'closePanel'

    },

    initialize: function() {
      this.myCountry = this.$("#countries")[0];
      this.myLocation = this.$("#pac-input")[0];
      this.myNear = this.$("#near-input")[0];
      this.myMap = this.$("#map_canvas")[0];
      this.myMode = this.$("#mode")[0];
      this.$listPanel = this.$("#listing-panel");
      this.$list = this.$("#results");
      this.$directionPanel = this.$("#right-panel");

      this.listenTo(app.togos, 'change:selected', this.togglePanel);
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

    closePanel: function() {
      this.$directionPanel.removeClass('shown').addClass('hidden');
      this.$listPanel.removeClass('hidden').addClass('shown');
    },

    togglePanel: function() {
      this.$directionPanel.removeClass('hidden').addClass('shown');
      this.$listPanel.removeClass('shown').addClass('hidden');
    },

    autoCompleteSetup: function() {
      this.autocomplete = new google.maps.places.Autocomplete(this.myLocation);
      this.autocomplete.bindTo('bounds', this.map);
      console.log(this.autocomplete);
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
      this.closePanel();

      this.$list.html('');
      // this.$listPanel.html('');

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
      this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(this.myMode);

    },

    getPlace: function() {
      app.togos.reset();
      // this.closePanel();

      var place = this.getPlace();
      console.log(place.geometry);
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
      var view = new app.TogoView({model: where});
      // var view = new app.TogoView({model: where});
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
      var place = app.togo.get("location");
      var radius = app.togo.get("near");

      if (place.geometry && radius) {
        this.$listPanel.find('.msg').hide();
        app.togos.reset();
        this.closePanel();
        this.$list.html('');
        // this.$listPanel.html('');
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
      // this.$listPanel.html('');

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

    },
});
})(jQuery);
