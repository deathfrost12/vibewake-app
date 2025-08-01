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

export function TrackCard({ track, onPress, onPreviewPress, showPreview = true }: TrackCardProps) {
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
        flexDirection: 'row',
        padding: 12,
        backgroundColor: theme.elevated,
        borderRadius: 8,
        marginBottom: 8,
        alignItems: 'center',
      }}
      onPress={() => onPress(track)}
      activeOpacity={0.8}
    >
      <Image
        source={{ 
          uri: track.album?.images?.[2]?.url || track.album?.images?.[0]?.url || 'https://via.placeholder.com/64x64/333/fff?text=♪'
        }}
        style={{ width: 48, height: 48, borderRadius: 4 }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ThemedText style={{ fontSize: 16, fontWeight: '600' }} numberOfLines={1}>
          {track.name}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, opacity: 0.7, marginTop: 2 }} numberOfLines={1}>
          {track.artists.map(a => a.name).join(', ')}
        </ThemedText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>
          {formatDuration(track.duration_ms)}
        </ThemedText>
        {showPreview && track.preview_url && onPreviewPress && (
          <TouchableOpacity
            style={{ marginTop: 4, padding: 4 }}
            onPress={(e) => {
              e.stopPropagation();
              onPreviewPress(track);
            }}
          >
            <Ionicons name="play-circle" size={20} color={APP_COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}