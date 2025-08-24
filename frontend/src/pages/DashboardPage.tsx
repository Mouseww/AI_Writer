import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Novel } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, Typography, Tag, Space, Alert, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // For loading animation

    useEffect(() => {
        fetchNovels();
    }, [t]);

    const fetchNovels = async () => {
        setLoading(true); // Start loading
        try {
            const response = await api.get('/novels');
            setNovels(response.data);
        } catch (err) {
            setError(t('Failed to fetch novels. You might need to log in.'));
        } finally {
            setLoading(false); // End loading
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/novels/${id}`);
            fetchNovels();
        } catch (err) {
            setError(t('Failed to delete novel.'));
        }
    };

    const handleStartWriting = async (id: number) => {
        try {
            await api.post(`/novels/${id}/start-writing`);
            fetchNovels();
        } catch (err) {
            setError(t('Failed to start writing.'));
        }
    };

    const handlePauseWriting = async (id: number) => {
        try {
            await api.post(`/novels/${id}/pause-writing`);
            fetchNovels();
        } catch (err) {
            setError(t('Failed to pause writing.'));
        }
    };

    const columns = [
        {
            title: t('Title'),
            dataIndex: 'title',
            key: 'title',
            render: (text: string, record: Novel) => <Link to={`/editor/novel/${record.id}`}>{text}</Link>,
        },
        {
            title: t('Status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'geekblue';
                if (status === 'Finished') {
                    color = 'green';
                } else if (status === 'Paused') {
                    color = 'volcano';
                } else if (status === 'Writing') {
                    color = 'processing';
                }
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: t('Latest Chapter'),
            dataIndex: 'latestChapterTitle',
            key: 'latestChapterTitle',
            render: (text: string) => text || t('No chapters yet'),
        },
        {
            title: t('Word Count'),
            dataIndex: 'totalWordCount',
            key: 'totalWordCount',
        },
        {
            title: t('Actions'),
            key: 'actions',
            render: (text: string, record: Novel) => (
                <Space size="small">
                    {/* {record.status === 'Paused' || record.status === 'Draft' ? (
                        <Button icon={<PlayCircleOutlined />} onClick={() => handleStartWriting(record.id)} title={t('Start Writing')} />
                    ) : (
                        <Button icon={<PauseCircleOutlined />} onClick={() => handlePauseWriting(record.id)} title={t('Pause Writing')} />
                    )} */}
                    <Button icon={<EditOutlined />} onClick={() => navigate(`/novels/${record.id}/edit`)} title={t('Edit Novel')} />
                    <Popconfirm
                        title={t("Are you sure to delete this novel?")}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t("Yes")}
                        cancelText={t("No")}
                    >
                        <Button icon={<DeleteOutlined />} danger title={t('Delete Novel')} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Title level={2} style={{ marginBottom: '0' }}>{t('Dashboard')}</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/create-novel')} style={{ marginTop: '10px' }}>
                    {t('Create New Novel')}
                </Button>
            </div>
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
            <Table columns={columns} dataSource={novels} rowKey="id" scroll={{ x: 'max-content' }} />
        </div>
    );
};

export default DashboardPage;
