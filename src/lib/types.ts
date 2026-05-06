export type Category = "anime" | "drama" | "kino" | "multfilm";

export interface Content {
  id: string;
  title: string;
  description: string | null;
  genre: string[];
  poster_url: string | null;
  banner_url: string | null;
  category: Category;
  year: number | null;
  rating: number | null;
  views: number;
  duration: string | null;
  is_trending: boolean;
  is_featured: boolean;
  created_at: string;
}

export type VideoType = "gdrive" | "direct";

export interface Episode {
  id: string;
  content_id: string;
  episode_number: number;
  title: string;
  gdrive_url: string;
  video_url: string | null;
  video_type: VideoType;
  is_vip: boolean;
  early_access_until: string | null;
  server2_url: string | null;
  quality_4k_url: string | null;
  created_at: string;
}

export interface VotingProject {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const CATEGORIES: { value: Category; label: string; path: string }[] = [
  { value: "anime", label: "Anime", path: "/anime" },
  { value: "drama", label: "Drama", path: "/drama" },
  { value: "kino", label: "Kino", path: "/kino" },
  { value: "multfilm", label: "Multfilm", path: "/multfilm" },
];
