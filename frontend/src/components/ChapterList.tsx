import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChapters, updateChapter, deleteChapter } from '../services/api';
import { Chapter } from '../types';
import { List, Typography, Button, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ChapterListProps {
    novelId: number;
    refresh: number;
}

const ChapterList: React.FC<ChapterListProps> = ({ novelId, refresh }) => {
    const { t } = useTranslation();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const navigate = useNavigate();

    const fetchChapters = async () => {
        try {
            const response = await getChapters(novelId);
            setChapters(response.data);
        } catch (error) {
            console.error(t("Failed to fetch chapters"), error);
        }
    };

    useEffect(() => {
        fetchChapters();
    }, [novelId, refresh]);

    const handleDelete = async (chapterId: number) => {
        try {
            await deleteChapter(novelId, chapterId);
            message.success(t('Chapter deleted successfully'));
            fetchChapters();
        } catch (error) {
            message.error(t('Failed to delete chapter'));
        }
    };

    return (
        <div>
            <Title level={3}>{t('章节列表')}</Title>
            <List
                itemLayout="horizontal"
                dataSource={chapters}
                renderItem={chapter => (
                    <List.Item
                        actions={[
                            <Button icon={<EditOutlined />} onClick={() => navigate(`/editor/novel/${novelId}/chapter/${chapter.id}`)}>
                                {t('编辑')}
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
                        ]}
                    >
                        <List.Item.Meta
                            title={<Link to={`/novel/${novelId}/chapter/${chapter.id}`}>{chapter.title}</Link>}
                            description={`${t('字数:')} ${chapter.wordCount}`}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default ChapterList;
