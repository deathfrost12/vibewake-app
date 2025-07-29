import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SongMakerDemo() {
  const [selectedMode, setSelectedMode] = useState<'simple' | 'custom'>(
    'simple'
  );
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [description, setDescription] = useState(
    'A serene song about a peaceful afternoon spent reading in the park under a sprawling oak tree.'
  );

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1 text-center mr-10">
            SongMaker.AI
          </Text>
          <View
            className="flex-row items-center bg-gray-800 px-3 py-1.5 rounded-2xl border border-primary"
            style={{
              shadowColor: '#14C46D',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 4,
            }}
          >
            <Ionicons name="musical-notes" size={16} color="#14C46D" />
            <Text className="text-primary font-semibold text-xs ml-1">PRO</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Toggle */}
          <View className="flex-row bg-gray-800 rounded-3xl p-1 mb-6">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-2xl items-center ${
                selectedMode === 'simple' ? 'bg-primary' : ''
              }`}
              style={
                selectedMode === 'simple'
                  ? {
                      shadowColor: '#14C46D',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                      elevation: 4,
                    }
                  : {}
              }
              onPress={() => setSelectedMode('simple')}
            >
              <Text
                className={`font-semibold text-base ${
                  selectedMode === 'simple'
                    ? 'text-black'
                    : 'text-secondary-500'
                }`}
              >
                Simple
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-2xl items-center ${
                selectedMode === 'custom' ? 'bg-primary' : ''
              }`}
              style={
                selectedMode === 'custom'
                  ? {
                      shadowColor: '#14C46D',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 6,
                      elevation: 4,
                    }
                  : {}
              }
              onPress={() => setSelectedMode('custom')}
            >
              <Text
                className={`font-semibold text-base ${
                  selectedMode === 'custom'
                    ? 'text-black'
                    : 'text-secondary-500'
                }`}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Song Description Card */}
          <View className="bg-gray-200 rounded-3xl p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-secondary-800">
                Song Description
              </Text>
              <View className="flex-row items-center">
                <Switch
                  value={isInstrumental}
                  onValueChange={setIsInstrumental}
                  trackColor={{ false: '#E5E5EA', true: '#14C46D' }}
                  thumbColor="#FFFFFF"
                />
                <Text className="text-secondary-800 text-base ml-2">
                  Instrumental
                </Text>
              </View>
            </View>

            <TextInput
              className="text-base text-secondary-800 leading-6"
              style={{ minHeight: 120, textAlignVertical: 'top' }}
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Describe your song..."
              placeholderTextColor="#8E8E93"
            />

            <View className="flex-row justify-between items-center mt-4">
              <View className="flex-row items-center">
                <TouchableOpacity className="p-2 mr-3">
                  <Ionicons name="trash-outline" size={20} color="#8E8E93" />
                </TouchableOpacity>
                <Text className="text-secondary-500 text-sm">94/200</Text>
              </View>
              <TouchableOpacity
                className="flex-row items-center bg-gray-100 px-4 py-2 rounded-2xl"
                style={{
                  shadowColor: '#14C46D',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="bulb-outline" size={16} color="#14C46D" />
                <Text className="text-primary font-semibold text-sm ml-1">
                  Inspiration
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Spacer */}
          <View className="h-48" />
        </ScrollView>

        {/* Create Button */}
        <View className="px-5 pb-4">
          <TouchableOpacity
            className="rounded-3xl"
            style={{
              shadowColor: '#14C46D',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['#5FE5A8', '#14C46D', '#0FA558']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="flex-row items-center justify-center py-4.5 rounded-3xl"
            >
              <Text className="text-black text-lg font-bold">Create</Text>
              <Ionicons
                name="sparkles"
                size={20}
                color="#000000"
                className="ml-2"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Navigation */}
        <View className="flex-row bg-gray-800 py-4 px-10 justify-around border-t border-gray-700">
          <TouchableOpacity className="p-2">
            <Ionicons name="home" size={24} color="#14C46D" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="apps" size={24} color="#8E8E93" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2">
            <Ionicons name="person" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
