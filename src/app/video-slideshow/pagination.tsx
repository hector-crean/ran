"use client";

import { LayoutGroup, motion } from "motion/react";

export function Pagination({
  id,
  currentPage,
  setPage,
  pages,
}: {
  id: string;
  currentPage: number;
  setPage: (page: number) => void;
  pages: number[];
}) {
  return (
    <LayoutGroup id={id}>
      <div className="absolute bottom-4 left-1/2 z-5 flex -translate-x-1/2 transform gap-2">
        {pages.map(page => (
          <Dot
            key={page}
            onClick={() => setPage(page)}
            isSelected={page === currentPage}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}

function Dot({
  isSelected,
  onClick,
}: {
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="relative h-3 w-3 cursor-pointer overflow-hidden rounded-full bg-gray-500"
      onClick={onClick}
    >
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white"
          layoutId="highlight"
        />
      )}
    </div>
  );
}
