// custom direction panel
// marker animation

var app = app || {};

(function ($) {
  'use strict';

  app.TogoView = Backbone.View.extend({
    el: '#directionSteps',

    events: {
      'click .destroy': 'closePanel'
    },

    template: _.template($("#info-template").html()),

    initialize:   function() {
      this.listenTo(app.togos, 'reset', this.markerClear);
      this.listenTo(this.model, 'clickMarker', this.markersTrigger);
      this.listenTo(this.model, 'change:selected', this.directionsRender);
      this.listenTo(this.model, 'change:travelmode', this.directionsRender);
      this.render();
    },

    render: function() {
      this.map = app.togo.get("map");
      this.markerSetup();
      this.infoWindowSetup();
      this.directionsSetup();
      this.invokeEvents();
    },

    invokeEvents: function() {
      var _this = this
      this.marker.addListener('click', function() {

        _this.model.trigger('clickMarker');
      });
    },

    // addListContent: function() {
    //   this.li = document.createElement('li');
    //
    //   var _this = this;
    //   var char = this.model.attributes.id;
    //   var markerIcon = MARKER_PATH + char + '.png';
    //   var charId = char.charCodeAt(0) - 'A'.charCodeAt(0);
    //
    //   var nameElem = document.createElement('h3');
    //   nameElem.textContent = this.marker.info.name;
    //   this.li.appendChild(nameElem);
    //
    //   if (this.marker.info.rating) {
    //     var ratingElem = document.createElement('p');
    //     var ratingHtml = '';
    //     for (var i=0; i<5; i++) {
    //       if (this.marker.info.rating < (i + 0.5)) {
    //         ratingHtml += '&#10025;';
    //       } else {
    //         ratingHtml += '&#10029;';
    //       }
    //     }
    //     ratingElem.innerHTML = ratingHtml;
    //     this.li.appendChild(ratingElem);
    //   }
    //
    //   this.li.onclick = function() {
    //       _this.model.trigger('clickMarker');
    //     };
    //
    //     return this.li;
    // },

    addListContent: function() {
      this.tr = document.createElement('tr');

      var _this = this;
      var char = this.model.attributes.id;
      var markerIcon = MARKER_PATH + char + '.png';
      var charId = char.charCodeAt(0)-'A'.charCodeAt(0);

      this.tr.style.backgroundColor = (charId % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
      var iconTd = document.createElement('td');
      var nameTd = document.createElement('td');
      var icon = document.createElement('img');
      icon.src = markerIcon;
      icon.setAttribute('class', 'placeIcon');
      icon.setAttribute('className', 'placeIcon');
      var name = document.createTextNode(this.marker.info.name);
      iconTd.appendChild(icon);
      nameTd.appendChild(name);
      this.tr.appendChild(iconTd);
      this.tr.appendChild(nameTd);

      this.tr.onclick = function() {
        _this.model.trigger('clickMarker');
      };

      return this.tr;
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

      this.marker.info = this.model.attributes.info;
      setTimeout(this.marker.setMap(this.map), char.charCodeAt(0)-'A'.charCodeAt(0));
    },

    infoWindowSetup: function() {
      this.infowindow = new google.maps.InfoWindow();
      var place = this.marker.info, $content = $(this.template());

      $content.find("#iw-icon").html('<img class="hotelIcon" ' +
        'src="' + place.icon + '"/>');
      $content.find("#iw-url").html('<b><a href="' + place.url + '">'
        + place.name + '</a></b>');
      $content.find("#iw-address").text(place.vicinity);

      if (place.formatted_phone_number) {
        $content.find("#iw-phone-row").show();
        $content.find("#iw-phone").text(place.formatted_phone_number);
      } else {
        $content.find("#iw-phone-row").hide();
      }

      if (place.rating) {
        var ratingHtml = '';
        for (var i=0; i<5; i++) {
          if (place.rating < (i + 0.5)) {
            ratingHtml += '&#10025;';
          } else {
            ratingHtml += '&#10029;';
          }
          $content.find("#iw-rating-row").show();
          $content.find("#iw-rating").html(ratingHtml);
        }
      } else {
        $content.find("#iw-rating-row").hide();
      }

      // The regexp isolates the first part of the URL (domain + subdomain)
      // to give a short URL for displaying in the info window.
      if (place.website) {
        var fullUrl = place.website;
        var website = hostnameRegexp.exec(place.website);
        if (website === null) {
          website = 'http://' + place.website + '/';
          fullUrl = website;
        }
        $content.find("#iw-website-row").show();
        $content.find("#iw-website").text(website);
      } else {
        $content.find("#iw-website-row").hide();
      }

      this.infowindow.setContent($content[0]);
    },

    directionClear: function() {
      if (this.marker.getAnimation) {
        this.marker.setAnimation(null);
      };

      if(this.infowindow) {
        this.infowindow.close();
      }

      if(this.directionsDisplay) {
        this.directionsDisplay.setMap(null);
        this.$el.html('');
      }
    },

    markersTrigger: function(where) {
      app.togos.each(function(where) { where.set({selected: false}); }, this);
      this.model.set({ selected: true});
    },

    directionsRender: function() {
      var _this = this;
      if( this.model.attributes.selected) {
        this.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { _this.marker.setAnimation(null);
        }, 1400);

        this.infowindow.open(this.map, this.marker);
        this.directionsDisplay.setMap(this.map);
        // this.directionsDisplay.setPanel(this.el);

        var origin_place_id = app.togo.get("location").place_id;
        var destination_place_id = this.marker.info.place_id;
        if (!origin_place_id || !destination_place_id) { return;}
        this.directionsService.route({
          origin: {'placeId': origin_place_id},
          destination: {'placeId': destination_place_id},
          travelMode: google.maps.TravelMode[this.model.attributes.travelmode]
        }, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
              _this.directionsDisplay.setDirections(response);
              _this.textDirections(response);
            } else {
              window.alert("Directions request failed due to" + status);
            }
        });
      } else {
        this.directionClear();
      }
    },

    textDirections: function(response) {
      var dir = response.routes[0].legs[0];
      var output = '';
      this.$el.html('<button class="destroy"></button><h3>Directions to ' + this.marker.info.name + '</h3>');

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
      output += '<div class="dir_end">'+ this.marker.info.name +'</div>';

			this.el.innerHTML += output;
    },

    clear: function() {
      alert('test');
    }

  });
})(jQuery);
