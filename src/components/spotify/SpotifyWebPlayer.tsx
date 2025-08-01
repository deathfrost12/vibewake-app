import React, { useRef, useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import { ThemedView, ThemedText } from '../ui/themed-view';
import { SpotifyTrack, spotifyAuth } from '../../services/auth/spotify-auth';

interface SpotifyWebPlayerProps {
  isVisible: boolean;
  track: SpotifyTrack | null;
  onClose: () => void;
  onPlaybackError: (error: Error) => void;
  accessToken: string;
}

interface PlayerMessage {
  type: 'PLAYER_READY' | 'PLAYER_STATE_CHANGED' | 'PLAYER_ERROR' | 'ERROR' | 'SDK_READY' | 'PLAYBACK_STARTED';
  payload?: any;
  data?: any;
  error?: string;
}

export function SpotifyWebPlayer({ isVisible, track, onClose, onPlaybackError, accessToken }: SpotifyWebPlayerProps) {
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const webViewRef = useRef<WebView>(null);
  
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      setIsLoading(true);
      setIsPlayerReady(false);
      setPlayerError(null);
    }
  }, [isVisible]);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message: PlayerMessage = JSON.parse(event.nativeEvent.data);
      console.log('🎵 Spotify Web Player message:', message);

      switch (message.type) {
        case 'PLAYER_READY':
          setIsPlayerReady(true);
          setIsLoading(false);
          console.log('🎵 Spotify Player ready with device ID:', message.payload?.device_id);
          
          // Auto-play the track if available
          if (track && spotifyAuth.isAuthenticated()) {
            playTrack(track);
          }
          break;

        case 'PLAYER_STATE_CHANGED':
          console.log('🎵 Player state:', message.payload);
          break;

        case 'PLAYER_ERROR':
        case 'ERROR':
          const errorMsg = message.payload?.message || message.error || 'Unknown player error';
          console.error('🎵 Player error:', errorMsg);
          setPlayerError(errorMsg);
          setIsLoading(false);
          break;

        case 'SDK_READY':
          console.log('🎵 Spotify SDK is ready');
          break;

        case 'PLAYBACK_STARTED':
          console.log('🎵 Playback started successfully');
          break;

        default:
          console.log('🎵 Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('🎵 Failed to parse WebView message:', error);
    }
  };

  const playTrack = async (trackToPlay: SpotifyTrack) => {
    if (!isPlayerReady || !webViewRef.current) {
      console.log('🎵 Player not ready yet');
      return;
    }

    const playMessage = {
      type: 'PLAY',
      payload: { trackUri: `spotify:track:${trackToPlay.id}` },
    };
    webViewRef.current.postMessage(JSON.stringify(playMessage));
  };

  

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      presentationStyle="pageSheet"
      animationType="slide"
    >
      <ThemedView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
        >
          <ThemedText style={{ fontSize: 18, fontWeight: '600' }}>
            🎵 Spotify Player
          </ThemedText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={{ flex: 1 }}>
          {!spotifyAuth.isAuthenticated() ? (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: 24 
            }}>
              <Ionicons name="musical-note" size={48} color={APP_COLORS.primary} />
              <ThemedText 
                style={{ 
                  fontSize: 18, 
                  fontWeight: '600', 
                  marginTop: 16,
                  textAlign: 'center'
                }}
              >
                Spotify Authentication Required
              </ThemedText>
              <ThemedText 
                style={{ 
                  fontSize: 14, 
                  opacity: 0.7, 
                  marginTop: 8,
                  textAlign: 'center'
                }}
              >
                Please authenticate with Spotify to play full tracks
              </ThemedText>
            </View>
          ) : (
            <WebView
              ref={webViewRef}
              source={require('../../assets/html/spotify-player.html')}
              style={{ flex: 1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              mixedContentMode="compatibility"
              onMessage={handleWebViewMessage}
              onLoadEnd={() => {
                if (webViewRef.current && track && spotifyAuth.getAccessToken()) {
                  const initMessage = {
                    type: 'INITIALIZE',
                    payload: { accessToken: spotifyAuth.getAccessToken() },
                  };
                  webViewRef.current.postMessage(JSON.stringify(initMessage));
                }
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
                setPlayerError(nativeEvent.description || 'Failed to load player');
              }}
            />
          )}
        </View>

        {/* Status Overlay */}
        {isLoading && (
          <View 
            style={{
              position: 'absolute',
              top: 100,
              left: 0,
              right: 0,
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: 20,
              margin: 20,
              borderRadius: 12,
            }}
          >
            <ActivityIndicator size="large" color={APP_COLORS.primary} />
            <ThemedText 
              style={{ 
                color: 'white', 
                marginTop: 12,
                textAlign: 'center'
              }}
            >
              Loading Spotify Player...
            </ThemedText>
          </View>
        )}

        {playerError && (
          <View 
            style={{
              position: 'absolute',
              bottom: 100,
              left: 20,
              right: 20,
              backgroundColor: '#EF4444',
              padding: 16,
              borderRadius: 12,
            }}
          >
            <ThemedText style={{ color: 'white', textAlign: 'center' }}>
              {playerError}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </Modal>
  );
}