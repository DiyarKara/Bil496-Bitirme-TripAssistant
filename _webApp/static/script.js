let map;
let markerArray = [];
let directionsService;
let directionsRenderer;
let stepDisplay;

async function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    stepDisplay = new google.maps.InfoWindow();

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: 40.771, lng: -73.974 },
    });

    directionsRenderer.setMap(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userPosition = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setCenter(userPosition);
            
            // Add user's location as an option and set it as the selected value
            const startSelect = document.getElementById("start");
            startSelect.options[0] = new Option("Current Location", `${userPosition.lat}, ${userPosition.lng}`, true, true);

            calculateAndDisplayRoute();
        }, () => {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }

    const onChangeHandler = function () {
        calculateAndDisplayRoute();
    };

    document.getElementById("start").addEventListener("change", onChangeHandler);
    document.getElementById("end").addEventListener("change", onChangeHandler);
}

function calculateAndDisplayRoute() {
    // Clear out the old markers.
    markerArray.forEach(marker => marker.setMap(null));
    markerArray = [];

    directionsService.route({
        origin: document.getElementById("start").value,
        destination: document.getElementById("end").value,
        travelMode: google.maps.TravelMode.WALKING,
    }).then((result) => {
        // Display the route on the map.
        directionsRenderer.setDirections(result);
    }).catch((e) => {
        window.alert("Directions request failed due to " + e);
    });
}

function handleLocationError(browserHasGeolocation, pos) {
    console.error(browserHasGeolocation ?
        "Error: The Geolocation service failed." :
        "Error: Your browser doesn't support geolocation.");
}

window.initMap = initMap;