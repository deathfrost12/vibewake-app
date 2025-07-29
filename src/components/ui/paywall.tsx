import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './button';
import { useRevenueCat } from '../common/revenuecat-provider';
import type { PurchasesPackage } from 'react-native-purchases';

const { width, height } = Dimensions.get('window');

const MOCK_PACKAGES = [
  {
    identifier: 'monthly',
    product: {
      identifier: 'com.danielholes.repetito.dev.pro.monthly',
      title: 'Repetito Pro Monthly',
      description: 'Měsíční přístup ke všem premium funkcím',
      priceString: '159 Kč',
      price: 159,
      currencyCode: 'CZK',
    },
  },
  {
    identifier: 'annual',
    product: {
      identifier: 'com.danielholes.repetito.dev.pro.annual',
      title: 'Repetito Pro Annual',
      description: 'Roční přístup ke všem premium funkcím',
      priceString: '990 Kč',
      price: 990,
      currencyCode: 'CZK',
    },
  },
];

interface PaywallProps {
  isVisible: boolean;
  onClose: () => void;
  source?:
    | 'onboarding'
    | 'magic_notes'
    | 'verified_content'
    | 'profile'
    | 'demo';
  title?: string;
  subtitle?: string;
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View className="flex-row items-start mb-4">
      <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3 mt-1">
        <Ionicons name={icon} size={20} color="#14C46D" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base mb-1">
          {title}
        </Text>
        <Text className="text-gray-600 text-sm leading-5">{description}</Text>
      </View>
    </View>
  );
}

interface PackageCardProps {
  package: PurchasesPackage;
  isSelected: boolean;
  onSelect: () => void;
  isPopular?: boolean;
}

function PackageCard({
  package: pkg,
  isSelected,
  onSelect,
  isPopular,
}: PackageCardProps) {
  // Parse package type from identifier
  const isAnnual =
    pkg.identifier.includes('annual') || pkg.identifier.includes('yearly');
  const isMonthly = pkg.identifier.includes('monthly');

  // Calculate savings for annual plans
  const savings = isAnnual ? '2 měsíce zdarma!' : undefined;

  return (
    <Pressable
      onPress={onSelect}
      className={`border-2 rounded-xl p-4 mb-3 ${
        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
      }`}
    >
      {isPopular && (
        <View className="absolute -top-2 left-4 bg-primary px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-semibold">
            Nejpopulárnější
          </Text>
        </View>
      )}

      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-lg">
            {isAnnual
              ? 'Roční předplatné'
              : isMonthly
                ? 'Měsíční předplatné'
                : pkg.product.title}
          </Text>

          {savings && (
            <Text className="text-primary font-medium text-sm mt-1">
              {savings}
            </Text>
          )}

          <Text className="text-gray-600 text-sm mt-1">
            {pkg.product.description}
          </Text>
        </View>

        <View className="items-end ml-3">
          <Text className="text-gray-900 font-bold text-xl">
            {pkg.product.priceString}
          </Text>
          {isAnnual && (
            <Text className="text-gray-500 text-xs">~133 Kč/měs</Text>
          )}
        </View>

        <View
          className={`w-5 h-5 rounded-full border-2 ml-3 items-center justify-center ${
            isSelected ? 'border-primary bg-primary' : 'border-gray-300'
          }`}
        >
          {isSelected && <Ionicons name="checkmark" size={12} color="white" />}
        </View>
      </View>
    </Pressable>
  );
}

export function Paywall({
  isVisible,
  onClose,
  source = 'profile',
  title,
  subtitle,
}: PaywallProps) {
  const { packages, purchasePackage, restorePurchases, isLoading } =
    useRevenueCat();
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Use mock packages if real packages are not available (for development)
  const availablePackages =
    packages.length > 0 ? packages : (MOCK_PACKAGES as any[]);
  const isUsingMockData = packages.length === 0;

  // Select the annual package by default (most popular)
  React.useEffect(() => {
    if (availablePackages.length > 0 && !selectedPackage) {
      const annualPackage = availablePackages.find(
        pkg =>
          pkg.identifier.includes('annual') || pkg.identifier.includes('yearly')
      );
      setSelectedPackage(annualPackage || availablePackages[0]);
    }
  }, [availablePackages, selectedPackage]);

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Chyba', 'Vyberte prosím balíček pro nákup');
      return;
    }

    try {
      setIsPurchasing(true);

      if (isUsingMockData) {
        // Mock purchase for development
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
        Alert.alert(
          'Demo nákup úspěšný! 🎉',
          'Toto je demo režim. V produkční verzi by nyní byl aktivován RevenueCat nákup.',
          [{ text: 'Pokračovat', onPress: onClose }]
        );
      } else {
        const success = await purchasePackage(selectedPackage);

        if (success) {
          Alert.alert(
            'Úspěch! 🎉',
            'Děkujeme za předplatné Repetito Pro! Nyní máte přístup ke všem premium funkcím.',
            [{ text: 'Pokračovat', onPress: onClose }]
          );
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsPurchasing(true);
      const success = await restorePurchases();

      if (success) {
        Alert.alert('Obnoveno! ✅', 'Vaše předplatné bylo úspěšně obnoveno.', [
          { text: 'Pokračovat', onPress: onClose },
        ]);
      } else {
        Alert.alert(
          'Žádné nákupy',
          'Nebyly nalezeny žádné předchozí nákupy k obnovení.'
        );
      }
    } catch (error) {
      console.error('Restore error:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">Repetito Pro</Text>
          <Pressable
            onPress={onClose}
            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View className="py-8 items-center">
            <View className="w-16 h-16 bg-primary rounded-full items-center justify-center mb-4">
              <Ionicons name="star" size={32} color="white" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
              {title || 'Odemkněte plný potenciál Repetito'}
            </Text>

            <Text className="text-gray-600 text-center text-base leading-6">
              {subtitle ||
                'Získejte přístup k ověřenému obsahu, AI funkcím a pokročilým nástrojům pro úspěch u maturity.'}
            </Text>
          </View>

          {/* Features */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Co získáte s Repetito Pro:
            </Text>

            <FeatureItem
              icon="library"
              title="Ověřený maturitní obsah"
              description="Přístup k rozsáhlé knihovně ověřených study setů připravených odborníky"
            />

            <FeatureItem
              icon="sparkles"
              title="Magic Notes (AI + OCR)"
              description="Převeďte své poznámky na interaktivní kartičky pomocí umělé inteligence"
            />

            <FeatureItem
              icon="analytics"
              title="Pokročilé statistiky"
              description="Detailní analýza vašeho pokroku a personalizované doporučení"
            />

            <FeatureItem
              icon="cloud-offline"
              title="Offline režim"
              description="Studujte kdekoli, i bez připojení k internetu"
            />

            <FeatureItem
              icon="notifications"
              title="Chytré notifikace"
              description="Personalizované připomínky založené na křivce zapomínání"
            />
          </View>

          {/* Packages */}
          {availablePackages.length > 0 && (
            <View className="mb-8">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                Vyberte svůj plán:
                {isUsingMockData && (
                  <Text className="text-sm text-orange-600 font-normal">
                    {' '}
                    (Demo režim)
                  </Text>
                )}
              </Text>

              {availablePackages.map((pkg, index) => {
                const isAnnual =
                  pkg.identifier.includes('annual') ||
                  pkg.identifier.includes('yearly');

                return (
                  <PackageCard
                    key={pkg.identifier}
                    package={pkg}
                    isSelected={selectedPackage?.identifier === pkg.identifier}
                    onSelect={() => setSelectedPackage(pkg)}
                    isPopular={isAnnual}
                  />
                );
              })}
            </View>
          )}

          {/* Purchase Button */}
          <View className="mb-6">
            <Button
              title={
                isPurchasing
                  ? 'Zpracovávám...'
                  : 'Spustit 7denní zkušební období'
              }
              onPress={handlePurchase}
              disabled={isPurchasing || !selectedPackage || isLoading}
              className="mb-4"
            />

            {isPurchasing && (
              <View className="flex-row items-center justify-center mb-4">
                <ActivityIndicator size="small" color="#14C46D" />
                <Text className="text-gray-600 ml-2">Zpracovávám nákup...</Text>
              </View>
            )}

            {/* Restore Button */}
            <Pressable
              onPress={handleRestore}
              disabled={isPurchasing}
              className="py-3"
            >
              <Text className="text-primary text-center font-medium">
                Obnovit předchozí nákupy
              </Text>
            </Pressable>
          </View>

          {/* Terms */}
          <View className="pb-8">
            <Text className="text-xs text-gray-500 text-center leading-4">
              Předplatné se automaticky obnovuje. Zrušit můžete kdykoli v
              nastavení App Store nebo Google Play. Pokračováním souhlasíte s
              našimi Podmínkami použití a Zásadami ochrany osobních údajů.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
