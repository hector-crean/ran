"use client";
import { DemoCard, type DemoCardProps } from "@/components/ui/demo-card";
import { motion } from "motion/react";

const demos: DemoCardProps[] = [
  // Video & Media
  {
    title: "NOV276",
    description: "Interactive video presentation",
    href: "/video-slideshow/scene_1_1",
    category: "Video & Media",
    preview: {
      type: "video",
      src: "/assets/optimised/Scene_4.1.1.mp4",
      poster: "/assets/optimised/Scene_4.1.1_poster.webp",
    },
  },
  {
    title: "X",
    description: "Interactive sequence",
    href: "/sequence/x",
    category: "Sequence",
    preview: {
      type: "image",
      src: "/assets/optimised/Scene_2.2.1_00001.webp",
    },
  },
  {
    title: "XY",
    description: "Interactive sequence",
    href: "/sequence/xy",
    category: "Sequence",
    preview: {
      type: "image",
      src: "/assets/optimised/Scene_5.3_00001.webp",
    },
  },
];

const categories = [...new Set(demos.map(demo => demo.category))];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <div className="bg-muted/30 border-b">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-foreground mb-4 text-4xl font-bold md:text-6xl">
              Interactive Slideshows
            </h1>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              A collection of interactive slideshows with accompanying
              components
            </p>
          </motion.div>
        </div>
      </div>

      {/* Demo Grid */}
      <div className="mx-auto max-w-6xl px-6 py-12">
        {categories.map(category => (
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
              className="text-foreground mb-6 text-2xl font-semibold"
            >
              {category}
            </motion.h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {demos
                .filter(demo => demo.category === category)
                .map(demo => (
                  <motion.div key={demo.href} variants={cardVariants}>
                    <DemoCard {...demo} />
                  </motion.div>
                ))}
            </div>
          </motion.section>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 mt-16 border-t">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="text-muted-foreground text-center">
            <p className="mb-4 text-sm">
              Built with Next.js, Framer Motion, and Tailwind CSS
            </p>
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
