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

  const mapRef = useRef();
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

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
  );
};

export default MapPage;
