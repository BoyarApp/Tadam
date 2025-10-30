import React from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { t } from '@i18n';
import { LoadingState } from '@components/common';
import { ArticleForm } from '@components/forms';
import { AppStackParamList, ArticleFormData } from '@types';
import { useCategories } from '@api/hooks/useCategories';
import { useDistricts } from '@api/hooks/useDistricts';
import { useSubmitArticle } from '@api/hooks/useSubmissions';

type Props = NativeStackScreenProps<AppStackParamList, 'SubmitArticle'>;

export const SubmitArticleScreen: React.FC<Props> = ({ navigation }) => {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: districts, isLoading: districtsLoading } = useDistricts();
  const submitMutation = useSubmitArticle();

  const handleSubmit = async (data: ArticleFormData) => {
    try {
      await submitMutation.mutateAsync({
        title: data.title,
        content: data.content,
        summary: data.summary,
        categoryId: data.categoryId,
        districtId: data.districtId,
        imageIds: data.images as any,
        source: data.source,
      });

      Alert.alert(
        t('submit.successTitle'),
        t('submit.successMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(t('errors.title'), t('errors.submitArticle'));
    }
  };

  if (categoriesLoading || districtsLoading) {
    return <LoadingState fullScreen text={t('common.loading')} />;
  }

  if (!categories || !districts) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ArticleForm
        categories={categories}
        districts={districts}
        onSubmit={handleSubmit}
        loading={submitMutation.isPending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
