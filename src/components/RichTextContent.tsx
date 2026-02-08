"use client";

import { useEffect, useState } from "react";
import { sanitizeCmsContent } from "@/lib/security";

interface RichTextContentProps {
    html: string;
}

export default function RichTextContent({ html }: RichTextContentProps) {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [lightboxAlt, setLightboxAlt] = useState<string>("");

    // Sanitize content before rendering
    const sanitizedHtml = sanitizeCmsContent(html);

    // Add click handlers to images after mount
    useEffect(() => {
        const handleImageClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === "IMG") {
                const img = target as HTMLImageElement;
                setLightboxSrc(img.src);
                setLightboxAlt(img.alt || "Image");
            }
        };

        const container = document.getElementById("rich-text-content");
        container?.addEventListener("click", handleImageClick);

        return () => {
            container?.removeEventListener("click", handleImageClick);
        };
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightboxSrc(null);
        };
        if (lightboxSrc) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [lightboxSrc]);

    return (
        <>
            <div
                id="rich-text-content"
                className="mb-6 [&_img]:cursor-zoom-in [&_img]:hover:opacity-90 [&_img]:transition-opacity"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            {/* Lightbox Modal */}
            {lightboxSrc && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setLightboxSrc(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image lightbox"
                >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl font-light hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded"
                        onClick={() => setLightboxSrc(null)}
                        aria-label="Close lightbox"
                    >
                        ×
                    </button>
                    <img
                        src={lightboxSrc}
                        alt={lightboxAlt}
                        className="max-w-full max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </>
    );
}
