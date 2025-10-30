import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, LoadingState } from '@components/common';
import { OnboardingStackParamList } from '@types';
import NotificationService from '@services/notification.service';
import { usePreferencesStore } from '@store/preferences.store';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NotificationPermission'>;

export const NotificationPermissionScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();
  const [loading, setLoading] = useState(false);

  const { completeOnboarding } = usePreferencesStore();

  const handleRequestPermission = async () => {
    try {
      setLoading(true);

      // Request notification permission
      const permission = await NotificationService.requestPermission();

      if (permission === 'granted') {
        // Get FCM token
        const token = await NotificationService.getToken();
        console.log('FCM Token:', token);

        // TODO: Send token to backend
        // await registerFCMToken({ token, platform: Platform.OS, deviceId });
      }

      // Complete onboarding regardless of permission
      await completeOnboarding();

      // Navigation will be handled by root navigator
      // when it detects isOnboarded = true
    } catch (error) {
      console.error('Notification permission error:', error);
      Alert.alert(
        t('errors.title'),
        t('errors.notifications'),
        [
          {
            text: t('common.skip'),
            onPress: handleSkip,
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

  const handleSkip = async () => {
    await completeOnboarding();
  };

  if (loading) {
    return <LoadingState fullScreen text={t('onboarding.completing')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🔔</Text>
          <Text
            style={[
              tamil ? theme.tamilTypography.h2 : theme.englishTypography.h2,
              styles.title,
            ]}
          >
            {t('onboarding.notificationTitle')}
          </Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.subtitle,
            ]}
          >
            {t('onboarding.notificationSubtitle')}
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefits}>
          {[
            {
              emoji: '⚡',
              text: t('onboarding.notificationBenefit1'),
            },
            {
              emoji: '🎯',
              text: t('onboarding.notificationBenefit2'),
            },
            {
              emoji: '📍',
              text: t('onboarding.notificationBenefit3'),
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
            title={t('onboarding.allowNotifications')}
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
