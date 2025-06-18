"use client"


import WorldMap from "@/components/ui/world-map";
import { worldGeojson } from "@/components/ui/world-map/world-geojson";


const Page = () => {

    return (<WorldMap
        collection={worldGeojson}
        width={961}
        height={922}
        projection='geoMercator'
        showControls={true}
        enableTooltips={true}
        tooltipContent={(data) => {
            return <div>
                <p>{data.properties.name}</p>
            </div>
        }}
    />)
}

export default Page;