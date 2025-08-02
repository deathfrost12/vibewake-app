import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { safeReplace } from '../../utils/navigation-utils';
import { reportError, reportEvent } from '../../lib/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  showDetails?: boolean;
}

export class ReptitoErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Error Boundary caught error:', error, errorInfo);

    // Report to Sentry with context
    reportError(error, {
      errorBoundary: true,
      componentStack: errorInfo.componentStack,
      errorInfo: errorInfo,
    });

    // Log custom event
    reportEvent('error_boundary_triggered', 'error');
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: undefined });
    reportEvent('error_boundary_restart_attempted', 'info');
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallbackUI
          error={this.state.error}
          onRestart={this.handleRestart}
          message={this.props.fallbackMessage}
          showDetails={this.props.showDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackUIProps {
  error?: Error;
  onRestart: () => void;
  message?: string;
  showDetails?: boolean;
}

const ErrorFallbackUI: React.FC<ErrorFallbackUIProps> = ({
  error,
  onRestart,
  message,
  showDetails = false,
}) => {
  const handleGoHome = async () => {
    try {
      await safeReplace('/(tabs)/dashboard', { bypassCooldown: true });
    } catch (navError) {
      console.error('Navigation error:', navError);
      // Fallback restart
      onRestart();
    }
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Nahlásit problém',
      'Chcete nahlásit tento problém vývojářům?',
      [
        { text: 'Zrušit', style: 'cancel' },
        {
          text: 'Nahlásit',
          onPress: () => {
            reportEvent('user_reported_error', 'info');
            // TODO: Open email or feedback form
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 justify-center items-center p-6 bg-white">
      {/* Magical Green accent */}
      <View className="w-16 h-16 bg-green-500 rounded-full mb-6 items-center justify-center">
        <Text className="text-white text-2xl font-bold">⚠️</Text>
      </View>

      <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
        Něco se pokazilo
      </Text>

      <Text className="text-gray-600 text-center mb-8 px-4">
        {message ||
          'Omlouváme se za potíže. Aplikace narazila na neočekávaný problém.'}
      </Text>

      {/* Action buttons */}
      <View className="w-full max-w-sm space-y-4">
        <TouchableOpacity
          onPress={handleGoHome}
          className="bg-green-500 rounded-xl py-4 px-6"
          accessibilityLabel="Vrátit se na hlavní stránku"
          accessibilityRole="button"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Vrátit se domů
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRestart}
          className="bg-gray-200 rounded-xl py-4 px-6"
          accessibilityLabel="Zkusit znovu"
          accessibilityRole="button"
        >
          <Text className="text-gray-700 text-center font-semibold text-lg">
            Zkusit znovu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReportIssue}
          className="py-3"
          accessibilityLabel="Nahlásit problém"
          accessibilityRole="button"
        >
          <Text className="text-green-500 text-center font-medium">
            Nahlásit problém
          </Text>
        </TouchableOpacity>
      </View>

      {/* Developer info (pouze ve staging/development) */}
      {showDetails &&
        error &&
        (__DEV__ || process.env.EXPO_PUBLIC_APP_ENV === 'staging') && (
          <View className="mt-8 p-4 bg-gray-100 rounded-lg max-w-full">
            <Text className="text-xs text-gray-500 font-mono">
              {error.message}
            </Text>
            {error.stack && (
              <Text
                className="text-xs text-gray-400 font-mono mt-2"
                numberOfLines={5}
              >
                {error.stack}
              </Text>
            )}
          </View>
        )}
    </View>
  );
};

// Wrapper pro jednoduché použití
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) => {
  const WrappedComponent = (props: P) => (
    <ReptitoErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ReptitoErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};
