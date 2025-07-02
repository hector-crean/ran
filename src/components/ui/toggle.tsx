"use client"

import { motion } from "framer-motion"

interface ToggleProps {
    isOn: boolean
    onClick: () => void
}

const Toggle = ({ isOn, onClick }: ToggleProps) => {
    return (
        <div className="flex flex-row items-center gap-2 w-fit uppercase text-xs font-semibold text-white">
            <span>On</span>
            <button
                className={`box-content h-5 aspect-[2/1] bg-transparent rounded-full cursor-pointer flex p-0.5 transition-colors ${isOn
                    ? 'justify-end bg-white'
                    : 'justify-start bg-slate-800'
                    }`}
                data-on={isOn}
                onClick={onClick}
            >
                <motion.div
                    className={`w-1/2 aspect-square rounded-full ${isOn
                        ? 'bg-slate-800'
                        : 'bg-white'
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
    )
}

export { Toggle }

