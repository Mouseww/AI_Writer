import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChapters, deleteChapter, publishChapter, rewriteChapter } from '../services/api';
import { Chapter } from '../types';
import { 
    List, 
    Typography, 
    Button, 
    Popconfirm, 
    message, 
    Dropdown, 
    Menu, 
    Space, 
    Spin, 
    Empty,
    Card,
    Tag
} from 'antd';
import { 
    EditOutlined, 
    DeleteOutlined, 
    MoreOutlined, 
    CopyOutlined, 
    UploadOutlined, 
    RedoOutlined,
    BookOutlined,
    FileTextOutlined,
    PlusOutlined,
    ClearOutlined
} from '@ant-design/icons';

const { Title } = Typography;

interface ChapterListProps {
    novelId: number;
    refresh: number;
    loading: boolean;
    defaultChapters?: Chapter[];
    onNewChapter?: () => void;
    onClearChapters?: () => void;
}

const ChapterList: React.FC<ChapterListProps> = ({ novelId, refresh, loading, defaultChapters, onNewChapter, onClearChapters }) => {
    const { t } = useTranslation();
    const [chapters, setChapters] = useState<Chapter[]>(defaultChapters || []);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchChapters = async () => {
        try {
            const response = await getChapters(novelId);
            console.log("Fetched chapters:", response.data);
            setChapters(response.data);
        } catch (error) {
            console.error(t("Failed to fetch chapters"), error);
        }
    };

    useEffect(() => {
        if (refresh > 0) {
            fetchChapters();
        }
    }, [refresh]);

    useEffect(() => {
        if (defaultChapters) {
            setChapters(defaultChapters);
        } else {
            fetchChapters();
        }
    }, [defaultChapters]);

    const handleDelete = async (chapterId: number) => {
        try {
            await deleteChapter(novelId, chapterId);
            message.success(t('Chapter deleted successfully'));
            fetchChapters();
        } catch (error) {
            message.error(t('Failed to delete chapter'));
        }
    };

    const handleCopyContent = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            message.success({
                content: t('Content copied to clipboard!'),
                duration: 2,
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }
            });
        } catch (err) {
            console.warn('navigator.clipboard.writeText failed, trying fallback.', err);
            // Fallback for older browsers or when the modern API fails
            const textArea = document.createElement("textarea");
            textArea.value = content;
            textArea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
            textArea.style.top = "0";
            textArea.style.left = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    message.success({
                        content: t('Content copied to clipboard!'),
                        duration: 2,
                        style: {
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                        }
                    });
                } else {
                    message.error({
                        content: t('Failed to copy content.'),
                        duration: 3,
                        style: {
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)'
                        }
                    });
                }
            } catch (fallbackErr) {
                console.error('Fallback copy method failed.', fallbackErr);
                message.error({
                    content: t('Failed to copy content.'),
                    duration: 3,
                    style: {
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)'
                    }
                });
            }
            document.body.removeChild(textArea);
        }
    };

    const handlePublish = async (chapterId: number) => {
        try {
            await publishChapter(novelId, chapterId);
            message.success({
                content: t('Chapter published successfully'),
                duration: 2,
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)'
                }
            });
        } catch (error) {
            message.error({
                content: t('Failed to publish chapter'),
                duration: 3,
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)'
                }
            });
        }
    };

    const handleRewrite = async (chapterId: number) => {
        try {
            await rewriteChapter(novelId, chapterId);
            message.success({
                content: t('Chapter rewrite started'),
                duration: 2,
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)'
                }
            });
        } catch (error) {
            message.error({
                content: t('Failed to start chapter rewrite'),
                duration: 3,
                style: {
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)'
                }
            });
        }
    };

    const renderItem = (chapter: Chapter) => {
        console.log("Rendering chapter:", chapter);
        const menu = (
            <Menu 
                style={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}
            >
                <Menu.Item 
                    key="edit" 
                    icon={<EditOutlined style={{ color: '#667eea' }} />} 
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        navigate(`/editor/novel/${novelId}/chapter/${chapter.id}`);
                    }}
                    style={{ 
                        borderRadius: '6px',
                        margin: '4px 8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {t('编辑')}
                </Menu.Item>
                <Menu.Item 
                    key="copy" 
                    icon={<CopyOutlined style={{ color: '#52c41a' }} />} 
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        handleCopyContent(chapter.content);
                    }}
                    style={{ 
                        borderRadius: '6px',
                        margin: '4px 8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {t('复制内容')}
                </Menu.Item>
                <Menu.Item 
                    key="publish" 
                    icon={<UploadOutlined style={{ color: '#1890ff' }} />} 
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        handlePublish(chapter.id);
                    }}
                    style={{ 
                        borderRadius: '6px',
                        margin: '4px 8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {t('发布章节')}
                </Menu.Item>
                <Menu.Item 
                    key="rewrite" 
                    icon={<RedoOutlined style={{ color: '#faad14' }} />} 
                    onClick={(e) => {
                        e.domEvent.stopPropagation();
                        handleRewrite(chapter.id);
                    }}
                    style={{ 
                        borderRadius: '6px',
                        margin: '4px 8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {t('重写章节')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item 
                    key="delete" 
                    icon={<DeleteOutlined style={{ color: '#ff4d4f' }} />} 
                    danger
                    onClick={(e) => e.domEvent.stopPropagation()}
                    style={{ 
                        borderRadius: '6px',
                        margin: '4px 8px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Popconfirm
                        title={t("确定要删除此章节吗？")}
                        description={t("此操作不可恢复，章节内容将被永久删除。")}
                        onConfirm={() => handleDelete(chapter.id)}
                        okText={t("确定删除")}
                        cancelText={t("取消")}
                        okButtonProps={{ danger: true }}
                        style={{ borderRadius: '6px' }}
                    >
                        {t('删除章节')}
                    </Popconfirm>
                </Menu.Item>
            </Menu>
        );

        const actions = isMobile ? (
            [<Dropdown overlay={menu} trigger={['click']} placement="bottomRight"> 
                <Button 
                    icon={<MoreOutlined />} 
                    style={{ 
                        borderRadius: '6px',
                        border: '1px solid #d9d9d9',
                        transition: 'all 0.3s ease',
                        minWidth: '44px',
                        height: '44px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#d9d9d9';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                />
            </Dropdown>]
        ) : ( 
            <Space size="small" wrap={false}>
                <div 
                    style={{ transition: 'transform 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Button 
                        type="primary"
                        icon={<EditOutlined />} 
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/novel/${novelId}/chapter/${chapter.id}`);
                        }}
                        size="small"
                        style={{ 
                            borderRadius: '6px',
                            fontWeight: 500,
                            boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {t('编辑')}
                    </Button>
                </div>
                <div 
                    style={{ transition: 'transform 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Button 
                        icon={<CopyOutlined />} 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopyContent(chapter.content);
                        }}
                        size="small"
                        style={{ 
                            borderRadius: '6px',
                            borderColor: '#52c41a',
                            color: '#52c41a',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t('复制')}
                    </Button>
                </div>
                <Popconfirm
                    title={t("确定要删除此章节吗？")}
                    description={t("此操作不可恢复，章节内容将被永久删除。")}
                    onConfirm={() => handleDelete(chapter.id)}
                    okText={t("确定删除")}
                    cancelText={t("取消")}
                    okButtonProps={{ danger: true }}
                    style={{ borderRadius: '8px' }}
                >
                    <div 
                        style={{ transition: 'transform 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Button 
                            danger 
                            icon={<DeleteOutlined />} 
                            onClick={(e) => e.stopPropagation()}
                            size="small"
                            style={{ 
                                borderRadius: '6px',
                                fontWeight: 500,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t('删除')}
                        </Button>
                    </div>
                </Popconfirm>
                <div 
                    style={{ transition: 'transform 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Button 
                        type="default"
                        icon={<UploadOutlined />} 
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePublish(chapter.id);
                        }}
                        size="small"
                        style={{ 
                            borderRadius: '6px',
                            borderColor: '#1890ff',
                            color: '#1890ff',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t('发布')}
                    </Button>
                </div>
                <div 
                    style={{ transition: 'transform 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Button 
                        icon={<RedoOutlined />} 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRewrite(chapter.id);
                        }}
                        size="small"
                        style={{ 
                            borderRadius: '6px',
                            borderColor: '#faad14',
                            color: '#faad14',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {t('重写')}
                    </Button>
                </div>
            </Space>
        );

        return (
            <div
                key={chapter.id}
                style={{ 
                    padding: '16px',
                    border: '1px solid #f0f0f0',
                    borderRadius: '12px',
                    background: 'white',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    opacity: 1,
                    transform: 'translateY(0) scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.08)';
                    e.currentTarget.style.borderColor = '#e6f7ff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                }}
                onClick={() => navigate(`/novel/${novelId}/chapter/${chapter.id}`)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <BookOutlined 
                                style={{ 
                                    marginRight: '8px', 
                                    fontSize: '18px', 
                                    color: '#667eea',
                                    flexShrink: 0
                                }} 
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Link 
                                    to={`/novel/${novelId}/chapter/${chapter.id}`}
                                    style={{ 
                                        color: '#333',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '16px',
                                        lineHeight: '1.4',
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.color = '#667eea';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.color = '#333';
                                    }}
                                >
                                    {chapter.title}
                                </Link>
                                <div style={{ 
                                    color: '#666', 
                                    fontSize: '12px', 
                                    marginTop: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <FileTextOutlined style={{ fontSize: '12px', color: '#999' }} />
                                    <span>{t('字数:')} {chapter.wordCount?.toLocaleString() || 0}</span>
                                    {chapter.createdAt && (
                                        <span style={{ marginLeft: 'auto' }}>
                                            {new Date(chapter.createdAt).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {chapter.content && chapter.content.length > 100 && (
                            <div style={{ 
                                color: '#666', 
                                fontSize: '14px', 
                                lineHeight: '1.5',
                                marginTop: '8px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {chapter.content.substring(0, 100)}...
                            </div>
                        )}
                    </div>
                    <div style={{ 
                        flexShrink: 0, 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {actions}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ 
            opacity: 1, 
            transform: 'translateY(0)',
            transition: 'all 0.5s ease'
        }}>
            {loading ? (
                <div style={{ 
                    padding: '40px 0', 
                    textAlign: 'center',
                    opacity: 1,
                    transition: 'opacity 0.3s ease'
                }}>
                    <Spin 
                        size="large" 
                        tip={t('Loading chapters...')}
                        style={{ color: '#667eea' }}
                    />
                    <div style={{ 
                        marginTop: '16px', 
                        color: '#666',
                        opacity: 1,
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease 0.2s'
                    }}>
                        {t('正在获取章节内容')}
                    </div>
                </div>
            ) : (
                <Card 
                    hoverable
                    style={{ 
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    bodyStyle={{ padding: '0' }}
                >
                    <div style={{ padding: '24px' }}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            marginBottom: '20px',
                            flexWrap: 'wrap'
                        }}>
                            <Title 
                                level={4} 
                                style={{ 
                                    margin: 0, 
                                    fontSize: '1.25rem',
                                    color: '#667eea',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <BookOutlined style={{ marginRight: 8, fontSize: '18px', color: '#667eea' }} />
                                {t('章节列表')}
                                {chapters.length > 0 && (
                                    <Tag 
                                        color="blue" 
                                        style={{ 
                                            marginLeft: '12px',
                                            borderRadius: '12px',
                                            fontWeight: 500,
                                            padding: '4px 12px',
                                            background: '#e6f7ff',
                                            borderColor: '#91d5ff',
                                            color: '#1890ff'
                                        }}
                                    >
                                        {chapters.length}
                                    </Tag>
                                )}
                            </Title>
                            <Space size="middle">
                                {onNewChapter && (
                                    <div 
                                        style={{ transition: 'transform 0.2s ease' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Button 
                                            type="primary" 
                                            icon={<PlusOutlined />} 
                                            onClick={onNewChapter}
                                            size="middle"
                                            style={{ 
                                                borderRadius: '6px',
                                                fontWeight: 500,
                                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                                            }}
                                        >
                                            {t('新增章节')}
                                        </Button>
                                    </div>
                                )}
                                {onClearChapters && chapters.length > 0 && (
                                    <Popconfirm
                                        title={t("确定要清空所有章节吗？")}
                                        description={t("此操作不可恢复，所有章节将被删除。")}
                                        onConfirm={onClearChapters}
                                        okText={t("确定清空")}
                                        cancelText={t("取消")}
                                        okButtonProps={{ danger: true }}
                                    >
                                        <div 
                                            style={{ transition: 'transform 0.2s ease' }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <Button 
                                                danger 
                                                icon={<ClearOutlined />} 
                                                size="middle"
                                                style={{ 
                                                    borderRadius: '6px',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {t('清空章节')}
                                            </Button>
                                        </div>
                                    </Popconfirm>
                                )}
                            </Space>
                            {chapters.length === 0 && !loading && (
                                <div style={{ color: '#999', fontSize: '14px' }}>
                                    {t('暂无章节')}
                                </div>
                            )}
                        </div>
                        
                        {chapters.length === 0 && !loading ? (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '60px 20px',
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                                borderRadius: '12px',
                                margin: '24px 0',
                                opacity: 1,
                                transform: 'scale(1)',
                                transition: 'all 0.5s ease'
                            }}>
                                <Empty 
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div style={{ 
                                            opacity: 1,
                                            transform: 'translateY(0)',
                                            transition: 'all 0.5s ease 0.2s'
                                        }}>
                                            <Title level={4} style={{ color: '#999', marginBottom: '8px' }}>
                                                {t('暂无章节')}
                                            </Title>
                                            <p style={{ color: '#666', marginBottom: '24px' }}>
                                                {t('开始创建你的第一个章节，让故事逐渐展开！')}
                                            </p>
                                        </div>
                                    }
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                opacity: 1,
                                transform: 'translateY(0)',
                                transition: 'all 0.5s ease'
                            }}>
                                {chapters.map((chapter, index) => (
                                    <React.Fragment key={chapter.id}>
                                        {renderItem(chapter)}
                                        {index < chapters.length - 1 && (
                                            <div style={{ height: '12px' }}></div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ChapterList;
