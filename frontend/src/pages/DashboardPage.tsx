import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Novel } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, Typography, Tag, Space, Alert, Popconfirm, Dropdown, Menu, Skeleton } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, MoreOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CSSTransition } from 'react-transition-group';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchNovels();
    }, [t]);

    const fetchNovels = async () => {
        setLoading(true);
        try {
            const response = await api.get('/novels');
            setNovels(response.data);
        } catch (err) {
            setError(t('Failed to fetch novels. You might need to log in.'));
        } finally {
            setLoading(false);
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
            await api.post(`/novels/${id}/workflow/status`, { status: 'Writing' });
            setNovels(prevNovels => 
                prevNovels.map(novel => 
                    novel.id === id ? { ...novel, status: 'Writing' } : novel
                )
            );
            setTimeout(() => fetchNovels(), 500);
        } catch (err) {
            console.error('Failed to start writing:', err);
            setError(t('Failed to start writing.'));
        }
    };

    const handlePauseWriting = async (id: number) => {
        try {
            await api.post(`/novels/${id}/workflow/status`, { status: 'Paused' });
            setNovels(prevNovels => 
                prevNovels.map(novel => 
                    novel.id === id ? { ...novel, status: 'Paused' } : novel
                )
            );
            setTimeout(() => fetchNovels(), 500);
        } catch (err) {
            console.error('Failed to pause writing:', err);
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
            responsive: ['md'],
        },
        {
            title: t('Word Count'),
            dataIndex: 'totalWordCount',
            key: 'totalWordCount',
            responsive: ['md'],
        },
        {
            title: t('Actions'),
            key: 'actions',
            render: (text: string, record: Novel) => {
                const menu = (
                    <Menu>
                        {record.status === 'Paused' || record.status === 'Draft' ? (
                            <Menu.Item key="start" icon={<PlayCircleOutlined />} onClick={() => handleStartWriting(record.id)}>{t('Start Writing')}</Menu.Item>
                        ) : (
                            <Menu.Item key="pause" icon={<PauseCircleOutlined />} onClick={() => handlePauseWriting(record.id)}>{t('Pause Writing')}</Menu.Item>
                        )}
                        <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => navigate(`/novels/${record.id}/edit`)}>{t('Edit Novel')}</Menu.Item>
                        <Menu.Item key="delete" icon={<DeleteOutlined />}>
                            <Popconfirm
                                title={t("Are you sure to delete this novel?")}
                                onConfirm={() => handleDelete(record.id)}
                                okText={t("Yes")}
                                cancelText={t("No")}
                            >
                                {t('Delete Novel')}
                            </Popconfirm>
                        </Menu.Item>
                    </Menu>
                );

                return isMobile ? (
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button icon={<MoreOutlined />} />
                    </Dropdown>
                ) : (
                    <Space size="small">
                        {record.status === 'Paused' || record.status === 'Draft' ? (
                            <Button 
                                icon={<PlayCircleOutlined />} 
                                onClick={() => handleStartWriting(record.id)} 
                                title={t('Start Writing')} 
                                type="primary"
                                ghost
                            />
                        ) : (
                            <Button 
                                icon={<PauseCircleOutlined />} 
                                onClick={() => handlePauseWriting(record.id)} 
                                title={t('Pause Writing')} 
                                danger
                                ghost
                            />
                        )}
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
                );
            },
        },
    ];

    const renderContent = () => {
        if (loading) {
            return (
                <div style={{ padding: '20px 0' }}>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </div>
            );
        }

        return (
            <CSSTransition
                in={!loading}
                timeout={300}
                classNames="fade"
                unmountOnExit
            >
                <Table 
                    columns={columns} 
                    dataSource={novels} 
                    rowKey="id" 
                    scroll={{ x: 'max-content' }}
                    loading={loading}
                    pagination={{ 
                        responsive: true,
                        position: ['bottomCenter']
                    }}
                />
            </CSSTransition>
        );
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
                <Title level={2} style={{ marginBottom: '0', fontSize: 'calc(1.2rem + 0.8vw)' }}>{t('Dashboard')}</Title>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => navigate('/create-novel')} 
                    style={{ marginTop: '10px' }}
                >
                    {t('Create New Novel')}
                </Button>
            </div>
            {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}
            {renderContent()}
        </div>
    );
};

export default DashboardPage;
