import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Agent } from '../types';
import { Button, Modal, Form, Input, Select, InputNumber, Table, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;
const { TextArea } = Input;

interface Model {
    id: string;
}

const AgentManager: React.FC = () => {
    const { t } = useTranslation();
    const [agents, setAgents] = useState<Agent[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [form] = Form.useForm();

    const fetchAgents = async () => {
        try {
            const response = await api.get(`/agents`);
            setAgents(response.data);
        } catch (error) {
            console.error("Failed to fetch agents", error);
            message.error(t('Failed to fetch agents'));
        }
    };

    const fetchModels = async () => {
        try {
            const response = await api.get(`/agents/models`);
            setModels(response.data.data);
        } catch (error) {
            console.error("Failed to fetch models", error);
            message.error(t('Failed to fetch models'));
        }
    };

    useEffect(() => {
        fetchAgents();
        fetchModels();
    }, []);

    const handleFormSubmit = async (values: any) => {
        try {
            if (editingAgent) {
                await api.put(`/agents/${editingAgent.id}`, values);
                message.success(t('Agent updated successfully'));
            } else {
                await api.post(`/agents`, values);
                message.success(t('Agent added successfully'));
            }
            setIsModalVisible(false);
            fetchAgents();
        } catch (error) {
            console.error(`Failed to ${editingAgent ? 'update' : 'add'} agent`, error);
            message.error(t(editingAgent ? 'Failed to update agent' : 'Failed to add agent'));
        }
    };

    const showModal = (agent: Agent | null = null) => {
        if (agent) {
            setEditingAgent(agent);
            form.setFieldsValue(agent);
        } else {
            setEditingAgent(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleDeleteAgent = async (agentId: number) => {
        try {
            await api.delete(`/agents/${agentId}`);
            fetchAgents();
            message.success(t('Agent deleted successfully'));
        } catch (error) {
            console.error("Failed to delete agent", error);
            message.error(t('Failed to delete agent'));
        }
    };

    const columns = [
        { title: t('Name'), dataIndex: 'name', key: 'name' },
        { title: t('Model'), dataIndex: 'model', key: 'model' },
        { title: t('Order'), dataIndex: 'order', key: 'order' },
        {
            title: t('Action'),
            key: 'action',
            render: (text: string, record: Agent) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Popconfirm title={t("Are you sure to delete this agent?")} onConfirm={() => handleDeleteAgent(record.id)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
                {t('Add New Agent')}
            </Button>
            <Modal
                title={t(editingAgent ? "Edit Agent" : "Add New Agent")}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item name="name" label={t("Agent Name")} rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="model" label={t("Model")} rules={[{ required: true }]}>
                        <Select>
                            {models.map(model => (
                                <Option key={model.id} value={model.id}>{model.id}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="order" label={t("Order")} rules={[{ required: true }]}>
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="prompt" label={t("System Prompt")} rules={[{ required: true }]}>
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {t(editingAgent ? "Update Agent" : "Add Agent")}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Table columns={columns} dataSource={agents} rowKey="id" />
        </div>
    );
};

export default AgentManager;
