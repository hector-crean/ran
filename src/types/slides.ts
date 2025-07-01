interface RegularSlidePayload {
  type: "Regular";
  data: {
    content: string;
    annotations?: unknown[];
  };
}

interface VideoSlidePayload {
  type: "Video";
  data: {
    url: string;
    autoplay?: boolean;
    current_time?: number;
  };
}

interface InteractiveSlidePayload {
  type: "Interactive";
  data: {
    content: string;
    interactive_elements: unknown[];
  };
}

interface PollSlidePayload {
  type: "Poll";
  data: {
    question: string;
    options: string[];
    results?: number[];
  };
}

export type SlidePayload =
  | RegularSlidePayload
  | VideoSlidePayload
  | InteractiveSlidePayload
  | PollSlidePayload;

export interface Slide {
  id: string;
  title: string;
  slide_type: SlidePayload;
} 