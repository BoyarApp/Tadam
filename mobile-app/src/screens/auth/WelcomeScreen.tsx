import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button } from '@components/common';
import { AuthStackParamList } from '@types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>{t('common.appName')}</Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.tagline,
            ]}
          >
            {t('welcome.tagline')}
          </Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Text style={styles.illustration}>📰</Text>
          <Text
            style={[
              tamil ? theme.tamilTypography.h2 : theme.englishTypography.h2,
              styles.welcomeTitle,
            ]}
          >
            {t('welcome.title')}
          </Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.welcomeSubtitle,
            ]}
          >
            {t('welcome.subtitle')}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title={t('welcome.getStarted')}
            onPress={() => navigation.navigate('Login')}
            variant="primary"
            size="large"
            fullWidth
          />

          <Text
            style={[
              tamil
                ? theme.tamilTypography.caption
                : theme.englishTypography.caption,
              styles.disclaimer,
            ]}
          >
            {t('welcome.disclaimer')}
          </Text>
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
  logoContainer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xxl,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  tagline: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  illustration: {
    fontSize: 100,
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeSubtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  actionsContainer: {
    gap: theme.spacing.md,
  },
  disclaimer: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
});
