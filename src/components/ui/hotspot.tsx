import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "motion/react";
import { useState } from "react";

interface HotspotProps {
    color?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const Hotspot = ({ children, color = "#3b82f6", size = 'md' }: HotspotProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    // Animation variants
    const glowVariants = {
        idle: {
            opacity: [0.4, 0.8, 0.4],
            scale: [0.95, 1.05, 0.95],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        hover: {
            opacity: [0.6, 1, 0.6],
            scale: [1.05, 1.2, 1.05],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const innerGlowVariants = {
        idle: {
            opacity: [0.9, 1, 0.9],
            scale: [1, 1.1, 1],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        hover: {
            opacity: 1,
            scale: 1.2,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const shimmerVariants = {
        idle: {
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 180, 360],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        hover: {
            opacity: 0.8,
            rotate: 720,
            transition: {
                duration: 1,
                ease: "easeOut"
            }
        }
    };

    const middleRingVariants = {
        idle: {
            opacity: [0.3, 0.6, 0.3],
            scale: [0.9, 1.1, 0.9],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
            }
        },
        hover: {
            opacity: 0.8,
            scale: 1.3,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    const pulseVariants = {
        idle: {
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.2, 0.6],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeOut"
            }
        },
        hover: {
            scale: [1.2, 1.5, 1.2],
            opacity: [0.8, 0.3, 0.8],
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
            }
        }
    };

    const buttonVariants = {
        idle: { scale: 1 },
        hover: {
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <motion.div
                    variants={buttonVariants}
                    initial="idle"
                    animate={isHovered ? "hover" : "idle"}
                    whileTap="tap"
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                >
                    <Button
                        variant='ghost'
                        className={`relative ${sizeClasses[size]} rounded-full p-0 m-0 bg-transparent hover:bg-transparent`}
                    >
                        {/* Outer pulse effect */}
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-current"
                            style={{
                                borderColor: `${color}40`,
                            }}
                            variants={pulseVariants}
                            animate={isHovered ? "hover" : "idle"}
                        />

                        {/* Outer glow ring */}
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: `radial-gradient(circle, transparent 40%, ${color}20 70%, ${color}10 100%)`,
                                boxShadow: `
                                    0 0 20px ${color}40,
                                    0 0 40px ${color}20,
                                    0 0 60px ${color}10
                                `,
                            }}
                            variants={glowVariants}
                            animate={isHovered ? "hover" : "idle"}
                        />

                        {/* Middle ring */}
                        <motion.div
                            className="absolute inset-2 rounded-full"
                            style={{
                                background: `radial-gradient(circle, transparent 30%, ${color}40 60%, ${color}20 100%)`,
                                boxShadow: `0 0 15px ${color}30`,
                            }}
                            variants={middleRingVariants}
                            animate={isHovered ? "hover" : "idle"}
                        />

                        {/* Inner gradient circle */}
                        <motion.div
                            className="absolute inset-3 rounded-full"
                            style={{
                                background: `radial-gradient(circle at 30% 30%, ${color}ff, ${color}cc 50%, ${color}99 100%)`,
                                boxShadow: `
                                    inset 0 0 10px ${color}40,
                                    0 0 10px ${color}60
                                `,
                            }}
                            variants={innerGlowVariants}
                            animate={isHovered ? "hover" : "idle"}
                        />

                        {/* Center highlight */}
                        <motion.div
                            className="absolute inset-4 rounded-full"
                            style={{
                                background: `radial-gradient(circle at 40% 40%, ${color}40, transparent 60%)`,
                            }}
                            variants={shimmerVariants}
                            animate={isHovered ? "hover" : "idle"}
                        />
                    </Button>
                </motion.div>
            </PopoverTrigger>
            <PopoverContent className="p-0 m-0 bg-transparent w-[50vw] border-0 text-[#1c2c5a] font-bold text-sm">
                <div
                    className="flex items-center justify-center"
                    style={{
                        boxShadow: '0 0 0 2px rgba(206, 209, 222, 1)',
                        padding: '2px',
                        borderRadius: '18px'
                    }}
                >
                    {/* Inner container */}
                    <div
                        className="flex items-center justify-center py-4 px-4"
                        style={{
                            backgroundColor: 'rgba(206, 209, 222, 0.8)',
                            borderRadius: '14px'

                        }}
                    >
                        {children}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export { Hotspot };

