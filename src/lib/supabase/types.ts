export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  display_order: number;
};

export type Module = {
  id: string;
  title: string;
  content_type: "text" | "video";
  video_url?: string | null;
  body?: string | null;
  published?: boolean;
  display_order: number;
};

export type Enrollment = {
  status: "interested" | "active" | "completed";
};
