import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNELS } from '@constants';
import type { PushNotification } from '@types';

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize notification service
  async initialize(): Promise<void> {
    await this.createChannels();
    await this.requestPermission();
    this.setupListeners();
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    return enabled;
  }

  // Check if permission is granted
  async hasPermission(): Promise<boolean> {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  // Get FCM token
  async getToken(): Promise<string> {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    return token;
  }

  // Create notification channels (Android)
  async createChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: NOTIFICATION_CHANNELS.DEFAULT,
        name: 'Default Notifications',
        importance: AndroidImportance.HIGH,
      });

      await notifee.createChannel({
        id: NOTIFICATION_CHANNELS.ARTICLES,
        name: 'New Articles',
        importance: AndroidImportance.DEFAULT,
      });

      await notifee.createChannel({
        id: NOTIFICATION_CHANNELS.ALERTS,
        name: 'Breaking News',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      await notifee.createChannel({
        id: NOTIFICATION_CHANNELS.SUBMISSIONS,
        name: 'Submission Updates',
        importance: AndroidImportance.DEFAULT,
      });
    }
  }

  // Display notification
  async displayNotification(notification: PushNotification): Promise<void> {
    await notifee.displayNotification({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      android: {
        channelId: notification.category || NOTIFICATION_CHANNELS.DEFAULT,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        largeIcon: notification.imageUrl,
        style: notification.imageUrl
          ? {
              type: AndroidStyle.BIGPICTURE,
              picture: notification.imageUrl,
            }
          : undefined,
      },
      ios: {
        sound: 'default',
        attachments: notification.imageUrl
          ? [
              {
                url: notification.imageUrl,
              },
            ]
          : undefined,
      },
    });
  }

  // Setup notification listeners
  private setupListeners(): void {
    // Foreground message handler
    messaging().onMessage(async (remoteMessage) => {
      const notification: PushNotification = {
        id: remoteMessage.messageId || Date.now().toString(),
        title: remoteMessage.notification?.title || '',
        body: remoteMessage.notification?.body || '',
        data: remoteMessage.data,
        imageUrl: remoteMessage.notification?.android?.imageUrl || remoteMessage.notification?.imageUrl,
        category: remoteMessage.data?.category as string,
        timestamp: Date.now(),
      };

      await this.displayNotification(notification);
    });

    // Background message handler
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });

    // Notification tap handler
    notifee.onForegroundEvent(async ({ type, detail }) => {
      if (type === 1 && detail.notification?.data) {
        // Navigate based on notification data
        this.handleNotificationTap(detail.notification.data);
      }
    });
  }

  // Handle notification tap
  private handleNotificationTap(data: any): void {
    // This should be handled by navigation service
    // For now, just log
    console.log('Notification tapped:', data);
  }

  // Cancel notification
  async cancelNotification(id: string): Promise<void> {
    await notifee.cancelNotification(id);
  }

  // Cancel all notifications
  async cancelAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  }

  // Get delivered notifications
  async getDeliveredNotifications(): Promise<any[]> {
    return await notifee.getDisplayedNotifications();
  }
}

export default NotificationService.getInstance();
