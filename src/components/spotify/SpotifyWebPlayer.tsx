import React, { useRef, useState, useEffect } from 'react';
import { View, Modal, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/theme-context';
import { THEME_COLORS, APP_COLORS } from '../../theme/colors';
import { ThemedView, ThemedText } from '../ui/themed-view';
import { SpotifyTrack, spotifyAuth } from '../../services/auth/spotify-auth';

interface SpotifyWebPlayerProps {
  visible: boolean;
  track: SpotifyTrack | null;
  onClose: () => void;
}

interface PlayerMessage {
  type: 'PLAYER_READY' | 'PLAYER_STATE_CHANGED' | 'PLAYER_ERROR';
  data?: any;
  error?: string;
}

export function SpotifyWebPlayer({ visible, track, onClose }: SpotifyWebPlayerProps) {
  const { isDark } = useTheme();
  const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
  const webViewRef = useRef<WebView>(null);
  
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerError, setPlayerError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setIsLoading(true);
      setIsPlayerReady(false);
      setPlayerError(null);
    }
  }, [visible]);

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    try {
      const message: PlayerMessage = JSON.parse(event.nativeEvent.data);
      console.log('🎵 Spotify Web Player message:', message);

      switch (message.type) {
        case 'PLAYER_READY':
          setIsPlayerReady(true);
          setIsLoading(false);
          console.log('🎵 Spotify Player ready with device ID:', message.data?.device_id);
          
          // Auto-play the track if available
          if (track && spotifyAuth.isAuthenticated()) {
            playTrack(track);
          }
          break;

        case 'PLAYER_STATE_CHANGED':
          console.log('🎵 Player state:', message.data);
          break;

        case 'PLAYER_ERROR':
          console.error('🎵 Player error:', message.error);
          setPlayerError(message.error || 'Unknown player error');
          setIsLoading(false);
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

    const playCommand = {
      type: 'PLAY_TRACK',
      trackUri: `spotify:track:${trackToPlay.id}`,
      trackId: trackToPlay.id
    };

    const javascript = `
      window.playSpotifyTrack(${JSON.stringify(playCommand)});
      true;
    `;

    webViewRef.current.injectJavaScript(javascript);
  };

  const getAccessToken = () => {
    // We'll need to get the current access token from spotifyAuth
    // This is a simplified version - you'll need to implement proper token management
    return spotifyAuth.isAuthenticated() ? 'CURRENT_ACCESS_TOKEN' : null;
  };

  const generatePlayerHTML = () => {
    const accessToken = getAccessToken();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>VibeWake Spotify Player</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.scdn.co/spotify-player.js"></script>
    <style>
        body {
            margin: 0;
            padding: 20px;
            background-color: ${isDark ? '#0D1A1A' : '#F8FAFC'};
            color: ${isDark ? '#F9FAFB' : '#1F2937'};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
        }
        .player-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
        }
        .track-info {
            margin-bottom: 20px;
        }
        .track-image {
            width: 200px;
            height: 200px;
            border-radius: 12px;
            margin: 0 auto 16px;
            display: block;
        }
        .track-name {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .track-artist {
            font-size: 14px;
            opacity: 0.7;
        }
        .controls {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin: 20px 0;
        }
        .play-button {
            background-color: #1DB954;
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .play-button:hover {
            background-color: #1ed760;
        }
        .status {
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.7;
        }
        .error {
            color: #ef4444;
            background-color: rgba(239, 68, 68, 0.1);
            padding: 12px;
            border-radius: 8px;
            margin: 16px 0;
        }
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="player-container">
        <div id="loading" class="loading">
            <div>⏳</div>
            <div>Loading Spotify Player...</div>
        </div>
        
        <div id="player-content" style="display: none;">
            <div class="track-info">
                <img id="track-image" class="track-image" src="" alt="Track artwork">
                <div id="track-name" class="track-name"></div>
                <div id="track-artist" class="track-artist"></div>
            </div>
            
            <div class="controls">
                <button id="play-button" class="play-button">▶</button>
            </div>
            
            <div id="status" class="status">Ready to play</div>
        </div>
        
        <div id="error-container"></div>
    </div>

    <script>
        let player = null;
        let deviceId = null;
        let currentTrack = null;
        
        const postMessage = (message) => {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
        };

        const showError = (error) => {
            document.getElementById('error-container').innerHTML = 
                '<div class="error">' + error + '</div>';
            postMessage({ type: 'PLAYER_ERROR', error });
        };

        const updateTrackInfo = (track) => {
            const imageElement = document.getElementById('track-image');
            const nameElement = document.getElementById('track-name');
            const artistElement = document.getElementById('track-artist');
            
            if (track) {
                imageElement.src = track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || '';
                nameElement.textContent = track.name || 'Unknown Track';
                artistElement.textContent = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
            }
        };

        window.onSpotifyWebPlaybackSDKReady = () => {
            const token = '${accessToken}';
            
            if (!token || token === 'CURRENT_ACCESS_TOKEN') {
                showError('No valid Spotify access token. Please re-authenticate.');
                return;
            }

            player = new Spotify.Player({
                name: 'VibeWake Player',
                getOAuthToken: cb => { cb(token); },
                volume: 1.0
            });

            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
                deviceId = device_id;
                document.getElementById('loading').style.display = 'none';
                document.getElementById('player-content').style.display = 'block';
                
                postMessage({ 
                    type: 'PLAYER_READY', 
                    data: { device_id } 
                });
            });

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            // Player state changes
            player.addListener('player_state_changed', (state) => {
                if (!state) return;
                
                currentTrack = state.track_window.current_track;
                const isPlaying = !state.paused;
                
                document.getElementById('play-button').textContent = isPlaying ? '⏸' : '▶';
                document.getElementById('status').textContent = 
                    isPlaying ? 'Playing...' : 'Paused';
                
                postMessage({ 
                    type: 'PLAYER_STATE_CHANGED', 
                    data: { isPlaying, track: currentTrack } 
                });
            });

            // Errors
            player.addListener('initialization_error', ({ message }) => {
                showError('Initialization Error: ' + message);
            });

            player.addListener('authentication_error', ({ message }) => {
                showError('Authentication Error: ' + message);
            });

            player.addListener('account_error', ({ message }) => {
                showError('Account Error: ' + message);
            });

            player.addListener('playback_error', ({ message }) => {
                showError('Playback Error: ' + message);
            });

            // Connect to the player
            player.connect().then(success => {
                if (!success) {
                    showError('Failed to connect to Spotify');
                }
            });

            // Play button click handler
            document.getElementById('play-button').addEventListener('click', () => {
                player.togglePlay();
            });
        };

        // Function to play specific track (called from React Native)
        window.playSpotifyTrack = async (command) => {
            if (!player || !deviceId) {
                showError('Player not ready');
                return;
            }

            try {
                const response = await fetch('https://api.spotify.com/v1/me/player/play?device_id=' + deviceId, {
                    method: 'PUT',
                    body: JSON.stringify({
                        uris: [command.trackUri]
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ${accessToken}'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to start playback: ' + response.status);
                }

                document.getElementById('status').textContent = 'Starting playback...';
            } catch (error) {
                showError('Playback failed: ' + error.message);
            }
        };
    </script>
</body>
</html>
    `;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
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
              source={{ html: generatePlayerHTML() }}
              style={{ flex: 1 }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback={true}
              mixedContentMode="compatibility"
              onMessage={handleWebViewMessage}
              onError={(error) => {
                console.error('🎵 WebView error:', error);
                setPlayerError('WebView failed to load');
                setIsLoading(false);
              }}
              onLoadEnd={() => {
                console.log('🎵 WebView loaded');
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