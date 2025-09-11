import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.ts';
import { Form, Input, Button, Card, message as antdMessage, Spin } from 'antd';

interface UserSettings {
    aiProxyUrl: string;
    encryptedApiKey: string;
}

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await api.get('/settings');
                form.setFieldsValue(response.data);
            } catch (error) {
                console.error('Failed to fetch settings', error);
                antdMessage.error(t('Could not load your settings.'));
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [t, form]);

    const handleSubmit = async (values: UserSettings) => {
        try {
            await api.post('/settings', values);
            antdMessage.success(t('Settings saved successfully!'));
        } catch (error) {
            console.error('Failed to save settings', error);
            antdMessage.error(t('Failed to save settings. Please try again.'));
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '50px' }}>
            <Card title={t('AI Settings')} style={{ width: '100%', maxWidth: '600px' }}>
                <Spin spinning={loading}>
                    <p>{t('Configure your AI model provider here.')}</p>
                    <Form form={form} layout="vertical" onFinish={handleSubmit}>
                        <Form.Item
                            label={t('AI Proxy URL:')}
                            name="aiProxyUrl"
                            rules={[{ required: true, message: t('Please input your AI Proxy URL!') }]}
                        >
                            <Input placeholder={t('e.g., https://api.openai.com/v1')} />
                        </Form.Item>
                        <Form.Item
                            label={t('API Key:')}
                            name="encryptedApiKey"
                            rules={[{ required: true, message: t('Please input your API Key!') }]}
                        >
                            <Input.Password />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">{t('Save Settings')}</Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Card>
        </div>
    );
};

export default SettingsPage;
