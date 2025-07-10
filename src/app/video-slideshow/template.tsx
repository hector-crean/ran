"use client";

import { AnimatePresence } from "motion/react";

export default function VideoSlideshowTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>;
}
