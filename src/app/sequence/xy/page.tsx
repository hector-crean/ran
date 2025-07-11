import { SequenceXY } from "./sequence-xy";

const Page = () => {
  return (
    <SequenceXY
      baseUrl="/assets/Scene_5.3"
      totalFrames={75}
      format="png"
      progressDirection={{ x: 2, y: 1 }}
    />
  );
};

export default Page;
