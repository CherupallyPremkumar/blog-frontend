"use client";

import { useState, useEffect, useCallback } from "react";

interface ImageLightboxProps {
    src: string;
    alt: string;
    caption?: string;
}

export default function ImageLightbox({ src, alt, caption }: ImageLightboxProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = useCallback(() => {
        setIsOpen(false);
    }, []);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";

            // Focus trap - focus the close button when modal opens
            const closeButton = document.getElementById("lightbox-close-btn");
            closeButton?.focus();
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, handleClose]);

    return (
        <>
            {/* Thumbnail */}
            <figure className="my-6">
                <button
                    type="button"
                    onClick={handleOpen}
                    className="w-full border-0 bg-transparent p-0 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    aria-label={`View full size image: ${alt}`}
                >
                    <img
                        src={src}
                        alt={alt}
                        className="w-full hover:opacity-90 transition-opacity"
                        loading="lazy"
                    />
                </button>
                {caption && (
                    <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
                        {caption}
                    </figcaption>
                )}
            </figure>

            {/* Lightbox Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={handleClose}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Image lightbox"
                >
                    <button
                        id="lightbox-close-btn"
                        className="absolute top-4 right-4 text-white text-3xl font-light hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black rounded p-1"
                        onClick={handleClose}
                        aria-label="Close lightbox"
                    >
                        ×
                    </button>
                    <img
                        src={src}
                        alt={alt}
                        className="max-w-full max-h-[90vh] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {caption && (
                        <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                            {caption}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
