import { useEffect, useRef, useState } from "react";

export default function Map({ events, selectedEvent, onSelect, favorites = [] }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const placemarksRef = useRef({});
    const [isMapReady, setIsMapReady] = useState(false);
    const isCentering = useRef(false);

    useEffect(() => {
        if (!window.ymaps) return;

        window.ymaps.ready(() => {
            if (!mapInstance.current && mapRef.current) {
                mapInstance.current = new window.ymaps.Map(mapRef.current, {
                    center: [55.75, 37.61],
                    zoom: 10,
                    controls: []
                });
                setIsMapReady(true);
            }
        });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.destroy();
                mapInstance.current = null;
                setIsMapReady(false);
            }
        };
    }, []);

    // Добавление меток
    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return;
        if (!events || !Array.isArray(events)) return;

        mapInstance.current.geoObjects.removeAll();
        placemarksRef.current = {};

        const eventsWithCoords = events.filter(event => {
            return event.coords &&
                Array.isArray(event.coords) &&
                event.coords.length === 2 &&
                typeof event.coords[0] === "number" &&
                typeof event.coords[1] === "number";
        });

        eventsWithCoords.forEach((event) => {
            const isActive = selectedEvent?.id === event.id;
            const isFavorite = favorites && Array.isArray(favorites) && favorites.includes(event.id);

            let iconUrl;
            if (isFavorite) {
                iconUrl = isActive ? "/icons/pin-favorite-active.png" : "/icons/pin-favorite.png";
            } else {
                iconUrl = isActive ? "/icons/pin-active.png" : "/icons/pin.png";
            }

            const placemark = new window.ymaps.Placemark(
                event.coords,
                {
                    hintContent: event.title || "Событие",
                },
                {
                    iconLayout: "default#imageWithContent",
                    iconImageHref: iconUrl,
                    iconImageSize: [40, 40],
                    iconImageOffset: [-20, -40],
                }
            );

            placemark.events.add("click", () => {
                onSelect?.(event);
            });

            mapInstance.current.geoObjects.add(placemark);
            placemarksRef.current[event.id] = placemark;
        });

        if (eventsWithCoords.length > 0 && !selectedEvent && !isCentering.current) {
            try {
                const bounds = mapInstance.current.geoObjects.getBounds();
                if (bounds) {
                    mapInstance.current.setBounds(bounds, {
                        checkZoomRange: true,
                        zoomMargin: 50
                    });
                }
            } catch (error) {
                console.error("Error setting bounds:", error);
            }
        }
    }, [events, isMapReady, favorites, onSelect, selectedEvent]);

    useEffect(() => {
        if (!isMapReady || !mapInstance.current) return;
        if (!events || !Array.isArray(events)) return;

        events.forEach((event) => {
            if (!event || !event.id) return;

            const placemark = placemarksRef.current[event.id];
            if (placemark) {
                const isActive = selectedEvent?.id === event.id;
                const isFavorite = favorites && Array.isArray(favorites) && favorites.includes(event.id);

                let iconUrl;
                if (isFavorite) {
                    iconUrl = isActive ? "/icons/pin-favorite-active.png" : "/icons/pin-favorite.png";
                } else {
                    iconUrl = isActive ? "/icons/pin-active.png" : "/icons/pin.png";
                }

                placemark.options.set({ iconImageHref: iconUrl });
            }
        });
    }, [selectedEvent, events, isMapReady, favorites]);

    useEffect(() => {
        if (selectedEvent &&
            mapInstance.current &&
            isMapReady &&
            selectedEvent.coords &&
            Array.isArray(selectedEvent.coords) &&
            selectedEvent.coords.length === 2 &&
            !isCentering.current) {

            isCentering.current = true;

            mapInstance.current.setCenter(selectedEvent.coords, 12, {
                duration: 300,
                checkZoomRange: true
            });

            setTimeout(() => {
                isCentering.current = false;
            }, 350);
        }
    }, [selectedEvent, isMapReady]);

    return (
        <div
            ref={mapRef}
            style={{
                width: "100%",
                height: "550px",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                background: "#f0f0f0"
            }}
        />
    );
}