var success = function(position) {

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
    zoom: 15,
    enableHighAccuracy: true,
    center: latlng,
    mapTypeControl: false,
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);

  var marker = new google.maps.Marker({
      position: latlng,
      map: map,
      title: accuracy ? "You are here!(at least within a " + accuracy + " meter radius)" : "You are close to here!"
  });

  document.querySelector('#zinger').innerText = "By the way, it didn't take much time to find you!";
}

var error = function(msg) {
  console.log('Failed to retrieve position using geolocation! Falling back...');
  // If geolocation is not enabled, fall back to freegeoip
  $.ajax({
    url: 'http://freegeoip.net/json/',
    type: 'POST',
    dataType: 'jsonp',
    success: function(location) {
      var postion = '{ "coords": { ' +
      '"latitude": ' + location.latitude + ', ' +
      '"longitude": ' + location.longitude + ', ' +
      '"accuracy": ""}}';
      success(postion);
    }
  });
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  console.log('No geolocation');
}
