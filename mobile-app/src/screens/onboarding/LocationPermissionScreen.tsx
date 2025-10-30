import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, LoadingState } from '@components/common';
import { OnboardingStackParamList, District } from '@types';
import LocationService from '@services/location.service';
import { reverseGeocode } from '@api/endpoints/districts';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LocationPermission'>;

export const LocationPermissionScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();
  const [loading, setLoading] = useState(false);

  const handleRequestPermission = async () => {
    try {
      setLoading(true);

      // Request location permission
      const permission = await LocationService.requestPermission();

      if (permission === 'granted') {
        // Get current location
        const location = await LocationService.getCurrentPosition();

        // Reverse geocode to get district
        const geocodeResult = await reverseGeocode(
          location.latitude,
          location.longitude
        );

        // Navigate to district selection with auto-detected district
        navigation.navigate('DistrictSelection', {
          autoDetected: geocodeResult.district as any, // District object
        });
      } else {
        // Permission denied - still navigate but without auto-detection
        navigation.navigate('DistrictSelection', {});
      }
    } catch (error) {
      console.error('Location permission error:', error);
      Alert.alert(
        t('errors.title'),
        t('errors.location'),
        [
          {
            text: t('common.skip'),
            onPress: () => navigation.navigate('DistrictSelection', {}),
          },
          {
            text: t('common.retry'),
            onPress: handleRequestPermission,
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('DistrictSelection', {});
  };

  if (loading) {
    return <LoadingState fullScreen text={t('onboarding.detectingLocation')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📍</Text>
          <Text
            style={[
              tamil ? theme.tamilTypography.h2 : theme.englishTypography.h2,
              styles.title,
            ]}
          >
            {t('onboarding.locationTitle')}
          </Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.subtitle,
            ]}
          >
            {t('onboarding.locationSubtitle')}
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {[
            {
              emoji: '🎯',
              text: t('onboarding.locationBenefit1'),
            },
            {
              emoji: '📰',
              text: t('onboarding.locationBenefit2'),
            },
            {
              emoji: '⚡',
              text: t('onboarding.locationBenefit3'),
            },
          ].map((benefit, index) => (
            <View key={index} style={styles.benefit}>
              <Text style={styles.benefitEmoji}>{benefit.emoji}</Text>
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.body
                    : theme.englishTypography.body,
                  styles.benefitText,
                ]}
              >
                {benefit.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={t('onboarding.allowLocation')}
            onPress={handleRequestPermission}
            variant="primary"
            size="large"
            fullWidth
          />

          <Button
            title={t('common.skip')}
            onPress={handleSkip}
            variant="ghost"
            size="large"
            fullWidth
          />
        </View>
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
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  benefits: {
    gap: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  benefitEmoji: {
    fontSize: 32,
  },
  benefitText: {
    flex: 1,
    color: theme.colors.textPrimary,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});
