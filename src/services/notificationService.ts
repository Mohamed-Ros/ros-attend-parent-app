import { ApiClient } from './apiClient';
import { Student } from '../types';

export interface ParentNotification {
  id: number;
  student_id?: number | null;
  title: string;
  body: string;
  type: string;
  created_at: string;
  extra_data?: any;
}

const SEEN_KEY = 'parent_last_seen_notification_id';

export class NotificationService {
  /** Inbox of all the children, newest first. Broadcasts reach every child of a teacher: shown once. */
  public static async fetchAll(students: Student[]): Promise<ParentNotification[]> {
    const lists = await Promise.all(
      students.map((s) =>
        ApiClient.get<{ notifications: ParentNotification[] }>(`/parent/student/${s.id}/notifications`)
          .then((r) => r?.notifications ?? [])
          .catch(() => [] as ParentNotification[]),
      ),
    );
    const byId = new Map<number, ParentNotification>();
    lists.flat().forEach((n) => byId.set(n.id, n));
    return [...byId.values()].sort((a, b) => b.id - a.id);
  }

  public static getLastSeenId(): number {
    try {
      return Number(localStorage.getItem(SEEN_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  public static markAllSeen(list: ParentNotification[]): void {
    const max = list.reduce((m, n) => Math.max(m, n.id), 0);
    try {
      if (max > this.getLastSeenId()) localStorage.setItem(SEEN_KEY, String(max));
    } catch {}
  }

  public static unreadCount(list: ParentNotification[]): number {
    const seen = this.getLastSeenId();
    return list.filter((n) => n.id > seen).length;
  }
}
