import { ResponsiveContainer } from "@/components/svg-responsive-container";
import { DragExample } from "./drag-example";


const Page = () => {


    return (
        <ResponsiveContainer width={1920} height={1080} fit="contain" scale={true} containerClassname='w-full h-full'>
            <DragExample />
        </ResponsiveContainer>
    )
}

export default Page;