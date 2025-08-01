import React from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import { ThemedText } from '../ui/themed-view';
import { SpotifyTrack } from '../../services/auth/spotify-auth';

interface TrackCardProps {
  track: SpotifyTrack;
  onPress: (track: SpotifyTrack) => void;
  onPreviewPress?: (track: SpotifyTrack) => void;
  showPreview?: boolean;
}

export function TrackCard({
  track,
  onPress,
  onPreviewPress,
  showPreview = true,
}: TrackCardProps) {
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
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
      onPress={() => onPress(track)}
      activeOpacity={0.8}
    >
      <View style={{ position: 'relative' }}>
        <Image
          source={{
            uri:
              track.album?.images?.[1]?.url ||
              track.album?.images?.[0]?.url ||
              'https://via.placeholder.com/120x120/333/fff?text=♪',
          }}
          style={{
            width: 116,
            height: 116,
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
        {showPreview && onPreviewPress && (
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
              onPreviewPress(track);
            }}
          >
            <Ionicons
              name={track.preview_url ? 'play' : 'musical-note-outline'}
              size={16}
              color="white"
            />
          </TouchableOpacity>
        )}
      </View>

      <ThemedText
        style={{ fontSize: 14, fontWeight: '600', marginBottom: 2 }}
        numberOfLines={2}
      >
        {track.name}
      </ThemedText>

      <ThemedText style={{ fontSize: 12, opacity: 0.7 }} numberOfLines={1}>
        {track.artists.map(a => a.name).join(', ')}
      </ThemedText>

      {!track.preview_url && (
        <ThemedText style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>
          No preview
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}
