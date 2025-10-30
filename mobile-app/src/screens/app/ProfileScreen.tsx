import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, Card } from '@components/common';
import { AppStackParamList } from '@types';
import { useAuthStore } from '@store/auth.store';
import { usePreferencesStore } from '@store/preferences.store';
import { useLogout } from '@api/hooks/useAuth';

type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress }) => {
  const tamil = isTamil();

  return (
    <Pressable onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <View>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.menuTitle,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.caption
                  : theme.englishTypography.caption,
                styles.menuSubtitle,
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();
  const { user } = useAuthStore();
  const { categories, districts, language } = usePreferencesStore();

  const logoutMutation = useLogout();

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutTitle'),
      t('profile.logoutMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await logoutMutation.mutateAsync();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                tamil ? theme.tamilTypography.h1 : theme.englishTypography.h1,
                styles.title,
              ]}
            >
              {t('profile.title')}
            </Text>
          </View>

          {/* User Info */}
          <Card variant="elevated" style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase() || '👤'}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.h3
                      : theme.englishTypography.h3,
                    styles.userName,
                  ]}
                >
                  {user?.username || t('profile.guest')}
                </Text>
                {user?.phone && (
                  <Text
                    style={[
                      tamil
                        ? theme.tamilTypography.caption
                        : theme.englishTypography.caption,
                      styles.userPhone,
                    ]}
                  >
                    {user.phone}
                  </Text>
                )}
              </View>
            </View>
          </Card>

          {/* Preferences Summary */}
          <Card variant="elevated" style={styles.section}>
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.h3
                  : theme.englishTypography.h3,
                styles.sectionTitle,
              ]}
            >
              {t('profile.preferences')}
            </Text>

            <View style={styles.preferencesGrid}>
              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>📍</Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.caption
                      : theme.englishTypography.caption,
                    styles.preferenceLabel,
                  ]}
                >
                  {t('profile.districts')}
                </Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.body
                      : theme.englishTypography.body,
                    styles.preferenceValue,
                  ]}
                >
                  {districts.length}
                </Text>
              </View>

              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>📂</Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.caption
                      : theme.englishTypography.caption,
                    styles.preferenceLabel,
                  ]}
                >
                  {t('profile.categories')}
                </Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.body
                      : theme.englishTypography.body,
                    styles.preferenceValue,
                  ]}
                >
                  {categories.length}
                </Text>
              </View>

              <View style={styles.preferenceItem}>
                <Text style={styles.preferenceIcon}>🌐</Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.caption
                      : theme.englishTypography.caption,
                    styles.preferenceLabel,
                  ]}
                >
                  {t('profile.language')}
                </Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.body
                      : theme.englishTypography.body,
                    styles.preferenceValue,
                  ]}
                >
                  {language === 'ta' ? 'தமிழ்' : 'English'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Menu */}
          <Card variant="elevated" style={styles.section}>
            <MenuItem
              icon="⚙️"
              title={t('profile.preferences')}
              subtitle={t('profile.preferencesSubtitle')}
              onPress={() => navigation.navigate('Preferences')}
            />

            <MenuItem
              icon="📝"
              title={t('profile.submissions')}
              subtitle={t('profile.submissionsSubtitle')}
              onPress={() => navigation.navigate('SubmissionsList')}
            />

            <MenuItem
              icon="🔔"
              title={t('profile.notifications')}
              subtitle={t('profile.notificationsSubtitle')}
              onPress={() => navigation.navigate('NotificationSettings')}
            />

            <MenuItem
              icon="🌐"
              title={t('profile.languageSettings')}
              subtitle={language === 'ta' ? 'தமிழ்' : 'English'}
              onPress={() => navigation.navigate('LanguageSettings')}
            />

            <MenuItem
              icon="⚙️"
              title={t('profile.settings')}
              onPress={() => navigation.navigate('Settings')}
            />
          </Card>

          {/* Logout */}
          <Button
            title={t('profile.logout')}
            onPress={handleLogout}
            variant="outline"
            fullWidth
            loading={logoutMutation.isPending}
            style={styles.logoutButton}
          />
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.textPrimary,
  },
  userCard: {
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  userName: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  userPhone: {
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  preferencesGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  preferenceItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
  },
  preferenceIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  preferenceLabel: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  preferenceValue: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuTitle: {
    color: theme.colors.textPrimary,
  },
  menuSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  menuArrow: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
});
