import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

// Spotify OAuth scopes for playlist access
const SPOTIFY_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-read-recently-played',
  'streaming',
].join(' ');

const redirectUri = 'com.owlee.app://auth/spotify';

export type SpotifyTrack = {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  preview_url: string | null;
  external_urls: { spotify: string };
  duration_ms: number;
  album?: {
    id: string;
    name: string;
    images: Array<{ url: string; width?: number; height?: number }>;
  };
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  tracks: {
    total: number;
    items: Array<{ track: SpotifyTrack }>;
  };
  images: Array<{ url: string; width: number; height: number }>;
};

export type SpotifyAuthResult = {
  accessToken: string;
  expiresIn: number;
};

class SpotifyAuthService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  async authenticate(): Promise<SpotifyAuthResult> {
    if (!SPOTIFY_CLIENT_ID) {
      throw new Error('Spotify Client ID is not configured');
    }

    // Use Authorization Code Flow with PKCE for mobile apps
    const request = new AuthSession.AuthRequest({
      clientId: SPOTIFY_CLIENT_ID,
      scopes: SPOTIFY_SCOPES.split(' '),
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true, // Enable PKCE for security
      extraParams: {},
    });

    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.spotify.com/authorize',
    });

    console.log('🎵 Spotify auth result:', JSON.stringify(result, null, 2));

    if (result.type === 'success' && 'params' in result && result.params.code) {
      console.log('🎵 Spotify auth successful, code received');
      return this.exchangeCodeForToken(result.params.code, request);
    }

    console.error('🎵 Spotify auth failed. Result type:', result.type, 'Params:', 'params' in result ? result.params : 'No params');
    throw new Error(`Spotify authentication failed: ${result.type}`);
  }

  private async exchangeCodeForToken(code: string, request: AuthSession.AuthRequest): Promise<SpotifyAuthResult> {
    const tokenEndpoint = 'https://accounts.spotify.com/api/token';
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: SPOTIFY_CLIENT_ID!,
      code_verifier: request.codeVerifier!, // PKCE code verifier
    });

    console.log('🎵 Exchanging code for token...');

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎵 Token exchange failed:', response.status, errorText);
      throw new Error(`Failed to exchange code for token: ${response.status}`);
    }

    const data = await response.json();
    console.log('🎵 Token exchange successful');
    
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000);

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }

  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    await this.ensureValidToken();
    
    const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user playlists');
    }

    const data = await response.json();
    return data.items;
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track(id,name,artists,preview_url,external_urls,duration_ms))&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎵 Failed to fetch playlist tracks:', response.status, errorText);
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }

    const data = await response.json();
    console.log('🎵 Raw playlist data:', JSON.stringify(data, null, 2));
    
    const allTracks = data.items.map((item: any) => item.track).filter((track: any) => track && track.id);
    const tracksWithPreview = allTracks.filter((track: any) => track.preview_url);
    
    console.log(`🎵 Total tracks: ${allTracks.length}, with preview: ${tracksWithPreview.length}`);
    
    // Return all tracks for now, we'll handle preview_url in UI
    return allTracks;
  }

  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();
    
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search tracks');
    }

    const data = await response.json();
    console.log(`🎵 Search found ${data.tracks.items.length} tracks`);
    
    const allTracks = data.tracks.items.filter((track: SpotifyTrack) => track && track.id);
    const tracksWithPreview = allTracks.filter((track: SpotifyTrack) => track.preview_url);
    
    console.log(`🎵 Search: Total tracks: ${allTracks.length}, with preview: ${tracksWithPreview.length}`);
    
    // Return all tracks for now, we'll handle preview_url in UI
    return allTracks;
  }

  async getUserRecentlyPlayed(limit: number = 10): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎵 Failed to fetch recently played tracks:', response.status, errorText);
      throw new Error(`Failed to fetch recently played tracks: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🎵 Recently played: ${data.items.length} tracks`);
    
    // Extract tracks from recently played items
    const tracks = data.items.map((item: any) => item.track).filter((track: any) => track && track.id);
    
    return tracks;
  }

  async getUserSavedTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();
    
    const response = await fetch(
      `https://api.spotify.com/v1/me/tracks?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎵 Failed to fetch saved tracks:', response.status, errorText);
      throw new Error(`Failed to fetch saved tracks: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🎵 Saved tracks: ${data.items.length} tracks`);
    
    // Extract tracks from saved items
    const tracks = data.items.map((item: any) => item.track).filter((track: any) => track && track.id);
    
    return tracks;
  }

  async getRecommendations(limit: number = 20): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();
    
    // Get recommendations based on user's top tracks and current popular genres
    const response = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=${limit}&seed_genres=pop,electronic,hip-hop`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎵 Failed to fetch recommendations:', response.status, errorText);
      throw new Error(`Failed to fetch recommendations: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🎵 Recommendations: ${data.tracks.length} tracks`);
    
    const tracks = data.tracks.filter((track: SpotifyTrack) => track && track.id);
    
    return tracks;
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      throw new Error('No valid token available. Please authenticate again.');
    }
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && this.tokenExpiry !== null && Date.now() < this.tokenExpiry;
  }

  logout(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}

export const spotifyAuth = new SpotifyAuthService();