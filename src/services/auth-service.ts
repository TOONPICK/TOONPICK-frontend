import { api, Response } from '@api';
import { Routes } from '@constants/routes';
import TokenManager from '@services/token-manager';
import TokenRefresher from '@services/token-refresher';
import Logger from '@utils/logger';
import Cookies from 'js-cookie';
import { dummyMemberProfile } from '@dummy';
import handleApiError from '@utils/api-error-handler';

const isDev = process.env.NODE_ENV === 'development';

export const AuthService = {
  /**
   * 일반 로그인
   * @param username - 사용자명
   * @param password - 비밀번호
   * @param loginCallback - 로그인 성공 시 실행할 콜백
   * @returns 성공 여부 및 메시지/데이터
   */
  login: async (username: string, password: string, loginCallback?: () => void): Promise<Response> => {
    if (isDev) {
      loginCallback?.();
      return { success: true, data: dummyMemberProfile };
    }
    try {
      const response = await api.post<{ accessToken: string }>('/login', { username, password });
      const accessToken = TokenManager.extractAccessTokenFromHeader(response.headers);

      if (accessToken) {
        TokenManager.setAccessToken(accessToken);
        loginCallback?.();
        return { success: true };
      } else {
        return { success: false, message: '로그인에 실패했습니다: 토큰을 찾을 수 없습니다.' };
      }
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * 회원가입
   * @param username - 사용자명
   * @param email - 이메일
   * @param password - 비밀번호
   * @returns 성공 여부 및 메시지/데이터
   */
  signup: async (username: string, email: string, password: string): Promise<Response> => {
    if (isDev) {
      return { success: true, data: dummyMemberProfile };
    }
    try {
      const joinPayload = {
        username,
        email: username,
        password,
      };

      await api.post('/join', joinPayload);
      return { success: true };
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * 로그아웃
   * @param logoutCallback - 로그아웃 성공 시 실행할 콜백
   * @returns 성공 여부 및 메시지
   */
  logout: async (logoutCallback?: () => void): Promise<Response> => {
    if (isDev) {
      logoutCallback?.();
      return { success: true };
    }
    try {
      TokenManager.clearAccessToken();
      await api.post('/logout');
      logoutCallback?.();
      return { success: true };
    } catch (error: any) {
      return handleApiError(error);
    }
  },

  /**
   * 로그인 여부 확인
   * @returns true(로그인 상태), false(비로그인)
   */
  isLoggedIn: (): boolean => {
    if (isDev) return true;
    const accessToken = TokenManager.getAccessToken();
    return !!accessToken && !TokenManager.isAccessTokenExpired(accessToken);
  },

  /**
   * 소셜 로그인 (카카오/네이버/구글/애플 등)
   * @param provider - 소셜 로그인 제공자명
   */
  socialLogin: (provider: string): void => {
    if (isDev) return;
    const redirectUri = window.location.origin + Routes.LOGIN_CALLBACK;

    // redirect_uri를 쿠키에 저장 (유효기간: 5분)
    Cookies.set('redirect_uri', redirectUri, { path: '/', expires: 1 / 288 });

    // OAuth2 로그인 요청 (redirect_uri는 URL에서 제거)
    const loginUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/oauth2/authorization/${provider}`;
    window.location.href = loginUrl;
  },

  /**
   * 소셜 로그인 콜백 처리 (토큰 재발급 및 저장)
   * @param loginCallback - 로그인 성공 시 실행할 콜백
   * @returns 성공 여부 및 메시지/데이터
   */
  handleSocialLoginCallback: async (loginCallback?: () => void): Promise<Response> => {
    if (isDev) {
      loginCallback?.();
      return { success: true, data: dummyMemberProfile };
    }
    try {
      const accessToken = await TokenRefresher.refreshAccessToken();
      if (accessToken) {
        TokenManager.setAccessToken(accessToken);
        loginCallback?.();
        return { success: true };
      } else {
        return { success: false, message: '소셜 로그인에 실패했습니다: 토큰을 찾을 수 없습니다.' };
      }
    } catch (error: any) {
      return handleApiError(error);
    }
  },
};

export default AuthService;
