import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '10px'
};

const initialCenter = {
  lat: 37.335,
  lng: -121.881
};

function MapComponent({ atmLocations }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: ''
  });

  const [map, setMap] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  // Center and zoom states
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    // Check if atmLocations are populated
    if (atmLocations.length > 0) {
      // Calculate bounds based on atmLocations
      const bounds = new window.google.maps.LatLngBounds();
      atmLocations.forEach((atm) => {
        bounds.extend(new window.google.maps.LatLng(atm.geometry.location.lat, atm.geometry.location.lng));
      });

      // Adjust the center and zoom based on the bounds
      setCenter(bounds.getCenter().toJSON());
      setZoom(12);
    } else {
      // No ATM locations, set to the initial center and zoom
      setCenter(initialCenter);
      setZoom(10);
    }
  }, [atmLocations]);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const placeAtmMarkers = (atms) => {
    return atms.map((atm, index) => (
      <Marker
        title="Chase Bank ATM"
        key={index}
        position={{ lat: atm.geometry.location.lat, lng: atm.geometry.location.lng }}
        onClick={() => setActiveMarker(index)}
      >
        {activeMarker === index && (
          <InfoWindow onCloseClick={() => setActiveMarker(null)}>
            <div>
              <h5>ATM Details<i className="bi bi-coin ms-1"></i></h5>
              <p><strong>Name:</strong> {atm.name}</p>
              <p><strong>Address:</strong> {atm.address}</p>
            </div>
          </InfoWindow>
        )}
      </Marker>
    ));
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {atmLocations.length > 0 ? placeAtmMarkers(atmLocations) : null}
    </GoogleMap>
  ) : <></>;
}

export default React.memo(MapComponent);
