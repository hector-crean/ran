"use client";
import ClipPathComparator from "@/components/clip-path-comparator";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <ClipPathComparator
        beforeContent={
          <img
            src="/assets/Scene_1.1_poster.png"
            alt="Before"
            className="w-full h-full object-cover"
          />
        }
        afterContent={
          <img
            src="/assets/Scene_2.1_poster.png"
            alt="After"
            className="w-full h-full object-cover"
          />
        }
        beforeLabel="Original"
        afterLabel="Enhanced"
      />{" "}
    </div>
  );
};

export default Page;
