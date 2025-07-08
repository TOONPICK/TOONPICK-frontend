import { api, Response, PagedResponse } from '@api';
import { Review, ReviewRequest } from '@models/review';
import { dummyReview, dummyReviewList } from '@dummy';

const PAGE_SIZE = 10;
const isDev = process.env.NODE_ENV === 'development';

class WebtoonReviewService {
  private static instance: WebtoonReviewService;

  private constructor() {}

  public static getInstance(): WebtoonReviewService {
    if (!WebtoonReviewService.instance) {
      WebtoonReviewService.instance = new WebtoonReviewService();
    }
    return WebtoonReviewService.instance;
  }

  /**
   * 웹툰 리뷰 생성
   * @param webtoonId - 리뷰를 작성할 웹툰의 ID
   * @param reviewCreateDTO - 리뷰 생성 DTO (rating, comment 등)
   * @returns 생성된 리뷰 객체 (성공 시), 에러 메시지 (실패 시)
   */
  public async createWebtoonReview(
    webtoonId: number, 
    reviewCreateDTO: ReviewRequest
  ): Promise<Response<Review>> {
    if (isDev) {
      return { success: true, data: dummyReview };
    }
    try {
      const response = await api.post<Review>(
        `/api/secure/reviews/${webtoonId}`, 
        reviewCreateDTO,
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('리뷰 생성 중 오류 발생:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 특정 리뷰 단건 조회
   * @param reviewId - 조회할 리뷰의 ID
   * @returns 리뷰 객체 (성공 시), 에러 메시지 (실패 시)
   */
  public async getWebtoonReviewById(
    reviewId: number
  ): Promise<Response<Review>> {
    if (isDev) {
      return { success: true, data: dummyReview };
    }
    try {
      const response = await api.get<Review>(`/api/public/reviews/${reviewId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('리뷰 가져오기 중 오류 발생:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 리뷰 수정
   * @param reviewId - 수정할 리뷰의 ID
   * @param reviewCreateDTO - 수정할 내용 (별점, 코멘트 등)
   * @returns 수정된 리뷰 객체 (성공 시), 에러 메시지 (실패 시)
   */
  public async updateWebtoonReview(
    reviewId: number, 
    reviewCreateDTO: ReviewRequest
  ): Promise<Response<Review>> {
    try {
      const response = await api.put<Review>(
        `/api/secure/reviews/${reviewId}`, 
        reviewCreateDTO, 
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error('리뷰 수정 중 오류 발생:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 리뷰 삭제
   * @param reviewId - 삭제할 리뷰의 ID
   * @returns 성공 여부 및 메시지
   */
  public async deleteWebtoonReview(
    reviewId: number
  ): Promise<Response<void>> {
    try {
      await api.delete(`/api/secure/reviews/${reviewId}`);
      return { success: true };
    } catch (error) {
      console.error('리뷰 삭제 중 오류 발생:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 리뷰 좋아요 토글 (좋아요/좋아요 취소)
   * @param reviewId - 좋아요 토글할 리뷰의 ID
   * @returns 성공 여부 및 메시지
   */
  public async toggleLikeForReview(
    reviewId: number
  ): Promise<Response<void>> {
    try {
      await api.post(`/api/secure/reviews/${reviewId}/like`);
      return { success: true };
    } catch (error) {
      console.error('리뷰 좋아요 토글 중 오류 발생:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 사용자가 특정 웹툰에 작성한 리뷰 단건 조회
   * @param webtoonId - 웹툰 ID
   * @returns 해당 유저가 작성한 리뷰 (없으면 null)
   */
  public async getUserReviewForWebtoon(webtoonId: number): Promise<Response<Review>> {
    if (isDev) {
      return { success: true, data: dummyReview };
    }
    try {
      const response = await api.get<Review>(`/api/secure/reviews/${webtoonId}/member`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('사용자 리뷰 가져오기 중 오류 발생:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * 특정 웹툰의 리뷰 목록 조회 (페이징/정렬 지원)
   * @param webtoonId - 리뷰를 조회할 웹툰의 ID
   * @param sortBy - 정렬 기준 (ex: 'latest', 'rating')
   * @param page - 페이지 번호 (0부터 시작)
   * @param size - 페이지당 리뷰 개수
   * @returns 리뷰 목록, 전체 개수, 페이징 정보 등
   */
  public async getReviewsByWebtoon(
    webtoonId: number, 
    sortBy: string = 'latest', 
    page: number = 0, 
    size: number = 20
  ): Promise<PagedResponse<Review[]>> {
    if (isDev) {
      return {
        success: true,
        data: dummyReviewList,
        total: dummyReviewList.length,
        page: 0,
        size: dummyReviewList.length,
        last: true,
      };
    }
    try {
      const response = await api.get<PagedResponse<Review[]>>(
        `/api/public/reviews/webtoon/${webtoonId}?sortBy=${sortBy}&page=${page}&size=${size}`
      );
      // 응답 데이터 구조 검증 및 페이징 정보 반환
      const { data, totalElements, page: currentPage, size: pageSize, last } = response.data || {};
      
      return {
        success: true,
        data: data || [],
        total: totalElements || 0, 
        page: currentPage || 0,
        size: pageSize || PAGE_SIZE,
        last: last || false,
      };
    } catch (error) {
      console.error('웹툰 리뷰 목록 가져오기 중 오류 발생:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default WebtoonReviewService.getInstance(); 