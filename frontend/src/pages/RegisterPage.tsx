import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/register', values);
            setSuccess(t('Registration successful! Please log in.'));
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data || t('Registration failed. Please try again.'));
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Card title={t('Register')} style={{ width: 400 }}>
                <Form
                    name="register"
                    onFinish={onFinish}
                >
                    {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
                    {success && <Alert message={success} type="success" showIcon style={{ marginBottom: 24 }} />}
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
                            {t('Register')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default RegisterPage;
