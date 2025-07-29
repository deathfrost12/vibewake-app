import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { MockDataService, MockApiService } from '../services/mock-data';

// Development hook pro snadné testování UI screenů
export const useDevTesting = () => {
  const [mockMode, setMockMode] = useState(true);
  const [loadingState, setLoadingState] = useState(false);

  // Simulace loading states pro testování
  const simulateLoading = (duration = 1000) => {
    setLoadingState(true);
    setTimeout(() => setLoadingState(false), duration);
  };

  // Rychlé testovací funkce
  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  const showSuccess = (message: string) => {
    Alert.alert('✅ Success', message);
  };

  const showError = (message: string) => {
    Alert.alert('❌ Error', message);
  };

  const showInfo = (message: string) => {
    Alert.alert('ℹ️ Info', message);
  };

  // Mock data shortcuts
  const mockData = {
    user: MockDataService.getCurrentUser(),
    posts: MockDataService.getPosts(),
    categories: MockDataService.getCategories(),
    notifications: MockDataService.getNotifications(),
    userStats: MockDataService.getUserStats(),
    popularPosts: MockDataService.getPopularPosts(),
  };

  // Testing scenarios
  const testScenarios = {
    emptyState: () => {
      showInfo('Testing empty state - no data');
      return { posts: [], categories: [], notifications: [] };
    },

    loadingState: () => {
      simulateLoading(2000);
      showInfo('Testing loading state - 2 seconds');
    },

    errorState: () => {
      showError('Testing error state - simulated error');
    },

    successState: () => {
      showSuccess('Testing success state - operation completed');
    },

    longContent: () => {
      showInfo('Testing long content');
      return {
        title:
          'Velmi dlouhý název study setu který může způsobit problémy s layoutem a zalamováním textu',
        description:
          'Toto je velmi dlouhý popis study setu, který obsahuje hodně textu a může způsobit problémy s layoutem. Je důležité testovat, jak se aplikace chová s dlouhým obsahem a zda se text správně zalamuje a zobrazuje.',
      };
    },
  };

  // Screen testing helpers
  const screenHelpers = {
    logScreenLoad: (screenName: string) => {
      console.log(`🖥️ Screen načten: ${screenName}`);
    },

    logUserAction: (action: string, screen: string) => {
      console.log(`👆 Akce: ${action} na ${screen}`);
    },

    measureRenderTime: (screenName: string) => {
      const startTime = Date.now();
      return () => {
        const endTime = Date.now();
        console.log(`⏱️ ${screenName} render time: ${endTime - startTime}ms`);
      };
    },
  };

  // Development info overlay
  const getDevInfo = () => ({
    mockMode,
    loadingState,
    timestamp: new Date().toLocaleTimeString('cs-CZ'),
    environment: __DEV__ ? 'development' : 'production',
  });

  return {
    // State
    mockMode,
    setMockMode,
    loadingState,

    // Mock data
    mockData,

    // Testing functions
    simulateLoading,
    testScenarios,

    // Alert helpers
    showAlert,
    showSuccess,
    showError,
    showInfo,

    // Screen helpers
    screenHelpers,

    // Dev info
    getDevInfo,

    // Quick access to mock API
    mockApi: MockApiService,
  };
};

// Hook pro testování konkrétního screenu
export const useScreenTesting = (screenName: string) => {
  const devTesting = useDevTesting();

  useEffect(() => {
    devTesting.screenHelpers.logScreenLoad(screenName);
  }, [screenName]);

  const trackAction = (actionName: string) => {
    devTesting.screenHelpers.logUserAction(actionName, screenName);
  };

  return {
    ...devTesting,
    trackAction,
    screenName,
  };
};
