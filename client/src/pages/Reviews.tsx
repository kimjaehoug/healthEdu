import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { reviewAPI } from '../services/api';
import { ReviewResult, SimilarPoint, NewSimilarPoint } from '../types';
import { Card, Container, Button, Spinner, ErrorMessage } from '../styles/GlobalStyles';

// API 응답 타입 정의 (현재 사용하지 않음)
/*
interface SimilarityAPIResponse {
  uploaded: {
    filename: string;
    tmp_path: string;
    size_bytes: number;
  };
  settings: {
    threshold_doc: number;
    threshold_chunk: number;
    min_hits: number;
    alpha: number;
    aggregate: string;
    topk_per_chunk: number;
    topk_for_agg: number;
    top_docs: number;
    top_hits_per_doc: number;
  };
  doc_only: {
    top: Array<{
      doc_path: string;
      score: number;
    }>;
  };
  chunk_only: {
    top: Array<{
      doc_path: string;
      score: number;
      matches: number;
    }>;
  };
  hybrid: {
    top: Array<{
      doc_path: string;
      score_final: number;
      score_doc: number;
      score_chunk: number;
    }>;
  };
  details: Array<{
    ref_doc: string;
    score: number;
    query_chunk_id: number;
    query_preview: string;
    ref_chunk_preview: string;
  }>;
}
*/

// API 응답을 ReviewResult 형식으로 변환하는 함수 (현재 사용하지 않음)
/*
const convertAPIResponseToReviewResult = (apiResponse: SimilarityAPIResponse, uploadId: number): ReviewResult => {
  const topResult = apiResponse.hybrid.top[0];
  const similarityScore = Math.round((topResult?.score_final || 0) * 100);
  const isSimilar = similarityScore >= 70; // 70% 이상이면 유사과목 인정

  // 파일명에서 과목명 추출 (확장자 제거)
  const subjectName = apiResponse.uploaded.filename.replace(/\.[^/.]+$/, "");

  // 유사한 점과 개선점 생성
  const similarPoints: string[] = [];
  const differentPoints: string[] = [];
  const recommendations: string[] = [];

  if (isSimilar) {
    similarPoints.push("보건교육 관련 핵심 내용 포함");
    similarPoints.push("교육 목표와 방법론의 일치성");
    if (topResult?.score_doc && topResult.score_doc > 0.8) {
      similarPoints.push("문서 전체적인 유사도가 높음");
    }
  } else {
    differentPoints.push("보건교육 핵심 내용 부족");
    differentPoints.push("교육 방법론의 차이");
    recommendations.push("보건교육 관련 내용 보강 필요");
    recommendations.push("교육 방법론 개선 권장");
  }

  // 상세 매칭 정보에서 추가 분석
  if (apiResponse.details.length > 0) {
    const avgScore = apiResponse.details.reduce((sum, detail) => sum + detail.score, 0) / apiResponse.details.length;
    if (avgScore > 0.7) {
      similarPoints.push("세부 내용의 높은 유사성");
    } else {
      differentPoints.push("세부 내용의 차이점 존재");
    }
  }

  return {
    id: Date.now(), // 임시 ID
    uploadId,
    userId: 1, // 임시 사용자 ID
    subjectName,
    similarityScore,
    isSimilar,
    criteriaScores: {
      "문서 유사도": Math.round((topResult?.score_doc || 0) * 100),
      "청크 유사도": Math.round((topResult?.score_chunk || 0) * 100),
      "종합 점수": similarityScore,
      "매칭 수": apiResponse.details.length
    },
    similarPoints,
    differentPoints,
    recommendations,
    createdAt: new Date().toISOString()
  };
};
*/

const ReviewsContainer = styled.div`
  padding: 60px 0;
  min-height: 80vh;
  background: transparent;
`;

const PageTitle = styled.h1`
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 12px;
  color: white;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PageSubtitle = styled.p`
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 50px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const FilterTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 50px;
`;

const FilterTab = styled.button<{ active: boolean }>`
  padding: 14px 28px;
  border: 2px solid ${props => props.active ? '#667eea' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.active ? 'rgba(102, 126, 234, 0.9)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.2);
    color: white;
    transform: translateY(-2px);
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
  align-items: start; /* 카드들이 상단 정렬되도록 */
`;

const ReviewCard = styled(Card)<{ isSimilar?: boolean }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-left: 6px solid ${props => props.isSimilar ? '#48bb78' : '#ff6b6b'};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  align-self: start; /* 각 카드가 독립적인 높이를 가지도록 */

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.isSimilar 
      ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' 
      : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'
    };
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const ReviewTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 6px;
`;

const ReviewDate = styled.div`
  font-size: 14px;
  color: #4a5568;
  font-weight: 500;
`;

const SimilarityScore = styled.div<{ score: number | string }>`
  background: ${props => {
    const numScore = typeof props.score === 'number' ? props.score : 0;
    return numScore >= 80 ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 
           numScore >= 70 ? 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)' : 
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

const ReviewStatus = styled.div<{ isSimilar: boolean }>`
  background: ${props => props.isSimilar 
    ? 'rgba(72, 187, 120, 0.1)' 
    : 'rgba(255, 107, 107, 0.1)'
  };
  color: ${props => props.isSimilar ? '#48bb78' : '#ff6b6b'};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-top: 12px;
  border: 1px solid ${props => props.isSimilar 
    ? 'rgba(72, 187, 120, 0.3)' 
    : 'rgba(255, 107, 107, 0.3)'
  };
`;

const ReviewContent = styled.div`
  margin-top: 24px;
`;

const ContentSection = styled.div`
  margin-bottom: 20px;

  h4 {
    font-size: 18px;
    font-weight: 700;
    color: #2d3748;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    background: rgba(102, 126, 234, 0.05);
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 14px;
    color: #2d3748;
    border-left: 4px solid #667eea;
    font-weight: 500;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(102, 126, 234, 0.1);
      transform: translateX(4px);
    }
  }
`;

const CriteriaScores = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
`;

const CriteriaItem = styled.div`
  background: rgba(255, 255, 255, 0.7);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const CriteriaName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 6px;
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
    return numScore >= 80 ? '#48bb78' : 
           numScore >= 70 ? '#ed8936' : '#ff6b6b';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.8);
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

const ExpandButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);

  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: white;
`;

const EmptyDescription = styled.p`
  font-size: 18px;
  margin-bottom: 32px;
  color: rgba(255, 255, 255, 0.8);
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 50px;
`;

const PageButton = styled.button<{ active?: boolean }>`
  padding: 12px 20px;
  border: 2px solid ${props => props.active ? '#667eea' : 'rgba(255, 255, 255, 0.3)'};
  background: ${props => props.active ? 'rgba(102, 126, 234, 0.9)' : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? 'white' : 'rgba(255, 255, 255, 0.9)'};
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.2);
    color: white;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      setError(error.response?.data?.message || '심사 결과를 불러오는 중 오류가 발생했습니다.');
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
      
      alert('심사 결과가 성공적으로 삭제되었습니다.');
    } catch (error: any) {
      console.error('삭제 오류:', error);
      alert(error.response?.data?.message || '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpanded = (reviewId: number) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        // 현재 카드가 펼쳐져 있으면 접기
        newSet.delete(reviewId);
      } else {
        // 다른 카드들은 모두 접고, 현재 카드만 펼치기
        newSet.clear();
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
          </div>
        </Container>
      </ReviewsContainer>
    );
  }

  return (
    <ReviewsContainer>
      <Container>
        <PageTitle>심사 결과</PageTitle>
        <PageSubtitle>
          보건교육사 유사과목 심사 결과를 확인하세요
        </PageSubtitle>

        <FilterTabs>
          <FilterTab 
            active={filter === 'all'} 
            onClick={() => handleFilterChange('all')}
          >
            전체
          </FilterTab>
          <FilterTab 
            active={filter === 'similar'} 
            onClick={() => handleFilterChange('similar')}
          >
            유사과목 인정
          </FilterTab>
          <FilterTab 
            active={filter === 'not-similar'} 
            onClick={() => handleFilterChange('not-similar')}
          >
            유사과목 미인정
          </FilterTab>
        </FilterTabs>

        {reviews.length === 0 ? (
          <EmptyState>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyTitle>심사 결과가 없습니다</EmptyTitle>
            <EmptyDescription>
              아직 심사를 요청한 과목이 없습니다.<br />
              파일을 업로드하여 심사를 시작해보세요.
            </EmptyDescription>
            <Button as={Link} to="/upload">
              파일 업로드하기
            </Button>
          </EmptyState>
        ) : (
          <>
            <ReviewsGrid>
              {reviews.map((review) => (
                <ReviewCard key={review.id} isSimilar={review.isSimilar}>
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
                    <CriteriaScores>
                      {Object.entries(review.criteriaScores).map(([criteria, score]) => (
                        <CriteriaItem key={criteria}>
                          <CriteriaName>{criteria}</CriteriaName>
                          <CriteriaScore score={score} criteria={criteria}>
                            {criteria === '매칭 청크 수' ? `${score}개` : 
                             criteria === '교과목 목적의 유사성' ? score : 
                             `${score}점`}
                          </CriteriaScore>
                        </CriteriaItem>
                      ))}
                    </CriteriaScores>

                    {/* 접기/펼치기 버튼 */}
                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                      <ExpandButton onClick={() => toggleExpanded(review.id)}>
                        {expandedReviews.has(review.id) ? '📄 상세 내용 접기' : '📋 상세 내용 보기'}
                      </ExpandButton>
                    </div>

                    {/* 상세 내용 - 접기/펼치기 */}
                    {expandedReviews.has(review.id) && (
                      <>
                        {/* 디버깅: similarPoints 내용 확인 */}
                        {(() => {
                          console.log('🔍 Review similarPoints:', review.similarPoints);
                          console.log('🔍 Review similarPoints length:', review.similarPoints.length);
                          console.log('🔍 Review similarPoints type:', typeof review.similarPoints);
                          return null;
                        })()}
                        
                        {review.similarPoints.length > 0 ? (
                          <ContentSection>
                        <h4>
                          <span style={{ marginRight: '8px' }}>✅</span>
                          교과목 목적의 유사성 ({review.similarPoints.length}개)
                        </h4>
                        <ul>
                          {review.similarPoints.map((point, index) => {
                            // 디버깅 로그
                            console.log('Similar point:', point, 'Type:', typeof point);
                            console.log('Similar point keys:', point && typeof point === 'object' ? Object.keys(point) : 'not object');
                            
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
                            // 기존 API 응답 구조 (queryPreview가 있는 구조) - 임시 처리
                            else if (typeof point === 'object' && 'rationale' in point && 'queryPreview' in point && 'confidence' in point) {
                              const oldSimilarPoint = point as any;
                              return (
                                <li key={index} style={{ 
                                  background: 'rgba(255, 165, 0, 0.05)',
                                  borderLeft: '4px solid #ffa500',
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
                                      background: 'rgba(255, 165, 0, 0.1)',
                                      padding: '12px',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(255, 165, 0, 0.2)'
                                    }}>
                                      <strong style={{ color: '#2d3748', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                        🎯 판단 근거:
                                      </strong>
                                      <div style={{ color: '#2d3748', lineHeight: '1.5' }}>
                                        {oldSimilarPoint.rationale}
                                      </div>
                                    </div>
                                    
                                    <div style={{ 
                                      background: 'rgba(255, 165, 0, 0.1)',
                                      padding: '12px',
                                      borderRadius: '8px',
                                      border: '1px solid rgba(255, 165, 0, 0.2)'
                                    }}>
                                      <strong style={{ color: '#2d3748', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                                        📄 매칭된 내용 (구형 데이터):
                                      </strong>
                                      <div style={{ 
                                        color: '#2d3748', 
                                        lineHeight: '1.5',
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: 'monospace',
                                        fontSize: '13px'
                                      }}>
                                        {oldSimilarPoint.queryPreview}
                                      </div>
                                    </div>
                                    
                                    <div style={{ 
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      background: 'rgba(255, 165, 0, 0.1)',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      fontSize: '12px'
                                    }}>
                                      <span style={{ fontWeight: '600', color: '#ffa500' }}>
                                        신뢰도: {oldSimilarPoint.confidence}%
                                      </span>
                                      <span style={{ color: '#4a5568', fontSize: '11px' }}>
                                        {oldSimilarPoint.docId}
                                      </span>
                                    </div>
                                  </div>
                                </li>
                              );
                            }
                            // 기존 구조화된 데이터 (SimilarPoint)
                            else if (typeof point === 'object' && 'uploadedContent' in point && 'existingContent' in point && !('rationale' in point)) {
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
                                    gap: '8px',
                                    fontSize: '14px'
                                  }}>
                                    <div style={{ 
                                      background: 'rgba(72, 187, 120, 0.1)',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(72, 187, 120, 0.2)'
                                    }}>
                                      <strong style={{ color: '#2d3748', fontSize: '12px' }}>📤 업로드한 문서:</strong>
                                      <div style={{ color: '#2d3748', marginTop: '4px' }}>{similarPoint.uploadedContent}</div>
                                    </div>
                                    <div style={{ 
                                      background: 'rgba(102, 126, 234, 0.1)',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      border: '1px solid rgba(102, 126, 234, 0.2)'
                                    }}>
                                      <strong style={{ color: '#2d3748', fontSize: '12px' }}>📚 기존 문서:</strong>
                                      <div style={{ color: '#2d3748', marginTop: '4px' }}>{similarPoint.existingContent}</div>
                                    </div>
                                    <div style={{ 
                                      textAlign: 'center',
                                      background: 'rgba(72, 187, 120, 0.1)',
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      color: '#48bb78'
                                    }}>
                                      유사도: {similarPoint.similarity}%
                                    </div>
                                  </div>
                                </li>
                              );
                            } else {
                              // 기존 문자열 형태 또는 알 수 없는 형태
                              console.warn('Unknown similarPoint type:', point);
                              return (
                                <li key={index} style={{ 
                                  background: 'rgba(255, 0, 0, 0.05)',
                                  borderLeft: '4px solid #ff0000',
                                  padding: '16px',
                                  borderRadius: '8px',
                                  marginBottom: '12px'
                                }}>
                                  <div style={{ color: '#ff0000', fontSize: '14px' }}>
                                    알 수 없는 데이터 형태: {typeof point === 'string' ? point : JSON.stringify(point)}
                                  </div>
                                </li>
                              );
                            }
                          })}
                        </ul>
                      </ContentSection>
                        ) : (
                          <ContentSection>
                            <h4>
                              <span style={{ marginRight: '8px' }}>❌</span>
                              교과목 목적의 유사성 - 비유사 항목
                            </h4>
                            {review.differentPoints.length > 0 ? (
                              <ul>
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
                          </ContentSection>
                        )}

                      </>
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