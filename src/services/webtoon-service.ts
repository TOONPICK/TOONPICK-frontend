import { api , Response, PagedResponse } from '@api';
import { WebtoonSummary, WebtoonDetails, Platform, SerializationStatus } from '@models/webtoon';
import { DayOfWeek, AgeRating } from '@models/enum';
import { dummyWebtoon, generateDummyWebtoons } from '@dummy';
import handleApiError from '@utils/api-error-handler';

const PAGE_SIZE = 60;
const isDev = process.env.NODE_ENV === 'development';

class WebtoonService {
  private static instance: WebtoonService;

  private constructor() {}

  public static getInstance(): WebtoonService {
    if (!this.instance) {
      this.instance = new WebtoonService();
    }
    return this.instance;
  }

  /**
   * 웹툰 상세 정보 조회
   * @param id - 조회할 웹툰의 ID
   * @returns 웹툰 상세 정보 객체 (성공 시), 에러 메시지 (실패 시)
   */
  public async getWebtoonDetails(id: number): Promise<Response<WebtoonDetails>> {
    if (isDev) {
      return { success: true, data: dummyWebtoon };
    }
    try {
      const response = await api.get<WebtoonDetails>(`/api/v1/webtoons/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 웹툰 목록 조회 (검색/필터/정렬/페이징 지원)
   * @param options - 검색/필터/정렬/페이징 옵션
   * @returns 웹툰 목록, 전체 개수, 페이징 정보 등
   */
  public async getWebtoons(
    options: {
      page: number;
      size?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
      search?: string;
      platforms?: Platform[];
      genres?: string[];
      authors?: string[];
      publishDays?: DayOfWeek[];
      serializationStatuses?: SerializationStatus[];
      ageRatings?: AgeRating[];
    }
  ): Promise<PagedResponse<WebtoonSummary[]>> {
    if (isDev) {
      return { success: true, data: generateDummyWebtoons(PAGE_SIZE) };
    }
    try {
      const response = await api.post<PagedResponse<WebtoonSummary[]>>('/api/v1/webtoons/filter', 
        {
          search: options.search,
          platforms: options.platforms,
          genres: options.genres,
          authors: options.authors,
          publishDays: options.publishDays,
          serializationStatuses: options.serializationStatuses,
          ageRatings: options.ageRatings
        },
        {
          params: {
            page: options.page,
            size: options.size || PAGE_SIZE,
            sortBy: options.sortBy || 'title',
            sortDir: options.sortDir || 'asc',
          },
        }
      );

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
      return handleApiError(error);
    }
  }

  /**
   * 인기 웹툰 조회
   * @param size - 가져올 웹툰 개수 (기본값 10)
   * @returns 인기 웹툰 목록
   */
  public async getPopularWebtoons(size: number = 10): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      return { success: true, data: generateDummyWebtoons(size) };
    }
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/v1/webtoons/popular`, { params: { size } });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 최신 웹툰 조회
   * @param size - 가져올 웹툰 개수 (기본값 10)
   * @returns 최신 웹툰 목록
   */
  public async getRecentWebtoons(size: number = 10): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      return { success: true, data: generateDummyWebtoons(size) };
    }
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/v1/webtoons/recent`, { params: { size } });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 웹툰 검색 (제목/작가명 기준)
   * @param query - 검색어
   * @param size - 최대 결과 개수 (기본값 20)
   * @returns 검색 결과 웹툰 목록
   */
  public async searchWebtoons(query: string, size: number = 20): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      // 개발 환경에서는 더미 데이터에서 검색 시뮬레이션
      const searchResults = generateDummyWebtoons(size).filter((webtoon: WebtoonSummary) => 
        webtoon.title.toLowerCase().includes(query.toLowerCase()) ||
        webtoon.authors?.some(author => 
          author.name.toLowerCase().includes(query.toLowerCase())
        )
      );
      
      return { 
        success: true, 
        data: searchResults.slice(0, size),
        message: `${searchResults.length}개의 웹툰을 찾았습니다.`
      };
    }
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/v1/webtoons/search`, { 
        params: { 
          q: query,
          size 
        } 
      });
      return { 
        success: true, 
        data: response.data,
        message: `${response.data.length}개의 웹툰을 찾았습니다.`
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 유사 웹툰 추천 (콘텐츠 기반)
   * @param webtoonId - 기준이 되는 웹툰 ID
   * @returns 유사한 웹툰 목록
   */
  public async getSimilarWebtoons(webtoonId: number): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      // 더미 데이터에서 일부 랜덤 웹툰 반환
      return { success: true, data: generateDummyWebtoons(4) };
    }
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/v1/webtoons/${webtoonId}/similar`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 유저 기반 유사 웹툰 추천 (개인화 추천)
   * @param webtoonId - 기준이 되는 웹툰 ID
   * @returns 유저의 취향 기반 유사 웹툰 목록
   */
  public async getUserSimilarWebtoons(webtoonId: number): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      // 더미 데이터에서 일부 랜덤 웹툰 반환
      return { success: true, data: generateDummyWebtoons(4) };
    }
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/v1/webtoons/${webtoonId}/user-similar`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 같은 작가의 웹툰 추천
   * @param webtoonId - 기준이 되는 웹툰 ID
   * @returns 같은 작가의 다른 웹툰 목록
   */
  public async getSameAuthorWebtoons(webtoonId: number): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      // 더미 데이터에서 같은 작가의 웹툰 반환 (id 1번 작가 기준)
      return { success: true, data: generateDummyWebtoons(4) };
    }
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/v1/webtoons/${webtoonId}/same-author`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 랜덤 추천 웹툰
   * @param size - 추천 개수 (기본값 4)
   * @returns 랜덤 웹툰 목록
   */
  public async getRandomWebtoons(size: number = 4): Promise<Response<WebtoonSummary[]>> {
    if (isDev) {
      // 더미 데이터에서 랜덤 추출
      const shuffled = [...generateDummyWebtoons(size)].sort(() => Math.random() - 0.5);
      return { success: true, data: shuffled.slice(0, size) };
    }
    try {
      const response = await api.get<WebtoonSummary[]>(`/api/v1/webtoons/random`, { params: { size } });
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export default WebtoonService.getInstance();
