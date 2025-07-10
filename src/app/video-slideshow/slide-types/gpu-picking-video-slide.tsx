

'use client';

import { GpuPickingVideo, GpuPickingVideoHandle } from '@/components/gpu-picking-video';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { HollowButton } from '@/components/ui/hollow-button';
import { useSlideshowContext } from '@/contexts/slideshow-context';
import { motion } from 'motion/react';
import { ReactNode, useCallback, useRef, useState } from 'react';

interface GpuPickingVideoSlideProps {
    videoSrc: string;
    maskSrc: string;
    instructions: ReactNode
}

export const GpuPickingVideoSlide = ({ videoSrc, maskSrc, instructions }: GpuPickingVideoSlideProps) => {
    const videoRef = useRef<GpuPickingVideoHandle>(null);


    // Other state
    const [lastPickedObject, setLastPickedObject] = useState<ColorInfo | null>(null);

    // Example outline settings
    const [outlineSettings, setOutlineSettings] = useState({
        thickness: 8.0,
        edgeThreshold: 0.5,
        innerColor: '#dbc6ec',
        outerColor: '#A020F0',
        maskOverlayColor: '#A020F0',
        maskOverlayOpacity: 0.3
    });




    // Mask interaction handlers
    const handleMaskHover = useCallback((colorInfo: ColorInfo, x: number, y: number) => {
        console.log('Mask hovered:', colorInfo, 'at', x, y);
    }, []);

    const handleMaskClick = useCallback((colorInfo: ColorInfo, x: number, y: number) => {
        console.log('Mask clicked:', colorInfo, 'at', x, y);
        setLastPickedObject(colorInfo);
    }, []);


    const { setPage, currentPage } = useSlideshowContext();

    const handleVideoEnded = () => {
        setPage(currentPage + 1);
    };



    return (
        <div className="relative w-full h-full flex items-center justify-center bg-black">

            <GpuPickingVideo
                ref={videoRef}
                videoSrc={videoSrc}
                maskSrc={maskSrc}
                onMaskHover={handleMaskHover}
                onMaskClick={handleMaskClick}
                onEnded={handleVideoEnded}
                outlineSettings={outlineSettings}
                className="w-full h-full"
                loop={true}
            />





            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline" className='absolute bottom-4 right-4'>Outline Settings</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">

                    <OutlineControls
                        outlineSettings={outlineSettings}
                        onSettingsChange={setOutlineSettings}
                    />
                </DialogContent>
            </Dialog>

            <motion.div className="absolute bottom-16 left-0 right-0 z-10 w-full pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <HollowButton>
                    {instructions}
                </HollowButton>
            </motion.div>







        </div>
    );
}


interface ColorInfo {
    r: number;
    g: number;
    b: number;
    a: number;
    rNorm: number;
    gNorm: number;
    bNorm: number;
    aNorm: number;
    hex: string;
    objectId: number;
}

interface OutlineControlsProps {
    outlineSettings: {
        thickness: number;
        edgeThreshold: number;
        innerColor: string;
        outerColor: string;
        maskOverlayColor: string;
        maskOverlayOpacity: number;
    };
    onSettingsChange: (settings: any) => void;
}

function OutlineControls({ outlineSettings, onSettingsChange }: OutlineControlsProps) {

    const updateSetting = useCallback((key: string, value: any) => {
        onSettingsChange({
            ...outlineSettings,
            [key]: value
        });
    }, [outlineSettings, onSettingsChange]);

    return (

        <div className="w-full h-full bg-black/80 text-white p-4 rounded-lg max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Outline Shader Controls</h3>

            <div className="grid grid-cols-2 gap-4">
                {/* Outline Thickness */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Outline Thickness: {outlineSettings.thickness.toFixed(1)}
                    </label>
                    <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.1"
                        value={outlineSettings.thickness}
                        onChange={(e) => updateSetting('thickness', parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="text-xs text-gray-400">Controls outline thickness</div>
                </div>

                {/* Edge Threshold */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Edge Threshold: {outlineSettings.edgeThreshold.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1.0"
                        step="0.01"
                        value={outlineSettings.edgeThreshold}
                        onChange={(e) => updateSetting('edgeThreshold', parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="text-xs text-gray-400">Minimum edge strength to show outline</div>
                </div>

                {/* Inner Color */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Inner Color
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={outlineSettings.innerColor}
                            onChange={(e) => updateSetting('innerColor', e.target.value)}
                            className="w-12 h-8 rounded border border-gray-600"
                        />
                        <input
                            type="text"
                            value={outlineSettings.innerColor}
                            onChange={(e) => updateSetting('innerColor', e.target.value)}
                            className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                        />
                    </div>
                    <div className="text-xs text-gray-400">Color at edge center</div>
                </div>

                {/* Outer Color */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Outer Color
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={outlineSettings.outerColor}
                            onChange={(e) => updateSetting('outerColor', e.target.value)}
                            className="w-12 h-8 rounded border border-gray-600"
                        />
                        <input
                            type="text"
                            value={outlineSettings.outerColor}
                            onChange={(e) => updateSetting('outerColor', e.target.value)}
                            className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                        />
                    </div>
                    <div className="text-xs text-gray-400">Color at edge periphery</div>
                </div>

                {/* Mask Overlay Color */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mask Overlay Color
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={outlineSettings.maskOverlayColor}
                            onChange={(e) => updateSetting('maskOverlayColor', e.target.value)}
                            className="w-12 h-8 rounded border border-gray-600"
                        />
                        <input
                            type="text"
                            value={outlineSettings.maskOverlayColor}
                            onChange={(e) => updateSetting('maskOverlayColor', e.target.value)}
                            className="flex-1 px-2 py-1 bg-gray-700 text-white rounded text-sm"
                        />
                    </div>
                    <div className="text-xs text-gray-400">Color overlay for masked areas</div>
                </div>

                {/* Mask Overlay Opacity */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mask Overlay Opacity: {outlineSettings.maskOverlayOpacity.toFixed(2)}
                    </label>
                    <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={outlineSettings.maskOverlayOpacity}
                        onChange={(e) => updateSetting('maskOverlayOpacity', parseFloat(e.target.value))}
                        className="w-full"
                    />
                    <div className="text-xs text-gray-400">Opacity of mask overlay</div>
                </div>
            </div>

            {/* Presets */}
            <div className="mt-4 pt-4 border-t border-gray-600">
                <label className="block text-sm font-medium mb-2">Presets:</label>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => onSettingsChange({
                            thickness: 1.0,
                            edgeThreshold: 0.3,
                            innerColor: '#ff0000',
                            outerColor: '#880000',
                            maskOverlayColor: '#ff4444',
                            maskOverlayOpacity: 0.2
                        })}
                        className="px-3 py-1 bg-red-600/50 text-white rounded text-sm hover:bg-red-600/70 transition-colors"
                    >
                        Red Outline
                    </button>
                    <button
                        onClick={() => onSettingsChange({
                            thickness: 1.5,
                            edgeThreshold: 0.4,
                            innerColor: '#00ff00',
                            outerColor: '#008800',
                            maskOverlayColor: '#44ff44',
                            maskOverlayOpacity: 0.3
                        })}
                        className="px-3 py-1 bg-green-600/50 text-white rounded text-sm hover:bg-green-600/70 transition-colors"
                    >
                        Green Thick
                    </button>
                    <button
                        onClick={() => onSettingsChange({
                            thickness: 0.5,
                            edgeThreshold: 0.6,
                            innerColor: '#0088ff',
                            outerColor: '#004488',
                            maskOverlayColor: '#4488ff',
                            maskOverlayOpacity: 0.15
                        })}
                        className="px-3 py-1 bg-blue-600/50 text-white rounded text-sm hover:bg-blue-600/70 transition-colors"
                    >
                        Blue Thin
                    </button>
                    <button
                        onClick={() => onSettingsChange({
                            thickness: 2.0,
                            edgeThreshold: 0.5,
                            innerColor: '#ffff00',
                            outerColor: '#888800',
                            maskOverlayColor: '#ffff44',
                            maskOverlayOpacity: 0.4
                        })}
                        className="px-3 py-1 bg-yellow-600/50 text-white rounded text-sm hover:bg-yellow-600/70 transition-colors"
                    >
                        Yellow Bold
                    </button>
                </div>
            </div>
        </div>

    );
}

export type { GpuPickingVideoSlideProps };

