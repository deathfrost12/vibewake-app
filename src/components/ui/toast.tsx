import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { View, Text, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Czech toast types with educational context
export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'streak'
  | 'achievement';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextType {
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  hideToast: (id: string) => void;
  hideAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Czech toast configurations for educational app
const getToastConfig = (type: ToastType) => {
  const configs = {
    success: {
      icon: 'checkmark-circle' as const,
      bgColor: '#10B981', // Green-500
      borderColor: '#10B981',
      textColor: 'text-white',
      duration: 3000,
    },
    error: {
      icon: 'close-circle' as const,
      bgColor: '#EF4444', // Red-500
      borderColor: '#EF4444',
      textColor: 'text-white',
      duration: 4000,
    },
    warning: {
      icon: 'warning' as const,
      bgColor: '#F59E0B', // Amber-500
      borderColor: '#F59E0B',
      textColor: 'text-white',
      duration: 3500,
    },
    info: {
      icon: 'information-circle' as const,
      bgColor: '#3B82F6', // Blue-500
      borderColor: '#3B82F6',
      textColor: 'text-white',
      duration: 3000,
    },
    streak: {
      icon: 'flame' as const,
      bgColor: '#14C46D', // Magical Green
      borderColor: '#14C46D',
      textColor: 'text-white',
      duration: 4000,
    },
    achievement: {
      icon: 'trophy' as const,
      bgColor: '#F59E0B', // Gold
      borderColor: '#F59E0B',
      textColor: 'text-white',
      duration: 5000,
    },
  };

  return configs[type];
};

interface ToastItemProps {
  toast: ToastConfig;
  onHide: (id: string) => void;
  index: number;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide, index }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const config = getToastConfig(toast.type);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log(`🍞 Zobrazuji toast: ${toast.title}`);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    // Auto hide
    const timer = setTimeout(() => {
      hideToast();
    }, toast.duration || config.duration);

    return () => clearTimeout(timer);
  }, []);

  const hideToast = useCallback(() => {
    console.log(`🗑️ Skrývám toast: ${toast.title}`);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(toast.id);
    });
  }, [toast.id, onHide]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        position: 'absolute',
        top: insets.top + 10 + index * 80, // Stack multiple toasts
        left: 16,
        right: 16,
        zIndex: 9999 - index,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={{
          backgroundColor: config.bgColor,
          borderLeftWidth: 4,
          borderLeftColor: config.borderColor,
          borderRadius: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
        className="flex-row items-center p-4"
      >
        {/* Icon */}
        <View className="mr-3">
          <Ionicons name={config.icon} size={24} color="white" />
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className={`${config.textColor} font-semibold text-base mb-1`}>
            {toast.title}
          </Text>
          <Text className={`${config.textColor} text-sm opacity-90`}>
            {toast.message}
          </Text>
        </View>

        {/* Action Button */}
        {toast.action && (
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              toast.action!.onPress();
              hideToast();
            }}
            className="ml-3 bg-white/20 rounded-lg px-3 py-2"
          >
            <Text className="text-white font-medium text-sm">
              {toast.action.label}
            </Text>
          </TouchableOpacity>
        )}

        {/* Close Button */}
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation();
            hideToast();
          }}
          className="ml-2 p-1"
        >
          <Ionicons name="close" size={18} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);

  const showToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = Date.now().toString();
    const newToast: ToastConfig = { ...config, id };

    console.log(`📢 Nový toast: ${config.title} - ${config.message}`);
    setToasts(prevToasts => [...prevToasts, newToast]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const hideAllToasts = useCallback(() => {
    console.log('🧹 Skrývám všechny toasts');
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, hideAllToasts }}>
      {children}

      {/* Render toasts */}
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onHide={hideToast}
          index={index}
        />
      ))}
    </ToastContext.Provider>
  );
};

// Czech educational toast helpers
export const useCzechToasts = () => {
  const { showToast } = useToast();

  return {
    // Study success messages
    studySuccess: (subject: string, count: number) =>
      showToast({
        type: 'success',
        title: '🎉 Skvělá práce!',
        message: `Dokončil/a jsi ${count} karet z ${subject}`,
      }),

    // Study completion
    studyComplete: (subject: string, score: number) =>
      showToast({
        type: 'success',
        title: '✅ Session dokončena!',
        message: `${subject}: ${score}% úspěšnost`,
        duration: 4000,
      }),

    // Streak achievements
    streakAchieved: (days: number) =>
      showToast({
        type: 'streak',
        title: '🔥 Fantastická šňůra!',
        message: `${days} dní v řadě! Nezlom to teď!`,
        duration: 4000,
      }),

    // Achievement unlocks
    achievementUnlocked: (title: string, description: string) =>
      showToast({
        type: 'achievement',
        title: `🏆 ${title}`,
        message: description,
        duration: 5000,
      }),

    // Error messages
    networkError: (retry?: () => void) =>
      showToast({
        type: 'error',
        title: '📡 Chyba připojení',
        message: 'Zkontroluj internetové připojení',
        action: retry
          ? {
              label: 'Opakovat',
              onPress: retry,
            }
          : undefined,
      }),

    // Sync messages
    syncSuccess: () =>
      showToast({
        type: 'success',
        title: '☁️ Synchronizováno',
        message: 'Všechny údaje jsou aktuální',
      }),

    syncError: () =>
      showToast({
        type: 'error',
        title: '☁️ Chyba synchronizace',
        message: 'Nepodařilo se synchronizovat data',
      }),

    // Study reminders
    studyReminder: (subject: string, onStudy?: () => void) =>
      showToast({
        type: 'info',
        title: '📚 Čas na studium!',
        message: `Nepřehlédni dnešní lekci ${subject}`,
        action: onStudy
          ? {
              label: 'Studovat',
              onPress: onStudy,
            }
          : undefined,
      }),

    // Warning messages
    lowProgress: () =>
      showToast({
        type: 'warning',
        title: '⚠️ Pozor na pokrok',
        message: 'Tento týden jsi studoval/a méně než obvykle',
      }),

    // Magic Notes messages
    magicNotesSuccess: (count: number) =>
      showToast({
        type: 'success',
        title: '🎭 Magic Notes hotovo!',
        message: `Vytvořil jsem ${count} flashcards z tvých poznámek`,
        duration: 4000,
      }),

    magicNotesError: () =>
      showToast({
        type: 'error',
        title: '🎭 Magic Notes selhalo',
        message: 'Nepodařilo se rozpoznat text z obrázku',
      }),

    // Quick actions
    quickSuccess: (message: string) =>
      showToast({
        type: 'success',
        title: '✅ Hotovo!',
        message,
        duration: 2000,
      }),

    quickError: (message: string) =>
      showToast({
        type: 'error',
        title: '❌ Chyba!',
        message,
        duration: 3000,
      }),

    quickInfo: (message: string) =>
      showToast({
        type: 'info',
        title: 'ℹ️ Info',
        message,
        duration: 2500,
      }),
  };
};

export default ToastProvider;
