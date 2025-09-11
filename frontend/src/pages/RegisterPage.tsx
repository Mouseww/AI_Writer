import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, UserAddOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await api.post('/auth/register', values);
            setSuccess(t('Registration successful! Please log in.'));
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data || t('Registration failed. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '100vh', 
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                animation: 'fadeIn 0.8s ease-in-out'
            }}
        >
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .register-card {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    border-radius: 16px;
                    border: none;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                    background: rgba(255, 255, 255, 0.95);
                }
                .register-title {
                    text-align: center;
                    margin-bottom: 8px !important;
                    color: #333;
                    font-weight: 700;
                }
                .register-subtitle {
                    text-align: center;
                    color: #666;
                    margin-bottom: 32px !important;
                }
                .register-form-item {
                    margin-bottom: 20px !important;
                }
                .register-button {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    height: 44px;
                    border-radius: 22px;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s ease;
                }
                .register-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
                }
                .register-link {
                    color: #667eea;
                    text-decoration: none;
                    font-weight: 500;
                }
                .register-link:hover {
                    color: #764ba2;
                    text-decoration: underline;
                }
                .brand-section {
                    text-align: center;
                    margin-bottom: 32px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    backdrop-filter: blur(10px);
                }
                .brand-icon {
                    font-size: 48px;
                    margin-bottom: 8px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
            `}</style>
            
            <Card 
                className="register-card"
                style={{ width: '100%', maxWidth: 420 }}
                bodyStyle={{ padding: '40px 32px' }}
            >
                <div className="brand-section">
                    <div className="brand-icon">✨</div>
                    <Title level={2} className="register-title">{t('Create Account')}</Title>
                    <Text className="register-subtitle">{t('Join AIWriter and start creating amazing stories')}</Text>
                </div>

                <Form
                    name="register"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    {error && (
                        <Alert 
                            message={t('Registration Error')} 
                            description={error} 
                            type="error" 
                            showIcon 
                            style={{ marginBottom: 24, borderRadius: 8 }}
                        />
                    )}
                    {success && (
                        <Alert 
                            message={t('Success')} 
                            description={success} 
                            type="success" 
                            showIcon 
                            style={{ marginBottom: 24, borderRadius: 8 }}
                        />
                    )}
                    
                    <Form.Item
                        name="username"
                        rules={[{ 
                            required: true, 
                            message: t('Please input your Username!'),
                            min: 3,
                            max: 20
                        }]}
                        className="register-form-item"
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: '#667eea' }} />} 
                            placeholder={t("Create username")}
                            size="large"
                            style={{ borderRadius: 12, height: 44 }}
                        />
                    </Form.Item>
                    
                    <Form.Item
                        name="password"
                        rules={[{ 
                            required: true, 
                            message: t('Please input your Password!'),
                            min: 6
                        }]}
                        className="register-form-item"
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: '#667eea' }} />} 
                            placeholder={t("Create password")}
                            size="large"
                            style={{ borderRadius: 12, height: 44 }}
                        />
                    </Form.Item>
                    
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            className="register-button"
                            size="large"
                            style={{ width: '100%' }}
                            icon={loading ? undefined : <UserAddOutlined />}
                        >
                            {loading ? t('Creating account...') : t('Create Account')}
                        </Button>
                    </Form.Item>
                    
                    <Divider style={{ margin: '24px 0' }} />
                    
                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                        <Text>{t("Already have an account?")}</Text>
                        <Link to="/login" className="register-link">
                            {t('Sign in instead')}
                        </Link>
                    </Space>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;
