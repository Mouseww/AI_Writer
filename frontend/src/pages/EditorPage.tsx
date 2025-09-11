import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    message, 
    Button, 
    Input, 
    List, 
    Card, 
    Tag, 
    Spin, 
    Row, 
    Col, 
    Typography, 
    Form, 
    Alert, 
    Space, 
    Statistic, 
    Popconfirm,
    Tooltip
} from 'antd';
import { 
    PlayCircleOutlined, 
    PauseCircleOutlined, 
    SaveOutlined, 
    PlusOutlined, 
    ClearOutlined, 
    SendOutlined, 
    BookOutlined, 
    MessageOutlined, 
    EditOutlined, 
    FileTextOutlined, 
    CheckCircleOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api, { createChapter, updateChapter, clearChapters, clearHistory, addUserMessage } from '../services/api';
import { Novel, Chapter } from '../types';
import HistoryItemView from '../components/HistoryItemView';
import ChapterList from '../components/ChapterList';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

interface HistoryItem {
    id: number;
    agent: { name: string } | null;
    content: string;
    abstract: string;
    timestamp: string;
    isUserMessage: boolean;
}

const EditorPage: React.FC = () => {
    const { t } = useTranslation();
    
    const getStatusTranslation = (status: string) => {
        switch (status) {
            case 'Writing': return t('writing');
            case 'Finished': return t('finished');
            case 'Paused': return t('paused');
            case 'Draft': return t('draft');
            default: return status;
        }
    };
    
    const { id, chapterId } = useParams<{ id: string, chapterId?: string }>();
    const [novel, setNovel] = useState<Novel | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [error, setError] = useState('');
    const [form] = Form.useForm();
    const [refreshChapterList, setRefreshChapterList] = useState(0);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const navigate = useNavigate();
    const [userMessage, setUserMessage] = useState('');

    const novelId = parseInt(id!);

    const fetchNovelAndHistory = useCallback(async () => {
        if (!novelId) return;
        setLoadingChapters(true);
        try {
            const response = await api.get(`/novels/${novelId}`);
            setNovel(response.data);
            setHistory(response.data.conversationHistories.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || []);
    
        } catch (err) {
            console.error('Failed to fetch novel and history', err);
            setError(t('failedToLoadNovelData'));
        } finally {
            setLoadingChapters(false);
        }
    }, [novelId, t]);

    const fetchChapter = useCallback(async () => {
        if (!novelId || !chapterId || chapterId === 'new') return;
        setLoadingChapters(true);
        try {
            const response = await api.get(`/novels/${novelId}/chapters/${chapterId}`);
            setChapter(response.data);
            form.setFieldsValue({ title: response.data.title, content: response.data.content });
        } catch (err) {
            console.error('Failed to fetch chapter', err);
            setError(t('failedToLoadChapterData'));
        } finally {
            setLoadingChapters(false);
        }
    }, [novelId, chapterId, form, t]);


    const fetchProgress = useCallback(async () => {
        if (!novelId) return;
        try {
            const response = await api.get(`/novels/${novelId}/workflow/progress`);
            const newHistory = response.data.history || [];

            setHistory(prevHistory => {
                const historyMap = new Map(prevHistory.map(item => [item.id, item]));
                newHistory.forEach((item: any) => {
                    const newItem = {
                        ...item,
                        agent: item.agentName ? { name: item.agentName } : null,
                        isUserMessage: !item.agentName
                    };
                    historyMap.set(item.id, newItem);
                });
                const mergedHistory = Array.from(historyMap.values());
                return mergedHistory.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });

            if (response.data.status !== novel?.status) {
                fetchNovelAndHistory();
            }

            setRefreshChapterList(prev => prev + 1);
        } catch (err) {
            console.error('Failed to fetch progress', err);
        }
    }, [novelId, novel?.status, fetchNovelAndHistory]);

    useEffect(() => {
        fetchNovelAndHistory();
        if (chapterId && chapterId !== 'new') {
            fetchChapter();
        } else if (chapterId === 'new') {
            setChapter(null);
            form.resetFields();
        }
    }, [fetchNovelAndHistory, fetchChapter, chapterId, form]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (novel?.status === 'Writing') {
                fetchProgress();
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(intervalId);
    }, [novel, fetchProgress]);

    const handleSaveChapter = async (values: { title: string, content: string }) => {
        if (!novelId) return;

        try {
            const wordCount = values.content.length;
            if (chapterId === 'new') {
                await createChapter(novelId, values.title, values.content, wordCount);
                message.success(t('chapterCreatedSuccessfully'));
            } else if (chapter) {
                await updateChapter(novelId, chapter.id, values.title, values.content, wordCount);
                message.success(t('chapterUpdatedSuccessfully'));
            }
            setRefreshChapterList(prev => prev + 1); // Refresh chapter list
            navigate(`/editor/novel/${novelId}`);
        } catch (err) {
            console.error('Failed to save chapter', err);
            setError(t('failedToSaveChapter'));
        }
    };

    const handleSaveAsChapter = async (rawContent: string) => {
        if (!novelId) return;
        try {
            const titleRegex = /\*\*(第[一二三四五六七八九十百千万]+章\s*[^*]+)\*\*/;


            const match = rawContent.match(titleRegex);

            let title: string;
            let content: string;

            if (match && match[1]) {
                title = match[1];
                content = rawContent.split(match[0])[1].trim();
            } else {
                // Fallback if no title is found
                title = rawContent.substring(0, 20) + "...";
                content = rawContent;
            }
            const wordCount = content.length;
            await createChapter(novelId, title, content, wordCount);
            message.success(t('conversationSavedAsChapter'));
            setRefreshChapterList(prev => prev + 1); // Refresh chapter list
        } catch (err) {
            console.error('Failed to save as chapter', err);
            setError(t('failedToSaveAsChapter'));
        }
    };

    if (error) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Alert
                    message={t('error')}
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button type="primary" onClick={() => setError('')} style={{ borderRadius: '6px' }}>
                            {t('retry')}
                        </Button>
                    }
                    style={{ 
                        marginBottom: 24, 
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(245, 34, 45, 0.1)'
                    }}
                />
            </div>
        );
    }

    if (chapterId && chapterId !== 'new' && !chapter) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Spin 
                    size="large" 
                    tip={t('loadingChapter')}
                    style={{ color: '#667eea' }}
                />
            </div>
        );
    }

    if (!chapterId && !novel) {
        return (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Spin 
                    size="large" 
                    tip={t('loadingNovel')}
                    style={{ color: '#667eea' }}
                />
            </div>
        );
    }

    if (chapterId) {
        return (
            <div style={{ opacity: 1, transition: 'opacity 0.6s ease' }}>
                <Card 
                    hoverable
                    style={{ 
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    bodyStyle={{ padding: '24px' }}
                >
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '24px',
                        flexWrap: 'wrap'
                    }}>
                        <Title 
                            level={2} 
                            style={{ 
                                margin: 0, 
                                fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {chapterId === 'new' ? t('newChapter') : t('editChapter')}
                            {chapterId !== 'new' && chapter && (
                                <Tag 
                                    color="blue" 
                                    style={{ 
                                        marginLeft: '12px',
                                        borderRadius: '12px',
                                        fontWeight: 500,
                                        padding: '4px 12px'
                                    }}
                                >
                                    <EditOutlined style={{ marginRight: 4 }} />
                                    {t('chapter')} #{chapter?.id || 'New'}
                                </Tag>
                            )}
                        </Title>
                        <Tooltip title={t('backToNovel')}>
                            <Button 
                                type="default" 
                                onClick={() => navigate(`/editor/novel/${novelId}`)}
                                icon={<BookOutlined />}
                                style={{ 
                                    borderRadius: '8px',
                                    height: '40px'
                                }}
                            />
                        </Tooltip>
                    </div>
                    
                    <Form form={form} onFinish={handleSaveChapter} layout="vertical">
                        <Form.Item 
                            name="title" 
                            label={t('title')} 
                            rules={[{ required: true, message: t('pleaseInputTitle') }]}
                        >
                            <Input 
                                placeholder={t('enterChapterTitle')}
                                prefix={<EditOutlined style={{ color: '#667eea' }} />}
                                style={{ 
                                    borderRadius: '8px',
                                    borderColor: '#d9d9d9',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        </Form.Item>
                        
                        <Form.Item 
                            name="content" 
                            label={t('content')} 
                            rules={[{ required: true, message: t('pleaseInputContent') }]}
                        >
                            <TextArea 
                                rows={20}
                                placeholder={t('enterChapterContent')}
                                style={{ 
                                    borderRadius: '8px',
                                    borderColor: '#d9d9d9',
                                    fontFamily: 'Georgia, serif',
                                    fontSize: '16px',
                                    lineHeight: '1.6',
                                    transition: 'all 0.3s ease',
                                    resize: 'vertical'
                                }}
                            />
                        </Form.Item>
                        
                        <Form.Item>
                            <div 
                                style={{ 
                                    display: 'flex', 
                                    gap: '12px',
                                    justifyContent: 'flex-start',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <Button 
                                    type="primary" 
                                    htmlType="submit" 
                                    icon={<SaveOutlined />}
                                    size="large"
                                    style={{ 
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {chapterId === 'new' ? t('createChapter') : t('saveChapter')}
                                </Button>
                                {chapterId !== 'new' && (
                                    <Button 
                                        htmlType="button"
                                        onClick={() => form.resetFields()}
                                        icon={<ClearOutlined />}
                                        size="large"
                                        style={{ 
                                            borderRadius: '8px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {t('reset')}
                                    </Button>
                                )}
                            </div>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        );
    }

    const handleStart = async () => {
        try {
            await api.post(`/novels/${novelId}/workflow/status`, { status: 'Writing' });
            if (novel) setNovel({ ...novel, status: 'Writing' });
        } catch (err) {
            setError(t('failedToStartWritingProcess'));
        }
    };

    const handlePause = async () => {
        try {
            await api.post(`/novels/${novelId}/workflow/status`, { status: 'Paused' });
            if (novel) setNovel({ ...novel, status: 'Paused' });
        } catch (err) {
            setError(t('failedToPauseWritingProcess'));
        }
    };

    const handleClearChapters = async () => {
        if (!novelId) return;
        try {
            await clearChapters(novelId);
            message.success(t('allChaptersCleared'));
            setRefreshChapterList(prev => prev + 1);
            fetchNovelAndHistory();
        } catch (err) {
            console.error('Failed to clear chapters', err);
            setError(t('failedToClearChapters'));
        }
    };

    const handleNewChapter = () => {
        navigate(`/editor/novel/${novelId}/chapter/new`);
    };

    const handleClearHistory = async () => {
        if (!novelId) return;
        try {
            await clearHistory(novelId);
            setHistory([]);
            message.success(t('conversationHistoryCleared'));
        } catch (err) {
            console.error('Failed to clear history', err);
            setError(t('failedToClearHistory'));
        }
    };

    const handleAddUserMessage = async () => {
        if (!novelId || !userMessage.trim()) return;
        try {
            await addUserMessage(novelId, userMessage);
            setUserMessage('');
            fetchNovelAndHistory(); // Refresh history
        } catch (err) {
            console.error('Failed to add user message', err);
            setError(t('failedToAddUserMessage'));
        }
    };

    return (
        <div 
            className="editor-container"
            style={{ 
                opacity: 1,
                transition: 'opacity 0.6s ease'
            }}
        >
            <div 
                style={{ 
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #e8f4f8 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '32px',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.08)',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    opacity: 1,
                    transform: 'translateY(0)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
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
                                    margin: 0, 
                                    fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    textShadow: '0 2px 4px rgba(102, 126, 234, 0.2)'
                                }}
                            >
                                ✍️ {t('editor')}
                            </Title>
                        </div>
                        {novel && (
                            <div 
                                style={{ 
                                    opacity: 1,
                                    transform: 'scale(1)',
                                    transition: 'all 0.4s ease 0.1s'
                                }}
                            >
                                <Tag 
                                    color="purple" 
                                    style={{ 
                                        borderRadius: '20px',
                                        fontWeight: 600,
                                        padding: '8px 16px',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '14px',
                                        height: 'auto'
                                    }}
                                >
                                    <BookOutlined style={{ fontSize: '16px' }} />
                                    {novel.title.length > 25 ? novel.title.substring(0, 25) + '...' : novel.title}
                                </Tag>
                            </div>
                        )}
                        
                                {novel && (
                                    <Tag 
                                        color={getStatusConfig(novel.status || 'Draft').bgColor} 
                                        style={{ 
                                            borderRadius: '20px',
                                            padding: '8px 16px',
                                            fontWeight: 600,
                                            color: getStatusConfig(novel.status || 'Draft').color,
                                            background: getStatusConfig(novel.status || 'Draft').color + '15',
                                            boxShadow: '0 2px 8px ' + (getStatusConfig(novel.status || 'Draft').color + '20'),
                                            border: '1px solid ' + (getStatusConfig(novel.status || 'Draft').color + '30'),
                                            height: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            animation: novel.status === 'Writing' ? 'pulse 2s infinite' : 'none'
                                        }}
                                    >
                                        {getStatusConfig(novel.status || 'Draft').icon && (
                                            React.createElement(getStatusConfig(novel.status || 'Draft').icon, { 
                                                style: { 
                                                    fontSize: '16px', 
                                                    color: getStatusConfig(novel.status || 'Draft').color 
                                                } 
                                            })
                                        )}
                                        <span style={{ 
                                            animation: novel.status === 'Writing' ? 'pulse 2s infinite' : 'none',
                                            fontWeight: 600
                                        }}>
                                            {getStatusTranslation(novel.status || 'Draft')}
                                        </span>
                                    </Tag>
                                )}
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        
                        {novel && (
                            <div 
                                style={{ 
                                    opacity: 1,
                                    transform: 'translateX(0)',
                                    transition: 'all 0.4s ease 0.3s'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    background: 'white',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid #f0f0f0'
                                }}>
                                    <FileTextOutlined 
                                        style={{ 
                                            color: (novel.totalWordCount || 0) > 50000 ? '#52c41a' : '#1890ff',
                                            fontSize: '18px'
                                        }} 
                                    />
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ 
                                            fontSize: '24px', 
                                            fontWeight: 700,
                                            fontFamily: 'monospace',
                                            color: (novel.totalWordCount || 0) > 50000 ? '#52c41a' : '#1890ff',
                                            lineHeight: '1'
                                        }}>
                                            {novel.totalWordCount?.toLocaleString() || 0}
                                        </div>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: '#666',
                                            fontWeight: 500
                                        }}>
                                            {t('totalWords')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div style={{ 
                            display: 'flex', 
                            gap: '8px',
                            flexWrap: 'wrap'
                        }}>
                            <Button 
                                type="default" 
                                onClick={() => navigate('/dashboard')}
                                size="large"
                                style={{ 
                                    borderRadius: '10px',
                                    height: '44px',
                                    borderColor: '#d9d9d9',
                                    color: '#666',
                                    fontWeight: 500,
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#667eea';
                                    e.currentTarget.style.color = '#667eea';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#d9d9d9';
                                    e.currentTarget.style.color = '#666';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                ← {t('backToDashboard')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={16}>
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
                                borderRadius: '16px',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginBottom: '24px',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)'
                            }}
                            bodyStyle={{ padding: '28px' }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                flexWrap: 'wrap',
                                gap: '20px',
                                marginBottom: '20px'
                            }}>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '16px',
                                    flexWrap: 'wrap'
                                }}>
                                </div>
                                

                            </div>
                            
                            {novel?.description && (
                                <div style={{ 
                                    marginTop: '16px',
                                    padding: '16px',
                                    background: 'rgba(248, 249, 255, 0.8)',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #667eea',
                                    lineHeight: '1.6',
                                    color: '#666',
                                    fontSize: '14px',
                                    opacity: 1,
                                    transform: 'translateY(0)',
                                    transition: 'all 0.3s ease',
                                    maxHeight: '100px',
                                    overflowY: 'auto',
                                    boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    {novel.description}
                                </div>
                            )}
                            

                                    <div 
                                        style={{ 
                                            marginTop: '24px',
                                            paddingTop: '20px',
                                            borderTop: '1px solid #f0f0f0',
                                            opacity: 1,
                                            transform: 'translateY(0)',
                                            transition: 'all 0.3s ease 0.2s'
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: '16px', 
                                            flexWrap: 'wrap',
                                            justifyContent: 'flex-start'
                                        }}>
                                            {novel?.status === 'Paused' || novel?.status === 'Draft' ? (
                                                <div 
                                                    style={{ 
                                                        position: 'relative',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.02)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                    onClick={(e) => {
                                                        if (!isWriting && novel) {
                                                            e.currentTarget.style.transform = 'scale(0.98)';
                                                            setTimeout(() => {
                                                                e.currentTarget.style.transform = 'scale(1.02)';
                                                            }, 150);
                                                        }
                                                    }}
                                                >
                                                    <Button 
                                                        type="primary" 
                                                        icon={<PlayCircleOutlined style={{ marginRight: '8px' }} />} 
                                                        onClick={handleStart} 
                                                        disabled={isWriting || !novel}
                                                        size="large"
                                                        loading={isWriting}
                                                        style={{ 
                                                            borderRadius: '12px',
                                                            fontWeight: 600,
                                                            height: '48px',
                                                            minWidth: '160px',
                                                            boxShadow: '0 6px 20px rgba(82, 196, 26, 0.3)',
                                                            border: 'none',
                                                            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                                            color: 'white',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (!isWriting && novel) {
                                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(82, 196, 26, 0.4)';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (!isWriting && novel) {
                                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(82, 196, 26, 0.3)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }
                                                        }}
                                                    >
                                                        <span style={{ position: 'relative', zIndex: 2 }}>
                                                            {t('开始自动写作')}
                                                        </span>
                                                        <div style={{ 
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: '-100%',
                                                            width: '100%',
                                                            height: '100%',
                                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                            transition: 'left 0.5s',
                                                            zIndex: 1
                                                        }}></div>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div 
                                                    style={{ 
                                                        position: 'relative',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.02)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                    onClick={(e) => {
                                                        if (isWriting) {
                                                            e.currentTarget.style.transform = 'scale(0.98)';
                                                            setTimeout(() => {
                                                                e.currentTarget.style.transform = 'scale(1.02)';
                                                            }, 150);
                                                        }
                                                    }}
                                                >
                                                    <Button 
                                                        danger
                                                        icon={<PauseCircleOutlined style={{ marginRight: '8px' }} />} 
                                                        onClick={handlePause} 
                                                        disabled={!isWriting}
                                                        size="large"
                                                        loading={isWriting}
                                                        style={{ 
                                                            borderRadius: '12px',
                                                            fontWeight: 600,
                                                            height: '48px',
                                                            minWidth: '160px',
                                                            boxShadow: '0 6px 20px rgba(250, 173, 20, 0.3)',
                                                            border: 'none',
                                                            background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                                                            color: 'white',
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            position: 'relative',
                                                            overflow: 'hidden'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            if (isWriting) {
                                                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(250, 173, 20, 0.4)';
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                            }
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            if (isWriting) {
                                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(250, 173, 20, 0.3)';
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                            }
                                                        }}
                                                    >
                                                        <span style={{ position: 'relative', zIndex: 2 }}>
                                                            {t('暂停自动写作')}
                                                        </span>
                                                        <div style={{ 
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: '-100%',
                                                            width: '100%',
                                                            height: '100%',
                                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                            transition: 'left 0.5s',
                                                            zIndex: 1
                                                        }}></div>
                                                    </Button>
                                                </div>
                                            )}
                                            
                                            <div 
                                                style={{ 
                                                    position: 'relative',
                                                    transition: 'transform 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1.02)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                }}
                                            >
                                                <Button 
                                                    type="default" 
                                                    onClick={() => navigate(`/novels/${novelId}/edit`)}
                                                    icon={<EditOutlined style={{ marginRight: '8px' }} />}
                                                    size="large"
                                                    style={{ 
                                                        borderRadius: '12px',
                                                        height: '48px',
                                                        minWidth: '140px',
                                                        border: '1px solid #d9d9d9',
                                                        background: 'white',
                                                        color: '#667eea',
                                                        fontWeight: 500,
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                                        position: 'relative',
                                                        overflow: 'hidden'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = '#667eea';
                                                        e.currentTarget.style.color = '#667eea';
                                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.2)';
                                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#d9d9d9';
                                                        e.currentTarget.style.color = '#667eea';
                                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <span style={{ position: 'relative', zIndex: 2 }}>
                                                        {t('编辑小说信息')}
                                                    </span>
                                                    <div style={{ 
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: '-100%',
                                                        width: '100%',
                                                        height: '100%',
                                                        background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
                                                        transition: 'left 0.5s',
                                                        zIndex: 1
                                                    }}></div>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                        </Card>

                        <ChapterList 
                            novelId={novelId} 
                            refresh={refreshChapterList} 
                            loading={loadingChapters} 
                            defaultChapters={novel?.chapters} 
                            onNewChapter={handleNewChapter}
                            onClearChapters={handleClearChapters}
                        />
                    </div>
                </Col>
                
                <Col xs={24} md={8}>
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
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                height: '100%'
                            }}
                            bodyStyle={{ padding: '24px' }}
                        >
                            <div 
                                style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    marginBottom: '20px',
                                    flexWrap: 'wrap'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Title 
                                        level={4} 
                                        style={{ 
                                            margin: 0, 
                                            color: '#667eea',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <MessageOutlined style={{ marginRight: 8, fontSize: '18px' }} />
                                        {t('对话历史')}
                                    </Title>
                                    {history.length > 0 && (
                                        <Tag 
                                            color="default" 
                                            style={{ 
                                                marginLeft: '12px',
                                                borderRadius: '12px',
                                                fontWeight: 500
                                            }}
                                        >
                                            {history.length}
                                        </Tag>
                                    )}
                                </div>
                                {history.length > 0 && (
                                    <Tooltip title={t("清空对话历史")}>
                                        <Popconfirm
                                            title={t("确定要清空对话记录吗？")}
                                            description={t("此操作不可恢复，所有对话历史将被删除。")}
                                            onConfirm={handleClearHistory}
                                            okText={t("确定清空")}
                                            cancelText={t("取消")}
                                            okButtonProps={{ danger: true }}
                                        >
                                            <Button 
                                                danger 
                                                size="small" 
                                                icon={<ClearOutlined />} 
                                                style={{ borderRadius: '6px' }}
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                )}
                            </div>
                            
                            <div style={{ height: '60vh', display: 'flex', flexDirection: 'column' }}>
                                <div 
                                    style={{ 
                                        flexGrow: 1, 
                                        overflowY: 'auto', 
                                        marginBottom: '16px',
                                        paddingRight: '4px'
                                    }}
                                >
                                    {history.length === 0 ? (
                                        <div 
                                            style={{ 
                                                textAlign: 'center', 
                                                padding: '40px 20px',
                                                color: '#999',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                                            <div>{t('暂无对话记录')}</div>
                                            <div style={{ marginTop: '8px', fontSize: '12px' }}>
                                                {t('在这里可以与AI交流，获取写作建议')}
                                            </div>
                                        </div>
                                    ) : (
                                        <List
                                            itemLayout="vertical"
                                            dataSource={history}
                                            renderItem={item => (
                                                <List.Item 
                                                    key={item.id}
                                                    style={{ 
                                                        padding: '12px 0',
                                                        borderBottom: '1px solid #f0f0f0',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = '#f8f9ff';
                                                        e.currentTarget.style.borderRadius = '8px';
                                                        e.currentTarget.style.padding = '12px';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderRadius = '0';
                                                        e.currentTarget.style.padding = '12px 0';
                                                    }}
                                                >
                                                    <HistoryItemView
                                                        item={{ ...item, agentName: item.agent?.name ?? t('用户') }}
                                                        novelId={novelId}
                                                        onUpdate={fetchNovelAndHistory}
                                                        onSatisfied={() => { }}
                                                        onSaveAsChapter={handleSaveAsChapter}
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    )}
                                </div>
                                
                                <div 
                                    style={{ 
                                        display: 'flex', 
                                        gap: '8px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid #f0f0f0',
                                        opacity: 1,
                                        transform: 'translateY(0)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Input.TextArea
                                        value={userMessage}
                                        onChange={(e) => setUserMessage(e.target.value)}
                                        placeholder={t('输入你的指令...')}
                                        autoSize={{ minRows: 1, maxRows: 4 }}
                                        onPressEnter={(e) => {
                                            if (!e.shiftKey) {
                                                e.preventDefault();
                                                handleAddUserMessage();
                                            }
                                        }}
                                        style={{ 
                                            borderRadius: '8px',
                                            borderColor: '#d9d9d9',
                                            fontSize: '14px',
                                            transition: 'all 0.3s ease',
                                            flex: 1
                                        }}
                                    />
                                    <div 
                                        style={{ 
                                            transition: 'transform 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'flex-end'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        <Tooltip title={t('发送消息')}>
                                            <Button
                                                type="primary"
                                                icon={<SendOutlined />}
                                                onClick={handleAddUserMessage}
                                                disabled={!userMessage.trim()}
                                                size="middle"
                                                style={{ 
                                                    borderRadius: '8px',
                                                    height: 'auto',
                                                    minHeight: '40px',
                                                    boxShadow: userMessage.trim() ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

const getStatusConfig = (status?: string) => {
    switch (status) {
        case 'Writing':
            return { color: '#52c41a', icon: PlayCircleOutlined, bgColor: 'green' as const };
        case 'Finished':
            return { color: '#389e0d', icon: CheckCircleOutlined, bgColor: 'success' as const };
        case 'Paused':
            return { color: '#faad14', icon: PauseCircleOutlined, bgColor: 'warning' as const };
        case 'Draft':
        default:
            return { color: '#1890ff', icon: FileTextOutlined, bgColor: 'default' as const };
    }
};

// 添加CSS动画
const styles = `
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
`;

if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

export default EditorPage;
