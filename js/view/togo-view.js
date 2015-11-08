// custom direction panel
// marker animation

var app = app || {};

(function ($) {
  'use strict';

  app.TogoView = Backbone.View.extend({
    el: '#right-panel',

    initialize:   function() {
      this.listenTo(app.togos, 'reset', this.markerClear);
      this.listenTo(this.model, 'clickMarker', this.directionsRender);
      this.listenTo(this.model, 'unset', this.directionClear);
      this.render();
    },

    render: function() {
      this.map = app.togo.get("map");
      this.markerSetup();
      this.directionsSetup();
      this.invokeEvents();
    },

    invokeEvents: function() {
      var _this = this
      this.marker.addListener('click', function() {
        _this.model.trigger('clickMarker');
      });
    },



    directionsSetup: function() {
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
      });
    },

    markerClear: function() {
      this.marker.setMap(null);
      if(this.directionsDisplay) {
        this.directionsDisplay.setMap(null);
        this.$el.html('');
        // this.directionsDisplay.setPanel(null);
      }
    },

    markerSetup: function() {
      var char = this.model.attributes.id;
      var markerIcon = MARKER_PATH + char + '.png';

      this.marker = new google.maps.Marker({
        position: this.model.attributes.location,
        animation: google.maps.Animation.DROP,
        icon: markerIcon
      });

      this.marker.placeResult = this.model.attributes.info;

      setTimeout(this.marker.setMap(this.map), char.charCodeAt(0)-'A'.charCodeAt(0));
    },

    directionClear: function() {
      if (this.marker.getAnimation) {
        this.marker.setAnimation(null);
      };

      if(this.directionsDisplay) {
        this.directionsDisplay.setMap(null);
        this.$el.html('');
        // this.directionsDisplay.setPanel(null);
      }
    },

    markersTrigger: function(where) {
      where.trigger('unset');
    },

    directionsRender: function() {
      app.togos.each(this.markersTrigger, this);

      var _this = this;

      this.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() { _this.marker.setAnimation(null);
      }, 2800);

      this.directionsDisplay.setMap(this.map);
      // this.directionsDisplay.setPanel(this.el);

      this.$el.html('<h3>Directions to ' + this.marker.placeResult.name + '</a></h3>');
      var origin_place_id = app.togo.get("location").place_id;
      var destination_place_id = this.marker.placeResult.place_id;
      if (!origin_place_id || !destination_place_id) { return;}

      this.directionsService.route({
        origin: {'placeId': origin_place_id},
        destination: {'placeId': destination_place_id},
        travelMode: google.maps.TravelMode.DRIVING
      }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            _this.directionsDisplay.setDirections(response);
            _this.textDirections(response);
          } else {
            window.alert("Directions request failed due to" + status);
          }
      });
    },

    textDirections: function(response) {
      var dir = response.routes[0].legs[0];
      var output = '';

      output += '<div class="dir_start">' + dir.start_address + '</div>';
      output += '<div class="dir_summary silver">Travel: '+ dir.distance.text +' - about '+ dir.duration.text +'</div>';

      output += '<table>';
      for (var i=0; i<dir.steps.length; i++){
				output += '<tr style="border-bottom: 1px solid silver;">';
				output += '<td class="dir_row"><span class="dir_sprite '+ dir.steps[i].maneuver +'"></span></td>';
				output += '<td class="dir_row">'+ (i+1) +'.</td>';
				output += '<td class="dir_row">'+ dir.steps[i].instructions +'</td>';
				output += '<td class="dir_row" style="white-space:nowrap;">'+ dir.steps[i].distance.text +'</td>';
				output += '</tr>';
			}
			output += '</table>';
      output += '<div class="dir_end">'+ this.marker.placeResult.name +'</div>';

			this.el.innerHTML += output;

    }

  });
})(jQuery);
