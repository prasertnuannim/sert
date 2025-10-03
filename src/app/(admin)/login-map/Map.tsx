"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { LoginEvent } from "@prisma/client";
import Loading from "@/components/form/Loading";
import { FaMapMarkerAlt } from "react-icons/fa";
import { renderToStaticMarkup } from "react-dom/server";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic(() => import("react-leaflet").then(m => m.TileLayer),    { ssr: false });
const Marker       = dynamic(() => import("react-leaflet").then(m => m.Marker),       { ssr: false });
const Popup        = dynamic(() => import("react-leaflet").then(m => m.Popup),        { ssr: false });

export default function LoginMap({ events }: { events: LoginEvent[] }) {
  const [L, setLeaflet] = useState<typeof import("leaflet") | null>(null);
  const [customIcon, setCustomIcon] = useState<L.Icon | null>(null);

  const svgString = renderToStaticMarkup(<FaMapMarkerAlt color="red" size={32} />);
const svgUrl = "data:image/svg+xml;base64," + btoa(svgString);


  useEffect(() => {
    (async () => {
      const leaflet = await import("leaflet");
      setLeaflet(leaflet);

      setCustomIcon(
        new leaflet.Icon({
         iconUrl: svgUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })
      );
    })();
  }, []);

  if (!L || !customIcon) {
    return <Loading/>
  }

  return (
    <MapContainer center={[13.736717, 100.523186]} zoom={3} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {events.filter(e => e.latitude && e.longitude).map(e => (
        <Marker key={e.id} position={[e.latitude!, e.longitude!]} icon={customIcon}>
          <Popup>
            <b>{e.email ?? "Anonymous"}</b> ({e.provider})
            <br />
            {e.city}, {e.country}
            <br />
            {new Date(e.createdAt).toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
