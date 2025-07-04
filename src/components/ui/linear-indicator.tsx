import { MotionValue, motion, useTransform } from "motion/react";

interface LinearIndicatorProps {
    progressRatio: MotionValue<number>;
    sliderText: string;
    width?: number;
    height?: number;
    trackColor?: string;
    progressColor?: string;
    thumbColor?: string;
    className?: string;
}

const LinearIndicator = ({
    progressRatio,
    width = 1200,
    height = 30,
    trackColor = "rgb(176, 178, 192)",
    progressColor = "rgb(52, 79, 129)",
    thumbColor = "rgb(204, 108, 244)",
    className = "",
    sliderText
}: LinearIndicatorProps) => {
    // Transform the progress ratio to percentage for width and position
    const progressPercentage = useTransform(progressRatio, [0, 1], [0, 100]);
    const thumbPosition = useTransform(progressRatio, [0, 1], [0, 100]);

    // Calculate thumb dimensions
    const thumbHeight = 2 * Math.min(height * 0.6, 12);
    const thumbWidth = thumbHeight * 3; // aspect ratio 3:1

    console.log(sliderText)

    return (
        <div className="px-32 py-8">
            <div
                className="flex items-center justify-center"
                style={{
                    boxShadow: '0 0 0 5px rgba(206, 209, 222, 1.0)',
                    padding: '5px',
                    borderRadius: '18px'
                }}
            >
                {/* Inner container */}
                <div
                    className="flex items-center justify-center py-4 px-12"
                    style={{
                        backgroundColor: 'rgb(206, 209, 222)',
                        borderRadius: '14px'

                    }}
                >
                    <div
                        className={`relative flex items-center ${className}`}
                        style={{
                            width: `${width}px`,
                            height: `${height}px`,
                            backgroundColor: 'rgb(206, 209, 222)'
                        }}
                    >
                        {/* Track (background) */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                backgroundColor: trackColor,
                                height: `${Math.min(height * 0.4, 8)}px`,
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                        />

                        {/* Progress bar */}
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                backgroundColor: progressColor,
                                height: `${Math.min(height * 0.4, 8)}px`,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: useTransform(progressPercentage, (value) => `${value}%`)
                            }}
                        />

                        {/* Thumb */}
                        <motion.div
                            className="absolute rounded-full shadow-sm"
                            style={{
                                backgroundColor: thumbColor,
                                height: `${thumbHeight}px`,
                                aspectRatio: '3 / 1',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                left: useTransform(thumbPosition, (value) => `calc(${value}% - ${thumbWidth / 2}px)`)
                            }}
                        />

                        {/* Tapered arrow pointing up */}
                        <motion.div
                            className="absolute bg-white"
                            style={{
                                width: '3px',
                                height: '40px',
                                clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                                top: '-250%',
                                transform: 'translateX(-50%)',
                                left: useTransform(thumbPosition, (value) => `${value}%`)
                            }}
                        />

                        {/* Tapered arrow pointing down */}
                        <motion.div
                            className="absolute bg-white"
                            style={{
                                width: '3px',
                                height: '40px',
                                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                                bottom: '-250%',
                                transform: 'translateX(-50%)',
                                left: useTransform(thumbPosition, (value) => `${value}%`)
                            }}
                        />

                        {/* Tooltip */}
                        <motion.div
                            className="absolute rounded-full shadow-sm flex flex-col items-center justify-center"
                            style={{
                                width: 'fit-content',
                                top: '-320%',
                                transform: 'translateY(-50%) translateX(-50%)',
                                left: useTransform(thumbPosition, (value) => {
                                    // Clamp the tooltip position to stay within bounds
                                    const minOffset = 0; // Minimum distance from edge (in %)
                                    const maxOffset = 100; // Maximum distance from edge (in %)
                                    const clampedValue = Math.max(minOffset, Math.min(maxOffset, value));
                                    return `${clampedValue}%`;
                                })
                            }}
                        >
                            <div className="text-2xl text-white whitespace-nowrap">
                                {sliderText}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { LinearIndicator };

