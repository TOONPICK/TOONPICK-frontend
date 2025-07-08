import { api } from '@api';
import TokenManager from '@/services/token-manager';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 토큰 만료 시 실패한 요청을 임시로 저장하는 큐
 * - 토큰 재발급이 완료되면 큐에 쌓인 요청을 재시도
 */
let failedQueue: Array<{
  requestConfig: AxiosRequestConfig;
  resolve: (value: AxiosResponse<any> | PromiseLike<AxiosResponse<any>>) => void;
  reject: (reason?: any) => void;
}> = [];
let isRefreshing = false;

/**
 * 큐에 쌓인 요청을 일괄 처리 (토큰 재발급 성공/실패 시)
 * @param error - 토큰 재발급 실패 시 에러
 * @param token - 새로 발급받은 액세스 토큰 (성공 시)
 */
const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ requestConfig, resolve, reject }) => {
    if (token) {
      requestConfig.headers = {
        ...requestConfig.headers,
        Authorization: `Bearer ${token}`,
      };
      resolve(api(requestConfig));
    } else {
      reject(error);
    }
  });
  failedQueue = [];
};

const TokenRefresher = {
  /**
   * 액세스 토큰 만료 시 재발급 및 원래 요청 재시도
   * @param originalRequest - 실패한 원본 요청
   * @returns 재시도된 API 응답 프라미스
   */
  handleTokenExpiration: async (originalRequest: AxiosRequestConfig) => {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccessToken = await TokenRefresher.refreshAccessToken();
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenManager.clearAccessToken();
        TokenManager.clearRefreshToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    // 이미 재발급 중이면 큐에 요청 추가 (Promise로 대기)
    return new Promise((resolve, reject) => {
      failedQueue.push({ requestConfig: originalRequest, resolve, reject });
    });
  },

  /**
   * 액세스 토큰 재발급 (refresh token 사용)
   * @returns 새로 발급받은 액세스 토큰 문자열
   * @throws 재발급 실패 시 에러
   */
  refreshAccessToken: async (): Promise<string> => {
    try {
      const response = await api.post('/reissue', {}, { withCredentials: true });
      const newAccessToken = TokenManager.extractAccessTokenFromHeader(response.headers);

      if (newAccessToken) {
        TokenManager.setAccessToken(newAccessToken);
        return newAccessToken;
      } else {
        throw new Error('Failed to reissue access token');
      }
    } catch (error) {
      TokenManager.clearAccessToken();
      TokenManager.clearRefreshToken();
      throw error;
    }
  },
};

export default TokenRefresher;
