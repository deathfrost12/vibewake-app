import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/theme-context';
import { ThemedView, ThemedText, ThemedCard } from '../ui/themed-view';
import { AudioManager } from '../../services/audio/AudioManager';
import { AudioTrack } from '../../services/audio/types';
import { SoundLibrary, PredefinedSound } from '../../services/audio/SoundLibrary';
import { FileUploadService, UploadedAudioFile } from '../../services/audio/FileUploadService';
import { spotifyAuth, SpotifyTrack, SpotifyPlaylist } from '../../services/auth/spotify-auth';
import { getSelectedSpotifyTrack, clearSelectedSpotifyTrack } from '../../app/alarms/spotify-selector';

export interface AudioPickerProps {
  selectedAudio?: AudioTrack;
  onAudioSelect: (audio: AudioTrack) => void;
  className?: string;
}

type TabType = 'predefined' | 'files' | 'spotify';

export function AudioPicker({ selectedAudio, onAudioSelect, className }: AudioPickerProps) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('predefined');
  const [predefinedSounds] = useState<PredefinedSound[]>(SoundLibrary.getAllSounds());
  const [predefinedTracks, setPredefinedTracks] = useState<AudioTrack[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedAudioFile[]>([]);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isPlayingRef = useRef<string | null>(null);
  
  // Spotify state
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [isSpotifyLoading, setIsSpotifyLoading] = useState(false);
  const [spotifySearchQuery, setSpotifySearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    initializeServices();
    loadUploadedFiles();
    
    // Check for selected Spotify track when component mounts/updates
    const selectedTrack = getSelectedSpotifyTrack();
    if (selectedTrack) {
      const audioTrack: AudioTrack = {
        id: selectedTrack.id,
        name: selectedTrack.name,
        uri: selectedTrack.external_urls.spotify,
        type: 'spotify',
        duration: Math.floor(selectedTrack.duration_ms / 1000),
      };
      
      onAudioSelect(audioTrack);
      clearSelectedSpotifyTrack();
    }
    loadPredefinedTracks();
    checkSpotifyAuth();
  }, []);

  // Handle returning from Spotify selector
  useFocusEffect(
    useCallback(() => {
      const selectedTrack = getSelectedSpotifyTrack();
      if (selectedTrack) {
        const audioTrack: AudioTrack = {
          id: selectedTrack.id,
          name: selectedTrack.name,
          uri: selectedTrack.external_urls.spotify,
          type: 'spotify',
          duration: Math.floor(selectedTrack.duration_ms / 1000),
        };
        
        onAudioSelect(audioTrack);
        clearSelectedSpotifyTrack();
      }
    }, [onAudioSelect])
  );

  const checkSpotifyAuth = () => {
    setIsSpotifyAuthenticated(spotifyAuth.isAuthenticated());
  };

  const loadPredefinedTracks = async () => {
    try {
      const tracks = await SoundLibrary.convertAllToAudioTracks();
      setPredefinedTracks(tracks);
    } catch (error) {
      console.error('Failed to load predefined tracks:', error);
    }
  };

  // Update ref when isPlaying changes
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  
  useEffect(() => {
    // Setup audio manager status listener - only run once on mount
    const handlePlaybackStatus = (status: any) => {
      if (!status.isPlaying && isPlayingRef.current) {
        setIsPlaying(null);
      }
    };

    AudioManager.addPlaybackStatusListener(handlePlaybackStatus);
    return () => {
      AudioManager.removePlaybackStatusListener(handlePlaybackStatus);
      AudioManager.unloadAudio(); // Clean up when component unmounts
    };
  }, []); // Empty dependency array - run only on mount/unmount

  useEffect(() => {
    // Handle search timeout cleanup separately
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const initializeServices = async () => {
    try {
      await AudioManager.initialize();
      await FileUploadService.initialize();
    } catch (error) {
      console.error('Failed to initialize audio services:', error);
      Alert.alert('Error', 'Failed to initialize audio services');
    }
  };

  const loadUploadedFiles = async () => {
    try {
      const files = await FileUploadService.getUploadedFiles();
      setUploadedFiles(files);
    } catch (error) {
      console.error('Failed to load uploaded files:', error);
    }
  };

  const handlePreviewAudio = async (track: AudioTrack) => {
    try {
      console.log('🎵 Preview audio clicked:', track);
      
      if (isPlaying === track.id) {
        // Stop current playback
        console.log('🎵 Stopping current playback');
        await AudioManager.stopAsync();
        setIsPlaying(null);
        return;
      }

      // Stop any currently playing audio
      if (isPlaying) {
        console.log('🎵 Stopping previous audio');
        await AudioManager.stopAsync();
      }

      setIsLoading(true);
      setIsPlaying(track.id);
      console.log('🎵 Loading audio:', track.uri);

      await AudioManager.loadAudio(track);
      console.log('🎵 Playing audio');
      await AudioManager.playAsync();
      
      // Auto-stop after 10 seconds (preview)
      setTimeout(async () => {
        try {
          await AudioManager.stopAsync();
          setIsPlaying(null);
        } catch (error) {
          console.error('Failed to stop preview:', error);
        }
      }, 10000);

    } catch (error) {
      console.error('Failed to preview audio:', error);
      Alert.alert('Error', 'Failed to play audio preview');
      setIsPlaying(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAudio = async (track: AudioTrack) => {
    // Stop any current playback
    if (isPlaying) {
      await AudioManager.stopAsync();
      setIsPlaying(null);
    }
    
    onAudioSelect(track);
  };

  const handleFileUpload = async () => {
    try {
      setIsUploading(true);
      const uploadedFile = await FileUploadService.pickAndUploadAudioFile();
      
      if (uploadedFile) {
        await loadUploadedFiles(); // Refresh the list
        const audioTrack = FileUploadService.convertToAudioTrack(uploadedFile);
        onAudioSelect(audioTrack);
        Alert.alert('Success', `Audio file "${uploadedFile.originalName}" uploaded successfully!`);
      }
    } catch (error: any) {
      console.error('Failed to upload file:', error);
      Alert.alert('Upload Error', error.message || 'Failed to upload audio file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    Alert.alert(
      'Delete Audio File',
      'Are you sure you want to delete this audio file?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileUploadService.deleteUploadedFile(fileId);
              await loadUploadedFiles();
              
              // If deleted file was selected, clear selection
              if (selectedAudio?.id === fileId && predefinedTracks.length > 0) {
                onAudioSelect(predefinedTracks[0]);
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete file');
            }
          }
        }
      ]
    );
  };

  const renderTabButton = (tab: TabType, label: string, icon: string, count?: number) => (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: activeTab === tab 
          ? (isDark ? '#1A2626' : '#F1F5F9')
          : 'transparent',
        borderRadius: 8,
        marginHorizontal: 4,
      }}
      onPress={() => setActiveTab(tab)}
    >
      <View style={{ alignItems: 'center' }}>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={activeTab === tab ? '#5CFFF0' : (isDark ? '#A8B4B6' : '#64748B')} 
        />
        <Text style={{ 
          fontSize: 12, 
          marginTop: 4, 
          color: activeTab === tab ? '#5CFFF0' : (isDark ? '#A8B4B6' : '#64748B'),
          fontWeight: activeTab === tab ? '600' : '400'
        }}>
          {label}
        </Text>
        {count !== undefined && (
          <Text style={{ 
            fontSize: 10, 
            color: isDark ? '#6B7280' : '#9CA3AF',
            marginTop: 2
          }}>
            {count}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderPredefinedSounds = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ gap: 12 }}>
        {predefinedTracks.map((track, index) => {
          const sound = predefinedSounds[index];
          const isSelected = selectedAudio?.id === track.id;
          const isCurrentlyPlaying = isPlaying === track.id;
          
          if (!sound) return null;
          
          return (
            <ThemedCard 
              key={sound.id}
              style={{ 
                padding: 16, 
                borderRadius: 12,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? '#5CFFF0' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              }}
            >
              <TouchableOpacity onPress={() => handleSelectAudio(track)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{sound.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                        {sound.name}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        {sound.description}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handlePreviewAudio(track)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: isDark ? '#2D3F3F' : '#E2E8F0',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isLoading && isCurrentlyPlaying ? (
                        <ActivityIndicator size="small" color="#5CFFF0" />
                      ) : (
                        <Ionicons 
                          name={isCurrentlyPlaying ? 'stop' : 'play'} 
                          size={16} 
                          color="#5CFFF0" 
                        />
                      )}
                    </TouchableOpacity>
                    
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#5CFFF0" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </ThemedCard>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderUploadedFiles = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={{ gap: 12 }}>
        {/* Upload Button */}
        <TouchableOpacity onPress={handleFileUpload} disabled={isUploading}>
          <ThemedCard style={{ 
            padding: 16, 
            borderRadius: 12,
            borderStyle: 'dashed',
            borderColor: '#5CFFF0',
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 80,
          }}>
            {isUploading ? (
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#5CFFF0" />
                <ThemedText style={{ marginTop: 8, fontSize: 14 }}>Uploading...</ThemedText>
              </View>
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Ionicons name="cloud-upload" size={24} color="#5CFFF0" />
                <ThemedText style={{ marginTop: 8, fontSize: 14, fontWeight: '600' }}>
                  Upload Audio File
                </ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                  MP3, M4A, WAV, AAC (Max 50MB)
                </ThemedText>
              </View>
            )}
          </ThemedCard>
        </TouchableOpacity>

        {/* Uploaded Files */}
        {uploadedFiles.map((file) => {
          const track = FileUploadService.convertToAudioTrack(file);
          const isSelected = selectedAudio?.id === track.id;
          const isCurrentlyPlaying = isPlaying === track.id;
          
          return (
            <ThemedCard 
              key={file.id}
              style={{ 
                padding: 16, 
                borderRadius: 12,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? '#5CFFF0' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              }}
            >
              <TouchableOpacity onPress={() => handleSelectAudio(track)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="musical-notes" size={24} color="#66F0FF" style={{ marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                        {file.originalName}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>
                        {(file.size / (1024 * 1024)).toFixed(1)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                      </ThemedText>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handlePreviewAudio(track)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isDark ? '#2D3F3F' : '#E2E8F0',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isLoading && isCurrentlyPlaying ? (
                        <ActivityIndicator size="small" color="#5CFFF0" />
                      ) : (
                        <Ionicons 
                          name={isCurrentlyPlaying ? 'stop' : 'play'} 
                          size={14} 
                          color="#5CFFF0" 
                        />
                      )}
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => handleDeleteFile(file.id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: isDark ? '#2D1F1F' : '#FEE2E2',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name="trash" size={14} color="#EF4444" />
                    </TouchableOpacity>
                    
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color="#5CFFF0" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </ThemedCard>
          );
        })}

        {uploadedFiles.length === 0 && !isUploading && (
          <ThemedCard style={{ padding: 24, alignItems: 'center', borderRadius: 12 }}>
            <Ionicons name="folder-open" size={32} color={isDark ? '#6B7280' : '#9CA3AF'} />
            <ThemedText style={{ marginTop: 12, textAlign: 'center', opacity: 0.7 }}>
              No uploaded files yet
            </ThemedText>
            <ThemedText style={{ fontSize: 12, textAlign: 'center', opacity: 0.5, marginTop: 4 }}>
              Upload your own audio files to use as alarm sounds
            </ThemedText>
          </ThemedCard>
        )}
      </View>
    </ScrollView>
  );

  // Spotify functions
  const handleSpotifyLogin = async () => {
    try {
      setIsSpotifyLoading(true);
      await spotifyAuth.authenticate();
      setIsSpotifyAuthenticated(true);
      
      // Navigate to Spotify selector screen
      router.push('/alarms/spotify-selector');
    } catch (error: any) {
      console.error('Spotify authentication failed:', error);
      Alert.alert('Spotify Login Failed', error.message || 'Unable to connect to Spotify');
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  const loadSpotifyPlaylists = async () => {
    try {
      setIsSpotifyLoading(true);
      const playlists = await spotifyAuth.getUserPlaylists();
      setSpotifyPlaylists(playlists);
    } catch (error: any) {
      console.error('Failed to load Spotify playlists:', error);
      Alert.alert('Error', 'Failed to load your Spotify playlists');
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  const handlePlaylistSelect = async (playlist: SpotifyPlaylist) => {
    console.log('🎵 Playlist selected:', playlist.name, playlist.id);
    try {
      setIsSpotifyLoading(true);
      setSelectedPlaylist(playlist);
      setSpotifySearchQuery(''); // Clear search when selecting playlist
      console.log('🎵 Loading tracks for playlist:', playlist.id);
      const tracks = await spotifyAuth.getPlaylistTracks(playlist.id);
      console.log('🎵 Loaded', tracks.length, 'tracks from playlist');
      setSpotifyTracks(tracks);
    } catch (error: any) {
      console.error('🎵 Failed to load playlist tracks:', error);
      Alert.alert('Error', 'Failed to load playlist tracks');
    } finally {
      setIsSpotifyLoading(false);
    }
  };

  const handleSpotifySearch = (query: string) => {
    setSpotifySearchQuery(query); // Set immediately for UI responsiveness
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (!query.trim()) {
      setSpotifyTracks([]);
      setSelectedPlaylist(null);
      return;
    }

    // Debounce search by 500ms
    const timeout = setTimeout(async () => {
      try {
        setIsSpotifyLoading(true);
        const tracks = await spotifyAuth.searchTracks(query);
        setSpotifyTracks(tracks);
        setSelectedPlaylist(null);
      } catch (error: any) {
        console.error('Spotify search failed:', error);
        Alert.alert('Search Error', 'Failed to search Spotify tracks');
      } finally {
        setIsSpotifyLoading(false);
      }
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const convertSpotifyToAudioTrack = (spotifyTrack: SpotifyTrack): AudioTrack => ({
    id: `spotify-${spotifyTrack.id}`,
    name: `${spotifyTrack.name} - ${spotifyTrack.artists.map(a => a.name).join(', ')}`,
    uri: spotifyTrack.preview_url || spotifyTrack.external_urls.spotify, // Fallback to Spotify URL
    type: 'spotify',
    duration: spotifyTrack.duration_ms,
  });

  const handleSpotifyLogout = () => {
    spotifyAuth.logout();
    setIsSpotifyAuthenticated(false);
    setSpotifyPlaylists([]);
    setSpotifyTracks([]);
    setSelectedPlaylist(null);
    setSpotifySearchQuery('');
  };

  const renderSpotifyTab = () => {
    if (!isSpotifyAuthenticated) {
      return (
        <ThemedCard style={{ padding: 24, alignItems: 'center', borderRadius: 12 }}>
          <Ionicons name="musical-note" size={48} color="#1DB954" />
          <ThemedText style={{ marginTop: 16, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
            Connect to Spotify
          </ThemedText>
          <ThemedText style={{ fontSize: 14, opacity: 0.7, marginTop: 8, textAlign: 'center' }}>
            Access your Spotify playlists and use preview tracks as alarm sounds
          </ThemedText>
          <TouchableOpacity
            style={{
              marginTop: 16,
              backgroundColor: '#1DB954',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
            onPress={handleSpotifyLogin}
            disabled={isSpotifyLoading}
          >
            {isSpotifyLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '600' }}>Connect Spotify</Text>
            )}
          </TouchableOpacity>
        </ThemedCard>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ gap: 16 }}>
          {/* Header with logout */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>
              🎵 Spotify
            </ThemedText>
            <TouchableOpacity onPress={handleSpotifyLogout}>
              <ThemedText style={{ fontSize: 14, color: '#EF4444' }}>Logout</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            placeholder="Search tracks..."
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            value={spotifySearchQuery}
            onChangeText={handleSpotifySearch}
            style={{
              backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
              color: isDark ? '#F9FAFB' : '#1F2937',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              fontSize: 16,
            }}
          />

          {/* Loading state */}
          {isSpotifyLoading && (
            <View style={{ alignItems: 'center', padding: 20 }}>
              <ActivityIndicator size="large" color="#1DB954" />
              <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>Loading...</ThemedText>
            </View>
          )}

          {/* Playlists (when no search) */}
          {!spotifySearchQuery && !isSpotifyLoading && (
            <View>
              <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                Your Playlists
              </ThemedText>
              {spotifyPlaylists.map((playlist) => (
                <TouchableOpacity
                  key={playlist.id}
                  onPress={() => handlePlaylistSelect(playlist)}
                >
                  <ThemedCard style={{ 
                    padding: 16, 
                    marginBottom: 8, 
                    borderRadius: 8,
                    backgroundColor: selectedPlaylist?.id === playlist.id 
                      ? (isDark ? '#1F2937' : '#F3F4F6') 
                      : undefined
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="list" size={20} color="#1DB954" />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <ThemedText style={{ fontWeight: '600', fontSize: 14 }}>
                          {playlist.name}
                        </ThemedText>
                        <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                          {playlist.tracks.total} tracks
                        </ThemedText>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={isDark ? '#6B7280' : '#9CA3AF'} />
                    </View>
                  </ThemedCard>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tracks */}
          {spotifyTracks.length > 0 && !isSpotifyLoading && (
            <View>
              <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                {selectedPlaylist ? `${selectedPlaylist.name} Tracks` : 'Search Results'}
              </ThemedText>
              {spotifyTracks.map((track) => {
                const audioTrack = convertSpotifyToAudioTrack(track);
                const isSelected = selectedAudio?.id === audioTrack.id;
                const isCurrentlyPlaying = isPlaying === audioTrack.id;
                
                return (
                  <ThemedCard 
                    key={track.id}
                    style={{ 
                      padding: 16, 
                      marginBottom: 8,
                      borderRadius: 8,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#1DB954' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                    }}
                  >
                    <TouchableOpacity onPress={() => handleSelectAudio(audioTrack)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                          <Ionicons name="musical-note" size={20} color="#1DB954" style={{ marginRight: 12 }} />
                          <View style={{ flex: 1 }}>
                            <ThemedText style={{ fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                              {track.name}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 12, opacity: 0.7 }} numberOfLines={1}>
                              {track.artists.map(a => a.name).join(', ')}
                              {!track.preview_url && ' • No preview'}
                            </ThemedText>
                          </View>
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity
                            onPress={track.preview_url ? () => handlePreviewAudio(audioTrack) : undefined}
                            disabled={!track.preview_url}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: !track.preview_url 
                                ? (isDark ? '#374151' : '#F3F4F6')
                                : (isDark ? '#2D3F3F' : '#E2E8F0'),
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: !track.preview_url ? 0.5 : 1,
                            }}
                          >
                            {!track.preview_url ? (
                              <Ionicons 
                                name="musical-note-outline" 
                                size={14} 
                                color={isDark ? '#6B7280' : '#9CA3AF'} 
                              />
                            ) : isLoading && isCurrentlyPlaying ? (
                              <ActivityIndicator size="small" color="#1DB954" />
                            ) : (
                              <Ionicons 
                                name={isCurrentlyPlaying ? 'stop' : 'play'} 
                                size={14} 
                                color="#1DB954" 
                              />
                            )}
                          </TouchableOpacity>
                          
                          {isSelected && (
                            <Ionicons name="checkmark-circle" size={20} color="#1DB954" />
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </ThemedCard>
                );
              })}
            </View>
          )}

          {/* Empty state */}
          {!isSpotifyLoading && spotifyTracks.length === 0 && spotifySearchQuery && (
            <ThemedCard style={{ padding: 24, alignItems: 'center', borderRadius: 12 }}>
              <Ionicons name="search" size={32} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <ThemedText style={{ marginTop: 12, textAlign: 'center', opacity: 0.7 }}>
                No tracks found
              </ThemedText>
              <ThemedText style={{ fontSize: 12, textAlign: 'center', opacity: 0.5, marginTop: 4 }}>
                Try searching for different keywords
              </ThemedText>
            </ThemedCard>
          )}

          {/* Empty playlists state */}
          {!isSpotifyLoading && spotifyPlaylists.length === 0 && !spotifySearchQuery && (
            <ThemedCard style={{ padding: 24, alignItems: 'center', borderRadius: 12 }}>
              <Ionicons name="list" size={32} color={isDark ? '#6B7280' : '#9CA3AF'} />
              <ThemedText style={{ marginTop: 12, textAlign: 'center', opacity: 0.7 }}>
                No playlists found
              </ThemedText>
              <ThemedText style={{ fontSize: 12, textAlign: 'center', opacity: 0.5, marginTop: 4 }}>
                Create some playlists in Spotify first
              </ThemedText>
            </ThemedCard>
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }} className={className}>
      {/* Tab Navigation */}
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: isDark ? '#0D1A1A' : '#F8FAFC', 
        borderRadius: 12, 
        padding: 4, 
        marginBottom: 16 
      }}>
        {renderTabButton('predefined', 'Sounds', 'musical-notes', predefinedTracks.length)}
        {renderTabButton('files', 'Files', 'folder', uploadedFiles.length)}
        {renderTabButton('spotify', 'Spotify', 'musical-note')}
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'predefined' && renderPredefinedSounds()}
        {activeTab === 'files' && renderUploadedFiles()}
        {activeTab === 'spotify' && renderSpotifyTab()}
      </View>
    </ThemedView>
  );
}