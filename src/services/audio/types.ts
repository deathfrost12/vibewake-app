export interface AudioTrack {
  id: string;
  name: string;
  uri: string;
  type: 'predefined' | 'uploaded' | 'spotify';
  duration?: number;
}

export interface PredefinedSound {
  id: string;
  name: string;
  file: string; // Asset module path
}

export interface UploadedAudio {
  id: string;
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  preview_url: string | null;
  external_urls: { spotify: string };
  duration_ms: number;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description?: string;
  tracks: { total: number };
  images?: { url: string }[];
}
