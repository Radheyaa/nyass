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
  display_order: number;
};

export type Enrollment = {
  status: "interested" | "active" | "completed";
};
