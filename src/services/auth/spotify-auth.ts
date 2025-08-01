import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const SPOTIFY_CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;

// Spotify OAuth scopes for playlist access and Web Playback SDK
const SPOTIFY_SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-read-recently-played',
  'streaming',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
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

    console.error(
      '🎵 Spotify auth failed. Result type:',
      result.type,
      'Params:',
      'params' in result ? result.params : 'No params'
    );
    throw new Error(`Spotify authentication failed: ${result.type}`);
  }

  private async exchangeCodeForToken(
    code: string,
    request: AuthSession.AuthRequest
  ): Promise<SpotifyAuthResult> {
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
    this.tokenExpiry = Date.now() + data.expires_in * 1000;

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }

  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    await this.ensureValidToken();

    const response = await fetch(
      'https://api.spotify.com/v1/me/playlists?limit=50',
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

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
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '🎵 Failed to fetch playlist tracks:',
        response.status,
        errorText
      );
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
    }

    const data = await response.json();
    console.log('🎵 Raw playlist data:', JSON.stringify(data, null, 2));

    const allTracks = data.items
      .map((item: any) => item.track)
      .filter((track: any) => track && track.id);
    const tracksWithPreview = allTracks.filter(
      (track: any) => track.preview_url
    );

    console.log(
      `🎵 Total tracks: ${allTracks.length}, with preview: ${tracksWithPreview.length}`
    );

    // Return all tracks for now, we'll handle preview_url in UI
    return allTracks;
  }

  async searchTracks(query: string): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();

    try {
      // Enhanced search strategy for better preview_url success
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=50&market=US`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search tracks');
      }

      const data = await response.json();
      console.log(`🎵 Search found ${data.tracks.items.length} tracks`);

      const allTracks = data.tracks.items.filter(
        (track: SpotifyTrack) => track && track.id
      );

      const tracksWithPreview = allTracks.filter(
        (track: SpotifyTrack) => track.preview_url
      );

      console.log(
        `🎵 Search: Total tracks: ${allTracks.length}, with preview: ${tracksWithPreview.length}`
      );

      // Prioritize tracks with previews, but include others as fallback
      const result = [
        ...tracksWithPreview.slice(0, 15), // Prefer tracks with preview
        ...allTracks.filter((track: any) => !track.preview_url).slice(0, 5), // Add some without preview as fallback
      ].slice(0, 20);

      return result;
    } catch (error) {
      console.error('🎵 Enhanced search failed, trying basic search:', error);

      // Fallback to basic search if enhanced fails
      return this.searchTracksBasic(query);
    }
  }

  private async searchTracksBasic(query: string): Promise<SpotifyTrack[]> {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search tracks');
    }

    const data = await response.json();
    return data.tracks.items.filter((track: SpotifyTrack) => track && track.id);
  }

  async getUserRecentlyPlayed(limit: number = 10): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();

    // Fetch more to increase chance of finding tracks with previews
    const fetchLimit = Math.min(limit * 3, 50);
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${fetchLimit}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '🎵 Failed to fetch recently played tracks:',
        response.status,
        errorText
      );
      throw new Error(
        `Failed to fetch recently played tracks: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(`🎵 Recently played: ${data.items.length} items fetched`);

    // Extract tracks from recently played items
    const allTracks = data.items
      .map((item: any) => item.track)
      .filter((track: any) => track && track.id);

    // Prioritize tracks with preview_url
    const tracksWithPreview = allTracks.filter(
      (track: any) => track.preview_url
    );
    const tracksWithoutPreview = allTracks.filter(
      (track: any) => !track.preview_url
    );

    console.log(
      `🎵 Recently played: ${tracksWithPreview.length} with preview, ${tracksWithoutPreview.length} without`
    );

    // Return prioritized list
    const result = [
      ...tracksWithPreview.slice(0, Math.ceil(limit * 0.8)),
      ...tracksWithoutPreview.slice(0, Math.floor(limit * 0.2)),
    ].slice(0, limit);

    return result;
  }

  async getUserSavedTracks(limit: number = 20): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();

    // Fetch more to increase chance of finding tracks with previews
    const fetchLimit = Math.min(limit * 2, 50);
    const response = await fetch(
      `https://api.spotify.com/v1/me/tracks?limit=${fetchLimit}`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        '🎵 Failed to fetch saved tracks:',
        response.status,
        errorText
      );
      throw new Error(`Failed to fetch saved tracks: ${response.status}`);
    }

    const data = await response.json();
    console.log(`🎵 Saved tracks: ${data.items.length} items fetched`);

    // Extract tracks from saved items
    const allTracks = data.items
      .map((item: any) => item.track)
      .filter((track: any) => track && track.id);

    // Prioritize tracks with preview_url
    const tracksWithPreview = allTracks.filter(
      (track: any) => track.preview_url
    );
    const tracksWithoutPreview = allTracks.filter(
      (track: any) => !track.preview_url
    );

    console.log(
      `🎵 Saved tracks: ${tracksWithPreview.length} with preview, ${tracksWithoutPreview.length} without`
    );

    // Return prioritized list (80% with preview, 20% without)
    const result = [
      ...tracksWithPreview.slice(0, Math.ceil(limit * 0.8)),
      ...tracksWithoutPreview.slice(0, Math.floor(limit * 0.2)),
    ].slice(0, limit);

    return result;
  }

  async getRecommendations(limit: number = 20): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();

    try {
      // Try featured playlists first (replaces deprecated recommendations API)
      console.log('🎵 Getting featured content as recommendations...');
      const featuredTracks = await this.getFeaturedContent(limit);
      if (featuredTracks.length > 0) {
        console.log(`🎵 Featured content: ${featuredTracks.length} tracks`);
        return featuredTracks;
      }
    } catch (error) {
      console.warn('🎵 Featured content failed, trying fallback:', error);
    }

    try {
      // Fallback: combine user's recent + saved tracks as "recommendations"
      console.log('🎵 Using user library as recommendations fallback...');
      const [recentTracks, savedTracks] = await Promise.all([
        this.getUserRecentlyPlayed(10).catch(() => []),
        this.getUserSavedTracks(10).catch(() => []),
      ]);

      // Combine and deduplicate
      const allTracks = [...recentTracks, ...savedTracks];
      const uniqueTracks = allTracks.filter(
        (track, index, arr) => arr.findIndex(t => t.id === track.id) === index
      );

      const result = uniqueTracks.slice(0, limit);
      console.log(`🎵 Fallback recommendations: ${result.length} tracks`);
      return result;
    } catch (error) {
      console.error('🎵 All recommendation methods failed:', error);
      return []; // Return empty array instead of throwing
    }
  }

  async getFeaturedContent(limit: number = 20): Promise<SpotifyTrack[]> {
    await this.ensureValidToken();

    // Get featured playlists
    const response = await fetch(
      'https://api.spotify.com/v1/browse/featured-playlists?limit=5',
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Featured playlists failed: ${response.status}`);
    }

    const data = await response.json();
    const playlists = data.playlists?.items || [];

    if (playlists.length === 0) {
      throw new Error('No featured playlists available');
    }

    // Get tracks from first featured playlist
    const firstPlaylist = playlists[0];
    const tracks = await this.getPlaylistTracks(firstPlaylist.id);

    return tracks.slice(0, limit);
  }

  private async ensureValidToken(): Promise<void> {
    if (
      !this.accessToken ||
      !this.tokenExpiry ||
      Date.now() >= this.tokenExpiry
    ) {
      throw new Error('No valid token available. Please authenticate again.');
    }
  }

  isAuthenticated(): boolean {
    return (
      this.accessToken !== null &&
      this.tokenExpiry !== null &&
      Date.now() < this.tokenExpiry
    );
  }

  getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      return this.accessToken;
    }
    return null;
  }

  logout(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  setToken(accessToken: string, expiresIn: number): void {
    this.accessToken = accessToken;
    this.tokenExpiry = Date.now() + expiresIn * 1000;
    console.log('🎵 Spotify token set manually');
  }
}

export const spotifyAuth = new SpotifyAuthService();
