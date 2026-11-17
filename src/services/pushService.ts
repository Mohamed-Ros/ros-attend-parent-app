import { PushNotifications } from '@capacitor/push-notifications';
import { ApiClient } from './apiClient';

const FCM_TOKEN_KEY = 'parent_fcm_token';

/** Fired when a push arrives (foreground) or is tapped; the app refreshes its inbox on it. */
export const PUSH_EVENT = 'parent:push';

export class PushService {
  private static initialized = false;

  private static isNative(): boolean {
    return typeof window !== 'undefined' && 'Capacitor' in window && (window as any).Capacitor?.isNativePlatform?.() !== false;
  }

  public static getDeviceToken(): string | null {
    try {
      return localStorage.getItem(FCM_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private static async sendTokenToServer(token: string): Promise<void> {
    if (!ApiClient.getToken()) return;
    try {
      await ApiClient.post('/parent/register-fcm-token', { token, device_type: 'android' });
    } catch (err) {
      console.warn('[PushService] Failed to send FCM token to server:', err);
    }
  }

  /** Call after login: the server binds this device to the logged-in parent (not to a student id). */
  public static async init(): Promise<void> {
    if (!this.isNative()) return;

    // Already set up in this session: just make sure the server knows the current token (e.g. after a re-login).
    if (this.initialized) {
      const known = this.getDeviceToken();
      if (known) await this.sendTokenToServer(known);
      return;
    }
    this.initialized = true;

    try {
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive === 'prompt') perm = await PushNotifications.requestPermissions();
      if (perm.receive !== 'granted') {
        console.warn('[PushService] Push notification permission not granted.');
        this.initialized = false;
        return;
      }

      // Listeners first, so the registration event cannot fire before we listen.
      await PushNotifications.addListener('registration', async (token) => {
        try {
          localStorage.setItem(FCM_TOKEN_KEY, token.value);
        } catch {}
        await this.sendTokenToServer(token.value);
      });
      await PushNotifications.addListener('registrationError', (err) => console.warn('[PushService] registration error', err));
      await PushNotifications.addListener('pushNotificationReceived', () => window.dispatchEvent(new Event(PUSH_EVENT)));
      await PushNotifications.addListener('pushNotificationActionPerformed', () => {
        window.dispatchEvent(new CustomEvent(PUSH_EVENT, { detail: { opened: true } }));
      });

      // Channel the server targets (FCM android.notification.channel_id = "default").
      await PushNotifications.createChannel({
        id: 'default',
        name: 'إشعارات المتابعة',
        description: 'الحضور والغياب والدرجات والمدفوعات',
        importance: 5,
        visibility: 1,
        vibration: true,
      }).catch(() => {});

      await PushNotifications.register();
    } catch (err) {
      console.error('[PushService] Failed to initialize push notifications:', err);
      this.initialized = false;
    }
  }
}
