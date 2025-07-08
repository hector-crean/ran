import { MotionValue, motion, useTransform } from "motion/react";

interface LinearIndicatorProps {
    progressRatio: MotionValue<number>;
    sliderText: string;
    trackColor?: string;
    progressColor?: string;
    thumbColor?: string;
    className?: string;
}

const LinearIndicator = ({
    progressRatio,
    trackColor = "rgb(176, 178, 192)",
    progressColor = "rgb(52, 79, 129)",
    thumbColor = "rgb(204, 108, 244)",
    className = "",
    sliderText,
}: LinearIndicatorProps) => {
    // Use responsive height based on viewport and container
    const baseHeight = 'clamp(1.5rem, 4vw, 2rem)'; // Responsive between 24px-32px


    const progressRatioOver100 = useTransform(progressRatio, [0, 1], [0, 100]);
    // Transform the progress ratio to percentage for width and position
    const progressPercentage = useTransform(progressRatio, [0, 1], ['0%', '100%']);



    return (
        <div
            className="w-full px-4 py-2 sm:px-8 sm:py-4 lg:px-16 lg:py-6"
            style={{
                '--indicator-height': baseHeight,
                '--track-height': 'calc(var(--indicator-height) * 0.3)',
                '--thumb-height': 'calc(var(--indicator-height) * 0.8)',
                '--thumb-width': 'calc(var(--thumb-height) * 3)',
                '--arrow-height': 'calc(var(--indicator-height) * 1.5)',
                '--arrow-width': 'calc(var(--indicator-height) * 0.12)',
                '--tooltip-offset': 'calc(var(--indicator-height) * -4)',
                '--border-radius': 'calc(var(--indicator-height) * 0.6)',
                '--outer-padding': 'clamp(0.25rem, 1vw, 0.5rem)',
                '--inner-padding-x': 'clamp(1rem, 3vw, 3rem)',
                '--inner-padding-y': 'clamp(0.5rem, 1.5vw, 1rem)',
            } as React.CSSProperties}
        >
            <div
                className="flex items-center justify-center w-full rounded-2xl"
                style={{
                    boxShadow: '0 0 0 var(--outer-padding) rgba(206, 209, 222, 1.0)',
                    padding: 'var(--outer-padding)',
                    borderRadius: 'var(--border-radius)'
                }}
            >
                {/* Inner container */}
                <div
                    className="flex items-center justify-center w-full"
                    style={{
                        backgroundColor: 'rgb(206, 209, 222)',
                        borderRadius: 'calc(var(--border-radius) * 0.8)',
                        paddingLeft: 'var(--inner-padding-x)',
                        paddingRight: 'var(--inner-padding-x)',
                        paddingTop: 'var(--inner-padding-y)',
                        paddingBottom: 'var(--inner-padding-y)'
                    }}
                >
                    <div
                        className={`relative flex items-center w-full ${className}`}
                        style={{
                            height: 'var(--indicator-height)',
                            backgroundColor: 'rgb(206, 209, 222)'
                        }}
                    >
                        {/* Track (background) */}
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                backgroundColor: trackColor,
                                height: 'var(--track-height)',
                                top: '50%',
                                transform: 'translateY(-50%)'
                            }}
                        />

                        {/* Progress bar */}
                        <motion.div
                            key="progress-bar"
                            className="absolute rounded-full"
                            style={{
                                backgroundColor: progressColor,
                                height: 'var(--track-height)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: progressPercentage
                            }}
                        />

                        {/* Thumb - Optimized with transform3d */}
                        <motion.div
                            key="thumb"
                            className="absolute rounded-full shadow-sm"
                            style={{
                                backgroundColor: thumbColor,
                                height: 'var(--thumb-height)',
                                width: 'var(--thumb-width)',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                left: progressPercentage,
                            }}
                        />

                        {/* Tapered arrow pointing up - Optimized */}
                        <motion.div
                            key="arrow-up"
                            className="absolute bg-white"
                            style={{
                                width: 'var(--arrow-width)',
                                height: 'var(--arrow-height)',
                                clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
                                top: 'calc(var(--tooltip-offset) + var(--arrow-height))',
                                transform: 'translateX(-50%)',
                                left: progressPercentage
                            }}
                        />

                        {/* Tapered arrow pointing down - Optimized */}
                        <motion.div
                            key="arrow-down"
                            className="absolute bg-white"
                            style={{
                                width: 'var(--arrow-width)',
                                height: 'var(--arrow-height)',
                                clipPath: 'polygon(0 0, 50% 100%, 100% 0)',
                                bottom: 'calc(var(--tooltip-offset) + var(--arrow-height))',
                                transform: 'translateX(-50%)',
                                left: progressPercentage
                            }}
                        />

                        {/* Tooltip - Optimized with clamped positioning */}
                        <motion.div
                            key="tooltip"
                            className="absolute rounded-full shadow-sm flex flex-col items-center justify-center"
                            style={{
                                width: 'fit-content',
                                top: 'var(--tooltip-offset)',
                                transform: 'translateY(-50%) translateX(-50%)',
                                left: progressPercentage
                            }}
                        >
                            <div className="text-sm sm:text-lg lg:text-2xl text-white whitespace-nowrap px-2 py-1">
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

