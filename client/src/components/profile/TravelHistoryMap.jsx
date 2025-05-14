import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/TravelHistoryMap.css';

// You should get your own mapbox token
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';

const TravelHistoryMap = ({ trips }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!trips || trips.length === 0) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [0, 20],
      zoom: 1.5
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add map load event handler
    map.current.on('load', () => {
      // Create a GeoJSON feature collection for trip destinations
      const destinations = {
        type: 'FeatureCollection',
        features: trips.map(trip => ({
          type: 'Feature',
          properties: {
            title: trip.title,
            city: trip.destination.city,
            country: trip.destination.country,
            startDate: new Date(trip.startDate).toLocaleDateString(),
            endDate: new Date(trip.endDate).toLocaleDateString(),
            id: trip._id
          },
          geometry: {
            type: 'Point',
            // Note: In a real app, you'd need to geocode these city names
            // or store actual coordinates in your trip records
            coordinates: trip.destination.coordinates || [0, 0]
          }
        }))
      };

      // Add the destinations as a source
      map.current.addSource('destinations', {
        type: 'geojson',
        data: destinations
      });

      // Add a layer for destination points
      map.current.addLayer({
        id: 'destination-points',
        type: 'circle',
        source: 'destinations',
        paint: {
          'circle-radius': 8,
          'circle-color': '#FF5A5F',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Add popup functionality
      map.current.on('click', 'destination-points', (e) => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { title, city, country, startDate, endDate, id } = e.features[0].properties;

        const popupContent = `
          <div class="map-popup">
            <h3>${title}</h3>
            <p>${city}, ${country}</p>
            <p>${startDate} - ${endDate}</p>
            <a href="/trips/${id}" class="popup-link">View Trip</a>
          </div>
        `;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popupContent)
          .addTo(map.current);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'destination-points', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'destination-points', () => {
        map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      if (map.current) map.current.remove();
    };
  }, [trips]);

  return (
    <div className="travel-history-map-container">
      <div ref={mapContainer} className="travel-map" />
    </div>
  );
};

export default TravelHistoryMap;