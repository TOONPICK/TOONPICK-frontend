import Logger from '@utils/logger';

/**
 * API 오류 처리
 * @param error - 발생한 에러 객체
 * @returns { success: false, message: string }
 */
export default function handleApiError(error: unknown): { success: false; message: string } {
  Logger.error('API Error:', { error: error instanceof Error ? error.message : 'Unknown error' });
  return {
    success: false,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
} 