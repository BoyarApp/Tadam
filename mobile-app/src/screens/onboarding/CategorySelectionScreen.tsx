import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Button, LoadingState, ErrorState } from '@components/common';
import { CategoryChip } from '@components/feed';
import { OnboardingStackParamList, Category } from '@types';
import { useCategories } from '@api/hooks/useCategories';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CategorySelection'>;

const MIN_CATEGORIES = 1;
const MAX_CATEGORIES = 10;

export const CategorySelectionScreen: React.FC<Props> = ({ route, navigation }) => {
  const tamil = isTamil();
  const { selectedDistricts } = route.params;

  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const { data: categories, isLoading, error, refetch } = useCategories();

  const handleToggleCategory = (category: Category) => {
    const isSelected = selectedCategories.some((c) => c.id === category.id);

    if (isSelected) {
      setSelectedCategories(selectedCategories.filter((c) => c.id !== category.id));
    } else {
      if (selectedCategories.length >= MAX_CATEGORIES) {
        Alert.alert(
          t('onboarding.maxCategoriesTitle'),
          t('onboarding.maxCategoriesMessage', { max: MAX_CATEGORIES })
        );
        return;
      }
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleContinue = () => {
    if (selectedCategories.length < MIN_CATEGORIES) {
      Alert.alert(
        t('onboarding.minCategoriesTitle'),
        t('onboarding.minCategoriesMessage', { min: MIN_CATEGORIES })
      );
      return;
    }

    navigation.navigate('NotificationPermission');
  };

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
            {t('onboarding.categoryTitle')}
          </Text>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.body
                : theme.englishTypography.body,
              styles.subtitle,
            ]}
          >
            {t('onboarding.categorySubtitle', {
              min: MIN_CATEGORIES,
              max: MAX_CATEGORIES,
            })}
          </Text>
        </View>

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
            count: selectedCategories.length,
            max: MAX_CATEGORIES,
          })}
        </Text>

        {/* Categories */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.categoriesContainer}>
            {categories?.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                selected={selectedCategories.some((c) => c.id === category.id)}
                onPress={handleToggleCategory}
              />
            ))}
          </View>
        </ScrollView>

        {/* Continue Button */}
        <Button
          title={t('common.continue')}
          onPress={handleContinue}
          disabled={selectedCategories.length < MIN_CATEGORIES}
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
  selectedCount: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  scrollView: {
    flex: 1,
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
});
