'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: { lat: number; lng: number };
  zoom: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
  }>;
}

export default function Map({ center, zoom, markers = [] }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!mapRef.current && mapContainerRef.current) {
      // Inicializa o mapa
      mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);

      // Adiciona o layer do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // Cria um ícone personalizado
    const customIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/4812/4812047.png',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    // Limpa marcadores existentes e adiciona os novos
    if (mapRef.current) {
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          layer.remove();
        }
      });

      markers.forEach(marker => {
        L.marker([marker.position.lat, marker.position.lng], { icon: customIcon })
          .bindPopup(marker.title)
          .addTo(mapRef.current!);
      });
    }

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom, markers]);

  return <div ref={mapContainerRef} className="w-full h-full relative z-[1]" />;
} 