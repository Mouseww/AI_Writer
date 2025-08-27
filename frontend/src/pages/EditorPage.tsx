import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message, Button, Input, List, Card, Tag, Spin, Row, Col, Typography, Form, Alert, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, SaveOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api, { createChapter, updateChapter } from '../services/api';
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
    const { id, chapterId } = useParams<{ id: string, chapterId?: string }>();
    const [novel, setNovel] = useState<Novel | null>(null);
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isWriting, setIsWriting] = useState(false);
    const [error, setError] = useState('');
    const [form] = Form.useForm();
    const [refreshChapterList, setRefreshChapterList] = useState(0);
    const navigate = useNavigate();

    const novelId = parseInt(id!);

    const fetchNovelAndHistory = useCallback(async () => {
        if (!novelId) return;
        try {
            const response = await api.get(`/novels/${novelId}`);
            setNovel(response.data);
            setHistory(response.data.conversationHistories.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) || []);
        } catch (err) {
            console.error('Failed to fetch novel and history', err);
            setError(t('Failed to load novel data.'));
        }
    }, [novelId, t]);

    const fetchChapter = useCallback(async () => {
        if (!novelId || !chapterId) return;
        try {
            const response = await api.get(`/novels/${novelId}/chapters/${chapterId}`);
            setChapter(response.data);
            form.setFieldsValue({ title: response.data.title, content: response.data.content });
        } catch (err) {
            console.error('Failed to fetch chapter', err);
            setError(t('Failed to load chapter data.'));
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

            setNovel(prevNovel => {
                if (prevNovel && response.data.status && response.data.status !== prevNovel.status) {
                    return { ...prevNovel, status: response.data.status };
                }
                return prevNovel;
            });
            setRefreshChapterList(prev => prev + 1);
        } catch (err) {
            console.error('Failed to fetch progress', err);
        }
    }, [novelId]);

    useEffect(() => {
        fetchNovelAndHistory();
        if (chapterId) {
            fetchChapter();
        }
    }, [fetchNovelAndHistory, fetchChapter, chapterId]);

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
            if (chapter) {
                await updateChapter(novelId, chapter.id, values.title, values.content);
                message.success(t("Chapter updated successfully!"));
            }
            navigate(`/editor/novel/${novelId}`);
        } catch (err) {
            console.error('Failed to save chapter', err);
            setError(t('Failed to save chapter.'));
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

            await createChapter(novelId, title, content);
            message.success(t("对话已保存为新章节!"));
            setRefreshChapterList(prev => prev + 1); // Refresh chapter list
        } catch (err) {
            console.error('Failed to save as chapter', err);
            setError(t('Failed to save as chapter.'));
        }
    };

    if (error) return <Alert message={error} type="error" showIcon />;
    if (chapterId && !chapter) return <Spin size="large" />;
    if (!chapterId && !novel) return <Spin size="large" />;

    if (chapterId) {
        return (
            <Card>
                <Title level={2}>{t('Edit Chapter')}</Title>
                <Form form={form} onFinish={handleSaveChapter} layout="vertical">
                    <Form.Item name="title" label={t("Title")} rules={[{ required: true, message: t('Please input the title!') }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="content" label={t("Content")} rules={[{ required: true, message: t('Please input the content!') }]}>
                        <TextArea rows={20} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                            {t('Save Chapter')}
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        );
    }

    const handleStart = async () => {
        try {
            await api.post(`/novels/${novelId}/workflow/status`, { status: 'Writing' });
            if (novel) setNovel({ ...novel, status: 'Writing' });
        } catch (err) {
            setError(t('Failed to start the writing process.'));
        }
    };

    const handlePause = async () => {
        try {
            await api.post(`/novels/${novelId}/workflow/status`, { status: 'Paused' });
            if (novel) setNovel({ ...novel, status: 'Paused' });
        } catch (err) {
            setError(t('Failed to pause the writing process.'));
        }
    };

    return (
        <Row gutter={24}>
            <Col span={16}>
                <Card>
                    <Title level={2}>{novel?.title}</Title>
                    <Paragraph type="secondary">{novel?.description}</Paragraph>
                    <Paragraph><strong>{t('状态:')}</strong> <Tag color={novel?.status === 'Writing' ? 'green' : 'volcano'}>{novel?.status}</Tag></Paragraph>

                    <Space style={{ marginBottom: '24px' }}>
                        <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleStart} disabled={novel?.status === 'Writing'}>{t('开始自动写作')}</Button>
                        <Button icon={<PauseCircleOutlined />} onClick={handlePause} disabled={novel?.status !== 'Writing'}>{t('暂停自动写作')}</Button>
                    </Space>
                </Card>
                <Card style={{ marginTop: '24px' }}>
                        <ChapterList novelId={novelId} refresh={refreshChapterList} />
                  
                </Card>
            </Col>
            <Col span={8}>
                <Card>
                    <Title level={3}>{t('对话历史')}</Title>
                    <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '24px' }}>
                        <List
                            itemLayout="vertical"
                            dataSource={history}
                            renderItem={item => (
                                <List.Item key={item.id}>
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
                    </div>
                    
                </Card>
            </Col>
        </Row>
    );
};

export default EditorPage;
