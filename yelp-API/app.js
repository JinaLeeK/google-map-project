var yoh = {};
var map;
var yelp = [];    // array to hold yelp markers
var bounds;       // defines bounding box of all locations
var infowindow = new google.maps.InfoWindow(); // infowindow
var auth = {};


  // function to get Yelp API Keyauthentication to access Yelp API
  yoh.getAPI = function() {
    auth = {'consumerKey' : '8JG3jYSS0qz9ysi826Ha6Q',
             'consumerSecret' : 'mhYhjI6e0t8cKNReiwhcP4UNVe8',
             'accessToken' : '8taFgd1FgD41cJo1eEUSIWoZVtFvtYcp',
             'accessTokenSecret' : 'H5fuG8jCvJDBxEFgPOVecoAeU_M'};

    // $.ajax({
    //   'url' : "./config/config.php",
    //   'dataType' : "json",
    //   'success' : function(data) {
    //     for (var index in data) {
    //       auth[index] = data[index];
    //     }
    //     auth.serviceProvider = {
    //       signatureMethod : "HMAC-SHA1"
    //     }
    //   }
    // });
  }

  // }


  // trace function for debugging
  function trace(message) {
    if (typeof console != 'undefined') {
      console.log(message)
    }
  }

  // toggle array layers on/off
  yoh.toggleArrayLayer = function(arraylayer) {
    if(arraylayer) {
      for (i in arraylayer) {
        if (arraylayer[i].getVisible() == true) {
          arraylayer[i].setMap(null);
          arraylayer[i].visible = false;
        } else {
          arraylayer[i].setMap(map);
          arraylayer[i].visible = true;
        }
      }
    }
  }

  // function tocreate yelp Marker
  yoh.createYelpMarker = function(i, latitude, longitude, title, infowindowcontent) {
    var markerLatLng = new google.maps.LatLng(latitude, longitude);

    //extent bounds for each stop and adjust mapt to fit to it
    bounds.extend(markerLatLng);
    map.fitBounds(bounds);

    yelp[i] = new google.maps.Marker({
      position: markerLatLng,
      map: map,
      title: title,
    })

    // add an onclick event
    google.maps.event.addListener(yelp[i], 'click', function() {
      infowindow.setContent(infowindowcontent);
      infowindow.open(map, yelp[i]);
    });
  }

  // function to get data from yelp
  yoh.getYelp = function(terms, ll) {
    yoh.getAPI();

    var accessor = {
      consumerSecret: auth.consumerSecret,
      tokenSecret: auth.accessTokenSecret
    };

    parameters = [];
    parameters.push(['ll', ll]);
    parameters.push(['radius_filter', '5000']);
    // parameters.push(['sort','2']);
    parameters.push(['category_filter',terms]);
    parameters.push(['callback', 'cb']);
    parameters.push(['oauth_consumer_key', auth.consumerKey]);
    parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
    parameters.push(['oauth_token', auth.accessToken]);
    parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

    var message = {
      'action' : 'http://api.yelp.com/v2/search',
      'method' : 'GET',
      'parameters' : parameters
    };

    OAuth.setTimestampAndNonce(message);
    OAuth.SignatureMethod.sign(message, accessor);

    var parameterMap = OAuth.getParameterMap(message.parameters);



    bounds = new google.maps.LatLngBounds();

    $.ajax({
      'url' : message.action,
      'data' : parameterMap,
      'dataType' : 'jsonp',
      'jsonpCallback' : 'cb',
      'success' : function(data) {
        trace(data);
        $.each(data.businesses, function(i, item) {
          infowindowcontent = '<strong>' + item.name + '</strong><br>';
          infowindowcontent += '<div class="row"><div class="col-md-4"><img src="' + item.image_url + '"></div>';
          infowindowcontent += '<div class="col-md-8">' + item.location.display_address + '</br>';
          infowindowcontent += item.display_phone + '<br>';
          infowindowcontent += '<a href="' + item.url + '" target="_blank"><img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQzpPj7DRaxotBYPgn5XWycD2vEUTO6XCANz1OYGI0ZSYggio-T" width="20px"></a>';
          infowindowcontent += ' '+item.rating + ' <img src="' + item.rating_img_url_small + '"></div></div>';

          yoh.createYelpMarker(i, item.location.coordinate.latitude, item.location.coordinate.longitude, item.name, infowindowcontent);
        });
        var test = data.businesses[0];
        var content = '<div class="row"><div class="col-md-4"><img src="' + test.image_url + '"></div>';
        content += '<div class="col-md-8">' + test.location.display_address + '<br>';
        content += test.display_phone + '</div></div>';
        $("#test").html(content);

      }
    });
  }

  // function that gets run when the document loads
  yoh.initialize = function() {
    var latlng = new google.maps.LatLng(33.640728, -84.427700);
    var myOptions = {
      zoom: 12,
      center : latlng,
      mapTypeId : google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    var myMarker = new google.maps.Marker({
      position: latlng,
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 5
      },
      draggable: true,
      map: map
    });

    yoh.getYelp('hotels', map.getCenter().lat()+','+map.getCenter().lng());
  }
