"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  isOn: boolean;
  onClick: () => void;
}

const Toggle = ({ isOn, onClick }: ToggleProps) => {
  return (
    <div className="flex w-fit flex-row items-center gap-2 text-xs font-semibold text-white uppercase">
      <span>On</span>
      <button
        className={`box-content flex aspect-[2/1] h-5 cursor-pointer rounded-full bg-transparent p-0.5 transition-colors ${
          isOn ? "justify-end bg-white" : "justify-start bg-slate-800"
        }`}
        data-on={isOn}
        onClick={onClick}
      >
        <motion.div
          className={`aspect-square w-1/2 rounded-full ${
            isOn ? "bg-slate-800" : "bg-white"
          }`}
          data-on={isOn}
          layout
          transition={{
            type: "spring",
            visualDuration: 0.2,
            bounce: 0.2,
          }}
        />
      </button>
      <span>Off</span>
    </div>
  );
};

export { Toggle };
