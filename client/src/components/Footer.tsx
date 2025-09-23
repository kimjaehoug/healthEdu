import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: #f8f9fa;
  border-top: 1px solid #dadce0;
  padding: 40px 0;
  margin-top: 60px;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 40px;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const FooterSection = styled.div`
  h3 {
    color: #333;
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }

  p, li {
    color: #5f6368;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 8px;
  }

  ul {
    list-style: none;
    padding: 0;
  }

  li {
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
      color: #0052cc;
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #dadce0;
  padding-top: 20px;
  text-align: center;
  color: #5f6368;
  font-size: 14px;
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <Container>
        <FooterContent>
          <FooterSection>
            <h3>보건교육사 유사과목 심사시스템</h3>
            <p>
              보건교육사 자격 취득에 필요한 유사 과목 심사를 
              자동화하여 신속하고 정확한 심사를 제공합니다.
            </p>
          </FooterSection>

          <FooterSection>
            <h3>서비스 안내</h3>
            <ul>
              <li>파일 업로드</li>
              <li>유사도 분석</li>
              <li>심사 결과 확인</li>
              <li>기준 안내</li>
            </ul>
          </FooterSection>

          <FooterSection>
            <h3>고객지원</h3>
            <ul>
              <li>이용 가이드</li>
              <li>자주 묻는 질문</li>
              <li>문의하기</li>
              <li>개인정보처리방침</li>
            </ul>
          </FooterSection>
        </FooterContent>

        <FooterBottom>
          <p>
            © 2025 보건교육사 유사과목 심사시스템. All rights reserved.
            <br />
            본 시스템은 보건교육사 자격 취득에 필요한 유사 과목 심사를 지원합니다.
          </p>
        </FooterBottom>
      </Container>
    </FooterContainer>
  );
};

export default Footer;