let map;

async function initMap() {
  // gets user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      const userPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      loadMap(userPosition);
    }, function() {
      // If fails use default position
      loadMap({ lat: -25.344, lng: 131.031 });
    });
  } else {
    // If geolocation is not supported use default position
    loadMap({ lat: -25.344, lng: 131.031 });
  }
}

async function loadMap(position) {
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at the given position
  map = new Map(document.getElementById("map"), {
    zoom: 4,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at the given location
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Current Location",
  });
}

initMap();