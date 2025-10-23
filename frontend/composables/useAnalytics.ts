/**
 * Analytics composable
 * Provides centralized event tracking with Plausible and Sentry integration
 */

export type AnalyticsEventName =
  | 'page_view'
  | 'article_view'
  | 'article_share'
  | 'membership_view'
  | 'membership_checkout_start'
  | 'membership_checkout_complete'
  | 'membership_checkout_failed'
  | 'district_selected'
  | 'category_selected'
  | 'feed_section_view'
  | 'ad_impression'
  | 'ad_click'
  | 'search_query'
  | 'error_encountered';

export interface AnalyticsEventProperties {
  [key: string]: string | number | boolean | undefined;
}

export interface PlausibleOptions {
  callback?: () => void;
  props?: Record<string, string | number | boolean>;
}

declare global {
  interface Window {
    plausible?: (eventName: string, options?: PlausibleOptions) => void;
  }
}

export const useAnalytics = () => {
  const config = useRuntimeConfig();
  const route = useRoute();

  /**
   * Track event with Plausible
   */
  const trackEvent = (
    eventName: AnalyticsEventName,
    properties?: AnalyticsEventProperties,
  ): void => {
    if (!process.client) {
      return;
    }

    try {
      // Track with Plausible if available
      if (window.plausible && config.public.plausibleDomain) {
        const props: Record<string, string | number | boolean> = {};

        // Convert properties to Plausible format
        if (properties) {
          Object.entries(properties).forEach(([key, value]) => {
            if (value !== undefined) {
              props[key] = value;
            }
          });
        }

        window.plausible(eventName, {
          props: Object.keys(props).length > 0 ? props : undefined,
        });

        if (import.meta.dev) {
          console.info('[Analytics] Event tracked:', eventName, props);
        }
      }
    } catch (error) {
      console.warn('[Analytics] Failed to track event:', error);
    }
  };

  /**
   * Track page view
   */
  const trackPageView = (pagePath?: string): void => {
    if (!process.client) {
      return;
    }

    const path = pagePath ?? route.fullPath;

    trackEvent('page_view', {
      path,
      referrer: document.referrer || undefined,
    });
  };

  /**
   * Track article view with metadata
   */
  const trackArticleView = (articleData: {
    slug: string;
    title: string;
    category?: string;
    district?: string;
  }): void => {
    trackEvent('article_view', {
      article_slug: articleData.slug,
      article_title: articleData.title,
      category: articleData.category,
      district: articleData.district,
    });
  };

  /**
   * Track article share
   */
  const trackArticleShare = (method: 'native' | 'whatsapp' | 'twitter' | 'copy', slug: string): void => {
    trackEvent('article_share', {
      share_method: method,
      article_slug: slug,
    });
  };

  /**
   * Track membership events
   */
  const trackMembershipEvent = (
    action: 'view' | 'checkout_start' | 'checkout_complete' | 'checkout_failed',
    metadata?: {
      plan?: string;
      amount?: number;
      transactionId?: string;
      errorReason?: string;
    },
  ): void => {
    const eventName: AnalyticsEventName =
      action === 'view'
        ? 'membership_view'
        : action === 'checkout_start'
          ? 'membership_checkout_start'
          : action === 'checkout_complete'
            ? 'membership_checkout_complete'
            : 'membership_checkout_failed';

    trackEvent(eventName, {
      plan: metadata?.plan,
      amount: metadata?.amount,
      transaction_id: metadata?.transactionId,
      error_reason: metadata?.errorReason,
    });
  };

  /**
   * Track district selection
   */
  const trackDistrictSelection = (districts: string[]): void => {
    trackEvent('district_selected', {
      district_count: districts.length,
      districts: districts.join(','),
    });
  };

  /**
   * Track category selection
   */
  const trackCategorySelection = (category: string): void => {
    trackEvent('category_selected', {
      category,
    });
  };

  /**
   * Track feed section view
   */
  const trackFeedSectionView = (sectionTitle: string, cardCount: number): void => {
    trackEvent('feed_section_view', {
      section_title: sectionTitle,
      card_count: cardCount,
    });
  };

  /**
   * Track ad events
   */
  const trackAdEvent = (
    action: 'impression' | 'click',
    adData: {
      campaignId: string;
      creativeId: string;
      position?: string;
    },
  ): void => {
    const eventName: AnalyticsEventName =
      action === 'impression' ? 'ad_impression' : 'ad_click';

    trackEvent(eventName, {
      campaign_id: adData.campaignId,
      creative_id: adData.creativeId,
      position: adData.position,
    });
  };

  /**
   * Track search query
   */
  const trackSearchQuery = (query: string, resultCount?: number): void => {
    trackEvent('search_query', {
      query,
      result_count: resultCount,
    });
  };

  /**
   * Track error
   */
  const trackError = (errorData: {
    errorType: string;
    errorMessage: string;
    context?: string;
  }): void => {
    trackEvent('error_encountered', {
      error_type: errorData.errorType,
      error_message: errorData.errorMessage,
      context: errorData.context,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackArticleView,
    trackArticleShare,
    trackMembershipEvent,
    trackDistrictSelection,
    trackCategorySelection,
    trackFeedSectionView,
    trackAdEvent,
    trackSearchQuery,
    trackError,
  };
};
