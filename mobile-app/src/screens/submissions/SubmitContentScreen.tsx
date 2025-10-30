import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Card } from '@components/common';
import { AppStackParamList } from '@types';

type Props = NativeStackScreenProps<AppStackParamList, 'SubmitContent'>;

export const SubmitContentScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();

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
            {t('submit.title')}
          </Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.subtitle,
            ]}
          >
            {t('submit.subtitle')}
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          <Card
            variant="elevated"
            onPress={() => navigation.navigate('SubmitArticle')}
            style={styles.optionCard}
          >
            <Text style={styles.optionEmoji}>📰</Text>
            <Text
              style={[
                tamil ? theme.tamilTypography.h3 : theme.englishTypography.h3,
                styles.optionTitle,
              ]}
            >
              {t('submit.article')}
            </Text>
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.body
                  : theme.englishTypography.body,
                styles.optionDescription,
              ]}
            >
              {t('submit.articleDescription')}
            </Text>
          </Card>

          <Card
            variant="elevated"
            onPress={() => navigation.navigate('SubmitAd')}
            style={styles.optionCard}
          >
            <Text style={styles.optionEmoji}>📢</Text>
            <Text
              style={[
                tamil ? theme.tamilTypography.h3 : theme.englishTypography.h3,
                styles.optionTitle,
              ]}
            >
              {t('submit.ad')}
            </Text>
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.body
                  : theme.englishTypography.body,
                styles.optionDescription,
              ]}
            >
              {t('submit.adDescription')}
            </Text>
          </Card>
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
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    color: theme.colors.textSecondary,
  },
  options: {
    gap: theme.spacing.md,
  },
  optionCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  optionEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  optionTitle: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  optionDescription: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
