"use client";

import React, { useEffect, useRef } from "react";
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

    useEffect(() => {
        if (ref.current && chart) {
            mermaid
                .run({
                    nodes: [ref.current],
                })
                .catch((e) => console.error("Mermaid error:", e));
        }
    }, [chart]);

    return (
        <div className="mermaid my-4" ref={ref}>
            {chart}
        </div>
    );
};

export default Mermaid;
