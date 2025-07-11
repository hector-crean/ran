import { Hotspot } from "@/components/ui/hotspot";
import { InfiniteCanvasMap } from "@/components/ui/infinite-canvas/infinite-canvas-map";
import type { Slide } from "@/types/slides";

export const slides: Slide[] = [
  {
    id: "scene_1_1",
    title: "Scene 1.1",
    firstFramePoster: "/assets/Scene_1.1_poster.png",
    lastFramePoster: "/assets/Scene_1.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_1.1.mp4",
        poster: "/assets/Scene_1.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_1_2",
    title: "Scene 1.1",
    firstFramePoster: "/assets/Scene_2.1_poster.png",
    lastFramePoster: "/assets/Scene_2.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "FreezeFrame",
      data: {
        poster: "/assets/Scene_2.1_poster.png",
        children: <InfiniteCanvasMap />,
      },
    },
  },
  {
    id: "scene_2_1",
    title: "Scene 2.1",
    firstFramePoster: "/assets/Scene_2.1_poster.png",
    lastFramePoster: "/assets/Scene_2.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_2.1.mp4",
        poster: "/assets/Scene_2.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_2_2_1",
    title: "Scene 2.2.1 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_2.2.1_00001.png",
    lastFramePoster: "/assets/Scene_2.2.1_00100.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "RotationalSequence",
      data: {
        baseUrl: "/assets/Scene_2.2.1",
        totalFrames: 100,
        format: "png",
        indicators: ["rotation-3d"],
      },
    },
  },
  {
    id: "scene_2_2_2",
    title: "Scene 2.2.2",
    firstFramePoster: "/assets/Scene_2.2.2_poster.png",
    lastFramePoster: "/assets/Scene_2.2.2_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_2.2.2.mp4",
        poster: "/assets/Scene_2.2.2_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_2_2_3",
    title: "Scene 2.2.3 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_2.2.3_00001.png",
    lastFramePoster: "/assets/Scene_2.2.3_00075.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "LinearSequence",
      data: {
        baseUrl: "/assets/Scene_2.2.3",
        totalFrames: 75,
        format: "png",
        sliderText: "Please use the slider to form the immune complex",
      },
    },
  },
  {
    id: "scene_2_2_4",
    title: "Scene 2.2.4",
    firstFramePoster: "/assets/Scene_2.2.4_poster.png",
    lastFramePoster: "/assets/Scene_2.2.4_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_2.2.4.mp4",
        poster: "/assets/Scene_2.2.4_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_3_1_1",
    title: "Scene 3.1.1",
    firstFramePoster: "/assets/Scene_3.1_poster.png",
    lastFramePoster: "/assets/Scene_3.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_3.1.mp4",
        poster: "/assets/Scene_3.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_3_1_2",
    title: "Scene 3.1.2",
    firstFramePoster: "/assets/Scene_4.1.1_poster.png",
    lastFramePoster: "/assets/Scene_4.1.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "ClipPathComparator",
      data: {
        beforeContent: <img src="/assets/Scene_4.1.1_poster.png" />,
        afterContent: (
          <img src="/assets/Scene_4.1.1_poster.png" className="invert filter" />
        ),
      },
    },
  },
  {
    id: "scene_3_1_3",
    title: "Scene 3.1.3",
    firstFramePoster: "/assets/Scene_4.1.1_poster.png",
    lastFramePoster: "/assets/Scene_4.1.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "FreezeFrame",
      data: {
        poster: "/assets/Scene_4.1.1_poster.png",
        children: <div className="text-2xl text-white">Question component</div>,
      },
    },
  },
  {
    id: "scene_3_1_4",
    title: "Scene 3.1.4",
    firstFramePoster: "/assets/Scene_4.1_poster.png",
    lastFramePoster: "/assets/Scene_4.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "DragDropGrid",
      data: {
        poster: "/assets/Scene_4.1.1_poster.png",
        positionedElements: [
          {
            screenCoords: { x: 0.71, y: 0.45 },
            node: (
              <Hotspot
                color="#bb67e4"
                icon="/touch_long_24dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"
                size="lg"
              />
            ),
          },
        ],
        instructions:
          "Drag and drop the immune complex to deposit it in the glomeruli",
      },
    },
  },
  {
    id: "scene_4_1_1",
    title: "Scene 4.1.1",
    firstFramePoster: "/assets/Scene_4.1.1_poster.png",
    lastFramePoster: "/assets/Scene_4.1.2_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.1.1.mp4",
        poster: "/assets/Scene_4.1.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_4_1_2",
    title: "Scene 4.1.2",
    firstFramePoster: "/assets/Scene_4.1.2_poster.png",
    lastFramePoster: "/assets/Scene_4.1.2_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "GpuPickingVideo",
      data: {
        videoSrc: "/assets/Scene_4.1.2-looped.mp4",
        maskSrc: "/assets/Scene_4.1.2-mask-looped-2.mp4",
        instructions:
          "Please choose the correct cell to activate in order to produce immunoglobulin",
      },
    },
  },
  {
    id: "scene_4_1_3",
    title: "Scene 4.1.3",
    firstFramePoster: "/assets/Scene_4.1.3_poster.png",
    lastFramePoster: "/assets/Scene_4.1.3_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.2.mp4",
        poster: "/assets/Scene_4.2_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  // {
  //   id: "scene_4_2",
  //   title: "Scene 4.2",
  //   firstFramePoster: "/assets/Scene_4.2_poster.png",
  //   lastFramePoster: "/assets/Scene_4.2_poster.png",
  //   onFinishAction: "next_slide",
  //   initialDrawer: null,
  //   initialSheet: null,
  //   initialDialog: null,
  //   slide_type: {
  //     type: "Video",
  //     data: {
  //       url: "/assets/Scene_4.2-looped.mp4",
  //       poster: "/assets/Scene_4.2_poster.png",
  //       autoplay: true,
  //     },
  //   },
  // },
  {
    id: "scene_4_3",
    title: "Scene 4.3",
    firstFramePoster: "/assets/Scene_4.3_poster.png",
    lastFramePoster: "/assets/Scene_4.3_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.3.mp4",
        poster: "/assets/Scene_4.3_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_4_4",
    title: "Scene 4.4",
    firstFramePoster: "/assets/Scene_4.4_poster.png",
    lastFramePoster: "/assets/Scene_4.4_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.4.mp4",
        poster: "/assets/Scene_4.4_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_1_1",
    title: "Scene 5.1.1",
    firstFramePoster: "/assets/Scene_5.1_poster.png",
    lastFramePoster: "/assets/Scene_5.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_5.1.mp4",
        poster: "/assets/Scene_5.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_1_2",
    title: "Scene 5.1.2",
    firstFramePoster: "/assets/Scene_5.1.1_poster.png",
    lastFramePoster: "/assets/Scene_5.1.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "FreezeFrame",
      data: {
        poster: "/assets/Scene_5.2_poster.png",
        // children: <div className="text-white text-2xl">Question component</div>,
        positionedElements: [
          {
            screenCoords: { x: 0.3, y: 0.32 },
            node: (
              <Hotspot color="#334e7d" size="lg">
                TACI (transmembrane activator and calcium-modulating cyclophilin
                ligand interactor) is a receptor protein on B cells that plays a
                crucial role in their activation and differentiation,
                particularly in T cell-independent antibody responses. It
                belongs to the tumor necrosis factor receptor (TNFR) superfamily
                and is a receptor for the ligands APRIL and BAFF. TACI is
                important for B cell survival, antibody production, and class
                switching
              </Hotspot>
            ),
          },
          {
            screenCoords: { x: 0.71, y: 0.45 },
            node: (
              <Hotspot color="#bb67e4" size="lg">
                BCMA: B cell maturation antigen (BCMA) is a tumor necrosis
                family receptor (TNFR) member that is predominantly expressed on
                terminally differentiated B cells and, upon binding to its
                ligands B cell activator of the TNF family (BAFF) and a
                proliferation inducing ligand (APRIL), delivers pro-survival
                cell signals.
              </Hotspot>
            ),
          },
        ],
      },
    },
  },
  {
    id: "scene_5_2",
    title: "Scene 5.2",
    firstFramePoster: "/assets/Scene_5.2_poster.png",
    lastFramePoster: "/assets/Scene_5.2_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_5.2.mp4",
        poster: "/assets/Scene_5.2_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_3",
    title: "Scene 5.3 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_5.3_00001.png",
    lastFramePoster: "/assets/Scene_5.3_00075.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "TargetedLinearSequence",
      data: {
        baseUrl: "/assets/Scene_5.3",
        totalFrames: 75,
        format: "png",
        sliderText: "To continue, please drag APRIL to bind TACI",
        progressDirection: { x: 1 / Math.sqrt(2), y: 1 / Math.sqrt(2) },
      },
    },
  },
  {
    id: "scene_5_4",
    title: "Scene 5.4",
    firstFramePoster: "/assets/Scene_5.4_poster.png",
    lastFramePoster: "/assets/Scene_5.4_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_5.4.mp4",
        poster: "/assets/Scene_5.4_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_5",
    title: "Scene 5.5 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_5.5_00001.png",
    lastFramePoster: "/assets/Scene_5.5_00025.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "TargetedLinearSequence",
      data: {
        baseUrl: "/assets/Scene_5.5",
        totalFrames: 25,
        format: "png",
        progressDirection: { x: 0, y: 1 },
        sliderText: "To continue, please drag APRIL to bind with BCMA",
      },
    },
  },
  {
    id: "scene_6_1",
    title: "Scene 6.1",
    firstFramePoster: "/assets/Scene_6.1_poster.png",
    lastFramePoster: "/assets/Scene_6.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_6.1.mp4",
        poster: "/assets/Scene_6.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_7_1",
    title: "Scene 7.1",
    firstFramePoster: "/assets/Scene_7.1_poster.png",
    lastFramePoster: "/assets/Scene_7.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_7.1.mp4",
        poster: "/assets/Scene_7.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_8_1",
    title: "Scene 8.1",
    firstFramePoster: "/assets/Scene_8.1_poster.png",
    lastFramePoster: "/assets/Scene_8.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "GpuPickingVideo",
      data: {
        videoSrc: "/assets/Scene_8.1_cut.mp4",
        maskSrc: "/assets/Scene_8.1_masked.mp4",
        instructions: "Please select the correct cell to activate",
      },
    },
  },
  {
    id: "scene_9_1",
    title: "Scene 9.1",
    firstFramePoster: "/assets/Scene_9.1_poster.png",
    lastFramePoster: "/assets/Scene_9.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_9.1.mp4",
        poster: "/assets/Scene_9.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_9_2",
    title: "Scene 9.2",
    firstFramePoster: "/assets/Scene_9.2_poster.png",
    lastFramePoster: "/assets/Scene_9.2_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_9.2.mp4",
        poster: "/assets/Scene_9.2_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_9_3",
    title: "Scene 9.3 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_9.3_00001.png",
    lastFramePoster: "/assets/Scene_9.3_00075.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "RotationalSequence",
      data: {
        baseUrl: "/assets/Scene_9.3",
        totalFrames: 75,
        format: "png",
      },
    },
  },
  {
    id: "scene_9_4",
    title: "Scene 9.4",
    firstFramePoster: "/assets/Scene_9.4_poster.png",
    lastFramePoster: "/assets/Scene_9.4_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_9.4.mp4",
        poster: "/assets/Scene_9.4_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_10_1",
    title: "Scene 10.1",
    firstFramePoster: "/assets/Scene_10.1_poster.png",
    lastFramePoster: "/assets/Scene_10.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_10.1.mp4",
        poster: "/assets/Scene_10.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_11_1",
    title: "Scene 11.1",
    firstFramePoster: "/assets/Scene_11.1_poster.png",
    lastFramePoster: "/assets/Scene_11.1_poster.png",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_11.1.mp4",
        poster: "/assets/Scene_11.1_poster.png",
        autoplay: true,
        loop: false,
      },
    },
  },
];
