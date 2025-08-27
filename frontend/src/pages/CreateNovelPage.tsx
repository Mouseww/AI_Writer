import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Form, Input, Button, Card, message as antdMessage } from 'antd';

const { TextArea } = Input;

const CreateNovelPage: React.FC = () => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleSubmit = async (values: { title: string, description: string }) => {
        try {
            await api.post('/novels', values);
            antdMessage.success(t('Novel created successfully!'));
            navigate('/'); // Redirect to dashboard on success
        } catch (err) {
            antdMessage.error(t('Failed to create novel. Please try again.'));
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '50px' }}>
            <Card title={t('Create a New Novel')} style={{ width: '100%', maxWidth: '600px' }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label={t('Title')}
                        name="title"
                        rules={[{ required: true, message: t('Please input the title!') }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label={t('Description')}
                        name="description"
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">{t('Create Novel')}</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreateNovelPage;
