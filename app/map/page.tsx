"use client";

import React, { useState } from "react";
import IndonesiaMap from "../components/IndonesiaMap";
import MapLoadErrorPopup from "../components/MapLoadErrorPopup";

export default function MapPage() {
    const [error, setError] = useState<string | null>(null);

    return (
        <div>
        {error && (
            <MapLoadErrorPopup
            message={error}
            onClose={() => {
                setError(null);
            }}
            />
        )}
        <IndonesiaMap onError={(err) => {
            setError(err);
        }} />
        </div>
    );
}