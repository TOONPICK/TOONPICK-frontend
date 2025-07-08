import { api, Response } from '@api';
import { MemberProfile } from '@models/member';
import { WebtoonSummary } from '@models/webtoon';
import { 
  dummyMemberProfile, 
  dummyCollections, 
  Collection,
  generateDummyWebtoons,
  dummyReviewList
} from '@dummy';
import handleApiError from '@utils/api-error-handler';

const isDev = process.env.NODE_ENV === 'development';

class MemberService {
  private static instance: MemberService;

  private constructor() {}

  public static getInstance(): MemberService {
    if (!MemberService.instance) {
      MemberService.instance = new MemberService();
    }
    return MemberService.instance;
  }

  /**
   * 사용자 프로필 정보 가져오기
   * @returns MemberProfile 객체 (성공 시), 에러 메시지 (실패 시)
   */
  public async getMemberProfile(): Promise<Response<MemberProfile>> {
    if (isDev) {
      const enrichedProfile = {
        ...dummyMemberProfile,
        favoriteWebtoons: generateDummyWebtoons(5),
        masterpieceWebtoons: generateDummyWebtoons(3),
        readingHistory: generateDummyWebtoons(8).map((webtoon: any, index: number) => ({
          webtoon,
          lastReadAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
        })),
        reviews: dummyReviewList.slice(0, 10),
        topReviews: dummyReviewList.slice(0, 3),
      };
      return { success: true, data: enrichedProfile };
    }
    try {
      const response = await api.get<MemberProfile>('/api/secure/member/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 북마크한 웹툰 목록 가져오기
   * @returns WebtoonSummary[] (성공 시), 에러 메시지 (실패 시)
   */
  public async getBookmarkedWebtoons(): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      return { success: true, data: generateDummyWebtoons(5) };
    }
    try {
      const response = await api.get<WebtoonSummary[]>('/api/secure/member/bookmarks');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 컬렉션 목록 가져오기
   * @returns Collection[] (성공 시), 에러 메시지 (실패 시)
   */
  public async getCollections(): Promise<Response<Collection[]>> {
    if (isDev) {
      return { success: true, data: dummyCollections };
    }
    try {
      const response = await api.get<Collection[]>('/api/secure/member/collections');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 명작 웹툰 목록 가져오기
   * @returns WebtoonSummary[] (성공 시), 에러 메시지 (실패 시)
   */
  public async getMasterpieceWebtoons(): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      return { success: true, data: dummyMemberProfile.masterpieceWebtoons || [] };
    }
    try {
      const response = await api.get<WebtoonSummary[]>('/api/secure/member/masterpieces');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 사용자 기본 정보(성별, 연령대, 나이) 업데이트
   * @param gender - 성별
   * @param ageGroup - 연령대
   * @param ageDigit - 나이(숫자)
   * @returns MemberProfile 객체 (성공 시), 에러 메시지 (실패 시)
   */
  public async updateBasicInfo({ 
    gender, 
    ageGroup, 
    ageDigit 
  }: { 
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'; 
    ageGroup: string; 
    ageDigit: number 
  }): Promise<Response<MemberProfile>> {
    if (isDev) {
      const updatedProfile = { ...dummyMemberProfile, gender, ageGroup, ageDigit };
      return { success: true, data: updatedProfile };
    }
    try {
      const response = await api.post<MemberProfile>('/api/secure/member/basic-info', { gender, ageGroup, ageDigit });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 사용자 프로필 이미지 업데이트
   * @param file - 업로드할 이미지 파일
   * @returns 이미지 URL (성공 시), 에러 메시지 (실패 시)
   */
  public async updateProfileImage(file: File): Promise<Response<string>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post<string>('/api/secure/member/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 관심 웹툰 추가
   * @param webtoonId - 추가할 웹툰 ID
   * @returns 성공 여부 및 메시지
   */
  public async addFavoriteWebtoon(webtoonId: number): Promise<Response> {
    try {
      await api.post(`/api/secure/member/favorites/${webtoonId}`);
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 관심 웹툰 삭제
   * @param webtoonId - 삭제할 웹툰 ID
   * @returns 성공 여부 및 메시지
   */
  public async removeFavoriteWebtoon(webtoonId: number): Promise<Response> {
    try {
      await api.delete(`/api/secure/member/favorites/${webtoonId}`);
      return { success: true };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 관심 웹툰 목록 가져오기
   * @returns WebtoonSummary[] (성공 시), 에러 메시지 (실패 시)
   */
  public async getFavorites(): Promise<Response<WebtoonSummary[]>> {
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/secure/member/favorites`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 웹툰이 관심 웹툰인지 확인
   * @param webtoonId - 확인할 웹툰 ID
   * @returns true/false (성공 시), 에러 메시지 (실패 시)
   */
  public async isFavoriteWebtoon(webtoonId: number): Promise<Response<boolean>> {
    try {
      const response = await api.get<boolean>(`/api/secure/member/favorites/${webtoonId}/is-favorite`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 튜토리얼 완료 처리
   * @returns MemberProfile 객체 (성공 시), 에러 메시지 (실패 시)
   */
  public async completeTutorial(): Promise<Response<MemberProfile>> {
    if (isDev) {
      const updatedProfile = { ...dummyMemberProfile, tutorial: true };
      return { success: true, data: updatedProfile };
    }
    try {
      const response = await api.post<MemberProfile>('/api/secure/member/tutorial/complete');
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export default MemberService.getInstance();