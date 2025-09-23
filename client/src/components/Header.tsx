import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: transparent;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
  
  img {
    border-radius: 8px;
  }
`;

const LogoText = styled.div`
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const NavLink = styled.div<{ active?: boolean }>`
  color: ${props => props.active ? '#667eea' : '#4a5568'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  padding: 12px 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    transform: translateY(-2px);
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #333;
`;

const UserRole = styled.div`
  font-size: 12px;
  color: #5f6368;
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  color: #4a5568;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    color: #2d3748;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
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

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo onClick={handleLogoClick}>
          <LogoIcon>
            <img 
              src="/images/image.png" 
              alt="보건교육사 로고" 
              style={{
                width: '100%', 
                height: '100%', 
                objectFit: 'contain'
              }} 
            />
          </LogoIcon>
          <LogoText>보건교육사 유사과목 심사시스템</LogoText>
        </Logo>

        {isAuthenticated ? (
          <>
            <NavLinks>
              <NavLink 
                active={window.location.pathname === '/'}
                onClick={() => handleNavClick('/')}
              >
                홈
              </NavLink>
              <NavLink 
                active={window.location.pathname === '/upload'}
                onClick={() => handleNavClick('/upload')}
              >
                파일 업로드
              </NavLink>
              <NavLink 
                active={window.location.pathname === '/reviews'}
                onClick={() => handleNavClick('/reviews')}
              >
                심사 결과
              </NavLink>
            </NavLinks>

            <UserMenu>
              <UserInfo>
                <UserName>{user?.name}</UserName>
                <UserRole>{user?.role}</UserRole>
              </UserInfo>
              <LogoutButton onClick={handleLogout}>
                로그아웃
              </LogoutButton>
            </UserMenu>
          </>
        ) : (
          <LoginButton onClick={() => handleNavClick('/login')}>
            로그인
          </LoginButton>
        )}
      </Nav>
    </HeaderContainer>
  );
};

export default Header;