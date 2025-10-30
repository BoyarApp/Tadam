import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { Input, Button, LoadingState } from '@components/common';
import { CategoryChip, DistrictCheckbox } from '@components/feed';
import { ImageUploader } from '@components/forms';
import { AppStackParamList, AdFormData, Category, District } from '@types';
import { useCategories } from '@api/hooks/useCategories';
import { useDistricts } from '@api/hooks/useDistricts';
import { useSubmitAd } from '@api/hooks/useSubmissions';
import { adSchema } from '@utils/validation';
import { z } from 'zod';

type Props = NativeStackScreenProps<AppStackParamList, 'SubmitAd'>;

export const SubmitAdScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();

  const [formData, setFormData] = useState<Partial<AdFormData>>({
    name: '',
    description: '',
    targetUrl: '',
    categoryIds: [],
    districtIds: [],
    budget: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    creative: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: districts, isLoading: districtsLoading } = useDistricts();
  const submitMutation = useSubmitAd();

  const handleChange = (field: keyof AdFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleToggleCategory = (category: Category) => {
    const categoryIds = formData.categoryIds || [];
    const isSelected = categoryIds.includes(category.id);

    if (isSelected) {
      handleChange('categoryIds', categoryIds.filter((id) => id !== category.id));
    } else {
      handleChange('categoryIds', [...categoryIds, category.id]);
    }
  };

  const handleToggleDistrict = (district: District) => {
    const districtIds = formData.districtIds || [];
    const isSelected = districtIds.includes(district.id);

    if (isSelected) {
      handleChange('districtIds', districtIds.filter((id) => id !== district.id));
    } else {
      handleChange('districtIds', [...districtIds, district.id]);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate
      adSchema.parse(formData);

      // Submit
      await submitMutation.mutateAsync({
        name: formData.name!,
        description: formData.description,
        creativeUrl: formData.creative || '',
        targetUrl: formData.targetUrl!,
        categoryIds: formData.categoryIds!,
        districtIds: formData.districtIds!,
        budget: formData.budget!,
        startDate: formData.startDate!.toISOString(),
        endDate: formData.endDate!.toISOString(),
      });

      Alert.alert(
        t('submit.successTitle'),
        t('submit.adSuccessMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        Alert.alert(t('errors.title'), t('errors.submitAd'));
      }
    }
  };

  if (categoriesLoading || districtsLoading) {
    return <LoadingState fullScreen text={t('common.loading')} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Campaign Name */}
          <Input
            label={t('adForm.name')}
            value={formData.name}
            onChangeText={(value) => handleChange('name', value)}
            placeholder={t('adForm.namePlaceholder')}
            error={errors.name}
          />

          {/* Description */}
          <Input
            label={t('adForm.description')}
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            placeholder={t('adForm.descriptionPlaceholder')}
            error={errors.description}
            multiline
            numberOfLines={3}
          />

          {/* Target URL */}
          <Input
            label={t('adForm.targetUrl')}
            value={formData.targetUrl}
            onChangeText={(value) => handleChange('targetUrl', value)}
            placeholder="https://example.com"
            error={errors.targetUrl}
            keyboardType="url"
          />

          {/* Categories */}
          <View style={styles.section}>
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.label
                  : theme.englishTypography.label,
                styles.label,
              ]}
            >
              {t('adForm.categories')}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories?.map((category) => (
                <CategoryChip
                  key={category.id}
                  category={category}
                  selected={formData.categoryIds?.includes(category.id)}
                  onPress={handleToggleCategory}
                />
              ))}
            </ScrollView>
          </View>

          {/* Districts */}
          <View style={styles.section}>
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.label
                  : theme.englishTypography.label,
                styles.label,
              ]}
            >
              {t('adForm.districts')}
            </Text>
            {districts?.slice(0, 5).map((district) => (
              <DistrictCheckbox
                key={district.id}
                district={district}
                selected={formData.districtIds?.includes(district.id)}
                onToggle={handleToggleDistrict}
              />
            ))}
          </View>

          {/* Budget */}
          <Input
            label={t('adForm.budget')}
            value={formData.budget?.toString()}
            onChangeText={(value) => handleChange('budget', parseFloat(value) || 0)}
            placeholder="5000"
            error={errors.budget}
            keyboardType="numeric"
          />

          {/* Date Range */}
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.label
                    : theme.englishTypography.label,
                  styles.label,
                ]}
              >
                {t('adForm.startDate')}
              </Text>
              <Button
                title={formData.startDate?.toLocaleDateString() || t('adForm.selectDate')}
                onPress={() => setShowStartDatePicker(true)}
                variant="outline"
              />
            </View>

            <View style={styles.dateField}>
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.label
                    : theme.englishTypography.label,
                  styles.label,
                ]}
              >
                {t('adForm.endDate')}
              </Text>
              <Button
                title={formData.endDate?.toLocaleDateString() || t('adForm.selectDate')}
                onPress={() => setShowEndDatePicker(true)}
                variant="outline"
              />
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={formData.startDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowStartDatePicker(false);
                if (date) handleChange('startDate', date);
              }}
              minimumDate={new Date()}
            />
          )}

          {showEndDatePicker && (
            <DateTimePicker
              value={formData.endDate || new Date()}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowEndDatePicker(false);
                if (date) handleChange('endDate', date);
              }}
              minimumDate={formData.startDate || new Date()}
            />
          )}

          {/* Submit Button */}
          <Button
            title={t('adForm.submit')}
            onPress={handleSubmit}
            loading={submitMutation.isPending}
            disabled={submitMutation.isPending}
            fullWidth
            size="large"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
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
  section: {
    marginBottom: theme.spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dateField: {
    flex: 1,
  },
  submitButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});
