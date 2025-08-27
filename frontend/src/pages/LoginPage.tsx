import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

interface LoginPageProps {
  onLogin: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setError('');
        try {
            const response = await api.post('/auth/login', values);
            const { token } = response.data;
            onLogin(token);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data || t('Login failed. Please check your credentials.'));
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Card title={t('Login')} style={{ width: 400 }}>
                <Form
                    name="login"
                    onFinish={onFinish}
                >
                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: t('Please input your Username!') }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder={t("Username")} />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: t('Please input your Password!') }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder={t("Password")} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            {t('Log in')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;
