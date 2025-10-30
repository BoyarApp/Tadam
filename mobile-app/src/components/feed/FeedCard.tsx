import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { FeedItem } from '@types';
import { formatTimeAgo } from '@utils/formatters';
import { Card } from '@components/common';

interface FeedCardProps {
  item: FeedItem;
  onPress: (slug: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ item, onPress }) => {
  const tamil = isTamil();
  const imageUrl = item.featuredImage?.formats?.medium?.url || item.featuredImage?.url;

  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={() => onPress(item.slug)}
      style={styles.card}
    >
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        {/* Category badges */}
        {item.categories.length > 0 && (
          <View style={styles.categoryContainer}>
            {item.categories.slice(0, 2).map((category) => (
              <View key={category} style={styles.categoryBadge}>
                <Text
                  style={[
                    styles.categoryText,
                    tamil
                      ? theme.tamilTypography.caption
                      : theme.englishTypography.caption,
                  ]}
                >
                  {category}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Title */}
        <Text
          style={[
            styles.title,
            tamil ? theme.tamilTypography.h3 : theme.englishTypography.h3,
          ]}
          numberOfLines={3}
        >
          {item.title}
        </Text>

        {/* Summary */}
        {item.summary && (
          <Text
            style={[
              styles.summary,
              tamil ? theme.tamilTypography.body : theme.englishTypography.body,
            ]}
            numberOfLines={2}
          >
            {item.summary}
          </Text>
        )}

        {/* Meta information */}
        <View style={styles.meta}>
          {/* Districts */}
          {item.districts.length > 0 && (
            <View style={styles.metaItem}>
              <Text style={styles.metaIcon}>📍</Text>
              <Text
                style={[
                  styles.metaText,
                  tamil
                    ? theme.tamilTypography.caption
                    : theme.englishTypography.caption,
                ]}
              >
                {item.districts.slice(0, 2).join(', ')}
              </Text>
            </View>
          )}

          {/* Published time */}
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text
              style={[
                styles.metaText,
                tamil
                  ? theme.tamilTypography.caption
                  : theme.englishTypography.caption,
              ]}
            >
              {formatTimeAgo(item.publishedAt)}
            </Text>
          </View>
        </View>

        {/* Reason (why this article is shown) */}
        {item.reason && (
          <View style={styles.reasonContainer}>
            <Text
              style={[
                styles.reasonText,
                tamil
                  ? theme.tamilTypography.caption
                  : theme.englishTypography.caption,
              ]}
            >
              💡 {item.reason}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.surfaceLight,
  },
  content: {
    padding: theme.spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  categoryText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  title: {
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  summary: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    color: theme.colors.textSecondary,
  },
  reasonContainer: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  reasonText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
