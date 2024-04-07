import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import './Map.css'; // Make sure to create a CSS file for the map styling

const MapPage = () => {
  const [startLocation, setStartLocation] = useState('');
  const mapRef = useRef(null);
  let map;
  let directionsService;
  let directionsRenderer;
  let stepDisplay;

  useEffect(() => {
    loadMapScript();
  }, []);

  const loadMapScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDoEPxBlh_sN28gkx00Tq5KzPKkZhfM1Vk&callback=initMap`;
    script.async = true;
    script.defer = true;
    window.initMap = initMap; // Make initMap available globally
    document.head.appendChild(script);
  };

  const initMap = () => {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    stepDisplay = new google.maps.InfoWindow();

    map = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 40.771, lng: -73.974 },
    });

    directionsRenderer.setMap(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(userPosition);
        setStartLocation(`${userPosition.lat},${userPosition.lng}`);
      }, () => {
        handleLocationError(true, map.getCenter());
      });
    } else {
      handleLocationError(false, map.getCenter());
    }
  };

  const handleLocationError = (browserHasGeolocation, pos) => {
    console.error(browserHasGeolocation ?
      "Error: The Geolocation service failed." :
      "Error: Your browser doesn't support geolocation.");
  };

  const calculateAndDisplayRoute = () => {
    // Implementation...
  };

  // Add other functions here...

  return (
    <div>
      <div id="logout-button" onClick={() => window.location.href='/logout'}>Logout</div>
      <div id="floating-panel">
        <b>Start: </b>
        <select id="start" value={startLocation} onChange={(e) => setStartLocation(e.target.value)}>
          <option value={startLocation}>Current Location</option>
          {/* Add other start locations here */}
        </select>
        <b>End: </b>
        <input id="end" type="text" placeholder="Enter a destination" />
      </div>
      <div id="map" ref={mapRef} style={{ height: '400px', width: '100%' }}></div>
      <div id="warnings-panel"></div>
      <div id="back-button" onClick={() => window.location.href='/dashboard'}>Back to Dashboard</div>
    </div>
  );
};

export default MapPage;