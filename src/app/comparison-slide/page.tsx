'use client'

import ClipPathComparator from "@/components/clip-path-comparator";


const Page = () => {
    return (
        <div className="flex flex-col items-center justify-center aspect-video w-full">
            <ClipPathComparator
                beforeContent={<video src="/videos/scene_02_07.mp4" autoPlay loop muted />}
                afterContent={<video src="/videos/scene_03_03.mp4" autoPlay loop muted />}
                beforeLabel="Before"
                afterLabel="After"
            />
        </div>
    )
}

export default Page;