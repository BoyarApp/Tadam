import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { LoadingState, ErrorState, Button } from '@components/common';
import { AppStackParamList } from '@types';
import { useArticle } from '@api/hooks/useArticle';
import { formatDate } from '@utils/formatters';
import { shareArticle } from '@utils/helpers';

type Props = NativeStackScreenProps<AppStackParamList, 'ArticleDetail'>;

export const ArticleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const tamil = isTamil();
  const { slug } = route.params;

  const { data: article, isLoading, error, refetch } = useArticle(slug);

  const handleShare = async () => {
    if (article) {
      await shareArticle(article.title, article.slug);
    }
  };

  if (isLoading) {
    return <LoadingState fullScreen text={t('article.loading')} />;
  }

  if (error || !article) {
    return <ErrorState error={error} onRetry={refetch} fullScreen />;
  }

  const imageUrl =
    article.featuredImage?.formats?.large?.url || article.featuredImage?.url;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Featured Image */}
        {imageUrl && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
        )}

        <View style={styles.content}>
          {/* Categories */}
          {article.categories.length > 0 && (
            <View style={styles.categories}>
              {article.categories.map((category) => (
                <View key={category.id} style={styles.categoryBadge}>
                  {category.emoji && (
                    <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  )}
                  <Text
                    style={[
                      tamil
                        ? theme.tamilTypography.caption
                        : theme.englishTypography.caption,
                      styles.categoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Title */}
          <Text
            style={[
              tamil ? theme.tamilTypography.h1 : theme.englishTypography.h1,
              styles.title,
            ]}
          >
            {article.title}
          </Text>

          {/* Meta */}
          <View style={styles.meta}>
            {article.published_at && (
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.caption
                    : theme.englishTypography.caption,
                  styles.metaText,
                ]}
              >
                {formatDate(article.published_at)}
              </Text>
            )}

            {article.districts.length > 0 && (
              <>
                <Text style={styles.metaSeparator}>•</Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.caption
                      : theme.englishTypography.caption,
                    styles.metaText,
                  ]}
                >
                  📍 {article.districts.map((d) => d.name).join(', ')}
                </Text>
              </>
            )}

            {article.views && (
              <>
                <Text style={styles.metaSeparator}>•</Text>
                <Text
                  style={[
                    tamil
                      ? theme.tamilTypography.caption
                      : theme.englishTypography.caption,
                    styles.metaText,
                  ]}
                >
                  👁 {article.views.toLocaleString()}
                </Text>
              </>
            )}
          </View>

          {/* Summary */}
          {article.summary && (
            <Text
              style={[
                tamil
                  ? theme.tamilTypography.body
                  : theme.englishTypography.body,
                styles.summary,
              ]}
            >
              {article.summary}
            </Text>
          )}

          {/* Content */}
          <Text
            style={[
              tamil ? theme.tamilTypography.body : theme.englishTypography.body,
              styles.content,
            ]}
          >
            {article.content}
          </Text>

          {/* Additional Images */}
          {article.images && article.images.length > 0 && (
            <View style={styles.images}>
              {article.images.map((image, index) => (
                <Image
                  key={image.id}
                  source={{ uri: image.formats?.medium?.url || image.url }}
                  style={styles.additionalImage}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}

          {/* Source */}
          {article.source && (
            <View style={styles.sourceContainer}>
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.caption
                    : theme.englishTypography.caption,
                  styles.sourceLabel,
                ]}
              >
                {t('article.source')}:
              </Text>
              <Text
                style={[
                  tamil
                    ? theme.tamilTypography.caption
                    : theme.englishTypography.caption,
                  styles.sourceText,
                ]}
              >
                {article.source}
              </Text>
            </View>
          )}

          {/* Share Button */}
          <Button
            title={t('article.share')}
            onPress={handleShare}
            variant="outline"
            fullWidth
            style={styles.shareButton}
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
  featuredImage: {
    width: '100%',
    height: 250,
    backgroundColor: theme.colors.surfaceLight,
  },
  content: {
    padding: theme.spacing.md,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metaText: {
    color: theme.colors.textSecondary,
  },
  metaSeparator: {
    color: theme.colors.textSecondary,
  },
  summary: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    fontWeight: '500',
  },
  images: {
    gap: theme.spacing.md,
    marginVertical: theme.spacing.lg,
  },
  additionalImage: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceLight,
  },
  sourceContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sourceLabel: {
    color: theme.colors.textSecondary,
  },
  sourceText: {
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  shareButton: {
    marginVertical: theme.spacing.lg,
  },
});
