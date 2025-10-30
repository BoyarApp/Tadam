import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, LoadingState, ErrorState, Input } from '@components/common';
import { DistrictCheckbox } from '@components/feed';
import { OnboardingStackParamList, District } from '@types';
import { useDistricts } from '@api/hooks/useDistricts';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DistrictSelection'>;

const MIN_DISTRICTS = 1;
const MAX_DISTRICTS = 5;

export const DistrictSelectionScreen: React.FC<Props> = ({ route, navigation }) => {
  const tamil = isTamil();
  const { autoDetected } = route.params;

  const [selectedDistricts, setSelectedDistricts] = useState<District[]>(
    autoDetected ? [autoDetected] : []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const { data: districts, isLoading, error, refetch } = useDistricts();

  const handleToggleDistrict = (district: District) => {
    const isSelected = selectedDistricts.some((d) => d.id === district.id);

    if (isSelected) {
      setSelectedDistricts(selectedDistricts.filter((d) => d.id !== district.id));
    } else {
      if (selectedDistricts.length >= MAX_DISTRICTS) {
        Alert.alert(
          t('onboarding.maxDistrictsTitle'),
          t('onboarding.maxDistrictsMessage', { max: MAX_DISTRICTS })
        );
        return;
      }
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const handleContinue = () => {
    if (selectedDistricts.length < MIN_DISTRICTS) {
      Alert.alert(
        t('onboarding.minDistrictsTitle'),
        t('onboarding.minDistrictsMessage', { min: MIN_DISTRICTS })
      );
      return;
    }

    navigation.navigate('CategorySelection', { selectedDistricts });
  };

  const filteredDistricts = districts?.filter((district) =>
    district.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState fullScreen text={t('common.loading')} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              tamil ? theme.tamilTypography.h2 : theme.englishTypography.h2,
              styles.title,
            ]}
          >
            {t('onboarding.districtTitle')}
          </Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.subtitle,
            ]}
          >
            {t('onboarding.districtSubtitle', {
              min: MIN_DISTRICTS,
              max: MAX_DISTRICTS,
            })}
          </Text>

          {autoDetected && (
            <View style={styles.autoDetected}>
              <Text style={styles.autoDetectedEmoji}>📍</Text>
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.caption
                    : theme.englishTypography.caption,
                  styles.autoDetectedText,
                ]}
              >
                {t('onboarding.autoDetected', { district: autoDetected.name })}
              </Text>
            </View>
          )}
        </View>

        {/* Search */}
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('onboarding.searchDistrict')}
          containerStyle={styles.searchContainer}
        />

        {/* Selected Count */}
        <Text
          style={[
            tamil
              ? theme.tamilTypography.caption
              : theme.englishTypography.caption,
            styles.selectedCount,
          ]}
        >
          {t('onboarding.selectedCount', {
            count: selectedDistricts.length,
            max: MAX_DISTRICTS,
          })}
        </Text>

        {/* Districts List */}
        <FlatList
          data={filteredDistricts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DistrictCheckbox
              district={item}
              selected={selectedDistricts.some((d) => d.id === item.id)}
              onToggle={handleToggleDistrict}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        />

        {/* Continue Button */}
        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          disabled={selectedDistricts.length < MIN_DISTRICTS}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  autoDetected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.borderRadius.sm,
  },
  autoDetectedEmoji: {
    fontSize: 16,
  },
  autoDetectedText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  searchContainer: {
    marginBottom: theme.spacing.sm,
  },
  selectedCount: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  list: {
    flex: 1,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: theme.spacing.md,
  },
});
