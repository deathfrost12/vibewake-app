import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateScreen() {
  const createOptions = [
    {
      id: 'ai',
      title: '✨ Magic Notes',
      description: 'Vyfoť si poznámky a AI z nich vytvoří karty',
      icon: 'camera-outline' as const,
      premium: true,
    },
    {
      id: 'text',
      title: '📝 Textová sada',
      description: 'Vytvoř karty ručně pomocí textu',
      icon: 'create-outline' as const,
      premium: false,
    },
    {
      id: 'image',
      title: '🖼️ Obrázková sada',
      description: 'Přidej obrázky k svým kartám',
      icon: 'image-outline' as const,
      premium: false,
    },
  ];

  const handleOptionPress = (option: (typeof createOptions)[0]) => {
    Alert.alert(
      option.title,
      `${option.description}\n\nTato funkce bude dostupná v příští verzi!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-5">
        <View className="mt-5 mb-8">
          <Text className="text-2xl font-bold text-secondary-800 mb-2">
            Jak chceš vytvořit sadu?
          </Text>
          <Text className="text-base text-secondary-500">
            Vyber si způsob, který ti nejvíce vyhovuje
          </Text>
        </View>

        {createOptions.map(option => (
          <TouchableOpacity
            key={option.id}
            className={`rounded-2xl p-5 mb-4 ${
              option.premium
                ? 'bg-green-50 border-2 border-primary'
                : 'bg-gray-50 border border-gray-200'
            }`}
            onPress={() => handleOptionPress(option)}
          >
            <View className="flex-row items-center">
              <View
                className={`w-12 h-12 rounded-full justify-center items-center mr-4 ${
                  option.premium ? 'bg-primary' : 'bg-green-50'
                }`}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={option.premium ? '#FFFFFF' : '#14C46D'}
                />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-lg font-semibold text-secondary-800 mr-2">
                    {option.title}
                  </Text>
                  {option.premium && (
                    <View className="bg-primary rounded-xl px-2 py-0.5">
                      <Text className="text-xs font-semibold text-white">
                        Plus
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-secondary-500 leading-5">
                  {option.description}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </View>
          </TouchableOpacity>
        ))}

        <View className="bg-gray-50 rounded-2xl p-5 mt-5 mb-10">
          <Text className="text-base font-semibold text-primary mb-3">
            💡 Tipy pro lepší karty
          </Text>
          <Text className="text-sm text-secondary-800 leading-5">
            • Krátké a jasné otázky{'\n'}• Jedna informace na kartu{'\n'}•
            Používej obrázky pro lepší zapamatování{'\n'}• Pravidelně aktualizuj
            obsah
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
