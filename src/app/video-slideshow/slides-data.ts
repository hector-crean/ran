import type { Slide } from "@/types/slides";

export const slides = [
  {
    id: "scene_1_1",
    title: "Scene 1.1",
    firstFramePoster: "/assets/Scene_1.1_poster.png",
    lastFramePoster: "/assets/Scene_1.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_1.1.mp4",
        poster: "/assets/Scene_1.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_2_1",
    title: "Scene 2.1",
    firstFramePoster: "/assets/Scene_2.1_poster.png",
    lastFramePoster: "/assets/Scene_2.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_2.1.mp4",
        poster: "/assets/Scene_2.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_2_2_1",
    title: "Scene 2.2.1 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_2.2.1_00001.png",
    lastFramePoster: "/assets/Scene_2.2.1_00100.png",
    slide_type: {
      type: 'Sequence',
      data:  {
        id: "scene_2_2_1",
        baseUrl: "/assets/Scene_2.2.1_",
        frameCount: 100,
        format: "png"
      }
    },
  },
  {
    id: "scene_2_2_2",
    title: "Scene 2.2.2",
    firstFramePoster: "/assets/Scene_2.2.2_poster.png",
    lastFramePoster: "/assets/Scene_2.2.2_poster.png",
    slide_type: {
      type: "Video",
      data: {
        id: "scene_2_2_2",
        url: "/assets/Scene_2.2.2.mp4",
        poster: "/assets/Scene_2.2.2_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_2_2_3",
    title: "Scene 2.2.3 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_2.2.3_00001.png",
    lastFramePoster: "/assets/Scene_2.2.3_00075.png",
    slide_type: {
      type: "Sequence",
      data:{
        id: "scene_2_2_3",
        baseUrl: "/assets/Scene_2.2.3_",
        frameCount: 75,
        format: "png"
      }
    },
  },
  {
    id: "scene_2_2_4",
    title: "Scene 2.2.4",
    firstFramePoster: "/assets/Scene_2.2.4_poster.png",
    lastFramePoster: "/assets/Scene_2.2.4_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_2.2.4.mp4",
        poster: "/assets/Scene_2.2.4_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_3_1",
    title: "Scene 3.1",
    firstFramePoster: "/assets/Scene_3.1_poster.png",
    lastFramePoster: "/assets/Scene_3.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_3.1.mp4",
        poster: "/assets/Scene_3.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_4_1",
    title: "Scene 4.1",
    firstFramePoster: "/assets/Scene_4.1_poster.png",
    lastFramePoster: "/assets/Scene_4.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.1.mp4",
        poster: "/assets/Scene_4.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_4_2",
    title: "Scene 4.2",
    firstFramePoster: "/assets/Scene_4.2_poster.png",
    lastFramePoster: "/assets/Scene_4.2_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.2.mp4",
        poster: "/assets/Scene_4.2_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_4_3",
    title: "Scene 4.3",
    firstFramePoster: "/assets/Scene_4.3_poster.png",
    lastFramePoster: "/assets/Scene_4.3_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.3.mp4",
        poster: "/assets/Scene_4.3_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_4_4",
    title: "Scene 4.4",
    firstFramePoster: "/assets/Scene_4.4_poster.png",
    lastFramePoster: "/assets/Scene_4.4_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_4.4.mp4",
        poster: "/assets/Scene_4.4_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_5_1",
    title: "Scene 5.1",
    firstFramePoster: "/assets/Scene_5.1_poster.png",
    lastFramePoster: "/assets/Scene_5.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_5.1.mp4",
        poster: "/assets/Scene_5.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_5_2",
    title: "Scene 5.2",
    firstFramePoster: "/assets/Scene_5.2_poster.png",
    lastFramePoster: "/assets/Scene_5.2_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_5.2.mp4",
        poster: "/assets/Scene_5.2_poster.png",
        autoplay: true,
        },
    },
  },
  {
    id: "scene_5_3",
    title: "Scene 5.3 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_5.3_00001.png",
    lastFramePoster: "/assets/Scene_5.3_00075.png",
    slide_type: {
      type: 'Sequence',
      data:  {
        baseUrl: "/assets/Scene_5.3_",
        frameCount: 75,
        format: "png"
      }
    },
  },
  {
    id: "scene_5_4",
    title: "Scene 5.4",
    firstFramePoster: "/assets/Scene_5.4_poster.png",
    lastFramePoster: "/assets/Scene_5.4_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_5.4.mp4",
        poster: "/assets/Scene_5.4_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_5_5",
    title: "Scene 5.5 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_5.5_00001.png",
    lastFramePoster: "/assets/Scene_5.5_00025.png",
    slide_type: {
      type: 'Sequence',
      data:  {
        baseUrl: "/assets/Scene_5.5_",
        frameCount: 25,
        format: "png"
      }
    },
  },
  {
    id: "scene_6_1",
    title: "Scene 6.1",
    firstFramePoster: "/assets/Scene_6.1_poster.png",
    lastFramePoster: "/assets/Scene_6.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_6.1.mp4",
        poster: "/assets/Scene_6.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_7_1",
    title: "Scene 7.1",
    firstFramePoster: "/assets/Scene_7.1_poster.png",
    lastFramePoster: "/assets/Scene_7.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_7.1.mp4",
        poster: "/assets/Scene_7.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_8_1",
    title: "Scene 8.1",
    firstFramePoster: "/assets/Scene_8.1_poster.png",
    lastFramePoster: "/assets/Scene_8.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_8.1.mp4",
        poster: "/assets/Scene_8.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_9_1",
    title: "Scene 9.1",
    firstFramePoster: "/assets/Scene_9.1_poster.png",
    lastFramePoster: "/assets/Scene_9.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_9.1.mp4",
        poster: "/assets/Scene_9.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_9_2",
    title: "Scene 9.2",
    firstFramePoster: "/assets/Scene_9.2_poster.png",
    lastFramePoster: "/assets/Scene_9.2_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_9.2.mp4",
        poster: "/assets/Scene_9.2_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_9_3",
    title: "Scene 9.3 - Interactive Sequence",
    firstFramePoster: "/assets/Scene_9.3_00001.png",
    lastFramePoster: "/assets/Scene_9.3_00075.png",
    slide_type: {
      type: 'Sequence',
      data:  {
        baseUrl: "/assets/Scene_9.3_",
        frameCount: 75,
        format: "png"
      }
    },
  },
  {
    id: "scene_9_4",
    title: "Scene 9.4",
    firstFramePoster: "/assets/Scene_9.4_poster.png",
    lastFramePoster: "/assets/Scene_9.4_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_9.4.mp4",
        poster: "/assets/Scene_9.4_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_10_1",
    title: "Scene 10.1",
    firstFramePoster: "/assets/Scene_10.1_poster.png",
    lastFramePoster: "/assets/Scene_10.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_10.1.mp4",
        poster: "/assets/Scene_10.1_poster.png",
        autoplay: true,
      },
    },
  },
  {
    id: "scene_11_1",
    title: "Scene 11.1",
    firstFramePoster: "/assets/Scene_11.1_poster.png",
    lastFramePoster: "/assets/Scene_11.1_poster.png",
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/Scene_11.1.mp4",
        poster: "/assets/Scene_11.1_poster.png",
        autoplay: true,
      },
    },
  },
] as Slide[];