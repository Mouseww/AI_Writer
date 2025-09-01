import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllNovelPlatforms, getUserNovelPlatforms, createUserNovelPlatform, deleteUserNovelPlatform } from '../services/api';
import { NovelPlatform, UserNovelPlatform } from '../types';

const { Option } = Select;

const PlatformsPage: React.FC = () => {
    const [userPlatforms, setUserPlatforms] = useState<UserNovelPlatform[]>([]);
    const [novelPlatforms, setNovelPlatforms] = useState<NovelPlatform[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUserPlatforms();
        fetchNovelPlatforms();
    }, []);

    const fetchUserPlatforms = async () => {
        try {
            const response = await getUserNovelPlatforms();
            setUserPlatforms(response.data);
        } catch (error) {
            message.error('Failed to fetch user platforms');
        }
    };

    const fetchNovelPlatforms = async () => {
        try {
            const response = await getAllNovelPlatforms();
            setNovelPlatforms(response.data);
        } catch (error) {
            message.error('Failed to fetch novel platforms');
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
            message.success('Platform added successfully');
        } catch (error) {
            message.error('Failed to add platform');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteUserNovelPlatform(id);
            fetchUserPlatforms();
            message.success('Platform deleted successfully');
        } catch (error) {
            message.error('Failed to delete platform');
        }
    };

    const columns = [
        {
            title: 'Platform Name',
            dataIndex: 'novelPlatformName',
            key: 'novelPlatformName',
        },
        {
            title: 'Username',
            dataIndex: 'platformUserName',
            key: 'platformUserName',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: UserNovelPlatform) => (
                <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger>
                    Delete
                </Button>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal} style={{ marginBottom: 16 }}>
                Add Platform
            </Button>
            <Table dataSource={userPlatforms} columns={columns} rowKey="id" />
            <Modal title="Add New Platform" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
                <Form form={form} layout="vertical">
                    <Form.Item name="novelPlatformId" label="Platform" rules={[{ required: true, message: 'Please select a platform!' }]}>
                        <Select placeholder="Select a platform">
                            {novelPlatforms.map(p => (
                                <Option key={p.id} value={p.id}>{p.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="platformUserName" label="Username" rules={[{ required: true, message: 'Please input your username!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="platformPassword" label="Password" rules={[{ required: true, message: 'Please input your password!' }]}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PlatformsPage;
