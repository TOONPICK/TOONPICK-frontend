// 액세스 토큰을 localStorage에 저장할 때 사용하는 키
const ACCESS_TOKEN_KEY = 'accessToken';


export const TokenManager = {
  /**
   * 액세스 토큰을 localStorage에 저장
   * @param token - 저장할 액세스 토큰 문자열
   */
  setAccessToken: (token: string): void => {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store access token:', error);
    }
  },

  /**
   * localStorage에서 액세스 토큰 조회
   * @returns 액세스 토큰 문자열 또는 null
   */
  getAccessToken: (): string | null => {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to retrieve access token:', error);
      return null;
    }
  },

  /**
   * localStorage에서 액세스 토큰 삭제
   */
  clearAccessToken: (): void => {
    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear access token:', error);
    }
  },

  /**
   * (확장 예정) 리프레시 토큰 삭제
   * - 현재는 실제 삭제 로직 없음, 서버 연동 필요
   */
  clearRefreshToken: (): void => {
    try {
      // todo : 리프레시 토큰 삭제 로직 추가 (서버로 요청)
    } catch (error) {
      console.error('Failed to clear refresh token:', error);
    }
  },

  /**
   * 액세스 토큰 만료 여부 검사
   * @param token - 검사할 액세스 토큰
   * @returns 만료/무효(true), 유효(false)
   */
  isAccessTokenExpired: (token: string): boolean => {
    try {
      const payload = TokenManager.decodeTokenPayload(token);
      if (!payload || !payload.exp) {
        console.warn('Invalid token payload: Missing "exp" field.');
        return true;
      }
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  /**
   * HTTP 응답 헤더에서 액세스 토큰 추출
   * @param headers - HTTP 응답 헤더 객체
   * @returns 추출된 액세스 토큰 문자열 또는 null
   */
  extractAccessTokenFromHeader: (headers: Record<string, any>): string | null => {
    try {
      const authHeader = headers['authorization'] || headers['Authorization'];
      if (authHeader && typeof authHeader === 'string') {
        const token = authHeader.split(' ')[1];
        if (!token) {
          console.warn('Authorization header is present but does not contain a valid token.');
        }
        return token || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to extract access token from header:', error);
      return null;
    }
  },

  /**
   * JWT 토큰의 payload(내용) 디코딩
   * @param token - 디코딩할 JWT 토큰
   * @returns 디코딩된 payload 객체 또는 null
   */
  decodeTokenPayload: (token: string): Record<string, any> | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token payload:', error);
      return null;
    }
  },
};

export default TokenManager;
