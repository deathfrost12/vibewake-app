import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import {
  ThemedView,
  ThemedText,
  ThemedCard,
} from '../../components/ui/themed-view';
import {
  spotifyAuth,
  SpotifyTrack,
  SpotifyPlaylist,
} from '../../services/auth/spotify-auth';
import { AudioTrack } from '../../services/audio/types';
import { TrackCard } from '../../components/spotify/TrackCard';

// Global state for selected track (simple solution)
let selectedSpotifyTrack: SpotifyTrack | null = null;

export const getSelectedSpotifyTrack = () => selectedSpotifyTrack;
export const clearSelectedSpotifyTrack = () => {
  selectedSpotifyTrack = null;
};

export default function SpotifySelectorScreen() {
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Content state
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyTrack[]>([]);
  const [savedTracks, setSavedTracks] = useState<SpotifyTrack[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([]);

  // Loading states
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);

  // Audio preview state
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  useEffect(() => {
    loadInitialContent();
  }, []);

  const loadInitialContent = async () => {
    try {
      // Load all content in parallel
      await Promise.all([
        loadRecentlyPlayed(),
        loadSavedTracks(),
        loadUserPlaylists(),
        loadRecommendations(),
      ]);
    } catch (error) {
      console.error('🎵 Failed to load initial content:', error);
      Alert.alert('Error', 'Failed to load Spotify content. Please try again.');
    }
  };

  const loadRecentlyPlayed = async () => {
    setIsLoadingRecent(true);
    try {
      const tracks = await spotifyAuth.getUserRecentlyPlayed(10);
      setRecentlyPlayed(tracks);
    } catch (error) {
      console.error('🎵 Failed to load recently played:', error);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  const loadSavedTracks = async () => {
    setIsLoadingSaved(true);
    try {
      const tracks = await spotifyAuth.getUserSavedTracks(20);
      setSavedTracks(tracks);
    } catch (error) {
      console.error('🎵 Failed to load saved tracks:', error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const loadUserPlaylists = async () => {
    setIsLoadingPlaylists(true);
    try {
      const playlists = await spotifyAuth.getUserPlaylists();
      setUserPlaylists(playlists);
    } catch (error) {
      console.error('🎵 Failed to load user playlists:', error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  const loadRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const tracks = await spotifyAuth.getRecommendations(20);
      setRecommendations(tracks);
    } catch (error) {
      console.error('🎵 Failed to load recommendations:', error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const results = await spotifyAuth.searchTracks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('🎵 Search failed:', error);
      Alert.alert('Search Error', 'Failed to search tracks. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    // Store selected track globally
    selectedSpotifyTrack = track;

    // Navigate back with selected track
    router.back();
  };

  const renderTrackItem = ({ item }: { item: SpotifyTrack }) => (
    <TrackCard
      track={item}
      onPress={handleTrackSelect}
      onPreviewPress={track => {
        // TODO: Implement preview playback
        console.log('🎵 Preview track:', track.name);
      }}
    />
  );

  const renderPlaylistItem = ({ item }: { item: SpotifyPlaylist }) => (
    <TouchableOpacity
      style={{
        width: 140,
        backgroundColor: theme.elevated,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => {
        // TODO: Navigate to playlist tracks or handle playlist selection
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item.images?.[0]?.url ||
            'https://via.placeholder.com/120x120/333/fff?text=Playlist',
        }}
        style={{
          width: 116,
          height: 116,
          borderRadius: 8,
          marginBottom: 8,
        }}
      />
      <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 2 }} numberOfLines={2}>
        {item.name}
      </ThemedText>
      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
        {item.tracks.total} tracks
      </ThemedText>
    </TouchableOpacity>
  );

  const renderRecentlyPlayedItem = ({ item }: { item: SpotifyTrack }) => (
    <TouchableOpacity
      style={{
        width: 140,
        backgroundColor: theme.elevated,
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => handleTrackSelect(item)}
      activeOpacity={0.8}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{
            uri:
              item.album?.images?.[1]?.url ||
              item.album?.images?.[0]?.url ||
              'https://via.placeholder.com/120x120/333/fff?text=♪',
          }}
          style={{
            width: 116,
            height: 116,
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: 16,
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={e => {
            e.stopPropagation();
            console.log('🎵 Preview track:', item.name);
          }}
        >
          <Ionicons 
            name={item.preview_url ? "play" : "musical-note-outline"} 
            size={16} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
      <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 2 }} numberOfLines={2}>
        {item.name}
      </ThemedText>
      
      <ThemedText style={{ fontSize: 12, opacity: 0.7 }} numberOfLines={1}>
        {item.artists[0]?.name}
      </ThemedText>
      
      {!item.preview_url && (
        <ThemedText style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>
          No preview
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, isLoading: boolean = false) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 24,
      }}
    >
      <ThemedText style={{ fontSize: 20, fontWeight: 'bold', flex: 1 }}>
        {title}
      </ThemedText>
      {isLoading && (
        <ActivityIndicator size="small" color={APP_COLORS.primary} />
      )}
    </View>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={APP_COLORS.success}
            />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.elevated,
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
            }}
          >
            <Ionicons
              name="search"
              size={20}
              color={theme.text.muted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={{
                flex: 1,
                fontSize: 16,
                color: theme.text.primary,
              }}
              placeholder="Search"
              placeholderTextColor={theme.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={APP_COLORS.primary} />
            )}
          </View>
        </View>

        <FlatList
          data={[]}
          renderItem={() => null}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          ListHeaderComponent={() => (
            <>
              {/* Results Section */}
              {searchQuery ? (
                <>
                  {renderSectionHeader('Results', isSearching)}
                  {searchResults.length > 0 ? (
                    <FlatList
                      data={searchResults}
                      renderItem={renderTrackItem}
                      keyExtractor={item => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      ItemSeparatorComponent={() => <View style={{width: 16}} />}
                      contentContainerStyle={{paddingHorizontal: 4, paddingBottom: 8}}
                    />
                  ) : !isSearching ? (
                    <ThemedText
                      style={{
                        textAlign: 'center',
                        opacity: 0.7,
                        marginBottom: 24,
                      }}
                    >
                      No results found for "{searchQuery}"
                    </ThemedText>
                  ) : null}
                </>
              ) : (
                <>
                  {renderSectionHeader('Recommended', isLoadingRecommendations)}
                  {recommendations.length > 0 ? (
                    <FlatList
                      data={recommendations.slice(0, 10)}
                      renderItem={renderTrackItem}
                      keyExtractor={item => item.id}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      ItemSeparatorComponent={() => <View style={{width: 16}} />}
                      contentContainerStyle={{paddingHorizontal: 4, paddingBottom: 8}}
                    />
                  ) : null}
                </>
              )}

              {/* Recently Played Section */}
              {renderSectionHeader('Recently Played', isLoadingRecent)}
              {recentlyPlayed.length > 0 ? (
                <FlatList
                  data={recentlyPlayed}
                  renderItem={renderRecentlyPlayedItem}
                  keyExtractor={(item, index) => `${item.id}-${index}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 8 }}
                />
              ) : (
                <ThemedText
                  style={{
                    textAlign: 'center',
                    opacity: 0.7,
                    marginBottom: 16,
                  }}
                >
                  No recently played tracks
                </ThemedText>
              )}

              {/* Songs Section (Saved Tracks) */}
              {renderSectionHeader('Songs', isLoadingSaved)}
              {savedTracks.length > 0 ? (
                <FlatList
                  data={savedTracks.slice(0, 15)}
                  renderItem={renderTrackItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{width: 12}} />}
                  contentContainerStyle={{paddingHorizontal: 4, paddingBottom: 8}}
                />
              ) : (
                <ThemedText
                  style={{
                    textAlign: 'center',
                    opacity: 0.7,
                    marginBottom: 16,
                  }}
                >
                  No saved tracks
                </ThemedText>
              )}

              {/* Your Playlists Section */}
              {renderSectionHeader('Your Playlists', isLoadingPlaylists)}
              {userPlaylists.length > 0 ? (
                <FlatList
                  data={userPlaylists}
                  renderItem={renderPlaylistItem}
                  keyExtractor={item => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{width: 12}} />}
                  contentContainerStyle={{paddingHorizontal: 4, paddingBottom: 8}}
                />
              ) : (
                <ThemedText
                  style={{
                    textAlign: 'center',
                    opacity: 0.7,
                    marginBottom: 16,
                  }}
                >
                  No playlists found
                </ThemedText>
              )}

              {/* Bottom padding */}
              <View style={{ height: 40 }} />
            </>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}
