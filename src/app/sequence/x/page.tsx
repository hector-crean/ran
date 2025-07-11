import { SequenceX } from "./sequence-x";

const Page = () => {
  return (
    <SequenceX
      baseUrl="/assets/optimised/Scene_2.2.1"
      totalFrames={100}
      format="webp"
      indicators={["rotation-3d"]}
    />
  );
};

export default Page;
