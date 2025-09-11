import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getAllNovelPlatforms, getUserNovelPlatforms, createUserNovelPlatform, deleteUserNovelPlatform } from '../services/api';
import { NovelPlatform, UserNovelPlatform } from '../types';

const { Option } = Select;

const PlatformsPage: React.FC = () => {
    const { t } = useTranslation();
    const [userPlatforms, setUserPlatforms] = useState<UserNovelPlatform[]>([]);
    const [novelPlatforms, setNovelPlatforms] = useState<NovelPlatform[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUserPlatforms();
        fetchNovelPlatforms();
    }, []);

    const fetchUserPlatforms = async () => {
        setLoading(true);
        try {
            const response = await getUserNovelPlatforms();
            setUserPlatforms(response.data);
        } catch (error) {
            message.error(t('Failed to fetch user platforms'));
        } finally {
            setLoading(false);
        }
    };

    const fetchNovelPlatforms = async () => {
        setLoading(true);
        try {
            const response = await getAllNovelPlatforms();
            setNovelPlatforms(response.data);
        } catch (error) {
            message.error(t('Failed to fetch novel platforms'));
        } finally {
            setLoading(false);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await createUserNovelPlatform(values);
            fetchUserPlatforms();
            handleCancel();
            message.success(t('Platform added successfully'));
        } catch (error) {
            message.error(t('Failed to add platform'));
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteUserNovelPlatform(id);
            fetchUserPlatforms();
            message.success(t('Platform deleted successfully'));
        } catch (error) {
            message.error(t('Failed to delete platform'));
        }
    };

    const columns = [
        {
            title: t('Platform Name'),
            dataIndex: 'novelPlatformName',
            key: 'novelPlatformName',
        },
        {
            title: t('Username'),
            dataIndex: 'platformUserName',
            key: 'platformUserName',
        },
        {
            title: t('Action'),
            key: 'action',
            render: (_: any, record: UserNovelPlatform) => (
                <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger>
                    {t('Delete')}
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal} style={{ marginBottom: 16 }}>
                {t('Add Platform')}
            </Button>
            <Spin spinning={loading}>
                <Table dataSource={userPlatforms} columns={columns} rowKey="id" />
            </Spin>
            <Modal title={t('Add New Platform')} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} layout="vertical">
                    <Form.Item name="novelPlatformId" label={t('Platform')} rules={[{ required: true, message: t('Please select a platform!') }]}>
                        <Select placeholder={t('Select a platform')}>
                            {novelPlatforms.map(p => (
                                <Option key={p.id} value={p.id}>{p.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="platformUserName" label={t('Username')} rules={[{ required: true, message: t('Please input your username!') }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="platformPassword" label={t('Password')} rules={[{ required: true, message: t('Please input your password!') }]}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PlatformsPage;
