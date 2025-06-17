"use client";
import ClipPathComparator from "@/components/clip-path-comparator";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <ClipPathComparator
        beforeContent={
          <img
            src="/red_distortion_2.webp"
            alt="Before"
            className="w-full h-full object-cover"
          />
        }
        afterContent={
          <img
            src="/blue_distortion_2.webp"
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
