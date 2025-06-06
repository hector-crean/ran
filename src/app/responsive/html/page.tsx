"use client";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { DragExample } from "./drag-example";

export default function ResponsivePage() {
    return (
        <ResponsiveContainer width={1920} height={1080} fit="contain" scale={true} containerClassname='w-full h-full'>
            <DragExample />
        </ResponsiveContainer>
    );
}


