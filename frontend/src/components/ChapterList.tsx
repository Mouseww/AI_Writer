import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getChapters, updateChapter, deleteChapter } from '../services/api';
import { Chapter } from '../types';
import { List, Card, Typography, Button, Modal, Form, Input, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface ChapterListProps {
    novelId: number;
    refresh: number;
}

const ChapterList: React.FC<ChapterListProps> = ({ novelId, refresh }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const fetchChapters = async () => {
        try {
            const response = await getChapters(novelId);
            setChapters(response.data);
        } catch (error) {
            console.error("Failed to fetch chapters", error);
        }
    };

    useEffect(() => {
        fetchChapters();
    }, [novelId, refresh]);

    const handleEdit = (chapter: Chapter) => {
        setEditingChapter(chapter);
        form.setFieldsValue({ title: chapter.title });
        setIsModalVisible(true);
    };

    const handleDelete = async (chapterId: number) => {
        try {
            await deleteChapter(novelId, chapterId);
            message.success('Chapter deleted successfully');
            fetchChapters();
        } catch (error) {
            message.error('Failed to delete chapter');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingChapter) {
                await updateChapter(novelId, editingChapter.id, values.title, editingChapter.content);
                message.success('Chapter updated successfully');
                setIsModalVisible(false);
                setEditingChapter(null);
                fetchChapters();
            }
        } catch (error) {
            message.error('Failed to update chapter');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingChapter(null);
    };

    return (
        <div>
            <Title level={3}>章节列表</Title>
            <List
                itemLayout="horizontal"
                dataSource={chapters}
                renderItem={chapter => (
                    <List.Item
                        actions={[
                            <Button icon={<EditOutlined />} onClick={() => navigate(`/editor/novel/${novelId}/chapter/${chapter.id}`)}>
                                编辑
                            </Button>,
                            <Popconfirm
                                title="Are you sure to delete this chapter?"
                                onConfirm={() => handleDelete(chapter.id)}
                                okText="Yes"
                                cancelText="No"
                            >
                                <Button icon={<DeleteOutlined />} danger>
                                    删除
                                </Button>
                            </Popconfirm>
                        ]}
                    >
                        <List.Item.Meta
                            title={<Link to={`/novel/${novelId}/chapter/${chapter.id}`}>{chapter.title}</Link>}
                            description={`字数: ${chapter.wordCount}`}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default ChapterList;
