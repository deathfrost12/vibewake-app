import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TestingScreen1() {
  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header with CTA */}
      <View className="px-5 pt-4 pb-6">
        <TouchableOpacity
          className="self-start p-2 mb-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Top CTA Button */}
        <TouchableOpacity
          style={{
            shadowColor: '#14C46D',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <LinearGradient
            colors={['#55D9C6', '#B5D982']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-full py-4 px-8"
          >
            <Text className="text-center text-lg font-bold text-black">
              Vyzkoušej zdarma
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5">
        {/* Main Content */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-white text-center mb-2">
            Čeština—
          </Text>
          <Text className="text-3xl font-bold text-lime-400 text-center mb-4">
            jednodušší než kdy předtím!
          </Text>

          <View className="bg-gray-800 rounded-2xl px-4 py-3 mb-8">
            <Text className="text-gray-300 text-center text-base">
              Mluv sebevědomě, zvládni gramatiku a nauč se nová slova
            </Text>
          </View>
        </View>

        {/* How It Works Section */}
        <View className="bg-gray-800 rounded-3xl p-6 mb-6">
          {/* How It Works Button */}
          <TouchableOpacity className="bg-lime-400 rounded-full py-3 px-6 self-center mb-4">
            <Text className="text-black font-bold text-lg">Jak to funguje</Text>
          </TouchableOpacity>

          {/* So Simple */}
          <View className="flex-row items-center justify-center mb-6">
            <Text className="text-blue-400 text-lg font-semibold mr-2">
              😊 Tak jednoduché!
            </Text>
          </View>

          {/* Step 1 */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">
              1. Odpověz na pár rychlých otázek
            </Text>
            <View className="flex-row justify-center gap-3">
              <View className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center border-2 border-gray-600">
                <Text className="text-red-500 text-2xl">🇨🇿</Text>
                <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              </View>
              <View className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center border-2 border-gray-600">
                <Text className="text-green-500 text-lg font-bold">B2</Text>
                <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              </View>
              <View className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center border-2 border-blue-500">
                <Text className="text-2xl">📚</Text>
                <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              </View>
              <View className="w-16 h-16 bg-gray-700 rounded-2xl items-center justify-center border-2 border-gray-600">
                <Text className="text-gray-400 text-2xl">?</Text>
              </View>
            </View>
          </View>

          {/* Step 2 */}
          <View className="mb-8">
            <Text className="text-white text-lg font-semibold mb-4">
              2. Vyber si AI tutora, který se ti líbí
            </Text>
            <View className="flex-row justify-center gap-2">
              {[1, 2, 3, 4, 5].map(index => (
                <View
                  key={index}
                  className={`w-12 h-12 rounded-full ${index === 2 ? 'border-2 border-blue-500' : ''}`}
                >
                  <View
                    className={`w-full h-full rounded-full ${
                      index === 1
                        ? 'bg-yellow-600'
                        : index === 2
                          ? 'bg-red-600'
                          : index === 3
                            ? 'bg-gray-600'
                            : index === 4
                              ? 'bg-blue-600'
                              : 'bg-green-600'
                    } items-center justify-center`}
                  >
                    <Text className="text-white text-xs">👤</Text>
                  </View>
                  {index === 2 && (
                    <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full items-center justify-center">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Step 3 */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-4">
              3. Absolvuj zábavné lekce a získej užitečné tipy
            </Text>
            <View className="flex-row justify-center gap-2">
              <View className="w-12 h-12 bg-green-600 rounded-2xl items-center justify-center">
                <Text className="text-white text-xs">📖</Text>
              </View>
              <View className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center">
                <Text className="text-white text-xs">✏️</Text>
              </View>
              <View className="w-12 h-12 bg-purple-600 rounded-2xl items-center justify-center">
                <Text className="text-white text-xs">💡</Text>
              </View>
              <View className="w-12 h-12 bg-red-500 rounded-2xl items-center justify-center border-2 border-blue-500">
                <Text className="text-white text-xs">🧩</Text>
                <View className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full items-center justify-center">
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              </View>
              <View className="w-12 h-12 bg-gray-600 rounded-2xl items-center justify-center">
                <Text className="text-white text-xs">🎯</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          className="bg-blue-600 rounded-full py-4 px-8 mb-8"
          onPress={() => router.back()}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-white text-lg font-bold mr-2">
              Pokračovat
            </Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </View>
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-8 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(index => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${index === 1 ? 'bg-blue-500' : 'bg-gray-600'}`}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
