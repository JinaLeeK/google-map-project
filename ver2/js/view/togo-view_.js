// custom direction panel
// marker animation

var app = app || {};

(function ($) {
  'use strict';

  app.TogoView = Backbone.View.extend({
    el: '#hotelContent',

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
      this.directionsSetup();
      this.invokeEvents();
    },

    invokeEvents: function() {
      var _this = this
      this.marker.addListener('click', function() {

        _this.model.trigger('clickMarker');
      });
    },

    addListContent: function() {
      this.tr = document.createElement('tr');
      var _this = this;
      var char = this.model.attributes.id;
      var markerIcon = MARKER_PATH + char + '.png';
      var charId = char.charCodeAt(0)-'A'.charCodeAt(0);

      var iconTd = document.createElement('td');
      var nameTd = document.createElement('td');
      var icon = document.createElement('img');
      icon.src = markerIcon;
      icon.setAttribute('class', 'placeIcon');
      icon.setAttribute('className', 'placeIcon');

      var nameElem = document.createElement('div');
      var nameHtml = '<div><b>'+ this.marker.info.name + '</b></div>'
      nameHtml += '<div>' + this.marker.info.adr_address + '</div>';
      nameElem.innerHTML = nameHtml;
      nameElem.onclick = function() {
        _this.model.trigger('clickMarker');
      };

      iconTd.appendChild(icon);
      nameTd.appendChild(nameElem);

      if (this.marker.info.rating) {
        var ratingElem = document.createElement('span');
        var ratingHtml = ''

        for (var i=0; i<5; i++) {
          if (this.marker.info.rating < (i + 0.5)) {
            ratingHtml += '&#10025;';
          } else {
            ratingHtml += '&#10029;';
          }
        }

        ratingElem.innerHTML = ratingHtml;
        ratingElem.setAttribute('class', 'review-icon');
        nameTd.appendChild(ratingElem);
      }


      if (this.marker.info.reviews) {
        var reviewElem = document.createElement('span');
        reviewElem.setAttribute('class','click-reviews');
        reviewElem.textContent = 'view reviews';
        reviewElem.addEventListener('click', (function(location, reviews) {
          return function() {
            var contentHtml = '';
            var streetviewUrl = 'http://maps.googleapis.com/maps/api/streetview?size=380x250&location=' + location + '';

            contentHtml = '<link rel="stylesheet" href="C:/Users/JinaLee/MyProject/google_maps_project/ver2/style.css">'
            contentHtml += '<img class="streetviewImage" src="' + streetviewUrl + '">';

            var reviewArray = [];
            reviews.forEach(function(review) {
              var reviewHtml = '<div class="each-review"><span class="review-icon">';

              for (var i=0; i<5; i++) {
                if (review.rating < (i + 0.5)) {
                  reviewHtml += '&#10025';
                } else {
                  reviewHtml += '&#10029';
                }
              }
              reviewHtml += '</span>'
              var date = _this.convertTimestamp(review.time);
              reviewHtml += '<span class="review-time">Reviewed ' + date + '</span>';
              reviewHtml += '<div class="content">' + review.text + '</div></div>';
              reviewArray.push(reviewHtml);
            });
            var reviewsHtml = reviewArray.join('');

            contentHtml += "<div class=reviews>" + reviewsHtml + "</div>";

            var reviewWin = window.open('','','width=450px, height=600px');
            $(reviewWin.document.body).html(contentHtml);
          }

        })(this.marker.info.geometry.location, this.marker.info.reviews));
        nameTd.appendChild(reviewElem);
      }

      this.tr.appendChild(iconTd);
      this.tr.appendChild(nameTd);
      this.tr.setAttribute('class', char);

      return this.tr;
    },

    convertTimestamp: function(timestamp) {
      var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
    		yyyy = d.getFullYear(),
    		mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
    		dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
    		hh = d.getHours(),
    		h = hh,
    		min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
    		ampm = 'AM',
    		time;

    	if (hh > 12) {
    		h = hh - 12;
    		ampm = 'PM';
    	} else if (hh === 12) {
    		h = 12;
    		ampm = 'PM';
    	} else if (hh == 0) {
    		h = 12;
    	}

    	// ie: 2013-02-18, 8:35 AM
    	time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    	return time;
    },

    directionsSetup: function() {
      var _this = this;
      this.directionsService = new google.maps.DirectionsService();
      this.directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
      });
    },

    directionsRender: function() {
      var _this = this;
      if( this.model.attributes.selected) {
        this.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() { _this.marker.setAnimation(null);
        }, 1400);

        this.directionsDisplay.setMap(this.map);

        this.directionsDisplay.setMap(this.map);
        var origin_place_id = app.togo.get("place").place_id;
        var destination_place_id = this.marker.info.place_id;
        if (!origin_place_id || !destination_place_id) { return;}
        this.directionsService.route({
          origin: {'placeId': origin_place_id},
          destination: {'placeId': destination_place_id},
          travelMode: google.maps.TravelMode[this.model.attributes.travelmode]
        }, function(response, status) {
          if (status === google.maps.DirectionsStatus.OK) {
            _this.directionsDisplay.setDirections(response);
            _this.marker.travelTime =response.routes[0].legs[0].duration.text;
            _this.marker.travelDistance = response.routes[0].legs[0].distance.text;
            _this.openInfoWin();
          } else {
            window.alert("Directions request failed due to" + status);
          }
        });

      } else {
        this.directionClear();
      }
    },

    markerClear: function() {
      this.marker.setMap(null);
      if(this.directionsDisplay) {
        this.directionsDisplay.setMap(null);
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

    openInfoWin: function() {
      this.infowindow = new google.maps.InfoWindow();
      var place = this.marker.info, $content = $(this.template());

      $content.find("#iw-url").html('<b><a href="' + place.website + '" target="_blank">'
        + place.name + '</a></b>');
      $content.find("#iw-address").text(place.vicinity);

      $content.find("#iw-travel").text(this.marker.travelDistance+' - about '+ this.marker.travelTime);

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
      this.infowindow.open(this.map, this.marker);
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
      }
    },

    markersTrigger: function(where) {
      app.togos.each(function(where) { where.set({selected: false}); }, this);
      this.model.set({ selected: true});
      this.model.toggleCompleted();
    },
  });
})(jQuery);
