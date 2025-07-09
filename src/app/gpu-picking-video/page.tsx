import GpuPickingVideo from '@/components/gpu-picking-video';

const Page = () => {
    return (
        <main className="w-full h-screen">
            <GpuPickingVideo
                videoSrc="/assets/Scene_8.1.mp4"
                maskSrc="/assets/Scene_8.1-masked.mp4"
                className="w-full h-full"

            />
        </main>
    );
}

export default Page;