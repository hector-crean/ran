import { Hotspot } from "@/components/ui/hotspot";
import { InfiniteCanvasMap } from "@/components/ui/infinite-canvas/infinite-canvas-map";
import type { Slide } from "@/types/slides";

export const slides: Slide[] = [
  {
    id: "scene_1_1",
    title: "Scene 1.1",
    firstFramePoster: "/assets/optimised/Scene_1.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_1.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_1.1.webm",
        poster: "/assets/optimised/Scene_1.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_1_2",
    title: "Scene 1.1",
    firstFramePoster: "/assets/optimised/Scene_2.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_2.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "FreezeFrame",
      data: {
        poster: "/assets/optimised/Scene_2.1_poster.webp",
        children: <InfiniteCanvasMap />,
      },
    },
  },
  {
    id: "scene_2_1",
    title: "Scene 2.1",
    firstFramePoster: "/assets/optimised/Scene_2.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_2.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_2.1.webm",
        poster: "/assets/optimised/Scene_2.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_2_2_1",
    title: "Scene 2.2.1 - Interactive Sequence",
    firstFramePoster: "/assets/optimised/Scene_2.2.1_00001.webp",
    lastFramePoster: "/assets/optimised/Scene_2.2.1_00100.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "RotationalSequence",
      data: {
        baseUrl: "/assets/optimised/Scene_2.2.1",
        totalFrames: 100,
        format: "webp",
        indicators: ["rotation-3d"],
      },
    },
  },
  {
    id: "scene_2_2_2",
    title: "Scene 2.2.2",
    firstFramePoster: "/assets/optimised/Scene_2.2.2_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_2.2.2_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_2.2.2.webm",
        poster: "/assets/optimised/Scene_2.2.2_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_2_2_3",
    title: "Scene 2.2.3 - Interactive Sequence",
    firstFramePoster: "/assets/optimised/Scene_2.2.3_00001.webp",
    lastFramePoster: "/assets/optimised/Scene_2.2.3_00075.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "LinearSequence",
      data: {
        baseUrl: "/assets/optimised/Scene_2.2.3",
        totalFrames: 75,
        format: "webp",
        sliderText: "Please use the slider to form the immune complex",
      },
    },
  },
  {
    id: "scene_2_2_4",
    title: "Scene 2.2.4",
    firstFramePoster: "/assets/optimised/Scene_2.2.4_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_2.2.4_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_2.2.4.webm",
        poster: "/assets/optimised/Scene_2.2.4_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_3_1_1",
    title: "Scene 3.1.1",
    firstFramePoster: "/assets/optimised/Scene_3.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_3.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_3.1.webm",
        poster: "/assets/optimised/Scene_3.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_3_1_2",
    title: "Scene 3.1.2",
    firstFramePoster: "/assets/optimised/Scene_4.1.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.1.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "ClipPathComparator",
      data: {
        beforeContent: <img src="/assets/optimised/Scene_4.1.1_poster.webp" />,
        afterContent: (
          <img
            src="/assets/optimised/Scene_4.1.1_poster.webp"
            className="invert filter"
          />
        ),
      },
    },
  },
  {
    id: "scene_3_1_3",
    title: "Scene 3.1.3",
    firstFramePoster: "/assets/optimised/Scene_4.1.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.1.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "QuestionTime",
      data: {
        poster: "/assets/optimised/Scene_4.1.1_poster.webp",
        title: "question time",
        questions: {
          0: {
            question: "What is the pathophysiology of IgAN?",
            options: [
              {
                answer:
                  "Overproduction of IgE antibodies that cross-react with glomerular basement membrane antigens, causing a type II hypersensitivity reaction and subsequent glomerular damage and proteinuria.",
                isCorrect: false,
              },
              {
                answer:
                  "Systemic vasculitis characterized by inflammation and thickening of small and medium-sized blood vessels throughout the body, including the kidneys, leading to reduced glomerular filtration and hematuria.",
                isCorrect: false,
              },
              {
                answer:
                  "Abnormal glycosylation of IgA1 leading to the formation of galactose-deficient lgA1 (Gd-IgA1), which are recognized by autoantibodies (often lgG). These immune complexes of Gd-IgA1 and anti-Gd-IgA1 deposit in the glomerular mesangium, activating the complement system and endothelin system (through Endothelin A receptor; ETAR) and lead to glomerular injury, inflammation, and proliferation.",
                isCorrect: true,
              },
            ],
          },
          1: {
            question:
              "The immune complexes are deposited in which part of the kidneys?",
            options: [
              { answer: "The medulla.", isCorrect: false },
              { answer: "The glomeruli.", isCorrect: true },
              { answer: "Calices.", isCorrect: false },
            ],
          },
        },
      },
    },
  },
  {
    id: "scene_3_1_4",
    title: "Scene 3.1.4",
    firstFramePoster: "/assets/optimised/Scene_4.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "DragDropGrid",
      data: {
        poster: "/assets/optimised/Scene_4.1.1_poster.webp",
        instructions:
          "Drag and drop the immune complex to deposit it in the glomeruli",
        draggable: {
          icon: "/NER109_Immune_complex0000 copy.png",
          x: "85%",
          y: "65%",
          radius: "10%",
        },
        dropzone: {
          x: "58%",
          y: "65%",
          radius: "20%",
        },
        showIndication: true,
      },
    },
  },
  {
    id: "scene_4_1_1",
    title: "Scene 4.1.1",
    firstFramePoster: "/assets/optimised/Scene_4.1.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.1.2_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_4.1.1.webm",
        poster: "/assets/optimised/Scene_4.1.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_4_1_2",
    title: "Scene 4.1.2",
    firstFramePoster: "/assets/optimised/Scene_4.1.2_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.1.2_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "GpuPickingVideo",
      data: {
        videoSrc: "/assets/optimised/Scene_4.1.2-looped.webm",
        maskSrc: "/assets/optimised/Scene_4.1.2-mask-looped-2.webm",
        instructions:
          "Please choose the correct cell to activate in order to produce immunoglobulin",
      },
    },
  },
  {
    id: "scene_4_1_3",
    title: "Scene 4.1.3",
    firstFramePoster: "/assets/optimised/Scene_4.1.3_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.1.3_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_4.2.webm",
        poster: "/assets/optimised/Scene_4.2_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  // {
  //   id: "scene_4_2",
  //   title: "Scene 4.2",
  //   firstFramePoster: "/assets/optimised/Scene_4.2_poster.webp",
  //   lastFramePoster: "/assets/optimised/Scene_4.2_poster.webp",
  //   onFinishAction: "next_slide",
  //   initialDrawer: null,
  //   initialSheet: null,
  //   initialDialog: null,
  //   slide_type: {
  //     type: "Video",
  //     data: {
  //       url: "/assets/optimised/Scene_4.2-looped.webm",
  //       poster: "/assets/optimised/Scene_4.2_poster.webp",
  //       autoplay: true,
  //     },
  //   },
  // },
  {
    id: "scene_4_3",
    title: "Scene 4.3",
    firstFramePoster: "/assets/optimised/Scene_4.3_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.3_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_4.3.webm",
        poster: "/assets/optimised/Scene_4.3_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_4_4",
    title: "Scene 4.4",
    firstFramePoster: "/assets/optimised/Scene_4.4_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_4.4_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_4.4.webm",
        poster: "/assets/optimised/Scene_4.4_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_1_1",
    title: "Scene 5.1.1",
    firstFramePoster: "/assets/optimised/Scene_5.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_5.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_5.1.webm",
        poster: "/assets/optimised/Scene_5.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_1_2",
    title: "Scene 5.1.2",
    firstFramePoster: "/assets/optimised/Scene_5.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_5.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "FreezeFrame",
      data: {
        poster: "/assets/optimised/Scene_5.2_poster.webp",
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
    firstFramePoster: "/assets/optimised/Scene_5.2_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_5.2_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_5.2.webm",
        poster: "/assets/optimised/Scene_5.2_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_3",
    title: "Scene 5.3 - Interactive Sequence",
    firstFramePoster: "/assets/optimised/Scene_5.3_00001.webp",
    lastFramePoster: "/assets/optimised/Scene_5.3_00075.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "TargetedLinearSequence",
      data: {
        baseUrl: "/assets/optimised/Scene_5.3",
        totalFrames: 75,
        format: "webp",
        sliderText: "To continue, please drag APRIL to bind TACI",
        progressDirection: { x: 1 / Math.sqrt(2), y: 1 / Math.sqrt(2) },
      },
    },
  },
  {
    id: "scene_5_4",
    title: "Scene 5.4",
    firstFramePoster: "/assets/optimised/Scene_5.4_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_5.4_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_5.4.webm",
        poster: "/assets/optimised/Scene_5.4_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_5_5",
    title: "Scene 5.5 - Interactive Sequence",
    firstFramePoster: "/assets/optimised/Scene_5.5_00001.webp",
    lastFramePoster: "/assets/optimised/Scene_5.5_00025.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "TargetedLinearSequence",
      data: {
        baseUrl: "/assets/optimised/Scene_5.5",
        totalFrames: 25,
        format: "webp",
        progressDirection: { x: 0, y: 1 },
        sliderText: "To continue, please drag APRIL to bind with BCMA",
      },
    },
  },
  {
    id: "scene_6_1",
    title: "Scene 6.1",
    firstFramePoster: "/assets/optimised/Scene_6.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_6.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_6.1.webm",
        poster: "/assets/optimised/Scene_6.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_7_1",
    title: "Scene 7.1",
    firstFramePoster: "/assets/optimised/Scene_7.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_7.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_7.1.webm",
        poster: "/assets/optimised/Scene_7.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_8_1",
    title: "Scene 8.1",
    firstFramePoster: "/assets/optimised/Scene_8.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_8.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "GpuPickingVideo",
      data: {
        videoSrc: "/assets/optimised/Scene_8.1_cut.webm",
        maskSrc: "/assets/optimised/Scene_8.1_masked.webm",
        instructions: "Please select the correct cell to activate",
      },
    },
  },
  {
    id: "scene_8_2",
    title: "Scene 8.2",
    firstFramePoster: "/assets/optimised/Scene_8.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_8.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "QuestionTime",
      data: {
        poster: "/assets/optimised/Scene_4.1.1_poster.webp",
        title: "question time",
        questions: {
          0: {
            question:
              "How does expression of TNFSF13 affect the risk of IgA nephropathy (IgAN)?",
            options: [
              {
                answer:
                  "Increased expression of TNFSF13 is associated with an increased risk and severity of IgAN.",
                isCorrect: true,
              },
              {
                answer:
                  "Decreased expression of TNFSF13 increases the risk of IgAN by impairing the clearance of immune complexes.",
                isCorrect: false,
              },
              {
                answer:
                  "TNFSF13 expression has no significant impact on the risk of developing or progressing IgAN.",
                isCorrect: false,
              },
            ],
          },
          1: {
            question: "What is the full name of APRIL?",
            options: [
              {
                answer:
                  "Apoptosis-Related Protein Involved in Lymphocyte signaling.",
                isCorrect: false,
              },
              { answer: "A Proliferation-Inducing Ligand.", isCorrect: true },
              {
                answer:
                  "Activator of Phosphorylation and Regulator of Interleukin Levels.",
                isCorrect: false,
              },
            ],
          },
          2: {
            question: "What is the biological role of APRIL?",
            options: [
              {
                answer:
                  "APRIL promotes the survival, proliferation, maturation, and differentiation of long-lived plasma cells and induces immunoglobulin class switching in B cells.",
                isCorrect: true,
              },
              {
                answer:
                  "APRIL primarily functions in the degradation of bacterial cell walls, contributing to innate immunity.",
                isCorrect: false,
              },
              {
                answer:
                  "APRIL's main role is to suppress inflammation by inhibiting the activation of T cells.",
                isCorrect: false,
              },
            ],
          },
        },
      },
    },
  },
  {
    id: "scene_9_1",
    title: "Scene 9.1",
    firstFramePoster: "/assets/optimised/Scene_9.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_9.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_9.1.webm",
        poster: "/assets/optimised/Scene_9.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_9_2",
    title: "Scene 9.2",
    firstFramePoster: "/assets/optimised/Scene_9.2_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_9.2_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_9.2.webm",
        poster: "/assets/optimised/Scene_9.2_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_9_3",
    title: "Scene 9.3 - Interactive Sequence",
    firstFramePoster: "/assets/optimised/Scene_9.3_00001.webp",
    lastFramePoster: "/assets/optimised/Scene_9.3_00075.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "RotationalSequence",
      data: {
        baseUrl: "/assets/optimised/Scene_9.3",
        totalFrames: 75,
        format: "webp",
      },
    },
  },
  {
    id: "scene_9_4",
    title: "Scene 9.4",
    firstFramePoster: "/assets/optimised/Scene_9.4_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_9.4_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_9.4.webm",
        poster: "/assets/optimised/Scene_9.4_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_10_1",
    title: "Scene 10.1",
    firstFramePoster: "/assets/optimised/Scene_10.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_10.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_10.1.webm",
        poster: "/assets/optimised/Scene_10.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_11_1",
    title: "Scene 11.1",
    firstFramePoster: "/assets/optimised/Scene_11.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_11.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "Video",
      data: {
        url: "/assets/optimised/Scene_11.1.webm",
        poster: "/assets/optimised/Scene_11.1_poster.webp",
        autoplay: true,
        loop: false,
      },
    },
  },
  {
    id: "scene_11_2",
    title: "Scene 11.2",
    firstFramePoster: "/assets/optimised/Scene_8.1_poster.webp",
    lastFramePoster: "/assets/optimised/Scene_8.1_poster.webp",
    onFinishAction: "next_slide",
    initialDrawer: null,
    initialSheet: null,
    initialDialog: null,
    slide_type: {
      type: "QuestionTime",
      data: {
        poster: "/assets/optimised/Scene_4.1.1_poster.webp",
        title: "question time",
        questions: {
          0: {
            question: "What is Zigakibart?",
            options: [
              {
                answer:
                  "Zigakibart is a small molecule inhibitor of the enzyme cyclooxygenase (COX), used to reduce pain and inflammation by preventing the production of prostaglandins.",
                isCorrect: false,
              },
              {
                answer:
                  "Zigakibart is a growth factor that stimulates the proliferation of red blood cells and is used in the treatment of anemia associated with chronic kidney disease.",
                isCorrect: false,
              },
              {
                answer:
                  "Zigakibart is an investigational monoclonal antibody that blocks the binding of APRIL, to its receptors TACI and BCMA, halting the production of abnormal Gd-IgA1 antibodies. By blocking APRIL, zigakibart is intended to address the initiating event in IgA nephropathy pathogenesis (production of Gd-IgA1).",
                isCorrect: true,
              },
            ],
          },
        },
      },
    },
  },
];
