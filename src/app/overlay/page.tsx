"use client";
import OutlineOverlay from "@/components/ui/svg/outline-overlay";
import { outline } from "../processed";

const Page = () => {
  return (
    <OutlineOverlay
      outline={outline}
    //   src="/test_complex.png"
      src="/square_dog.webp"
    />
  );
};

export default Page;
