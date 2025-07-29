import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

interface AppleAuthResult {
  success: boolean;
  idToken?: string;
  nonce?: string; // Original nonce for Supabase
  fullName?: {
    given_name?: string;
    family_name?: string;
  } | null;
  email?: string;
  error?: string;
}

interface AppleUser {
  email?: string;
  name?: string;
}

class AppleAuthService {
  private static instance: AppleAuthService;

  static getInstance(): AppleAuthService {
    if (!AppleAuthService.instance) {
      AppleAuthService.instance = new AppleAuthService();
    }
    return AppleAuthService.instance;
  }

  /**
   * Check if Apple Sign-In is available on this device
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS !== 'ios') {
        console.log('🍎 Apple Sign-In is only available on iOS');
        return false;
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      console.log('🍎 Apple Sign-In availability:', isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('🍎 Error checking Apple Sign-In availability:', error);
      return false;
    }
  }

  /**
   * Configure Apple Sign-In - for iOS this is minimal setup
   */
  async configure(): Promise<boolean> {
    try {
      // For Apple Sign-In, most configuration is done in app.json/app.config.js
      // No runtime configuration needed unlike Google OAuth
      const available = await this.isAvailable();

      if (available) {
        console.log('🍎 Apple Sign-In configured successfully');
        return true;
      }

      console.log('🍎 Apple Sign-In not available on this device');
      return false;
    } catch (error) {
      console.error('🍎 Apple Sign-In configuration failed:', error);
      return false;
    }
  }

  /**
   * Generate a secure nonce for Apple Sign-In with SHA-256 hash
   */
  private async generateNonce(): Promise<{
    nonce: string;
    hashedNonce: string;
  }> {
    try {
      // Generate random nonce
      const nonce = await Crypto.randomUUID();

      // Apple requires SHA-256 hashed nonce for the request
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce,
        { encoding: Crypto.CryptoEncoding.HEX }
      );

      console.log('🍎 Generated nonce pair:', {
        nonce: nonce.substring(0, 8) + '...',
        hashedNonce: hashedNonce.substring(0, 8) + '...',
      });

      return { nonce, hashedNonce };
    } catch (error) {
      console.error('🍎 Error generating nonce:', error);
      // Fallback to timestamp-based nonce
      const fallbackNonce = Date.now().toString();
      const fallbackHashed = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        fallbackNonce,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return { nonce: fallbackNonce, hashedNonce: fallbackHashed };
    }
  }

  /**
   * Sign in with Apple
   */
  async signIn(): Promise<AppleAuthResult> {
    try {
      console.log('🍎 Starting Apple Sign-In...');

      // Check availability first
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Apple Sign-In není dostupný na tomto zařízení',
        };
      }

      // Generate nonce pair for security
      const { nonce, hashedNonce } = await this.generateNonce();

      // Request Apple Sign-In with required scopes (use hashed nonce for Apple)
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce, // Apple requires hashed nonce
      });

      console.log('🍎 Apple Sign-In credential received:', {
        hasIdentityToken: !!credential.identityToken,
        hasAuthorizationCode: !!credential.authorizationCode,
        hasFullName: !!credential.fullName,
        hasEmail: !!credential.email,
        state: credential.state,
      });

      // Validate that we received the required token
      if (!credential.identityToken) {
        return {
          success: false,
          error: 'Nepodařilo se získat Apple identity token',
        };
      }

      // Extract user information
      const fullName = credential.fullName
        ? {
            given_name: credential.fullName.givenName || undefined,
            family_name: credential.fullName.familyName || undefined,
          }
        : null;

      const result: AppleAuthResult = {
        success: true,
        idToken: credential.identityToken,
        nonce, // Original nonce for Supabase
        fullName,
        email: credential.email || undefined,
      };

      console.log('🍎 Apple Sign-In successful:', {
        hasIdToken: !!result.idToken,
        hasEmail: !!result.email,
        hasFullName: !!result.fullName,
      });

      return result;
    } catch (error: any) {
      console.error('🍎 Apple Sign-In error:', error);

      // Handle specific Apple Sign-In errors
      if (error.code === 'ERR_REQUEST_CANCELED') {
        return {
          success: false,
          error: 'Přihlášení bylo zrušeno uživatelem',
        };
      }

      if (error.code === 'ERR_INVALID_RESPONSE') {
        return {
          success: false,
          error: 'Neplatná odpověď od Apple. Zkuste to znovu.',
        };
      }

      if (error.code === 'ERR_REQUEST_FAILED') {
        return {
          success: false,
          error: 'Síťová chyba. Zkontrolujte připojení k internetu.',
        };
      }

      if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
        return {
          success: false,
          error: 'Apple Sign-In není správně nakonfigurován',
        };
      }

      return {
        success: false,
        error: `Apple Sign-In chyba: ${error.message || 'Neznámá chyba'}`,
      };
    }
  }

  /**
   * Sign out from Apple (minimal - Apple doesn't provide a direct sign out)
   */
  async signOut(): Promise<void> {
    try {
      console.log('🍎 Apple Sign-In sign out - clearing local state');
      // Apple doesn't provide a direct sign out method like Google
      // The sign out is handled by clearing the session on the server side
      // and locally in the app state
    } catch (error) {
      console.error('🍎 Apple Sign-In sign out error:', error);
    }
  }

  /**
   * Get platform information for debugging
   */
  getPlatformInfo() {
    return {
      platform: Platform.OS,
      isIOS: Platform.OS === 'ios',
      supportsAppleSignIn: Platform.OS === 'ios',
    };
  }
}

// Export singleton instance
export const appleAuth = AppleAuthService.getInstance();
