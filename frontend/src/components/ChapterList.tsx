import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChapters, deleteChapter } from '../services/api';
import { Chapter } from '../types';
import { List, Typography, Button, Popconfirm, message, Dropdown, Menu, Space, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, MoreOutlined, CopyOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ChapterListProps {
    novelId: number;
    refresh: number;
    loading: boolean;
    defaultChapters?: Chapter[];
}

const ChapterList: React.FC<ChapterListProps> = ({ novelId, refresh, loading, defaultChapters }) => {
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
            message.success(t('Content copied to clipboard!'));
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
                    message.success(t('Content copied to clipboard!'));
                } else {
                    message.error(t('Failed to copy content.'));
                }
            } catch (fallbackErr) {
                console.error('Fallback copy method failed.', fallbackErr);
                message.error(t('Failed to copy content.'));
            }
            document.body.removeChild(textArea);
        }
    };

    const renderItem = (chapter: Chapter) => {
        console.log("Rendering chapter:", chapter);
        const menu = (
            <Menu>
                <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => navigate(`/editor/novel/${novelId}/chapter/${chapter.id}`)}>
                    {t('编辑')}
                </Menu.Item>
                <Menu.Item key="copy" icon={<CopyOutlined />} onClick={() => handleCopyContent(chapter.content)}>
                    {t('Copy Content')}
                </Menu.Item>
                <Menu.Item key="delete" icon={<DeleteOutlined />}>
                    <Popconfirm
                        title={t("Are you sure to delete this chapter?")}
                        onConfirm={() => handleDelete(chapter.id)}
                        okText={t("Yes")}
                        cancelText={t("No")}
                    >
                        {t('删除')}
                    </Popconfirm>
                </Menu.Item>
            </Menu>
        );

        const actions = isMobile ? (
            [<Dropdown overlay={menu} trigger={['click']}> 
                <Button icon={<MoreOutlined />} />
            </Dropdown>]
        ) : ( 
            [
                <Button icon={<EditOutlined />} onClick={() => navigate(`/editor/novel/${novelId}/chapter/${chapter.id}`)}>
                    {t('编辑')}
                </Button>,
                <Button icon={<CopyOutlined />} onClick={() => handleCopyContent(chapter.content)}>
                    {t('Copy Content')}
                </Button>,
                <Popconfirm
                    title={t("Are you sure to delete this chapter?")}
                    onConfirm={() => handleDelete(chapter.id)}
                    okText={t("Yes")}
                    cancelText={t("No")}
                >
                    <Button icon={<DeleteOutlined />} danger>
                        {t('删除')}
                    </Button>
                </Popconfirm>
            ]
        );

        return (
            <List.Item actions={actions}>
                <List.Item.Meta
                    title={<Link to={`/novel/${novelId}/chapter/${chapter.id}`}>{chapter.title}</Link>}
                    description={`${t('字数:')} ${chapter.wordCount}`}
                />
            </List.Item>
        );
    };

    return (
        <Spin spinning={loading}>
            <div>
                <Title level={3}>{t('章节列表')}</Title>
                <List
                    itemLayout="horizontal"
                    dataSource={chapters}
                    renderItem={renderItem}
                />
            </div>
        </Spin>
    );
};

export default ChapterList;
