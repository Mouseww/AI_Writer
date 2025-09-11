import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../services/api';
import { Novel } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Table, Button, Typography, Tag, Space, Alert, Popconfirm, Card, Row, Col, Statistic, Empty, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, PlayCircleOutlined, PauseCircleOutlined, 
  BookOutlined, FileTextOutlined, UserOutlined, CheckCircleOutlined, ReloadOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { easeOut } from 'framer-motion';
import { useAppContext } from '../App';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const { showNotification, setLoading, user } = useAppContext();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [localLoading, setLocalLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false); // 添加防重复调用标志
    const [stats, setStats] = useState({
        totalNovels: 0,
        writingNovels: 0,
        finishedNovels: 0,
        totalWords: 0
    });

    const calculateStats = (novels: Novel[]) => {
        const totalNovels = novels.length;
        const writingNovels = novels.filter(n => n.status === 'Writing').length;
        const finishedNovels = novels.filter(n => n.status === 'Finished').length;
        const totalWords = novels.reduce((sum, novel) => sum + (novel.totalWordCount || 0), 0);
        
        setStats({ totalNovels, writingNovels, finishedNovels, totalWords });
    };
    
    const getStatusTranslation = (status: string) => {
        switch (status) {
            case 'Writing': return t('writing');
            case 'Finished': return t('finished');
            case 'Paused': return t('paused');
            case 'Draft': return t('draft');
            default: return status;
        }
    };

    const fetchNovels = async (retryCount = 0) => {
        // 防止重复调用
        if (!user || isFetching) return;
        
        setIsFetching(true);
        setLocalLoading(true);
        let isCurrentRequest = true; // 标记当前请求
        
        try {
            const response = await api.get('/novels');
            if (!isCurrentRequest) return; // 如果请求已取消，忽略结果
            
            const data = response.data;
            setNovels(data);
            calculateStats(data);
            if (error) setError('');
            showNotification('success', t('Novels loaded successfully'), `${data.length} novels found`);
        } catch (err: any) {
            if (!isCurrentRequest) return; // 如果请求已取消，忽略错误
            
            console.error('Fetch novels error:', err);
            if (retryCount < 3) {
                // 自动重试最多3次
                setTimeout(() => {
                    if (isCurrentRequest) {
                        fetchNovels(retryCount + 1);
                    }
                }, 1000 * (retryCount + 1));
                return;
            }
            setError(t('Failed to fetch novels. Please check your connection and try again.'));
            showNotification('error', t('Failed to load novels'), err.message || t('Network error'));
        } finally {
            if (isCurrentRequest) {
                setLocalLoading(false);
                setIsFetching(false);
            }
        }
    };

    useEffect(() => {
        if (user && !isFetching) {
            fetchNovels();
        }
    }, [user]);

    // 清理函数，确保组件卸载时停止加载
    useEffect(() => {
        return () => {
            setIsFetching(false);
        };
    }, []);

    const handleDelete = useCallback(async (id: number) => {
        if (!user) {
            showNotification('warning', t('Please login first'), t('You need to be logged in to delete novels'));
            return;
        }
        
        try {
            await api.delete(`/novels/${id}`);
            setNovels(prev => prev.filter(novel => novel.id !== id));
            calculateStats(novels.filter(novel => novel.id !== id));
            showNotification('success', t('Novel deleted successfully'), t('The novel has been removed from your list'));
        } catch (err: any) {
            console.error('Delete novel error:', err);
            showNotification('error', t('Failed to delete novel'), err.message || t('Please try again'));
        }
    }, [user, t, showNotification, novels, calculateStats]);

    const handleStartWriting = useCallback(async (id: number) => {
        if (!user) {
            showNotification('warning', t('Please login first'), t('You need to be logged in to start writing'));
            return;
        }
        
        try {
            await api.post(`/novels/${id}/workflow/status`, { status: 'Writing' });
            setNovels(prev => 
                prev.map(n => n.id === id ? { ...n, status: 'Writing' } : n)
            );
            calculateStats(novels.map(n => n.id === id ? { ...n, status: 'Writing' } : n));
            showNotification('success', t('Writing started'), t('AI is now generating content for your novel'));
        } catch (err: any) {
            console.error('Start writing error:', err);
            showNotification('error', t('Failed to start writing'), err.message || t('Please check your settings'));
        }
    }, [user, t, showNotification, novels, calculateStats]);

    const handlePauseWriting = useCallback(async (id: number) => {
        if (!user) {
            showNotification('warning', t('Please login first'), t('You need to be logged in to pause writing'));
            return;
        }
        
        try {
            await api.post(`/novels/${id}/workflow/status`, { status: 'Paused' });
            setNovels(prev => 
                prev.map(n => n.id === id ? { ...n, status: 'Paused' } : n)
            );
            calculateStats(novels.map(n => n.id === id ? { ...n, status: 'Paused' } : n));
            showNotification('info', t('Writing paused'), t('You can resume writing anytime'));
        } catch (err: any) {
            console.error('Pause writing error:', err);
            showNotification('error', t('Failed to pause writing'), err.message || t('Please try again'));
        }
    }, [user, t, showNotification, novels, calculateStats]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Writing':
                return { color: '#237804', icon: PlayCircleOutlined, bgColor: 'success' };
            case 'Finished':
                return { color: '#1f7a1f', icon: CheckCircleOutlined, bgColor: 'success' };
            case 'Paused':
                return { color: '#faad14', icon: PauseCircleOutlined, bgColor: 'warning' };
            case 'Draft':
            default:
                return { color: '#1890ff', icon: FileTextOutlined, bgColor: 'default' };
        }
    };

    const columns: ColumnsType<Novel> = [
        {
            title: t('Title'),
            dataIndex: 'title',
            key: 'title',
            width: '25%',
            render: (text: string, record: Novel) => (
                <div 
                    style={{ 
                        fontWeight: 600, 
                        color: '#667eea',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        opacity: 1,
                        transform: 'translateX(0)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px) scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    }}
                >
                    <Link 
                        to={`/editor/novel/${record.id}`}
                        style={{ 
                            color: 'inherit',
                            textDecoration: 'none'
                        }}
                    >
                        {text}
                    </Link>
                </div>
            ),
        },
        {
            title: t('Status'),
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => {
                const config = getStatusConfig(status);
                const IconComponent = config.icon;
                const statusText = getStatusTranslation(status);
                return (
                    <div 
                        style={{ 
                            opacity: 1,
                            transform: 'scale(1)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        <Tag 
                            color={config.bgColor} 
                            style={{ 
                                borderRadius: '20px',
                                padding: '4px 12px',
                                fontWeight: 500,
                                color: config.color,
                                ...(status === 'Writing' && { 
                                    boxShadow: '0 0 10px rgba(82, 196, 26, 0.3)'
                                })
                            }}
                        >
                            <IconComponent style={{ marginRight: 4, fontSize: '12px', color: config.color }} />
                            {statusText}
                        </Tag>
                    </div>
                );
            },
        },
        {
            title: t('Latest Chapter'),
            dataIndex: 'latestChapterTitle',
            key: 'latestChapterTitle',
            responsive: ['md'],
            render: (text: string, record: Novel) => (
                <span 
                    style={{ 
                        color: text ? '#333' : '#999',
                        fontSize: '14px',
                        opacity: 1,
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {text || t('noChaptersYet')}
                   
                </span>
            ),
        },
        {
            title: t('Word Count'),
            dataIndex: 'totalWordCount',
            key: 'totalWordCount',
            responsive: ['md'],
            align: 'right',
            render: (wordCount: number) => (
                <span 
                    style={{ 
                        fontFamily: 'monospace',
                        color: wordCount > 10000 ? '#52c41a' : '#1890ff',
                        fontWeight: wordCount > 10000 ? 600 : 400,
                        opacity: 1,
                        transform: 'translateX(0)',
                        transition: 'all 0.4s ease'
                    }}
                >
                    {wordCount?.toLocaleString() || 0} {t('words')}
                </span>
            ),
        },
        {
            title: t('Actions'),
            key: 'actions',
            width: 150,
            render: (text: string, record: Novel) => (
                <div 
                    style={{ 
                        opacity: 1,
                        transform: 'translateX(0)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Space size="small" wrap={false}>
                        {record.status === 'Paused' || record.status === 'Draft' ? (
                            <div 
                                style={{ transition: 'transform 0.2s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onClick={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            >
                                <Button 
                                    icon={<PlayCircleOutlined />} 
                                    onClick={() => handleStartWriting(record.id)} 
                                    title={t('startWriting')} 
                                    type="primary"
                                    size="small"
                                    loading={localLoading || isFetching}
                                    style={{ 
                                        borderRadius: '6px',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {t('start')}
                                </Button>
                            </div>
                        ) : (
                            <div 
                                style={{ transition: 'transform 0.2s ease' }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                onClick={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            >
                                    <Button 
                                        icon={<PauseCircleOutlined />} 
                                        onClick={() => handlePauseWriting(record.id)} 
                                        title={t('pauseWriting')} 
                                        danger
                                        size="small"
                                        loading={localLoading || isFetching}
                                        style={{ 
                                            borderRadius: '6px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                        }}
                                    >
                                        {t('pause')}
                                    </Button>
                            </div>
                        )}
                        <div 
                            style={{ transition: 'transform 0.2s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        >
                            <Button 
                                icon={<EditOutlined />} 
                                onClick={() => navigate(`/novels/${record.id}/edit`)} 
                                title={t('editNovel')} 
                                size="small"
                                style={{ borderRadius: '6px' }}
                            />
                        </div>
                        <div 
                            style={{ transition: 'transform 0.2s ease' }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onClick={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        >
                            <Popconfirm
                                title={t('confirmDeleteTitle')}
                                description={t('confirmDeleteDescription')}
                                onConfirm={() => handleDelete(record.id)}
                                okText={t('confirmDeleteOk')}
                                cancelText={t('cancel')}
                                okButtonProps={{ danger: true }}
                            >
                                <Button 
                                    icon={<DeleteOutlined />} 
                                    danger 
                                    size="small"
                                    style={{ borderRadius: '6px' }}
                                    loading={localLoading || isFetching}
                                />
                            </Popconfirm>
                        </div>
                    </Space>
                </div>
            ),
        },
    ];

    const renderStats = () => (
        <div 
            style={{ 
                opacity: 1,
                transition: 'opacity 0.5s ease'
            }}
        >
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <div 
                        style={{ 
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'all 0.5s ease'
                        }}
                    >
                        <Card 
                            hoverable 
                            style={{ 
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <Statistic
                                title={t('totalNovels')}
                                value={stats.totalNovels}
                                prefix={<BookOutlined style={{ color: '#667eea', fontSize: '20px' }} />}
                            />
                        </Card>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div 
                        style={{ 
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'all 0.5s ease 0.1s'
                        }}
                    >
                        <Card 
                            hoverable 
                            style={{ 
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <Statistic
                                title={t('writingNovels')}
                                value={stats.writingNovels}
                                prefix={<PlayCircleOutlined style={{ color: '#52c41a', fontSize: '20px' }} />}
                            />
                        </Card>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div 
                        style={{ 
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'all 0.5s ease 0.2s'
                        }}
                    >
                        <Card 
                            hoverable 
                            style={{ 
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <Statistic
                                title={t('completedNovels')}
                                value={stats.finishedNovels}
                                prefix={<CheckCircleOutlined style={{ color: '#389e0d', fontSize: '20px' }} />}
                            />
                        </Card>
                    </div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <div 
                        style={{ 
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'all 0.5s ease 0.3s'
                        }}
                    >
                        <Card 
                            hoverable 
                            style={{ 
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            <Statistic
                                title={t('totalWords')}
                                value={stats.totalWords}
                                prefix={<FileTextOutlined style={{ color: '#1890ff', fontSize: '20px' }} />}
                                suffix={t('words')}
                            />
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );

    const renderEmpty = () => (
        <div 
            style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '12px',
                margin: '24px 0',
                opacity: 1,
                transform: 'scale(1)',
                transition: 'all 0.5s ease'
            }}
        >
            <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <div 
                        style={{ 
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'all 0.5s ease 0.2s'
                        }}
                    >
                        <Title level={4} style={{ color: '#999', marginBottom: '8px' }}>
                            {t('noNovelsYet')}
                        </Title>
                        <p style={{ color: '#666', marginBottom: '24px' }}>
                            {t('startCreatingNovel')}
                        </p>
                        <div 
                            style={{ 
                                display: 'inline-block',
                                transition: 'transform 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                                <Button 
                                    type="primary" 
                                    icon={<PlusOutlined />} 
                                    size="large"
                                    onClick={() => navigate('/create-novel')}
                                    style={{ 
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                    }}
                                >
                                    {t('createFirstNovel')}
                                </Button>
                        </div>
                    </div>
                }
            />
        </div>
    );

    const renderContent = () => {
        if (localLoading || isFetching) {
            return (
                <div 
                    style={{ 
                        padding: '40px 0', 
                        textAlign: 'center',
                        opacity: 1,
                        transition: 'opacity 0.3s ease'
                    }}
                >
                    <div 
                        style={{ 
                            display: 'inline-block',
                            transition: 'transform 1s linear',
                            animation: 'spin 1s linear infinite'
                        }}
                    >
                        <Spin 
                            size="large" 
                            tip={t('loadingNovels')}
                            style={{ color: '#667eea' }}
                        />
                    </div>
                    <div 
                        style={{ 
                            marginTop: '16px', 
                            color: '#666',
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'all 0.3s ease 0.2s'
                        }}
                    >
                        {t('fetchingCreativeWorks')}
                    </div>
                </div>
            );
        }

        if (error && novels.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Alert
                        message={t('loadingFailed')}
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button 
                                type="primary" 
                                onClick={() => fetchNovels()}
                                loading={localLoading}
                            >
                                {t('retry')}
                            </Button>
                        }
                        style={{ marginBottom: 24 }}
                    />
                    <Empty 
                        description={t('noNovelsAvailable')}
                    />
                </div>
            );
        }

        if (novels.length === 0 && !error) {
            return renderEmpty();
        }

        return (
            <div 
                style={{ 
                    opacity: 1,
                    transform: 'translateY(0)',
                    transition: 'all 0.5s ease'
                }}
            >
                <div 
                    style={{ 
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                        border: 'none',
                        overflow: 'hidden',
                        opacity: 1,
                        transition: 'all 0.3s ease'
                    }}
                >
                    <div style={{ padding: '24px' }}>
                        <div 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '16px',
                                opacity: 1,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {novels.map((novel, index) => (
                                <div
                                    key={novel.id}
                                    style={{ 
                                        padding: '16px',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '8px',
                                        background: 'white',
                                        cursor: 'pointer',
                                        opacity: 1,
                                        transform: 'translateY(0) scale(1)',
                                        transition: 'all 0.4s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.borderColor = '#e6f7ff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = '0 0 0 rgba(0, 0, 0, 0)';
                                        e.currentTarget.style.borderColor = '#f0f0f0';
                                    }}
                                >
                                    <Table 
                                        columns={columns} 
                                        dataSource={[novel]} 
                                        rowKey="id" 
                                        pagination={false}
                                        showHeader={false}
                                        size="middle"
                                        style={{ 
                                            background: 'transparent',
                                            border: 'none'
                                        }}
                                        className="novel-row"
                                    />
                                </div>
                            ))}
                        </div>
                        
                        {novels.length > 0 && (
                            <div 
                                style={{ 
                                    textAlign: 'center', 
                                    padding: '24px',
                                    borderTop: '1px solid #f0f0f0',
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                    transition: 'all 0.3s ease 0.5s'
                                }}
                            >
                                <div 
                                    style={{ 
                                        display: 'inline-block',
                                        transition: 'transform 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'
                                }>
                                <Button 
                                    type="dashed" 
                                    onClick={() => !isFetching && fetchNovels()}
                                    icon={<ReloadOutlined spin={localLoading || isFetching} />}
                                    loading={localLoading || isFetching}
                                    disabled={isFetching}
                                    style={{ borderRadius: '6px' }}
                                >
                                    {t('refreshList')}
                                </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div 
            className="dashboard-container"
            style={{ 
                opacity: 1,
                transition: 'opacity 0.6s ease'
            }}
        >
            <div 
                style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '32px', 
                    flexWrap: 'wrap',
                    padding: '0 8px',
                    opacity: 1,
                    transform: 'translateY(0)',
                    transition: 'all 0.3s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div 
                        style={{ 
                            opacity: 1,
                            transform: 'translateX(0)',
                            transition: 'all 0.4s ease'
                        }}
                    >
                        <Title 
                            level={2} 
                            style={{ 
                                marginBottom: '0', 
                                fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginRight: '16px'
                            }}
                        >
                            {t('dashboard')}
                        </Title>
                    </div>
                    {user ? (
                        <div 
                            style={{ 
                                opacity: 1,
                                transform: 'scale(1)',
                                transition: 'all 0.4s ease 0.1s'
                            }}
                        >
                            <Tag 
                                color="blue" 
                                style={{ 
                                    borderRadius: '12px',
                                    fontWeight: 500,
                                    padding: '4px 12px'
                                }}
                            >
                                <UserOutlined style={{ marginRight: 4 }} />
                                {user.username}
                            </Tag>
                        </div>
                    ) : (
                        <div 
                            style={{ 
                                opacity: 1,
                                transform: 'scale(1)',
                                transition: 'all 0.4s ease 0.1s'
                            }}
                        >
                                <Tag 
                                    color="default" 
                                    style={{ 
                                        borderRadius: '12px',
                                        fontWeight: 500,
                                        padding: '4px 12px'
                                    }}
                                >
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    {t('guest')}
                                </Tag>
                        </div>
                    )}
                </div>
                <div 
                    style={{ 
                        opacity: 1,
                        transform: 'translateX(0)',
                        transition: 'all 0.4s ease 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => navigate('/create-novel')} 
                        size="large"
                        style={{ 
                            borderRadius: '8px',
                            fontWeight: 600,
                            height: '44px',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }}
                    >
                        {t('createNewNovel')}
                    </Button>
                </div>
            </div>

            {renderStats()}
            
            {error && (
                <div 
                    style={{ 
                        opacity: 1,
                        transform: 'translateX(0)',
                        transition: 'all 0.3s ease'
                    }}
                >
                <Alert 
                    message={t('error')} 
                    description={error}
                    type="error" 
                    showIcon 
                    closable
                    style={{ 
                        marginBottom: 24, 
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(245, 34, 45, 0.1)'
                    }}
                    onClose={() => setError('')}
                />
                </div>
            )}
            
            {renderContent()}
        </div>
    );
};

export default DashboardPage;
