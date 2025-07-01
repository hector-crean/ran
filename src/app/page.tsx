"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DemoCard {
  title: string;
  description: string;
  href: string;
  category: string;
  preview?: string;
}

const demos: DemoCard[] = [
  // Video & Media
  {
    title: "Video Slideshow",
    description: "Interactive video presentation with smooth crossfade transitions",
    href: "/video-slideshow/scene_1_1",
    category: "Video & Media",
    preview: "/assets/Scene_1.1_poster.png",
  },
  {
    title: "Interactive Video",
    description: "Flow-based video editing with node compositor",
    href: "/interactive-video",
    category: "Video & Media",
  },
  {
    title: "Image Comparison",
    description: "Before/after image comparison tool",
    href: "/image-comparison",
    category: "Video & Media",
  },
  {
    title: "Comparison Slide",
    description: "Side-by-side content comparison interface",
    href: "/comparison-slide",
    category: "Video & Media",
  },

  // Animation & Motion
  {
    title: "Sequence Slider",
    description: "Frame-by-frame image sequence scrubbing",
    href: "/sequence-slider",
    category: "Animation & Motion",
    preview: "/assets/Scene_2.2.1_00001.png",
  },
  {
    title: "Drag & Drop",
    description: "Advanced drag and drop interactions",
    href: "/drag",
    category: "Animation & Motion",
  },
  {
    title: "Drag Handle",
    description: "Custom drag handles and constraints",
    href: "/drag-handle",
    category: "Animation & Motion",
  },
  {
    title: "Focus Demo",
    description: "Interactive focus and attention management",
    href: "/focus-demo",
    category: "Animation & Motion",
  },

  // Data Visualization
  {
    title: "World Map",
    description: "Interactive world map with geographic data",
    href: "/world-map",
    category: "Data Visualization",
  },
  {
    title: "World Countries",
    description: "Country-based world visualization",
    href: "/world",
    category: "Data Visualization",
  },
  {
    title: "Infinite Canvas",
    description: "Zoomable and pannable infinite canvas",
    href: "/infinite-canvas",
    category: "Data Visualization",
  },

  // UI Components
  {
    title: "Tabs Interface",
    description: "Animated tab navigation component",
    href: "/tabs",
    category: "UI Components",
  },
  {
    title: "Overlay System",
    description: "Modal and overlay management",
    href: "/overlay",
    category: "UI Components",
  },
  {
    title: "Responsive Design",
    description: "Responsive layout demonstrations",
    href: "/responsive",
    category: "UI Components",
  },

  // Graphics & Effects
  {
    title: "SVG Glow Effects",
    description: "Advanced SVG filter effects and animations",
    href: "/svg/glow-filter",
    category: "Graphics & Effects",
  },
];

const categories = [...new Set(demos.map(demo => demo.category))];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Interactive Demos
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of interactive components, animations, and visualizations 
              built with React, Framer Motion, and modern web technologies.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Demo Grid */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {categories.map((category) => (
          <motion.section
            key={category}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="mb-12"
          >
            <motion.h2 
              variants={cardVariants}
              className="text-2xl font-semibold text-foreground mb-6"
            >
              {category}
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {demos
                .filter(demo => demo.category === category)
                .map((demo) => (
                  <motion.div
                    key={demo.href}
                    variants={cardVariants}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={demo.href} className="block h-full">
                      <Card className="h-full hover:shadow-md transition-shadow duration-200 cursor-pointer">
                        {demo.preview && (
                          <div className="relative h-32 overflow-hidden rounded-t-xl">
                            <Image
                              src={demo.preview}
                              alt={demo.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <CardHeader className={demo.preview ? "pb-2" : ""}>
                          <CardTitle className="text-lg">{demo.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <CardDescription className="text-sm">
                            {demo.description}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-4 text-sm">Built with Next.js, Framer Motion, and Tailwind CSS</p>
            <div className="flex justify-center gap-6 text-sm">
              <a 
                href="https://nextjs.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Next.js
              </a>
              <a 
                href="https://motion.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Framer Motion
              </a>
              <a 
                href="https://tailwindcss.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Tailwind CSS
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
