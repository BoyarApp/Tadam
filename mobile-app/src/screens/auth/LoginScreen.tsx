import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, LoadingState } from '@components/common';
import { AuthStackParamList } from '@types';
import { useSocialAuth } from '@api/hooks/useAuth';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();
  const [loading, setLoading] = useState(false);

  const socialAuthMutation = useSocialAuth();

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      // Configure Google Sign-In
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.idToken) {
        // Send to backend
        await socialAuthMutation.mutateAsync({
          provider: 'google',
          accessToken: userInfo.idToken,
        });
      }
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      Alert.alert(t('errors.title'), t('errors.googleSignIn'));
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);

      // Perform Apple Sign-In
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, authorizationCode } = appleAuthRequestResponse;

      if (identityToken) {
        // Send to backend
        await socialAuthMutation.mutateAsync({
          provider: 'apple',
          accessToken: authorizationCode,
          idToken: identityToken,
        });
      }
    } catch (error: any) {
      console.error('Apple Sign-In error:', error);
      if (error.code !== appleAuth.Error.CANCELED) {
        Alert.alert(t('errors.title'), t('errors.appleSignIn'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = () => {
    navigation.navigate('PhoneLogin');
  };

  if (loading || socialAuthMutation.isPending) {
    return <LoadingState fullScreen text={t('auth.signingIn')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>{t('common.appName')}</Text>
            <Text
              style={[
                tamil ? theme.tamilTypography.h2 : theme.englishTypography.h2,
                styles.title,
              ]}
            >
              {t('auth.welcome')}
            </Text>
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.body
                  : theme.englishTypography.body,
                styles.subtitle,
              ]}
            >
              {t('auth.loginPrompt')}
            </Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtons}>
            <Button
              title={t('auth.googleSignIn')}
              onPress={handleGoogleSignIn}
              variant="outline"
              size="large"
              fullWidth
              disabled={loading}
            />

            {Platform.OS === 'ios' && (
              <Button
                title={t('auth.appleSignIn')}
                onPress={handleAppleSignIn}
                variant="outline"
                size="large"
                fullWidth
                disabled={loading}
              />
            )}

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.caption
                    : theme.englishTypography.caption,
                  styles.dividerText,
                ]}
              >
                {t('auth.or')}
              </Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title={t('auth.phoneSignIn')}
              onPress={handlePhoneLogin}
              variant="primary"
              size="large"
              fullWidth
              disabled={loading}
            />
          </View>

          {/* Terms */}
          <Text
            style={[
              tamil
                ? theme.tamilTypography.caption
                : theme.englishTypography.caption,
              styles.terms,
            ]}
          >
            {t('auth.terms')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  socialButtons: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.md,
  },
  terms: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
});
