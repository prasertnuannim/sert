"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// แก้ icon path ให้ทำงานใน Next
import iconUrl from "leaflet/dist/images/marker-icon.png"
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl })

type Props = {
  lat: number
  lon: number
  label?: string
  zoom?: number
  height?: number
}

export default function MapMini({ lat, lon, label, zoom = 13, height = 180 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const map = L.map(ref.current, {
      attributionControl: true,
      zoomControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([lat, lon], zoom)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.marker([lat, lon]).addTo(map).bindPopup(label || "Session")

    return () => {
      map.remove()
    }
  }, [lat, lon, label, zoom])

  return <div ref={ref} style={{ height, width: "100%", borderRadius: 12, overflow: "hidden" }} />
}
