"use client";

import React, { useMemo } from "react";
import plantumlEncoder from "plantuml-encoder";

interface PlantUMLProps {
    puml: string;
}

const PlantUML: React.FC<PlantUMLProps> = ({ puml }) => {
    const src = useMemo(() => {
        try {
            if (!puml) return "";
            const encoded = plantumlEncoder.encode(puml);
            // Use SVG for better quality
            return `https://www.plantuml.com/plantuml/svg/${encoded}`;
        } catch (e) {
            console.error("PlantUML encoding error:", e);
            return "";
        }
    }, [puml]);

    if (!src) return null;

    return (
        <figure className="my-6 flex justify-center">
            <img
                src={src}
                alt="PlantUML Diagram"
                className="max-w-full h-auto rounded-lg shadow-sm bg-white p-4 border border-gray-100 dark:border-neutral-800"
                loading="lazy"
            />
        </figure>
    );
};

export default PlantUML;
