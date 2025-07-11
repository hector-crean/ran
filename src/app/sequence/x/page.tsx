import { SequenceX } from "./sequence-x";

const Page = () => {
  return (
    <SequenceX
      baseUrl="/assets/Scene_2.2.1"
      totalFrames={100}
      format="png"
      indicators={["rotation-3d"]}
    />
  );
};

export default Page;
