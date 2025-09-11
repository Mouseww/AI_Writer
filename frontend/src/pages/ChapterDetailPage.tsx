import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getChapter } from '../services/api';
import { Chapter } from '../types';
import { toLocalTime } from '../utils/time';
import { Spin } from 'antd';

const ChapterDetailPage: React.FC = () => {
    const { t } = useTranslation();
    const { novelId, chapterId } = useParams<{ novelId: string, chapterId: string }>();
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapter = async () => {
            if (novelId && chapterId && !isNaN(parseInt(chapterId))) {
                setLoading(true);
                try {
                    const response = await getChapter(parseInt(novelId), parseInt(chapterId));
                    setChapter(response.data);
                } catch (error) {
                    console.error(t('Failed to fetch chapter'), error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchChapter();
    }, [novelId, chapterId, t]);

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '50px auto' }} />;
    }

    if (!chapter) {
        return <p>{t('Chapter not found or failed to load.')}</p>;
    }

    return (
        <div>
            <h2>{chapter.title}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{chapter.content}</p>
            <small className="text-muted">
                {t('字数:')} {chapter.wordCount} | 
                {t('创建于:')} {toLocalTime(chapter.createdAt)} | 
                {t('最后更新于:')} {toLocalTime(chapter.lastUpdatedAt)}
            </small>
        </div>
    );
};

export default ChapterDetailPage;
