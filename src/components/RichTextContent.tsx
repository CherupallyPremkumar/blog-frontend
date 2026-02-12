"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Mermaid from "./Mermaid";
import PlantUML from "./PlantUML";

interface RichTextContentProps {
    content: string;
}

export default function RichTextContent({ content }: RichTextContentProps) {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [lightboxAlt, setLightboxAlt] = useState<string>("");

    if (!content) return null;

    // Helper functions for image processing
    const fixImageUrl = (url: string) => {
        if (!url) return "";
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "";
        if (url.includes("localhost:1337")) {
            return url.replace(/http:\/\/localhost:1337/g, strapiUrl);
        }
        if (url.startsWith("http://") || url.startsWith("https://")) return url;
        if (url.startsWith("/")) return `${strapiUrl}${url}`;
        return `${strapiUrl}/uploads/${url}`;
    };

    const cleanAltText = (text: string) => {
        if (!text) return "";
        return text
            .replace(/\.(png|jpg|jpeg|gif|webp)$/i, "")
            .replace(/[-_]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };

    return (
        <>
            <div className="prose prose-lg max-w-none prose-img:rounded-lg prose-img:shadow-md prose-a:text-blue-600 hover:prose-a:text-blue-800 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300">
                <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Heading renderers with IDs for ToC
                        h2: ({ children }) => {
                            const text = String(children);
                            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                            return <h2 id={id} className="scroll-mt-24">{children}</h2>;
                        },
                        h3: ({ children }) => {
                            const text = String(children);
                            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                            return <h3 id={id} className="scroll-mt-24">{children}</h3>;
                        },
                        // Prevent p tags from wrapping figure elements (causes hydration errors)
                        p: ({ children, ...props }) => {
                            return <div className="text-gray-900 dark:text-slate-200 leading-relaxed mb-4" {...props}>{children}</div>;
                        },
                        code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const language = match ? match[1] : "";
                            const code = String(children).replace(/\n$/, "");

                            if (language === "mermaid") {
                                return <Mermaid chart={code} />;
                            }

                            if (language === "plantuml" || language === "puml") {
                                return <PlantUML puml={code} />;
                            }

                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        img({ src, alt, ...props }) {
                            const fixedSrc = fixImageUrl(String(src || ""));
                            const cleanedAlt = cleanAltText(String(alt || ""));

                            return (
                                <figure className="my-6 relative hover:z-10 group">
                                    <img
                                        src={fixedSrc}
                                        alt={cleanedAlt}
                                        className="w-full rounded-lg transition-transform duration-300 hover:scale-150 cursor-zoom-in shadow-sm hover:shadow-xl group-hover:scale-150 group-hover:z-50"
                                        loading="lazy"
                                        onClick={() => {
                                            if (fixedSrc) {
                                                setLightboxSrc(fixedSrc);
                                                setLightboxAlt(cleanedAlt);
                                            }
                                        }}
                                        {...props}
                                    />
                                    {cleanedAlt && (
                                        <figcaption className="mt-4 text-center text-sm text-gray-500 italic">
                                            {cleanedAlt}
                                        </figcaption>
                                    )}
                                </figure>
                            );
                        },

                        li({ children }) {
                            return <li className="my-1 text-gray-900 dark:text-slate-200 leading-snug">{children}</li>;
                        },
                        ul({ children }) {
                            return <ul className="list-disc pl-6 my-2 text-gray-900 dark:text-slate-200 last:mb-0">{children}</ul>;
                        },
                        a({ href, children, ...props }) {
                            // Fix localhost URLs in links
                            let fixedHref = href;
                            if (href && href.includes("localhost:3000")) {
                                const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
                                fixedHref = href.replace(/http:\/\/localhost:3000/g, siteUrl);
                            }
                            return (
                                <a href={fixedHref} className="text-blue-600 underline hover:text-blue-800" {...props}>
                                    {children}
                                </a>
                            );
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>

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
