var generateMap = function(position) {
  if (typeof position === "string") { position = JSON.parse(position) };

  var latitude = position.coords.latitude,
      longitude = position.coords.longitude,
      accuracy = position.coords.accuracy;

  var mapcanvas = document.createElement('div');
  mapcanvas.id = 'mapcanvas';
  mapcanvas.style.height = '400px';
  mapcanvas.style.width = '560px';

  document.querySelector('#container').appendChild(mapcanvas);

  var latlng = new google.maps.LatLng(latitude, longitude);
  var myOptions = {
    zoom: 17,
    center: latlng,
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapId: "7efa9a40d5adc7fb",
  };
  var geoOptions = {
    maximumAge: 5 * 60 * 1000,
    timeout: 10 * 1000
  };
  var map =
    new google.maps.Map(
      document.getElementById("mapcanvas"),
      myOptions,
      geoOptions
    );

  var marker = new google.maps.marker.AdvancedMarkerElement({
    position: latlng,
    map: map,
    title: accuracy ? "You are here!(at least within a " + accuracy + " meter radius)" : "You are close to here!"
  });

  document.querySelector('#zinger').innerText =
    accuracy ?
      "By the way, I have barely started looking and I already found you!" :
      "Haha! Did you really think I can't find your location because you blocked it?";
}

var errorHandler = function(geoLocationError) {
  console.log(`Failed to retrieve position using geolocation! [Error: ${geoLocationError.message}]`);
  console.log('Falling back to ip based lookup ...');
  // If geolocation is not enabled, fall back to ip address
  $.ajax({
    url: 'https://ipapi.co/json/',
    type: 'GET',
    dataType: 'json',
    success: function(location) {
      console.log(location);
      var position = {
        coords: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: null
        }
      };
      console.log('Fall back succeeded!');
      generateMap(JSON.stringify(position));
    },
    error: function(xhr, status, error) {
      console.error('Geolocation fallback failed:', error);
      // Provide a fallback experience
      var defaultPosition = {
        coords: {
          // Defaulting to San Francisco
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: null
        }
      };
      console.log('Using default location');
      generateMap(JSON.stringify(defaultPosition));
    },
    timeout: 5000 // Add timeout to prevent long waiting times
  });
}

var initMap = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(generateMap, errorHandler);
  } else {
    console.log('Geolocation is not supported by client!');
  }
}
