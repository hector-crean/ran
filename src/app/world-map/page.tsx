import WorldMap from "@/components/ui/world-map";


const Page = () => {

    return (<WorldMap
        projection={{
            type: 'geoMercator',
            center: [0, 20] // Center on equator, slight north
        }}
    />)
}

export default Page;