"use client";

import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    securityLevel: "loose",
});

interface MermaidProps {
    chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (ref.current && chart?.trim()) {
            setError(false);
            mermaid
                .run({
                    nodes: [ref.current],
                })
                .catch(() => {
                    setError(true);
                });
        }
    }, [chart]);

    if (!chart?.trim()) return null;

    if (error) {
        return (
            <pre className="my-4 p-4 bg-gray-100 rounded text-sm text-gray-600 overflow-x-auto">
                {chart}
            </pre>
        );
    }

    return (
        <div className="mermaid my-4" ref={ref}>
            {chart}
        </div>
    );
};

export default Mermaid;
