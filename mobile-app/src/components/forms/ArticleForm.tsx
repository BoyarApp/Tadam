import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Input, Button } from '@components/common';
import { ImageUploader } from './ImageUploader';
import { CategoryChip } from '@components/feed';
import { DistrictCheckbox } from '@components/feed';
import { ArticleFormData, Category, District } from '@types';
import { articleSchema } from '@utils/validation';
import { z } from 'zod';

interface ArticleFormProps {
  categories: Category[];
  districts: District[];
  onSubmit: (data: ArticleFormData) => void;
  loading?: boolean;
  initialData?: Partial<ArticleFormData>;
}

export const ArticleForm: React.FC<ArticleFormProps> = ({
  categories,
  districts,
  onSubmit,
  loading = false,
  initialData,
}) => {
  const tamil = isTamil();

  const [formData, setFormData] = useState<Partial<ArticleFormData>>({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    content: initialData?.content || '',
    categoryId: initialData?.categoryId,
    districtId: initialData?.districtId,
    images: initialData?.images || [],
    source: initialData?.source || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  const handleChange = (field: keyof ArticleFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleValidateAndSubmit = () => {
    try {
      // Validate with Zod
      const validated = articleSchema.parse({
        ...formData,
        imageIds: formData.images,
      });

      // Submit
      onSubmit(validated as ArticleFormData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const selectedDistrict = districts.find((d) => d.id === formData.districtId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Input
          label={t('articleForm.title')}
          value={formData.title}
          onChangeText={(value) => handleChange('title', value)}
          placeholder={t('articleForm.titlePlaceholder')}
          error={errors.title}
          maxLength={200}
          multiline
        />

        {/* Summary */}
        <Input
          label={t('articleForm.summary')}
          value={formData.summary}
          onChangeText={(value) => handleChange('summary', value)}
          placeholder={t('articleForm.summaryPlaceholder')}
          error={errors.summary}
          maxLength={500}
          multiline
          numberOfLines={3}
        />

        {/* Content */}
        <Input
          label={t('articleForm.content')}
          value={formData.content}
          onChangeText={(value) => handleChange('content', value)}
          placeholder={t('articleForm.contentPlaceholder')}
          error={errors.content}
          maxLength={10000}
          multiline
          numberOfLines={10}
        />

        {/* Category Picker */}
        <View style={styles.pickerContainer}>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.label
                : theme.englishTypography.label,
              styles.label,
            ]}
          >
            {t('articleForm.category')}
          </Text>

          {selectedCategory ? (
            <View style={styles.selectedItem}>
              <CategoryChip
                category={selectedCategory}
                selected
                onPress={() => setShowCategoryPicker(true)}
              />
            </View>
          ) : (
            <Button
              title={t('articleForm.selectCategory')}
              onPress={() => setShowCategoryPicker(true)}
              variant="outline"
            />
          )}

          {errors.categoryId && (
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.caption
                  : theme.englishTypography.caption,
                styles.errorText,
              ]}
            >
              {errors.categoryId}
            </Text>
          )}

          {showCategoryPicker && (
            <View style={styles.pickerList}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    category={category}
                    selected={category.id === formData.categoryId}
                    onPress={(cat) => {
                      handleChange('categoryId', cat.id);
                      setShowCategoryPicker(false);
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* District Picker */}
        <View style={styles.pickerContainer}>
          <Text
            style={[
              tamil
                ? theme.tamilTypography.label
                : theme.englishTypography.label,
              styles.label,
            ]}
          >
            {t('articleForm.district')}
          </Text>

          {selectedDistrict ? (
            <View style={styles.selectedItem}>
              <DistrictCheckbox
                district={selectedDistrict}
                selected
                onToggle={() => setShowDistrictPicker(true)}
              />
            </View>
          ) : (
            <Button
              title={t('articleForm.selectDistrict')}
              onPress={() => setShowDistrictPicker(true)}
              variant="outline"
            />
          )}

          {errors.districtId && (
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.caption
                  : theme.englishTypography.caption,
                styles.errorText,
              ]}
            >
              {errors.districtId}
            </Text>
          )}

          {showDistrictPicker && (
            <View style={styles.pickerList}>
              {districts.slice(0, 10).map((district) => (
                <DistrictCheckbox
                  key={district.id}
                  district={district}
                  selected={district.id === formData.districtId}
                  onToggle={(dist) => {
                    handleChange('districtId', dist.id);
                    setShowDistrictPicker(false);
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Image Uploader */}
        <ImageUploader
          images={formData.images || []}
          onImagesChange={(imageIds) => handleChange('images', imageIds)}
          disabled={loading}
        />

        {/* Source (optional) */}
        <Input
          label={t('articleForm.source')}
          value={formData.source}
          onChangeText={(value) => handleChange('source', value)}
          placeholder={t('articleForm.sourcePlaceholder')}
          error={errors.source}
        />

        {/* Submit Button */}
        <Button
          title={t('articleForm.submit')}
          onPress={handleValidateAndSubmit}
          loading={loading}
          disabled={loading}
          fullWidth
          size="large"
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  label: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  pickerContainer: {
    marginBottom: theme.spacing.md,
  },
  selectedItem: {
    marginBottom: theme.spacing.sm,
  },
  pickerList: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  errorText: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
