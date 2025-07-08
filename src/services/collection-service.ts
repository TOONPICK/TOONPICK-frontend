import { Response } from '@api/types';
import { Collection, CollectionCreateRequest, CollectionUpdateRequest } from '@models/collection';
import { dummyCollections } from '@dummy/collection-dummy';
import handleApiError from '@utils/api-error-handler';

const isDev = process.env.NODE_ENV === 'development';

class CollectionService {
  private baseUrl = process.env.REACT_APP_API_BASE_URL || '';

  /**
   * 컬렉션 목록 조회
   * @returns Collection[] (성공 시), 에러 메시지 (실패 시)
   */
  async getCollections(): Promise<Response<Collection[]>> {
    try {
      if (isDev) {
        return {
          success: true,
          data: dummyCollections,
          message: '컬렉션 목록을 성공적으로 불러왔습니다.'
        };
      }

      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('컬렉션 목록 조회에 실패했습니다.');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.collections,
        message: '컬렉션 목록을 성공적으로 불러왔습니다.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 컬렉션 상세 조회
   * @param id - 조회할 컬렉션 ID
   * @returns Collection 객체 (성공 시), 에러 메시지 (실패 시)
   */
  async getCollectionById(id: number): Promise<Response<Collection>> {
    try {
      if (isDev) {
        const collection = dummyCollections.find((c: Collection) => c.id === id);
        if (!collection) {
          return {
            success: false,
            message: '컬렉션을 찾을 수 없습니다.'
          };
        }
        return {
          success: true,
          data: collection,
          message: '컬렉션을 성공적으로 불러왔습니다.'
        };
      }

      const response = await fetch(`${this.baseUrl}/collections/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('컬렉션 조회에 실패했습니다.');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.collection,
        message: '컬렉션을 성공적으로 불러왔습니다.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 컬렉션 생성
   * @param request - 생성할 컬렉션 정보 (이름, 설명, 공개여부 등)
   * @returns 생성된 Collection 객체 (성공 시), 에러 메시지 (실패 시)
   */
  async createCollection(request: CollectionCreateRequest): Promise<Response<Collection>> {
    try {
      if (isDev) {
        const newCollection: Collection = {
          id: Math.max(...dummyCollections.map((c: Collection) => c.id)) + 1,
          name: request.name,
          description: request.description,
          isPublic: request.isPublic,
          tags: request.tags,
          thumbnail: 'https://via.placeholder.com/300x200/667eea/ffffff?text=New+Collection',
          webtoonCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          webtoons: []
        };
        
        return {
          success: true,
          data: newCollection,
          message: '컬렉션이 성공적으로 생성되었습니다.'
        };
      }

      const response = await fetch(`${this.baseUrl}/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('컬렉션 생성에 실패했습니다.');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.collection,
        message: '컬렉션이 성공적으로 생성되었습니다.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 컬렉션 수정
   * @param id - 수정할 컬렉션 ID
   * @param request - 수정할 정보
   * @returns 수정된 Collection 객체 (성공 시), 에러 메시지 (실패 시)
   */
  async updateCollection(id: number, request: CollectionUpdateRequest): Promise<Response<Collection>> {
    try {
      if (isDev) {
        const collectionIndex = dummyCollections.findIndex((c: Collection) => c.id === id);
        if (collectionIndex === -1) {
          return {
            success: false,
            message: '컬렉션을 찾을 수 없습니다.'
          };
        }

        const updatedCollection: Collection = {
          ...dummyCollections[collectionIndex],
          name: request.name || '',
          description: request.description || '',
          isPublic: request.isPublic || false,
          tags: request.tags || [],
          updatedAt: new Date().toISOString()
        };

        return {
          success: true,
          data: updatedCollection,
          message: '컬렉션이 성공적으로 수정되었습니다.'
        };
      }

      const response = await fetch(`${this.baseUrl}/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('컬렉션 수정에 실패했습니다.');
      }

      const data = await response.json();
      return {
        success: true,
        data: data.collection,
        message: '컬렉션이 성공적으로 수정되었습니다.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 컬렉션 삭제
   * @param id - 삭제할 컬렉션 ID
   * @returns 성공 여부 및 메시지
   */
  async deleteCollection(id: number): Promise<Response<void>> {
    try {
      if (isDev) {
        const collectionIndex = dummyCollections.findIndex((c: Collection) => c.id === id);
        if (collectionIndex === -1) {
          return {
            success: false,
            message: '컬렉션을 찾을 수 없습니다.'
          };
        }

        return {
          success: true,
          message: '컬렉션이 성공적으로 삭제되었습니다.'
        };
      }

      const response = await fetch(`${this.baseUrl}/collections/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('컬렉션 삭제에 실패했습니다.');
      }

      return {
        success: true,
        message: '컬렉션이 성공적으로 삭제되었습니다.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 웹툰을 컬렉션에 추가
   * @param collectionId - 컬렉션 ID
   * @param webtoonId - 추가할 웹툰 ID
   * @returns 성공 여부 및 메시지
   */
  async addWebtoonToCollection(collectionId: number, webtoonId: number): Promise<Response<void>> {
    try {
      if (isDev) {
        const collection = dummyCollections.find((c: Collection) => c.id === collectionId);
        if (!collection) {
          return {
            success: false,
            message: '컬렉션을 찾을 수 없습니다.'
          };
        }

        return {
          success: true,
          message: '웹툰이 컬렉션에 성공적으로 추가되었습니다.'
        };
      }

      const response = await fetch(`${this.baseUrl}/collections/${collectionId}/webtoons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ webtoonId })
      });

      if (!response.ok) {
        throw new Error('웹툰 추가에 실패했습니다.');
      }

      return {
        success: true,
        message: '웹툰이 컬렉션에 성공적으로 추가되었습니다.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }

  /**
   * 웹툰을 컬렉션에서 제거
   * @param collectionId - 컬렉션 ID
   * @param webtoonId - 제거할 웹툰 ID
   * @returns 성공 여부 및 메시지
   */
  async removeWebtoonFromCollection(collectionId: number, webtoonId: number): Promise<Response<void>> {
    try {
      if (isDev) {
        const collection = dummyCollections.find((c: Collection) => c.id === collectionId);
        if (!collection) {
          return {
            success: false,
            message: '컬렉션을 찾을 수 없습니다.'
          };
        }

        return {
          success: true,
          message: '웹툰이 컬렉션에서 성공적으로 제거되었습니다.'
        };
      }

      const response = await fetch(`${this.baseUrl}/collections/${collectionId}/webtoons/${webtoonId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('웹툰 제거에 실패했습니다.');
      }

      return {
        success: true,
        message: '웹툰이 컬렉션에서 성공적으로 제거되었습니다.'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
}

export default new CollectionService(); 