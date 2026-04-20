export interface Content {
  id: string;
  title: string;
  description: string | null;
  genre: string[];
  poster_url: string | null;
  banner_url: string | null;
  created_at: string;
}

export interface Episode {
  id: string;
  content_id: string;
  episode_number: number;
  title: string;
  gdrive_url: string;
  is_vip: boolean;
  created_at: string;
}
