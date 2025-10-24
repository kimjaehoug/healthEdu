import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { reviewAPI } from '../services/api';
import { ReviewResult, NewSimilarPoint, SimilarPoint } from '../types';

const ReviewsContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  margin-bottom: 0;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 40px;
`;

const FilterButton = styled.button<{ active: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
    : 'rgba(255, 255, 255, 0.2)'
  };
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active 
    ? '0 4px 15px rgba(72, 187, 120, 0.4)' 
    : '0 2px 8px rgba(0, 0, 0, 0.2)'
  };

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)' 
      : 'rgba(255, 255, 255, 0.3)'
    };
    transform: translateY(-2px);
    box-shadow: ${props => props.active 
      ? '0 6px 20px rgba(72, 187, 120, 0.5)' 
      : '0 4px 15px rgba(0, 0, 0, 0.3)'
    };
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
`;

const ReviewCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ReviewHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReviewTitle = styled.h3`
  margin: 0;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
`;

const ReviewDate = styled.p`
  margin: 4px 0 0 0;
  color: #718096;
  font-size: 0.875rem;
`;

const ReviewStatus = styled.div<{ isSimilar: boolean }>`
  background: ${props => props.isSimilar 
    ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
    : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
  };
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const ReviewContent = styled.div`
  padding: 24px;
`;

const CriteriaScores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const CriteriaItem = styled.div`
  text-align: center;
  padding: 16px;
  background: rgba(72, 187, 120, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(72, 187, 120, 0.2);
`;

const CriteriaName = styled.div`
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 8px;
  font-weight: 500;
`;

const CriteriaScore = styled.div<{ score: number | string; criteria?: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => {
    // 교과목 목적의 유사성의 경우 특별 처리
    if (props.criteria === '교과목 목적의 유사성') {
      return props.score === '유사함' ? '#48bb78' : '#ff6b6b';
    }
    // 매칭 청크 수의 경우 특별 처리 (5개 이상이면 인정)
    if (props.criteria === '매칭 청크 수') {
      const numScore = typeof props.score === 'number' ? props.score : 0;
      return numScore >= 5 ? '#48bb78' : '#ff6b6b';
    }
    // 다른 기준들은 기존 로직
    const numScore = typeof props.score === 'number' ? props.score : 0;
    return numScore >= 70 ? '#48bb78' : '#ff6b6b';
  }};
`;

const SimilarityScore = styled.div<{ score: number | string }>`
  background: ${props => {
    const numScore = typeof props.score === 'number' ? props.score : 0;
    return numScore >= 70 ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' :
           'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)';
  }};
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  min-width: 80px;
  text-align: center;
`;

const ExpandButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

const ContentSection = styled.div`
  margin-bottom: 24px;

  h4 {
    color: #2d3748;
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    margin-bottom: 16px;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 107, 107, 0.2);
  margin-bottom: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.8);
`;

// 탭 관련 스타일 컴포넌트
const TabContainer = styled.div`
  margin-top: 20px;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 20px;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.active ? '#2d3748' : '#718096'};
  border-bottom: 3px solid ${props => props.active ? '#48bb78' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #2d3748;
    background: rgba(72, 187, 120, 0.05);
  }
`;

const TabContent = styled.div`
  min-height: 200px;
`;

const EmptyIcon = styled.div`
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.7;
`;

const DeleteButton = styled.button<{ disabled?: boolean }>`
  background: ${props => props.disabled 
    ? 'rgba(255, 107, 107, 0.3)' 
    : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
  };
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    background: ${props => props.disabled 
      ? 'rgba(255, 107, 107, 0.3)' 
      : 'linear-gradient(135deg, #ee5a52 0%, #ff6b6b 100%)'
    };
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled 
      ? '0 2px 8px rgba(255, 107, 107, 0.3)' 
      : '0 4px 15px rgba(255, 107, 107, 0.4)'
    };
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
`;

const PageButton = styled.button<{ active?: boolean; disabled?: boolean }>`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
    : 'rgba(255, 255, 255, 0.2)'
  };
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)' 
      : 'rgba(255, 255, 255, 0.3)'
    };
    transform: translateY(-1px);
  }
`;

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'similar' | 'not-similar'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const [activeTabs, setActiveTabs] = useState<Record<number, string>>({});

  const fetchReviews = async (page: number = 1, filterType: string = 'all') => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 호출
      const response = await reviewAPI.getUserReviews({
        page,
        limit: 6,
        isSimilar: filterType === 'similar' ? true : filterType === 'not-similar' ? false : undefined
      });

      console.log('API 응답:', response);
      
      if (response.data) {
        setReviews(response.data.reviews || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setReviews([]);
        setTotalPages(1);
      }
    } catch (error: any) {
      console.error('심사 결과 조회 오류:', error);
      setError(error.response?.data?.message || '심사 결과를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(currentPage, filter);
  }, [currentPage, filter]);

  const handleFilterChange = (newFilter: 'all' | 'similar' | 'not-similar') => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!window.confirm('정말로 이 심사 결과를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setDeletingId(reviewId);
      await reviewAPI.deleteReview(reviewId);
      
      // 삭제 후 목록 새로고침
      await fetchReviews(currentPage, filter);
    } catch (error: any) {
      console.error('삭제 오류:', error);
      alert('삭제에 실패했습니다: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpanded = (reviewId: number) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTabChange = (reviewId: number, tabName: string) => {
    setActiveTabs(prev => ({
      ...prev,
      [reviewId]: tabName
    }));
  };

  const getActiveTab = (reviewId: number) => {
    return activeTabs[reviewId] || 'criteria';
  };

  if (loading) {
    return (
      <ReviewsContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spinner />
            <p style={{ marginTop: '20px', color: 'rgba(255, 255, 255, 0.9)', fontSize: '18px' }}>
              심사 결과를 불러오는 중...
            </p>
          </div>
        </Container>
      </ReviewsContainer>
    );
  }

  if (error) {
    return (
      <ReviewsContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.7 }}>⚠️</div>
            <ErrorMessage style={{ color: 'white', fontSize: '18px' }}>{error}</ErrorMessage>
            <button 
              onClick={() => fetchReviews(currentPage, filter)}
              style={{
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              다시 시도
            </button>
          </div>
        </Container>
      </ReviewsContainer>
    );
  }

  return (
    <ReviewsContainer>
      <Container>
        <Header>
          <Title>심사 결과</Title>
          <Subtitle>보건교육사 유사과목 심사 결과를 확인하세요</Subtitle>
        </Header>

        <FilterContainer>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => handleFilterChange('all')}
          >
            전체
          </FilterButton>
          <FilterButton 
            active={filter === 'similar'} 
            onClick={() => handleFilterChange('similar')}
          >
            유사과목 인정
          </FilterButton>
          <FilterButton 
            active={filter === 'not-similar'} 
            onClick={() => handleFilterChange('not-similar')}
          >
            유사과목 미인정
          </FilterButton>
        </FilterContainer>

        {reviews.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <h3 style={{ marginBottom: '16px', color: 'rgba(255, 255, 255, 0.9)' }}>
              심사 결과가 없습니다
            </h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
              {filter === 'similar' ? '유사과목으로 인정된 결과가 없습니다.' :
               filter === 'not-similar' ? '유사과목으로 미인정된 결과가 없습니다.' :
               '아직 심사된 결과가 없습니다.'}
            </p>
          </EmptyState>
        ) : (
          <>
            <ReviewsGrid>
              {reviews.map((review) => (
                <ReviewCard key={review.id}>
                  <ReviewHeader>
                    <div>
                      <ReviewTitle>{review.subjectName}</ReviewTitle>
                      <ReviewDate>{formatDate(review.createdAt)}</ReviewDate>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <SimilarityScore score={(() => {
                          const contentSimilarity = review.criteriaScores['내용 유사도'];
                          return contentSimilarity !== undefined ? Number(contentSimilarity) : review.similarityScore;
                        })()}>
                          {(() => {
                            const contentSimilarity = review.criteriaScores['내용 유사도'];
                            console.log('Review criteriaScores:', review.criteriaScores);
                            console.log('Content similarity:', contentSimilarity);
                            // 내용 유사도가 undefined가 아닌 경우 (0이어도 포함) 사용
                            const score = contentSimilarity !== undefined ? Number(contentSimilarity) : review.similarityScore;
                            return `${score}%`;
                          })()}
                        </SimilarityScore>
                        <DeleteButton 
                          disabled={deletingId === review.id}
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          {deletingId === review.id ? '삭제 중...' : '🗑️ 삭제'}
                        </DeleteButton>
                      </div>
                      <ReviewStatus isSimilar={review.isSimilar}>
                        {review.isSimilar ? '유사과목 인정' : '유사과목 미인정'}
                      </ReviewStatus>
                    </div>
                  </ReviewHeader>

                  <ReviewContent>
                    {/* 접기/펼치기 버튼 */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <ExpandButton onClick={() => toggleExpanded(review.id)}>
                        {expandedReviews.has(review.id) ? '📄 보고서 접기' : '📋 보고서 보기'}
                      </ExpandButton>
                    </div>

                    {/* 보고서 형태 - 세로 배치 */}
                    {expandedReviews.has(review.id) && (
                      <div style={{ 
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '24px',
                        marginTop: '16px'
                      }}>
                        {/* 1. 심사 기준 섹션 */}
                        <ContentSection>
                          <h4 style={{ 
                            color: '#2d3748', 
                            fontSize: '18px', 
                            fontWeight: '700',
                            marginBottom: '20px',
                            paddingBottom: '12px',
                            borderBottom: '2px solid #48bb78'
                          }}>
                            📊 1. 심사 기준
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* 내용 유사도 */}
                            <div style={{ 
                              background: 'rgba(72, 187, 120, 0.05)',
                              padding: '20px',
                              borderRadius: '12px',
                              border: '1px solid rgba(72, 187, 120, 0.2)'
                            }}>
                              <h5 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>
                                📈 내용 유사도
                              </h5>
                              <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700', 
                                color: typeof review.criteriaScores['내용 유사도'] === 'number' && review.criteriaScores['내용 유사도'] >= 70 ? '#48bb78' : '#ff6b6b'
                              }}>
                                {review.criteriaScores['내용 유사도']}점
                              </div>
                            </div>

                            {/* 교과목 목적의 유사성 */}
                            <div style={{ 
                              background: 'rgba(72, 187, 120, 0.05)',
                              padding: '20px',
                              borderRadius: '12px',
                              border: '1px solid rgba(72, 187, 120, 0.2)'
                            }}>
                              <h5 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>
                                🎯 교과목 목적의 유사성
                              </h5>
                              <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700', 
                                color: review.criteriaScores['교과목 목적의 유사성'] === '유사함' ? '#48bb78' : '#ff6b6b'
                              }}>
                                {review.criteriaScores['교과목 목적의 유사성']}
                              </div>
                            </div>
                          </div>
                        </ContentSection>

                        {/* 2. 근거 섹션 */}
                        <ContentSection>
                          <h4 style={{ 
                            color: '#2d3748', 
                            fontSize: '18px', 
                            fontWeight: '700',
                            marginBottom: '20px',
                            paddingBottom: '12px',
                            borderBottom: '2px solid #667eea'
                          }}>
                            🔍 2. 근거
                          </h4>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            {/* 매칭 청크 수 */}
                            <div style={{ 
                              background: 'rgba(102, 126, 234, 0.05)',
                              padding: '20px',
                              borderRadius: '12px',
                              border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                              <h5 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>
                                📊 매칭 청크 수
                              </h5>
                              <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700', 
                                color: typeof review.criteriaScores['매칭 청크 수'] === 'number' && review.criteriaScores['매칭 청크 수'] >= 5 ? '#48bb78' : '#ff6b6b'
                              }}>
                                {review.criteriaScores['매칭 청크 수']}개
                              </div>
                            </div>

                            {/* 문서 유사도 */}
                            <div style={{ 
                              background: 'rgba(72, 187, 120, 0.05)',
                              padding: '20px',
                              borderRadius: '12px',
                              border: '1px solid rgba(72, 187, 120, 0.2)'
                            }}>
                              <h5 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>
                                📄 문서 유사도
                              </h5>
                              <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700', 
                                color: typeof review.criteriaScores['문서 유사도'] === 'number' && review.criteriaScores['문서 유사도'] >= 70 ? '#48bb78' : '#ff6b6b'
                              }}>
                                {review.criteriaScores['문서 유사도']}점
                              </div>
                            </div>

                            {/* 문단 유사도 */}
                            <div style={{ 
                              background: 'rgba(102, 126, 234, 0.05)',
                              padding: '20px',
                              borderRadius: '12px',
                              border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                              <h5 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>
                                📝 문단 유사도
                              </h5>
                              <div style={{ 
                                fontSize: '24px', 
                                fontWeight: '700', 
                                color: typeof review.criteriaScores['문단 유사도'] === 'number' && review.criteriaScores['문단 유사도'] >= 70 ? '#48bb78' : '#ff6b6b'
                              }}>
                                {review.criteriaScores['문단 유사도']}점
                              </div>
                            </div>
                          </div>

                          {/* 교과목 목적의 유사성 항목들 */}
                          {review.similarPoints.length > 0 ? (
                            <div>
                              <h5 style={{ margin: '0 0 16px 0', color: '#2d3748', fontSize: '16px' }}>
                                ✅ 교과목 목적의 유사성 ({review.similarPoints.length}개)
                              </h5>
                              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {review.similarPoints.map((point, index) => {
                                  // 새로운 API 응답 구조 (NewSimilarPoint) - queryPreview가 없는 새로운 구조
                                  if (typeof point === 'object' && 'rationale' in point && 'uploadedContent' in point && 'existingContent' in point && !('queryPreview' in point)) {
                                    const newSimilarPoint = point as NewSimilarPoint;
                                    return (
                                      <li key={index} style={{ 
                                        background: 'rgba(72, 187, 120, 0.05)',
                                        borderLeft: '4px solid #48bb78',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '12px'
                                      }}>
                                        <div style={{ 
                                          display: 'flex', 
                                          flexDirection: 'column', 
                                          gap: '12px',
                                          fontSize: '14px'
                                        }}>
                                          <div style={{ 
                                            background: 'rgba(72, 187, 120, 0.1)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(72, 187, 120, 0.2)'
                                          }}>
                                            <strong style={{ color: '#2d3748', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                              🎯 판단 근거:
                                            </strong>
                                            <div style={{ color: '#2d3748', lineHeight: '1.5' }}>
                                              {newSimilarPoint.rationale}
                                            </div>
                                          </div>

                                          <div style={{ 
                                            background: 'rgba(72, 187, 120, 0.1)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(72, 187, 120, 0.2)'
                                          }}>
                                            <strong style={{ color: '#2d3748', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                              📤 업로드한 문서:
                                            </strong>
                                            <div style={{ 
                                              color: '#2d3748',
                                              lineHeight: '1.5',
                                              whiteSpace: 'pre-wrap',
                                              fontFamily: 'monospace',
                                              fontSize: '13px'
                                            }}>
                                              {newSimilarPoint.uploadedContent}
                                            </div>
                                          </div>

                                          <div style={{ 
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(102, 126, 234, 0.2)'
                                          }}>
                                            <strong style={{ color: '#2d3748', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                              📚 매칭된 기존 문서:
                                            </strong>
                                            <div style={{ 
                                              color: '#2d3748',
                                              lineHeight: '1.5',
                                              whiteSpace: 'pre-wrap',
                                              fontFamily: 'monospace',
                                              fontSize: '13px'
                                            }}>
                                              {newSimilarPoint.existingContent}
                                            </div>
                                          </div>

                                          <div style={{ 
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'rgba(72, 187, 120, 0.1)',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                          }}>
                                            <span style={{ fontWeight: '600', color: '#48bb78' }}>
                                              신뢰도: {newSimilarPoint.confidence}%
                                            </span>
                                            <span style={{ color: '#4a5568', fontSize: '11px' }}>
                                              {newSimilarPoint.docId}
                                            </span>
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  }
                                  // 기존 구조 (backward compatibility)
                                  else if (typeof point === 'object' && 'uploadedContent' in point && 'existingContent' in point) {
                                    const similarPoint = point as SimilarPoint;
                                    return (
                                      <li key={index} style={{ 
                                        background: 'rgba(72, 187, 120, 0.05)',
                                        borderLeft: '4px solid #48bb78',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '12px'
                                      }}>
                                        <div style={{ 
                                          display: 'flex', 
                                          flexDirection: 'column', 
                                          gap: '12px',
                                          fontSize: '14px'
                                        }}>
                                          <div style={{ 
                                            background: 'rgba(72, 187, 120, 0.1)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(72, 187, 120, 0.2)'
                                          }}>
                                            <strong style={{ color: '#2d3748', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                              📤 업로드한 문서:
                                            </strong>
                                            <div style={{ 
                                              color: '#2d3748',
                                              lineHeight: '1.5',
                                              whiteSpace: 'pre-wrap',
                                              fontFamily: 'monospace',
                                              fontSize: '13px'
                                            }}>
                                              {similarPoint.uploadedContent}
                                            </div>
                                          </div>

                                          <div style={{ 
                                            background: 'rgba(102, 126, 234, 0.1)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(102, 126, 234, 0.2)'
                                          }}>
                                            <strong style={{ color: '#2d3748', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                              📚 기존 문서:
                                            </strong>
                                            <div style={{ 
                                              color: '#2d3748',
                                              lineHeight: '1.5',
                                              whiteSpace: 'pre-wrap',
                                              fontFamily: 'monospace',
                                              fontSize: '13px'
                                            }}>
                                              {similarPoint.existingContent}
                                            </div>
                                          </div>

                                          <div style={{ 
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'rgba(72, 187, 120, 0.1)',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                          }}>
                                            <span style={{ fontWeight: '600', color: '#48bb78' }}>
                                              유사도: {Math.round(similarPoint.similarity * 100)}%
                                            </span>
                                          </div>
                                        </div>
                                      </li>
                                    );
                                  }
                                  // 문자열 형태 (legacy)
                                  else {
                                    return (
                                      <li key={index} style={{ 
                                        background: 'rgba(72, 187, 120, 0.05)',
                                        borderLeft: '4px solid #48bb78',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '12px'
                                      }}>
                                        <div style={{ 
                                          color: '#2d3748',
                                          lineHeight: '1.5',
                                          fontSize: '14px'
                                        }}>
                                          {point}
                                        </div>
                                      </li>
                                    );
                                  }
                                })}
                              </ul>
                            </div>
                          ) : (
                            <div>
                              <h5 style={{ margin: '0 0 16px 0', color: '#2d3748', fontSize: '16px' }}>
                                ❌ 교과목 목적의 유사성 - 비유사 항목
                              </h5>
                              {review.differentPoints.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                  {review.differentPoints.map((point, index) => (
                                    <li key={index} style={{ 
                                      background: 'rgba(255, 107, 107, 0.05)',
                                      borderLeft: '4px solid #ff6b6b',
                                      padding: '16px',
                                      borderRadius: '8px',
                                      marginBottom: '12px'
                                    }}>
                                      <div style={{ 
                                        background: 'rgba(255, 107, 107, 0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(255, 107, 107, 0.2)'
                                      }}>
                                        <div style={{ 
                                          color: '#2d3748', 
                                          lineHeight: '1.5',
                                          fontSize: '14px'
                                        }}>
                                          {point}
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div style={{ 
                                  background: 'rgba(255, 107, 107, 0.1)',
                                  padding: '20px',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(255, 107, 107, 0.2)',
                                  textAlign: 'center',
                                  color: '#2d3748'
                                }}>
                                  비유사 항목에 대한 상세 정보가 없습니다.
                                </div>
                              )}
                            </div>
                          )}
                        </ContentSection>

                        {/* 3. 심사가능여부 섹션 */}
                        <ContentSection>
                          <h4 style={{ 
                            color: '#2d3748', 
                            fontSize: '18px', 
                            fontWeight: '700',
                            marginBottom: '20px',
                            paddingBottom: '12px',
                            borderBottom: '2px solid #48bb78'
                          }}>
                            ✅ 3. 심사가능여부
                          </h4>
                          <div style={{ 
                            background: 'rgba(72, 187, 120, 0.05)',
                            padding: '20px',
                            borderRadius: '12px',
                            border: '1px solid rgba(72, 187, 120, 0.2)'
                          }}>
                            <h5 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '16px' }}>
                              📋 문서 구조 유사도
                            </h5>
                            <div style={{ 
                              fontSize: '24px', 
                              fontWeight: '700', 
                                color: typeof review.criteriaScores['문서 구조 유사도'] === 'number' && review.criteriaScores['문서 구조 유사도'] >= 70 ? '#48bb78' : '#ff6b6b'
                            }}>
                              {review.criteriaScores['문서 구조 유사도']}점
                            </div>
                            <div style={{ 
                              marginTop: '12px',
                              fontSize: '14px',
                              color: '#4a5568',
                              lineHeight: '1.5'
                            }}>
                              문서의 구조적 유사성을 평가하여 심사 가능 여부를 판단합니다.
                            </div>
                          </div>
                        </ContentSection>
                      </div>
                    )}
                  </ReviewContent>
                </ReviewCard>
              ))}
            </ReviewsGrid>

            {totalPages > 1 && (
              <Pagination>
                <PageButton 
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  이전
                </PageButton>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PageButton
                    key={page}
                    active={currentPage === page}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </PageButton>
                ))}
                
                <PageButton 
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  다음
                </PageButton>
              </Pagination>
            )}
          </>
        )}
      </Container>
    </ReviewsContainer>
  );
};

export default Reviews;