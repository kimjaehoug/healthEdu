import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { Button, Card, Container } from '../styles/GlobalStyles';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 100px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.1"/><stop offset="100%" stop-color="%23ffffff" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="100" fill="url(%23a)"/><circle cx="800" cy="300" r="150" fill="url(%23a)"/><circle cx="400" cy="700" r="120" fill="url(%23a)"/></svg>');
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 70px;
  align-items: center;
  position: relative;
  z-index: 1;
  min-height: 420px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 50px;
    text-align: center;
    min-height: auto;
  }

  @media (max-width: 768px) {
    gap: 35px;
  }
`;

const HeroText = styled.div`
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  @media (max-width: 1024px) {
    text-align: center;
  }
`;

const HeroImage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  
  img {
    max-width: 100%;
    height: auto;
    max-height: 350px;
    filter: drop-shadow(0 12px 35px rgba(0, 0, 0, 0.3));
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 120%;
    height: 120%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    z-index: -1;
  }
`;

const HeroTitle = styled.h1`
  font-size: 50px;
  font-weight: 800;
  margin-bottom: 18px;
  line-height: 1.1;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) {
    font-size: 46px;
  }

  @media (max-width: 768px) {
    font-size: 34px;
    margin-bottom: 14px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 19px;
  margin-bottom: 28px;
  opacity: 0.95;
  max-width: 600px;
  position: relative;
  z-index: 1;
  line-height: 1.5;
  font-weight: 400;

  @media (max-width: 1024px) {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
  }

  @media (max-width: 768px) {
    font-size: 17px;
    margin-bottom: 22px;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;

  @media (max-width: 1024px) {
    justify-content: center;
  }

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const HeroButton = styled(Button)`
  background: rgba(255, 255, 255, 0.95);
  color: #667eea;
  font-weight: 700;
  padding: 16px 32px;
  font-size: 16px;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 160px;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 15px;
    min-width: 140px;
  }
`;

const FeaturesSection = styled.section`
  padding: 100px 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #333;
`;

const SectionSubtitle = styled.p`
  text-align: center;
  font-size: 18px;
  color: #5f6368;
  margin-bottom: 60px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  margin-top: 60px;
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: 40px 24px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  font-size: 40px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  }
`;

const FeatureTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

const FeatureDescription = styled.p`
  color: #5f6368;
  line-height: 1.6;
  font-size: 16px;
`;

const ProcessSection = styled.section`
  padding: 100px 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
`;

const ProcessSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-top: 60px;
`;

const ProcessStep = styled.div`
  text-align: center;
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  &:not(:last-child)::after {
    content: '→';
    position: absolute;
    right: -20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 28px;
    color: #667eea;
    font-weight: bold;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      display: none;
    }
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  margin: 0 auto 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
  }
`;

const StepTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #2d3748;
`;

const StepDescription = styled.p`
  color: #4a5568;
  line-height: 1.7;
  font-size: 16px;
  font-weight: 500;
`;


const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/upload');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      <HeroSection>
        <Container>
          <HeroContent>
            <HeroText>
              <HeroTitle>보건교육사 유사과목 심사시스템</HeroTitle>
              <HeroSubtitle>
                AI 기반 자동 심사로 보건교육사 자격 취득을 위한 유사 과목을 
                신속하고 정확하게 판정받으세요
              </HeroSubtitle>
              <HeroButtons>
                <HeroButton onClick={handleGetStarted}>
                  {isAuthenticated ? '파일 업로드하기' : '지금 시작하기'}
                </HeroButton>
                <HeroButton 
                  variant="secondary" 
                  onClick={() => navigate('/reviews')}
                >
                  심사 기준 보기
                </HeroButton>
              </HeroButtons>
            </HeroText>
            <HeroImage>
              <img 
                src="/images/hero-illustration.svg" 
                alt="보건교육사 시스템 일러스트레이션" 
              />
            </HeroImage>
          </HeroContent>
        </Container>
      </HeroSection>

      <FeaturesSection>
        <Container>
          <SectionTitle>주요 기능</SectionTitle>
          <SectionSubtitle>
            보건교육사 유사과목 심사를 위한 모든 기능을 한 곳에서
          </SectionSubtitle>

          <FeaturesGrid>
            <FeatureCard>
              <FeatureIcon>📄</FeatureIcon>
              <FeatureTitle>파일 업로드</FeatureTitle>
              <FeatureDescription>
                과목 관련 문서를 간편하게 업로드하고 
                자동으로 분석을 시작합니다.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>🤖</FeatureIcon>
              <FeatureTitle>AI 자동 분석</FeatureTitle>
              <FeatureDescription>
                인공지능이 교육목표, 내용, 방법 등을 
                종합적으로 분석하여 유사도를 산출합니다.
              </FeatureDescription>
            </FeatureCard>

            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>상세 결과 제공</FeatureTitle>
              <FeatureDescription>
                유사도 점수와 함께 구체적인 분석 결과와 
                개선 방안을 제시합니다.
              </FeatureDescription>
            </FeatureCard>
          </FeaturesGrid>
        </Container>
      </FeaturesSection>

      <ProcessSection>
        <Container>
          <SectionTitle>이용 절차</SectionTitle>
          <SectionSubtitle>
            간단한 3단계로 유사과목 심사를 완료하세요
          </SectionSubtitle>

          <ProcessSteps>
            <ProcessStep>
              <StepNumber>1</StepNumber>
              <StepTitle>파일 업로드</StepTitle>
              <StepDescription>
                과목 관련 문서를 시스템에 업로드합니다.
                PDF, Word, Excel 파일을 지원합니다.
              </StepDescription>
            </ProcessStep>

            <ProcessStep>
              <StepNumber>2</StepNumber>
              <StepTitle>AI 분석</StepTitle>
              <StepDescription>
                인공지능이 문서를 분석하여 보건교육사 
                인정과목과의 유사도를 계산합니다.
              </StepDescription>
            </ProcessStep>

            <ProcessStep>
              <StepNumber>3</StepNumber>
              <StepTitle>결과 확인</StepTitle>
              <StepDescription>
                상세한 분석 결과와 유사과목 인정 여부를 
                확인하고 검토합니다.
              </StepDescription>
            </ProcessStep>
          </ProcessSteps>
        </Container>
      </ProcessSection>

    </>
  );
};

export default Home;