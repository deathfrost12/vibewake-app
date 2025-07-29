import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Conditional imports - only import when needed
let AuthSession: any = null;
let WebBrowser: any = null;
let GoogleSignin: any = null;
let statusCodes: any = null;

interface GoogleAuthResult {
  success: boolean;
  error?: string;
  user?: any;
  idToken?: string;
  accessToken?: string;
}

interface GoogleAuthConfig {
  webClientId: string;
  webClientSecret?: string;
  iosClientId?: string;
  androidClientId?: string;
}

// Check platform and environment
const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';

// Lazy load web modules
const loadWebModules = async (): Promise<boolean> => {
  if (!isWeb) return false;

  try {
    const authSessionModule = await import('expo-auth-session');
    const webBrowserModule = await import('expo-web-browser');

    // Properly assign the imported modules
    AuthSession = authSessionModule;
    WebBrowser = webBrowserModule;

    // Configure web browser for OAuth
    if (WebBrowser.maybeCompleteAuthSession) {
      WebBrowser.maybeCompleteAuthSession();
    }

    console.log('✅ Web OAuth modules loaded successfully');
    return true;
  } catch (error) {
    console.log('⚠️ Web OAuth modules failed to load:', error);
    return false;
  }
};

const loadGoogleSignin = async (): Promise<boolean> => {
  // Skip loading in Expo Go or web
  if (isExpoGo || isWeb) {
    console.log('🔸 Skipping Google Sign-in module load:', { isExpoGo, isWeb });
    return false;
  }

  try {
    const googleModule = await import(
      '@react-native-google-signin/google-signin'
    );
    GoogleSignin = googleModule.GoogleSignin;
    statusCodes = googleModule.statusCodes;
    console.log('✅ Google Sign-in module loaded successfully');
    return true;
  } catch (error) {
    console.log('⚠️ Google Sign-in module není dostupný:', error);
    return false;
  }
};

class GoogleAuthService {
  private configured = false;
  private available = false;
  private moduleLoaded = false;
  private webModulesLoaded = false;
  private webConfig: any = null;

  private getConfig(): GoogleAuthConfig | null {
    const webClientId =
      Constants.expoConfig?.extra?.googleWebClientId ||
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '571576096718-tfv99n1r0v2jpp1l2gt9p70lkh9mprg2.apps.googleusercontent.com';

    const webClientSecret =
      Constants.expoConfig?.extra?.googleClientSecret ||
      process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET;

    const iosClientId =
      Constants.expoConfig?.extra?.googleIosClientId ||
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      '571576096718-poh1o01vj6k96k55895i85hq9vtn8rgo.apps.googleusercontent.com';

    const androidClientId =
      Constants.expoConfig?.extra?.googleAndroidClientId ||
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

    console.log('🔍 Google config details:', {
      webClientId: webClientId ? 'found' : 'missing',
      webClientSecret: webClientSecret ? 'found' : 'missing',
      iosClientId: iosClientId ? 'found' : 'missing',
      androidClientId: androidClientId ? 'found' : 'missing',
    });

    if (!webClientId) {
      console.warn('Google Web Client ID není nakonfigurováno');
      return null;
    }

    return {
      webClientId,
      webClientSecret,
      iosClientId,
      androidClientId,
    };
  }

  private setupWebAuth(config: GoogleAuthConfig) {
    if (!isWeb || !config.webClientId || !AuthSession) return;

    const redirectUri = AuthSession.makeRedirectUri({
      useProxy: true,
      preferLocalhost: false,
    });

    this.webConfig = {
      clientId: config.webClientId,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      additionalParameters: {},
      extraParams: {
        access_type: 'offline',
      },
    };

    console.log('🌐 Web OAuth config:', {
      clientId: config.webClientId.substring(0, 20) + '...',
      redirectUri,
    });
  }

  async configure(): Promise<boolean> {
    console.log('🔍 Starting Google OAuth configuration...', {
      platform: Platform.OS,
      isExpoGo,
      isWeb,
    });

    try {
      const config = this.getConfig();
      if (!config) {
        console.log('⚠️ Google OAuth konfigurace není k dispozici');
        this.available = false;
        return false;
      }

      // Setup web auth
      if (isWeb) {
        this.webModulesLoaded = await loadWebModules();
        if (!this.webModulesLoaded) {
          console.log('⚠️ Web modules se nepodařilo načíst');
          this.available = false;
          return false;
        }

        this.setupWebAuth(config);
        this.configured = true;
        this.available = true;
        console.log('✅ Google Web OAuth nakonfigurován úspěšně');
        return true;
      }

      // Skip native setup in Expo Go
      if (isExpoGo) {
        console.log('🔸 Google OAuth disabled in Expo Go');
        this.available = false;
        this.moduleLoaded = false;
        return false;
      }

      // Setup native auth
      this.moduleLoaded = await loadGoogleSignin();
      if (!this.moduleLoaded || !GoogleSignin) {
        console.log('⚠️ Google Sign-in module se nepodařilo načíst');
        this.available = false;
        return false;
      }

      console.log('🔍 Configuring Google Sign-in with:', {
        webClientId: config.webClientId.substring(0, 20) + '...',
        iosClientId: config.iosClientId?.substring(0, 20) + '...',
      });

      await GoogleSignin.configure({
        webClientId: config.webClientId,
        iosClientId: config.iosClientId,
        offlineAccess: true,
        hostedDomain: '',
        forceCodeForRefreshToken: true,
      });

      this.configured = true;
      this.available = true;
      console.log('✅ Google Sign-in nakonfigurován úspěšně');
      return true;
    } catch (error) {
      console.log('⚠️ Google Sign-in configuration error:', error);
      this.configured = false;
      this.available = false;
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.available && this.configured;
  }

  private async signInWeb(): Promise<GoogleAuthResult> {
    if (!this.webConfig || !AuthSession) {
      return {
        success: false,
        error: 'Web Google OAuth není nakonfigurován',
      };
    }

    try {
      console.log('🌐 Starting web OAuth flow...');

      // Google's discovery document URLs
      const discovery = {
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
        revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
      };

      // Create request using proper API
      const request = new AuthSession.AuthRequest({
        clientId: this.webConfig.clientId,
        scopes: this.webConfig.scopes,
        redirectUri: this.webConfig.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: this.webConfig.extraParams,
      });

      console.log('🌐 Created auth request, starting prompt...');

      const result = await request.promptAsync(discovery);

      console.log('🌐 Web OAuth result:', {
        type: result.type,
        hasCode: result.type === 'success' && !!result.params?.code,
      });

      if (result.type === 'success' && result.params.code) {
        // Exchange code for tokens
        const tokenResult = await this.exchangeCodeForTokens(
          result.params.code
        );

        if (tokenResult.success) {
          return {
            success: true,
            idToken: tokenResult.idToken,
            accessToken: tokenResult.accessToken,
            user: tokenResult.user,
          };
        } else {
          return {
            success: false,
            error: tokenResult.error || 'Token exchange selhalo',
          };
        }
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Přihlášení bylo zrušeno',
        };
      } else {
        return {
          success: false,
          error: 'Neočekávaná chyba při web OAuth',
        };
      }
    } catch (error) {
      console.error('🔥 Web Google sign-in error:', error);
      return {
        success: false,
        error: 'Chyba při web přihlášení: ' + String(error),
      };
    }
  }

  private async exchangeCodeForTokens(code: string): Promise<any> {
    if (!this.webConfig) {
      return { success: false, error: 'Web config not available' };
    }

    const config = this.getConfig();
    if (!config || !config.webClientSecret) {
      return {
        success: false,
        error: 'Google Client Secret není nakonfigurován pro web OAuth',
      };
    }

    try {
      console.log('🔄 Exchanging code for tokens...');

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.webConfig.clientId,
          client_secret: config.webClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: this.webConfig.redirectUri,
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        console.error('Token exchange error:', tokens);
        return {
          success: false,
          error: 'Token exchange failed: ' + tokens.error_description,
        };
      }

      console.log('✅ Tokens received, fetching user info...');

      // Get user info
      const userResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
      );
      const user = await userResponse.json();

      console.log('✅ User info received:', {
        hasUser: !!user,
        email: user?.email?.substring(0, 5) + '...',
      });

      return {
        success: true,
        idToken: tokens.id_token,
        accessToken: tokens.access_token,
        user,
      };
    } catch (error) {
      console.error('Token exchange error:', error);
      return {
        success: false,
        error: 'Network error during token exchange: ' + String(error),
      };
    }
  }

  private async signInNative(): Promise<GoogleAuthResult> {
    if (!GoogleSignin) {
      return {
        success: false,
        error: 'Google OAuth vyžaduje EAS development build',
      };
    }

    try {
      console.log('🔍 Starting native Google sign-in...');

      await GoogleSignin.hasPlayServices();
      console.log('🔍 Play Services available');

      const userInfo = await GoogleSignin.signIn();

      // Better debugging - show actual structure
      console.log('🔍 Google sign-in response structure:', {
        hasData: !!userInfo.data,
        hasUser: !!userInfo.user,
        hasIdToken: !!userInfo.idToken,
        hasServerAuthCode: !!userInfo.serverAuthCode,
        topLevelKeys: Object.keys(userInfo),
      });

      console.log('🔍 Raw userInfo:', JSON.stringify(userInfo, null, 2));

      // Extract from the correct location based on response structure
      let authToken = userInfo.data?.idToken || userInfo.idToken;
      let accessToken = userInfo.data?.accessToken || userInfo.accessToken;
      let userData = userInfo.data?.user || userInfo.user;

      console.log('🔍 Token extraction strategy used:', {
        foundInData: !!userInfo.data?.idToken,
        foundInRoot: !!userInfo.idToken,
      });

      // Fallback to server auth code if no idToken
      if (!authToken) {
        console.log('🔍 Using serverAuthCode as fallback...');
        authToken = userInfo.data?.serverAuthCode || userInfo.serverAuthCode;
      }

      console.log('🔍 Final extracted tokens:', {
        hasAuthToken: !!authToken,
        hasAccessToken: !!accessToken,
        hasUserData: !!userData,
        authTokenStart: authToken ? authToken.substring(0, 20) + '...' : 'none',
      });

      if (!authToken) {
        console.log('⚠️ Missing both idToken and serverAuthCode');
        console.log('🔍 Full userInfo for debugging:', userInfo);
        return {
          success: false,
          error: 'Nepodařilo se získat autentizační token',
        };
      }

      return {
        success: true,
        user: userData,
        idToken: authToken,
        accessToken: accessToken,
      };
    } catch (error: any) {
      console.error('🔥 Native Google Sign-in error:', error);

      let errorMessage = 'Neočekávaná chyba při Google přihlášení';

      if (statusCodes && error.code) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          errorMessage = 'Přihlášení bylo zrušeno';
        } else if (error.code === statusCodes.IN_PROGRESS) {
          errorMessage = 'Přihlašování již probíhá';
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          errorMessage = 'Google Play Services nejsou k dispozici';
        } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
          errorMessage = 'Je vyžadováno přihlášení';
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async signIn(): Promise<GoogleAuthResult> {
    if (!this.available) {
      return {
        success: false,
        error: isExpoGo
          ? 'Google OAuth vyžaduje EAS development build. V Expo Go není dostupný.'
          : 'Google OAuth není nakonfigurován',
      };
    }

    // Route to appropriate sign-in method
    if (isWeb) {
      return this.signInWeb();
    } else {
      return this.signInNative();
    }
  }

  async signInSilently(): Promise<GoogleAuthResult> {
    if (isWeb || isExpoGo || !this.available || !GoogleSignin) {
      return {
        success: false,
        error: 'Silent sign-in není dostupný',
      };
    }

    try {
      const userInfo = await GoogleSignin.signInSilently();

      return {
        success: true,
        user: userInfo.user,
        idToken: userInfo.idToken || undefined,
      };
    } catch (error: any) {
      console.log('Silent Google sign-in failed:', error.message);

      return {
        success: false,
        error: 'Automatické přihlášení selhalo',
      };
    }
  }

  async isSignedIn(): Promise<boolean> {
    if (isWeb || isExpoGo || !this.available || !GoogleSignin) {
      return false;
    }

    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Error checking Google sign-in status:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (isWeb || isExpoGo || !this.available || !GoogleSignin) {
      return; // Gracefully do nothing if not available
    }

    try {
      await GoogleSignin.signOut();
      console.log('Google sign out úspěšný');
    } catch (error) {
      console.error('Google sign out error:', error);
      // Don't throw - allow other sign out processes to continue
    }
  }

  async getCurrentUser(): Promise<any | null> {
    if (isWeb || isExpoGo || !GoogleSignin) {
      return null;
    }

    try {
      return await GoogleSignin.getCurrentUser();
    } catch {
      return null;
    }
  }

  isDevelopment(): boolean {
    return isExpoGo;
  }

  getPlatformInfo() {
    return {
      platform: Platform.OS,
      isExpoGo,
      isWeb,
      available: this.available,
      configured: this.configured,
      moduleLoaded: this.moduleLoaded,
      webModulesLoaded: this.webModulesLoaded,
    };
  }
}

export const googleAuth = new GoogleAuthService();
