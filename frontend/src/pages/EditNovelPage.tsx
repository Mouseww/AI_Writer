import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api, { getUserNovelPlatforms } from '../services/api.ts';
import { Novel, UserNovelPlatform } from '../types';
import { Form, Input, Button, Card, message as antdMessage, Select, Switch } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const EditNovelPage: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [userPlatforms, setUserPlatforms] = useState<UserNovelPlatform[]>([]);
    const [isAutoPublishEnabled, setIsAutoPublishEnabled] = useState(false);
    const [autoPublish, setAutoPublish] = useState(false);

    useEffect(() => {
        const fetchNovel = async () => {
            try {
                const response = await api.get<Novel>(`/novels/${id}`);
                const novelData = response.data;
                form.setFieldsValue(novelData);
                setAutoPublish(novelData.autoPublish);
                setIsAutoPublishEnabled(!!novelData.userNovelPlatformId && !!novelData.platformNumber);
            } catch (err) {
                
                antdMessage.error(t('Failed to load novel data.'));
            }
        };

        const fetchUserPlatforms = async () => {
            try {
                const response = await getUserNovelPlatforms();
                setUserPlatforms(response.data);
            } catch (error) {
                antdMessage.error(t('Failed to fetch user platforms'));
            }
        };

        fetchNovel();
        fetchUserPlatforms();
    }, [id, t, form]);

    const handleFormChange = () => {
        const platformId = form.getFieldValue('userNovelPlatformId');
        const platformNumber = form.getFieldValue('platformNumber');
        setIsAutoPublishEnabled(!!platformId && !!platformNumber);
    };

    const handleSubmit = async (values: Novel) => {
        try {
            const payload = {
                ...values,
                id: parseInt(id!, 10),
                autoPublish: isAutoPublishEnabled ? autoPublish : false,
            };
            await api.put(`/novels/${id}`, payload);
            antdMessage.success(t('Novel updated successfully!'));
            navigate('/'); // Redirect to dashboard on success
        } catch (err) {
            antdMessage.error(t('Failed to update novel. Please try again.'));
            console.error(err);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '50px' }}>
            <Card title={t('Edit Novel')} style={{ width: '100%', maxWidth: '600px' }}>
                <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={handleFormChange}>
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
                    <Form.Item
                        label={t('Platform')}
                        name="userNovelPlatformId"
                    >
                        <Select placeholder={t('Select a platform')} allowClear>
                            {userPlatforms.map(p => (
                                <Option key={p.id} value={p.id}>{p.novelPlatformName} ({p.platformUserName})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label={t('Platform Number')}
                        name="platformNumber"
                        rules={[{ required: isAutoPublishEnabled, message: t('Please input platform number!') }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label={t('Auto Publish')}
                        name="autoPublish"
                    >
                        <Switch
                            checked={autoPublish}
                            onChange={setAutoPublish}
                            disabled={!isAutoPublishEnabled}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">{t('Save Changes')}</Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default EditNovelPage;
