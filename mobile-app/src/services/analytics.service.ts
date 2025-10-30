import analytics from '@react-native-firebase/analytics';

export class AnalyticsService {
  private static instance: AnalyticsService;
  private enabled: boolean = true;

  private constructor() {}

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Set analytics collection enabled/disabled
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    analytics().setAnalyticsCollectionEnabled(enabled);
  }

  // Log event
  logEvent(event: string, params?: Record<string, any>): void {
    if (!this.enabled) return;
    analytics().logEvent(event, params);
  }

  // Log screen view
  logScreenView(screenName: string, screenClass?: string): void {
    if (!this.enabled) return;
    analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  // Set user ID
  setUserId(userId: string): void {
    if (!this.enabled) return;
    analytics().setUserId(userId);
  }

  // Set user properties
  setUserProperties(properties: Record<string, any>): void {
    if (!this.enabled) return;
    Object.entries(properties).forEach(([key, value]) => {
      analytics().setUserProperty(key, String(value));
    });
  }

  // Predefined events
  logLogin(method: string): void {
    this.logEvent('login', { method });
  }

  logSignUp(method: string): void {
    this.logEvent('sign_up', { method });
  }

  logArticleView(articleId: string, category: string, district: string): void {
    this.logEvent('article_view', {
      article_id: articleId,
      category,
      district,
    });
  }

  logArticleSubmit(category: string, district: string): void {
    this.logEvent('article_submit', {
      category,
      district,
    });
  }

  logAdSubmit(budget: number, duration: number): void {
    this.logEvent('ad_submit', {
      budget,
      duration,
    });
  }

  logSearch(query: string, resultsCount: number): void {
    this.logEvent('search', {
      search_term: query,
      results_count: resultsCount,
    });
  }

  logShare(contentType: string, contentId: string, method: string): void {
    this.logEvent('share', {
      content_type: contentType,
      item_id: contentId,
      method,
    });
  }

  logPreferenceChange(type: 'category' | 'district', value: string): void {
    this.logEvent('preference_change', {
      preference_type: type,
      preference_value: value,
    });
  }

  logNotificationReceived(category: string): void {
    this.logEvent('notification_received', {
      category,
    });
  }

  logNotificationTapped(category: string, articleId?: string): void {
    this.logEvent('notification_tapped', {
      category,
      article_id: articleId,
    });
  }
}

export default AnalyticsService.getInstance();
