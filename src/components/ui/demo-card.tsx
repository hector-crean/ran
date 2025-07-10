"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

type Preview =
  | { type: "image"; src: string }
  | { type: "video"; src: string; poster: string };

interface DemoCardProps {
  title: string;
  description: string;
  href: string;
  category: string;
  preview: Preview;
}

function PreviewMedia({ preview, alt }: { preview: Preview; alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (preview.type === "image") {
    return (
      <div className="bg-muted relative h-32 overflow-hidden rounded-t-xl">
        <img
          src={preview.src}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
        {!isLoaded && !hasError && (
          <div className="bg-muted absolute inset-0 flex items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        )}
        {hasError && (
          <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center">
            <span className="text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    );
  }

  if (preview.type === "video") {
    return (
      <div className="bg-muted group relative h-32 overflow-hidden rounded-t-xl">
        <video
          className="h-full w-full object-cover"
          poster={preview.poster}
          muted
          loop
          playsInline
          controls={false}
          onMouseEnter={e => {
            e.currentTarget.play();
          }}
          onMouseLeave={e => {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }}
        >
          <source src={preview.src} type="video/mp4" />
        </video>

        {/* Play indicator */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="rounded-full bg-white/90 p-2">
            <svg
              className="h-4 w-4 text-black"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function DemoCard({ title, description, href, preview }: DemoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="h-full"
    >
      <Link href={href} className="block h-full">
        <Card className="h-full cursor-pointer transition-shadow duration-200 hover:shadow-md">
          <PreviewMedia preview={preview} alt={title} />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <CardDescription className="text-sm">{description}</CardDescription>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export type { DemoCardProps, Preview };
