"use client";

import {
  Australia,
  BaseCountries,
  EastAsia,
  Europe,
  SouthAfrica,
  SouthAmerica,
} from "@/components/ui/infinite-canvas/base-countries";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSlideshowContext } from "@/contexts/slideshow-context";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import InfiniteCanvas, { CanvasItem, InfiniteCanvasAPI } from ".";
import { Button } from "../button";
import { Sheet, SheetContent } from "../sheet";

type CountryInfo =
  | {
      country: string;
      value: number;
    }
  | {
      country: string;
      range: [number, number];
    };

interface CountryInfoBoxProps {
  grouping: string;
  data: CountryInfo[];
}

const CountryInfoBox = ({ grouping, data }: CountryInfoBoxProps) => {
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-lg border-1 border-white bg-transparent p-2">
      <div className="h-full w-full rounded-lg bg-white p-2">
        <Table>
          <TableCaption>
            {grouping} - Incidence rates per 100,000 people
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Country</TableHead>
              <TableHead>Incidence rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map(item => (
              <TableRow key={item.country}>
                <TableCell>{item.country}</TableCell>
                <TableCell>
                  {"value" in item
                    ? item.value
                    : `${item.range[0]}-${item.range[1]}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const InfiniteCanvasMap = ({ onFinish }: { onFinish: () => void }) => {
  const api = useRef<InfiniteCanvasAPI>(null);

  // Apply root-level CSS for optimal touch handling
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      :root {
        touch-action: pan-x pan-y;
        height: 100%;
      }
      html, body {
        height: 100%;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [items, setItems] = useState<CanvasItem[]>([
    {
      type: "SVG",
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "1",
      x: 2728.78,
      y: 2612.96,
      width: 320,
      height: 220,
      render: ({ selected, viewport }) => <SouthAfrica selected={selected} />,
      expansion: {
        dx: 0,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <CountryInfoBox
            grouping="Southern Africa"
            data={[{ country: "South Africa", value: 0.06 }]}
          />
        ),
      },
    },
    {
      type: "SVG",
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "2",
      x: 1370.14,
      y: 2224.32,
      width: 646.57,
      height: 571.49,
      render: ({ selected, viewport }) => <SouthAmerica />,
      expansion: {
        dx: 0,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <CountryInfoBox
            grouping="South America"
            data={[
              { country: "Peru", value: 1.7 },
              { country: "Brazil", value: 0.33 },
            ]}
          />
        ),
      },
    },
    {
      type: "SVG",
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "3",
      x: 4068.4,
      y: 2447.19,
      width: 565.06,
      height: 525.24,
      render: ({ selected, viewport }) => <Australia selected={selected} />,
      expansion: {
        dx: 0,
        dy: 0,
        width: 228.01,
        height: 200.95,
        render: ({ selected, parent, viewport }) => (
          <CountryInfoBox
            grouping="Australasia"
            data={[{ country: "Australia", range: [1.41, 10.5] }]}
          />
        ),
      },
    },
    {
      type: "SVG",
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "4",
      x: 1641.67, //1653
      y: 322.95, //313
      width: 1634.17,
      height: 1500,
      render: ({ selected, viewport }) => <Europe />,
      expansion: {
        dx: 0,
        dy: 0,
        width: 320,
        height: 600,
        render: ({ selected, parent, viewport }) => (
          <CountryInfoBox
            grouping="Europe"
            data={[
              { country: "The Netherlands", value: 1.9 },
              { country: "Italy", value: 0.84 },
              { country: "Czechia", value: 1.16 },
              { country: "Norway", value: 0.85 },
              { country: "Estonia", value: 1.4 },
              { country: "Denmark", value: 1.08 },
              { country: "Poland", value: 0.62 },
              { country: "Spain", value: 0.34 },
              { country: "Germany", value: 1.72 },
              { country: "Lithiania", value: 1.93 },
              { country: "United Kingdom", value: 0.99 },
              { country: "France", range: [2.5, 3.1] },
            ]}
          />
        ),
      },
    },

    {
      type: "SVG",
      interaction: {
        selectable: true,
        draggable: false,
        hoverable: true,
      },
      id: "5",
      x: 3938.89,
      y: 1587.68,
      width: 584.07,
      height: 692.22,
      render: ({ selected, viewport }) => <EastAsia />,
      expansion: {
        dx: 0,
        dy: 0,
        width: 228.01,
        height: 250,
        render: ({ selected, parent, viewport }) => (
          <CountryInfoBox
            grouping="East Asia"
            data={[
              { country: "Japan", value: 4.2 },
              { country: "Taiwan", value: 1.8 },
              { country: "Singapore", value: 0.55 },
            ]}
          />
        ),
      },
    },
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const handleItemsChange = (newItems: CanvasItem[]) => {
    setItems(newItems);
  };

  // Presentation controls
  const startPresentation = () => {
    setCurrentSlide(0);
    api.current?.fitToItemsAndSelect(["1"], { animate: true, duration: 800 });
  };

  const nextSlide = () => {
    if (currentSlide === items.length - 1) {
      onFinish();
      return;
    }
    const nextIndex = (currentSlide + 1) % items.length;
    const prevIndex = currentSlide === 0 ? items.length - 1 : currentSlide - 1;
    setCurrentSlide(nextIndex);
    api.current?.deselectItems([items[prevIndex].id]);
    api.current?.fitToItemsAndSelect([items[nextIndex].id], {
      animate: true,
      duration: 600,
      padding: 100,
    });
  };

  const prevSlide = () => {
    const nextIndex = (currentSlide + 1) % items.length;
    const prevIndex = currentSlide === 0 ? items.length - 1 : currentSlide - 1;
    setCurrentSlide(prevIndex);
    api.current?.deselectItems([items[nextIndex].id]);
    api.current?.fitToItemsAndSelect([items[prevIndex].id], {
      animate: true,
      duration: 600,
      padding: 100,
    });
  };

  const fitAllItems = () => {
    api.current?.fitAll({ animate: true, duration: 800 });
  };

  const zoomToCenter = () => {
    api.current?.zoomToPoint({ x: 400, y: 250 }, 2, { animate: true });
  };

  const resetView = () => {
    api.current?.reset({ animate: true, duration: 600 });
  };

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <title>Infinite Canvas Demo</title>
      </Head>
      <div className="pointer-events-auto grid h-full w-full grid-cols-1 grid-rows-[30px_1fr_80px] bg-transparent">
        <div className="row-span-1 row-start-2 flex flex-col items-center justify-center overflow-clip rounded-tl-lg rounded-bl-lg border-1 border-white p-1.5">
          <div className="text-dark-blue w-full rounded-tl-lg bg-white p-2 text-2xl">
            Please select the locations below to reveal location specific
            information
          </div>

          <div className="bg-light-blue relative aspect-[16/9] w-full flex-1 rounded-bl-lg">
            {/* Presentation Controls */}
            <div className="absolute right-4 bottom-4 z-10 rounded-lg bg-white p-4 shadow-lg">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={startPresentation}
                  disabled={currentSlide === 0}
                >
                  Restart
                </Button>
                <div className="flex items-center justify-center gap-2">
                  <Button onClick={prevSlide} disabled={currentSlide === 0}>
                    <ArrowLeft />
                  </Button>
                  <Button onClick={nextSlide}>
                    {currentSlide === items.length - 1 ? (
                      "Finish"
                    ) : (
                      <ArrowRight />
                    )}
                  </Button>
                </div>
                <div className="text-center text-xs text-gray-600">
                  Slide {currentSlide + 1} of {items.length}
                </div>
              </div>
            </div>

            {/* Viewport Controls */}
            {/* <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                Viewport Controls
              </h2>
              <div className="flex flex-col gap-2">
                <button
                  onClick={fitAllItems}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  📐 Fit All Items
                </button>
                <button
                  onClick={zoomToCenter}
                  className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-sm"
                >
                  🎯 Zoom to Center
                </button>
                <button
                  onClick={resetView}
                  className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                >
                  🏠 Reset View
                </button>
              </div>
            </div> */}
            <InfiniteCanvas
              ref={api}
              items={items}
              onItemsChange={handleItemsChange}
              minZoom={0.1}
              maxZoom={3}
              zoomSensitivity={0.03}
              initialViewport={{
                x: 53.68550200572031,
                y: 56.051491651119875,
                scale: 0.24883199999999994,
              }}
            >
              <BaseCountries />
            </InfiniteCanvas>
          </div>
        </div>
      </div>
    </>
  );
};

const InfiniteCanvasMapInSheet = () => {
  const api = useSlideshowContext();
  const [open, setOpen] = useState(true);

  const handleFinish = () => {
    setOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  useEffect(() => {
    if (open == false) {
      setTimeout(() => {
        api.setPage(api.currentPage + 1);
      }, 800); // 800ms delay
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-[60vw] border-none bg-transparent sm:max-w-[80vw]"
      >
        <InfiniteCanvasMap onFinish={handleFinish} />
      </SheetContent>
    </Sheet>
  );
};

export { InfiniteCanvasMapInSheet as InfiniteCanvasMap };
