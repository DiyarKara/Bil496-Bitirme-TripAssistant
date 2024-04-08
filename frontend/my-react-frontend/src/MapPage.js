import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100vw',
  height: '100vh',
};
const defaultCenter = {
  lat: 40.771,
  lng: -73.974,
};

const libraries = ['places'];

const MapPage = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDoEPxBlh_sN28gkx00Tq5KzPKkZhfM1Vk', // Replace with your actual Google Maps API key
    libraries,
  });

  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directionsResult, setDirectionsResult] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');

  const mapRef = useRef();
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);
  const handleDestinationChange = (e) => {
    setDestinationAddress(e.target.value);
  };
  const handleFindRoute = () => {
    if (!destinationAddress) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ 'address': destinationAddress }, (results, status) => {
      if (status === 'OK') {
        const destinationCoords = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        setDestination(destinationCoords);
        calculateAndDisplayRoute(userLocation, destinationCoords);
      } else {
        console.error('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  useEffect(() => {
    if (map) {
      // Center map on user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(pos);
          map.setCenter(pos);
        }, () => {
          console.error("The Geolocation service failed.");
        });
      } else {
        console.error("Your browser doesn't support geolocation.");
      }
    }
  }, [map]);

  const onMapClick = useCallback((event) => {
    const destination = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    setDestination(destination);
    calculateAndDisplayRoute(userLocation, destination);
  }, [userLocation]);

  const calculateAndDisplayRoute = useCallback((start, destination) => {
    if (!start || !destination) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
      origin: start,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        setDirectionsResult(result);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps</div>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={defaultCenter}
        onLoad={onLoad}
        onClick={onMapClick}
      >
        {userLocation && <Marker position={userLocation} />}
        {destination && <Marker position={destination} />}
        {directionsResult && <DirectionsRenderer directions={directionsResult} />}
      </GoogleMap>
      <div id="floating-panel">
        <b>Destination:</b>
        <input 
          type="text" 
          placeholder="Enter a destination" 
          value={destinationAddress} 
          onChange={handleDestinationChange}
        />
        <button onClick={handleFindRoute}>Find Route</button>
      </div>
    </div>
  );
};

export default MapPage;
