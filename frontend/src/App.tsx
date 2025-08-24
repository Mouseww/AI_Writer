import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Menu, Button, Dropdown, Space, Avatar } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, GlobalOutlined } from '@ant-design/icons';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import SettingsPage from './pages/SettingsPage';
import CreateNovelPage from './pages/CreateNovelPage';
import EditNovelPage from './pages/EditNovelPage';
import AgentsPage from './pages/AgentsPage';
import ChapterDetailPage from './pages/ChapterDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

const { Header, Content, Footer } = Layout;

const AppContent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ username: payload.sub });
      } catch (e) {
        console.error('Invalid token', e);
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const handleLogin = (token: string) => {
    localStorage.setItem('token', token);
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser({ username: payload.sub });
    } catch (e) {
      console.error('Invalid token on login', e);
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
      <Menu.Item key="en" onClick={() => i18n.changeLanguage('en')}>English</Menu.Item>
      <Menu.Item key="zh" onClick={() => i18n.changeLanguage('zh')}>中文</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', color: 'white', fontSize: '20px', marginRight: '20px' }}>
            {/* Placeholder for Logo */}
            <Link to="/" style={{ color: 'inherit' }}>AIWriter</Link>
          </div>
          {user && (
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['/']} selectedKeys={[window.location.pathname]} style={{ flex: 1, minWidth: 0 }}>
              <Menu.Item key="/"><Link to="/">{t('Dashboard')}</Link></Menu.Item>
              <Menu.Item key="/agents"><Link to="/agents">{t('AI Agents')}</Link></Menu.Item>
            </Menu>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center'}}>
          <Dropdown overlay={langMenu} trigger={['click']}>
            <Button icon={<GlobalOutlined />} shape="circle" style={{ marginRight: '20px',marginTop: '16px'  }} />
          </Dropdown>
          {user ? (
            <Dropdown overlay={userMenu} trigger={['click']}>
              <a onClick={e => e.preventDefault()}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  {user.username}
                </Space>
              </a>
            </Dropdown>
          ) : (
            <Space>
              <Button type="primary" onClick={() => navigate('/login')}>{t('Login')}</Button>
              <Button onClick={() => navigate('/register')}>{t('Register')}</Button>
            </Space>
          )}
        </div>
      </Header>
      <Content className="app-content" style={{ padding: '0 50px', marginTop: '24px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/agents" element={<AgentsPage />} />
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
      <Footer style={{ textAlign: 'center' }}>{t('AIWriter ©2025 Created by You')}</Footer>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
