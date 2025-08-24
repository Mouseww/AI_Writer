import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Chapter } from '../types';
import { toLocalTime } from '../utils/time';

const ChapterDetailPage: React.FC = () => {
    const { novelId, chapterId } = useParams<{ novelId: string, chapterId: string }>();
    const [chapter, setChapter] = useState<Chapter | null>(null);

    useEffect(() => {
        const fetchChapter = async () => {
            if (novelId && chapterId) {
                try {
                    const response = await api.get(`/novels/${novelId}/chapters/${chapterId}`);
                    setChapter(response.data);
                } catch (error) {
                    console.error("Failed to fetch chapter", error);
                }
            }
        };

        fetchChapter();
    }, [novelId, chapterId]);

    if (!chapter) {
        return <p>正在加载章节...</p>;
    }

    return (
        <div>
            <h2>{chapter.title}</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{chapter.content}</p>
            <small className="text-muted">
                字数: {chapter.wordCount} | 
                创建于: {toLocalTime(chapter.createdAt)} | 
                最后更新于: {toLocalTime(chapter.lastUpdatedAt)}
            </small>
        </div>
    );
};

export default ChapterDetailPage;
