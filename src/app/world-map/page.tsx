import WorldMap from "@/components/ui/world-map";
import { worldGeojson } from "@/components/ui/world-map/world-geojson";


const Page = () => {

    return (<WorldMap
        geojson={worldGeojson}
        projection={{
            type: 'geoMercator',
            center: [0, 20] // Center on equator, slight north
        }}
        enableDrag={true}
        enableZoom={true}
        showControls={true}
        autoCycle={false}
        cycleInterval={3000}
        transitionDuration={0.5}
        enableTooltips={true}
    />)
}

export default Page;