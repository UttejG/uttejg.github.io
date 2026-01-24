const generateMap = (position) => {

  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const accuracy = position.coords.accuracy;

  const mapcanvas = document.createElement('div');
  mapcanvas.id = 'mapcanvas';
  mapcanvas.style.height = '400px';
  mapcanvas.style.width = '560px';

  document.querySelector('#container').appendChild(mapcanvas);

  const latlng = new google.maps.LatLng(latitude, longitude);
  const myOptions = {
    zoom: 1,
    center: latlng,
    mapTypeControl: false,
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    mapId: "7efa9a40d5adc7fb",
  };
  const geoOptions = {
    maximumAge: 5 * 60 * 1000,
    timeout: 10 * 1000
  };
  const map =
    new google.maps.Map(
      document.getElementById("mapcanvas"),
      myOptions,
      geoOptions
    );

  // Create the marker but initially hide it
  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: latlng,
    map: null, // Don't show marker initially
    title: accuracy ? `You're here! (Well, within a ${accuracy} meter radius at least)` : "You're around here somewhere"
  });

  // Animate the zoom
  setTimeout(() => {
    const zoomAnimation = setInterval(() => {
      const currentZoom = map.getZoom();

      // Increase zoom
      if (currentZoom < 17) {
        map.setZoom(currentZoom + 1);
      } else {
        clearInterval(zoomAnimation);
        // Show marker after animation completes
        marker.map = map;

        document.querySelector('#zinger').innerText =
          accuracy ?
            "By the way, I just started looking, and I’ve already found you!" :
            "Haha! Did you really think I couldn’t find your location just because you blocked it?";
      }
    }, 250); // Adjust timing for different zooming effects
  }, 1000); // Initial delay before animation starts

  // setting this div to zero width space so that it doesn't affect the layout
  document.querySelector('#zinger').innerText = "\u200B";
}

const errorHandler = (geoLocationError) => {
  console.log(`Failed to retrieve position using geolocation! [Error: ${geoLocationError.message}]`);

  console.log('Falling back to ip based lookup ...');
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => { controller.abort(); }, 5000);
  
  fetch('https://ipapi.co/json/', {
    signal: controller.signal
  })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((location) => {
      console.log(`Narrowed down the location to ${location.city},${location.region} ${location.country_code}`);
      const position = {
        coords: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: null
        }
      };
      console.log('Fall back succeeded!');
      generateMap(position);
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      console.error(`Geolocation fallback failed: [Error: ${error.message}]`);
      // If everything fails, use San Francisco as default
      const defaultPosition = {
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: null
        }
      };
      console.log('Using San Francisco as default location!');
      generateMap(defaultPosition);
    });
}

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(generateMap, errorHandler);
  } else {
    console.error('Geolocation is not supported by client!');
  }
}
