import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-attachment: fixed;
    color: #2d3748;
    line-height: 1.6;
    min-height: 100vh;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    border: none;
    outline: none;
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

// 정부 웹사이트 스타일 컨테이너
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

// 카드 스타일
export const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 32px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

// 버튼 스타일
export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger'; size?: 'small' | 'medium' | 'large' }>`
  padding: ${props => {
    switch (props.size) {
      case 'small': return '10px 20px';
      case 'large': return '18px 36px';
      default: return '14px 28px';
    }
  }};
  border-radius: 12px;
  font-size: ${props => {
    switch (props.size) {
      case 'small': return '14px';
      case 'large': return '18px';
      default: return '16px';
    }
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
          &:active {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return `
          background: rgba(255, 255, 255, 0.9);
          color: #4a5568;
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          &:hover {
            background: rgba(255, 255, 255, 1);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
          }
        `;
      default:
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

// 입력 필드 스타일
export const Input = styled.input<{ error?: boolean }>`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${props => props.error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 12px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  color: #2d3748;

  &:focus {
    border-color: #667eea;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

export const TextArea = styled.textarea<{ error?: boolean }>`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${props => props.error ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)'};
  border-radius: 12px;
  font-size: 16px;
  resize: vertical;
  min-height: 120px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  color: #2d3748;

  &:focus {
    border-color: #667eea;
    background: rgba(255, 255, 255, 1);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    outline: none;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

// 라벨 스타일
export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

// 에러 메시지 스타일
export const ErrorMessage = styled.div`
  color: #d93025;
  font-size: 14px;
  margin-top: 4px;
`;

// 성공 메시지 스타일
export const SuccessMessage = styled.div`
  color: #137333;
  font-size: 14px;
  margin-top: 4px;
`;

// 로딩 스피너
export const Spinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #0052cc;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 헤더 스타일
export const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

// 네비게이션 스타일
export const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// 푸터 스타일
export const Footer = styled.footer`
  background: #f8f9fa;
  border-top: 1px solid #dadce0;
  padding: 40px 0;
  margin-top: 60px;
  text-align: center;
  color: #5f6368;
`;

// 그리드 레이아웃
export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 1}, 1fr);
  gap: ${props => props.gap || '20px'};
`;

// 플렉스 레이아웃
export const Flex = styled.div<{ direction?: 'row' | 'column'; justify?: string; align?: string; gap?: string }>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  gap: ${props => props.gap || '0'};
`;

// 테마 정의
export const theme = {
  colors: {
    primary: '#667eea',
    primaryDark: '#764ba2',
    secondary: 'rgba(255, 255, 255, 0.9)',
    success: '#48bb78',
    error: '#ff6b6b',
    warning: '#ed8936',
    text: '#2d3748',
    textSecondary: '#4a5568',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    white: '#ffffff',
    border: 'rgba(255, 255, 255, 0.3)',
    glass: 'rgba(255, 255, 255, 0.95)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    danger: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
  },
  shadows: {
    small: '0 2px 8px rgba(0, 0, 0, 0.1)',
    medium: '0 8px 32px rgba(0, 0, 0, 0.1)',
    large: '0 12px 40px rgba(0, 0, 0, 0.15)',
    glow: '0 0 20px rgba(102, 126, 234, 0.3)',
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px',
  },
};