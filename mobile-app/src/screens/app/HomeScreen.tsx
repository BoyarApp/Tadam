import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { theme } from '@theme';
import { isTamil, t } from '@i18n';
import { LoadingState, ErrorState, EmptyState } from '@components/common';
import { FeedCard } from '@components/feed';
import { AppStackParamList, FeedItem } from '@types';
import { useFeed } from '@api/hooks/useFeed';
import { usePreferencesStore } from '@store/preferences.store';

type Props = NativeStackScreenProps<AppStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const tamil = isTamil();
  const { categories, districts } = usePreferencesStore();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useFeed({
    categories: categories.map((c) => c.id.toString()),
    districts: districts.map((d) => d.id.toString()),
  });

  const feedItems = data?.pages.flatMap((page) => page) || [];

  const handleArticlePress = (slug: string) => {
    navigation.navigate('ArticleDetail', { slug });
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return <LoadingState size="small" />;
    }
    return null;
  };

  if (isLoading) {
    return <LoadingState fullScreen text={t('feed.loading')} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} fullScreen />;
  }

  if (feedItems.length === 0) {
    return (
      <EmptyState
        title={t('feed.empty')}
        message={t('feed.emptyMessage')}
        actionLabel={t('feed.exploreCategories')}
        onAction={() => navigation.navigate('Preferences')}
        emoji="📰"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[
              tamil ? theme.tamilTypography.h1 : theme.englishTypography.h1,
              styles.title,
            ]}
          >
            {t('common.appName')}
          </Text>
        </View>

        {/* Feed */}
        <FlatList
          data={feedItems}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => (
            <FeedCard item={item} onPress={handleArticlePress} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
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
  },
  header: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    color: theme.colors.primary,
  },
  listContent: {
    padding: theme.spacing.md,
  },
});
