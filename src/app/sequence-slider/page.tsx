"use client";

import { glob } from 'glob';
import path from 'path';
import { SequenceSliderClient } from './sequence-slider-client';
import { use } from 'react';

// Cache the sequence images to prevent re-reading on every request
let cachedSequenceImages: string[] | null = null;

async function getSequenceImages(): Promise<string[]> {
    // Return cached results if available
    if (cachedSequenceImages) {
        return cachedSequenceImages;
    }

    // Get the absolute path to the ribosome sequence directory in public
    const sequenceDir = path.join(process.cwd(), 'public/assets/sequences/ribosome');

    try {
        // Use glob to find all PNG files in the directory
        const files = await glob('*.png', {
            cwd: sequenceDir,
            absolute: false
        });

        // Sort the files by their numeric sequence
        const sortedFiles = files.sort((a, b) => {
            const aNum = parseInt(a.match(/(\d+)/)?.[1] || '0');
            const bNum = parseInt(b.match(/(\d+)/)?.[1] || '0');
            return aNum - bNum;
        });

        // Convert to web-accessible paths and cache the result
        cachedSequenceImages = sortedFiles.map(file => `/assets/sequences/ribosome/${file}`);
        return cachedSequenceImages;
    } catch (error) {
        console.error('Error loading sequence images:', error);
        return [];
    }
}

export default async function SequenceSliderExample() {

    const paths = use(getSequenceImages());
    return <SequenceSliderClient imagePaths={paths} />;
}