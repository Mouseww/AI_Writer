import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Menu, Button, Dropdown, Space, Avatar, ConfigProvider, message, Spin, notification } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, GlobalOutlined, MenuOutlined, LoadingOutlined } from '@ant-design/icons';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import SettingsPage from './pages/SettingsPage';
import CreateNovelPage from './pages/CreateNovelPage';
import EditNovelPage from './pages/EditNovelPage';
import AgentsPage from './pages/AgentsPage';
import ChapterDetailPage from './pages/ChapterDetailPage';
import PlatformsPage from './pages/PlatformsPage';
import ProtectedRoute from './components/ProtectedRoute';

// 创建全局 navigate 引用
export const navigateRef = { current: null as any };

// 创建全局状态上下文
interface AppContextType {
  user: { username: string } | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  showNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string, description?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const { Header, Content, Footer } = Layout;

const AppThemeConfig = {
  theme: {
    token: {
      colorPrimary: '#667eea',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      colorInfo: '#1890ff',
      fontSize: 14,
      borderRadius: 8,
      sizeUnit: 4,
    },
    components: {
      Button: {
        defaultShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      },
      Menu: {
        itemHoverBg: 'rgba(255, 255, 255, 0.1)',
        itemColor: '#ffffff',
        itemSelectedColor: '#ffffff',
        itemHoverColor: '#ffffff',
      },
    },
  },
  prefixCls: 'aiwriter-antd',
};

// 全局通知配置
const configNotification = () => {
  notification.config({
    placement: 'topRight',
    top: 100,
    duration: 3,
    maxCount: 3,
  });
};

const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);

  // 设置全局 navigate 引用
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    configNotification();
  }, []);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.sub });
      } catch (e) {
        console.error(t('Invalid token'), e);
        localStorage.removeItem('token');
      }
    }
  }, [t]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
    showNotification('info', t('Logged out successfully'));
  };

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: payload.sub });
      showNotification('success', t('Login successful'));
    } catch (e) {
      console.error(t('Invalid token on login'), e);
      showNotification('error', t('Login failed'));
    }
  };

  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', msg: string, description?: string) => {
    const config = {
      message: msg,
      description: description,
      duration: 3,
      className: 'notification-item',
    };
    
    switch (type) {
      case 'success':
        notification.success(config);
        break;
      case 'error':
        notification.error(config);
        break;
      case 'info':
        notification.info(config);
        break;
      case 'warning':
        notification.warning(config);
        break;
    }
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        {t('Settings')}
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        {t('Logout')}
      </Menu.Item>
    </Menu>
  );

  const langMenu = (
    <Menu>
      <Menu.Item key="en" onClick={() => i18n.changeLanguage('en')}>{t('English')}</Menu.Item>
      <Menu.Item key="zh" onClick={() => i18n.changeLanguage('zh')}>{t('中文')}</Menu.Item>
    </Menu>
  );

  const mainNavigationMenu = (
    <Menu 
      theme="dark" 
      mode={isMobile ? "vertical" : "horizontal"} 
      defaultSelectedKeys={['/']} 
      selectedKeys={[window.location.pathname]} 
      style={{ flex: 1, minWidth: 0 }}
      className="fade-in-up"
    >
      <Menu.Item key="/"><Link to="/">{t('Dashboard')}</Link></Menu.Item>
      <Menu.Item key="/agents"><Link to="/agents">{t('AI Agents')}</Link></Menu.Item>
      <Menu.Item key="/platforms"><Link to="/platforms">{t('Platforms')}</Link></Menu.Item>
    </Menu>
  );

  const contextValue: AppContextType = {
    user,
    loading,
    setLoading,
    showNotification,
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <Spin 
          size="large" 
          indicator={<LoadingOutlined style={{ fontSize: 48, color: '#667eea' }} spin />} 
          tip={t('Loading')}
        />
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <ConfigProvider {...AppThemeConfig}>
        <Layout style={{ minHeight: '100vh' }} className="fade-in-up">
          <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, height: '100%', padding: isMobile ? '0 10px' : '0 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '20px', marginRight: '20px' }}>
                <Link to="/" style={{ color: 'inherit', transition: 'all 0.3s ease' }}>
                  AIWriter
                  <span style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.9 }}>✨</span>
                </Link>
              </div>
              {!isMobile && user && mainNavigationMenu}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: isMobile ? '15px 10px 15px 0px' : '16px 20px 15px 0px' }}>
              <Space align="center">
                <Dropdown overlay={langMenu} trigger={['click']}>
                  <Button icon={<GlobalOutlined />} shape="circle" size="small" />
                </Dropdown>
              </Space>
              &nbsp;&nbsp;&nbsp;&nbsp;
              {isMobile && user && (
                <Dropdown overlay={mainNavigationMenu} trigger={['click']}>
                  <Button icon={<MenuOutlined />} style={{ marginLeft: '10px' }} size="small" />
                </Dropdown>
              )}
              {user ? (
                <Dropdown overlay={userMenu} trigger={['click']}>
                  <a onClick={e => e.preventDefault()} style={{ color: 'inherit' }}>
                    <Space align="center">
                      <Avatar icon={<UserOutlined />} size="small" style={{ background: 'rgba(255, 255, 255, 0.2)' }} />
                      {!isMobile && <span style={{ marginLeft: '8px', fontWeight: 500 }}>{user.username}</span>}
                    </Space>
                  </a>
                </Dropdown>
              ) : (
                <Space align="center">
                  <Button type="primary" size="small" onClick={() => navigate('/login')}>
                    {t('Login')}
                  </Button>
                  <Button size="small" onClick={() => navigate('/register')}>
                    {t('Register')}
                  </Button>
                </Space>
              )}
            </div>
          </Header>
          <Content className="app-content" style={{ padding: isMobile ? '0 10px' : '0 50px', marginTop: '24px' }}>
            <div style={{ background: '#fff', padding: isMobile ? 12 : 24, minHeight: 280 }}>
              <Routes>
                <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/agents" element={<AgentsPage />} />
                  <Route path="/platforms" element={<PlatformsPage />} />
                  <Route path="/create-novel" element={<CreateNovelPage />} />
                  <Route path="/novels/:id/edit" element={<EditNovelPage />} />
                  <Route path="/novel/:novelId/chapter/:chapterId" element={<ChapterDetailPage />} />
                  <Route path="/editor/novel/:id/chapter/:chapterId" element={<EditorPage />} />
                  <Route path="/editor/novel/:id" element={<EditorPage />} />
                  <Route path="/" element={<DashboardPage />} />
                </Route>
              </Routes>
            </div>
          </Content>
          <Footer style={{ textAlign: 'center' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              {t('AIWriter ©2025 Created by You')} | 
              <a href="https://github.com/Mouseww/AI_Writer" target="_blank" rel="noopener noreferrer" 
                 style={{ color: 'rgba(255, 255, 255, 0.7)', marginLeft: '8px' }}>
                {t('GitHub')}
              </a>
            </span>
          </Footer>
        </Layout>
      </ConfigProvider>
    </AppContext.Provider>
  );
};

// 自定义 Hook 用于访问全局上下文
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
