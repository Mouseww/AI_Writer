import React, { useState } from 'react';
import api from '../services/api';
import { Button, Input, Typography, Space, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, LikeOutlined, BookOutlined } from '@ant-design/icons';
import { toLocalTime } from '../utils/time';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface HistoryItem {
    id: number;
    agentName: string;
    content: string;
    timestamp: string;
    isUserMessage: boolean;
}

interface HistoryItemViewProps {
    item: HistoryItem;
    novelId: number;
    onUpdate: () => void; // Callback to refresh the history list
    onSatisfied: () => void;
    onSaveAsChapter: (content: string) => void;
}

const HistoryItemView: React.FC<HistoryItemViewProps> = ({ item, novelId, onUpdate, onSatisfied, onSaveAsChapter }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(item.content);

    const handleSave = async () => {
        try {
            await api.put(`/novels/${novelId}/workflow/history/${item.id}`, { content });
            setIsEditing(false);
            onUpdate(); // Trigger parent to refetch history
            message.success('保存成功');
        } catch (error) {
            console.error("Failed to update history item", error);
            message.error("保存失败。");
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/novels/${novelId}/workflow/history/${item.id}`);
            onUpdate(); // Trigger parent to refetch history
            message.success('删除成功');
        } catch (error) {
            console.error("Failed to delete history item", error);
            message.error("删除失败。");
        }
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{item.isUserMessage ? '您' : item.agentName}</Text>
                <Space>
                    {!item.isUserMessage && (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)} size="small"  title='修改' />
                            <Button icon={<BookOutlined />} onClick={() => onSaveAsChapter(item.content)} size="small" title='保存至章节' />
                            {/* <Button icon={<LikeOutlined />} onClick={onSatisfied} size="small" /> */}
                        </>
                    )}
                    <Popconfirm title="您确定要删除此项吗？" onConfirm={handleDelete} okText="Yes" cancelText="No">
                        <Button title='删除'  icon={<DeleteOutlined />} size="small" danger />
                    </Popconfirm>
                </Space>
            </div>
            {isEditing && !item.isUserMessage ? (
                <div>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        autoSize={{ minRows: 3 }}
                        style={{ margin: '8px 0' }}
                    />
                    <Space>
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="small">保存</Button>
                        <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)} size="small">取消</Button>
                    </Space>
                </div>
            ) : (
                <Paragraph style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>{item.content}</Paragraph>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>{toLocalTime(item.timestamp)}</Text>
        </div>
    );
};

export default HistoryItemView;
