import { ApiClient } from './apiClient';
import { Student } from '../types';

export interface ParentSession {
  student: Student;
  students: Student[];
  mustChangePassword: boolean;
}

/** Device label sent with the login so the account can tell its sessions apart. */
const deviceName = (): string => {
  const ua = navigator.userAgent || '';
  const android = ua.match(/Android[^;)]*;\s*([^)]+)\)/);
  return (android ? android[1] : /iPhone|iPad/.test(ua) ? 'iOS' : 'Web').slice(0, 60);
};

export class AuthService {
  /** Phone + password. The very first password is the phone number itself; the server then asks for a new one. */
  public static async login(phone: string, password: string): Promise<{ mustChangePassword: boolean }> {
    const res = await ApiClient.post<{ token: string; must_change_password: boolean }>('/parent/auth/login', {
      phone,
      password,
      device_name: deviceName(),
    });
    ApiClient.setToken(res.token);
    return { mustChangePassword: !!res.must_change_password };
  }

  public static changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return ApiClient.post('/parent/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  }

  /** The children this parent token can see (also tells whether the password still has to be changed). */
  public static async fetchSession(): Promise<ParentSession> {
    const res = await ApiClient.get<{ student: Student; students: Student[]; must_change_password: boolean }>('/parent/me');
    const students = Array.isArray(res?.students) && res.students.length > 0 ? res.students : res.student ? [res.student] : [];
    return { student: students[0], students, mustChangePassword: !!res.must_change_password };
  }

  public static async logout(fcmToken?: string | null): Promise<void> {
    if (ApiClient.getToken()) {
      await ApiClient.post('/parent/auth/logout', fcmToken ? { fcm_token: fcmToken } : {}).catch(() => {});
    }
    ApiClient.setToken(null);
  }
}
