import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Button, Input, Typography, Space, Popconfirm, message, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined, BookOutlined, RedoOutlined } from '@ant-design/icons';
import { toLocalTime } from '../utils/time';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface HistoryItem {
    id: number;
    agentName: string;
    content: string;
    abstract: string;
    timestamp: string;
    isUserMessage: boolean;
}

interface HistoryItemViewProps {
    item: HistoryItem;
    novelId: number;
    onUpdate: () => void;
    onSatisfied: () => void;
    onSaveAsChapter: (content: string) => void;
}

const HistoryItemView: React.FC<HistoryItemViewProps> = ({ item, novelId, onUpdate, onSatisfied, onSaveAsChapter }) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(item.content);
    const [showAbstract, setShowAbstract] = useState(true);

    const handleSave = async () => {
        try {
            await api.put(`/novels/${novelId}/workflow/history/${item.id}`, { content });
            setIsEditing(false);
            onUpdate();
            message.success(t('保存成功'));
        } catch (error) {
            console.error("Failed to update history item", error);
            message.error(t("保存失败。"));
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/novels/${novelId}/workflow/history/${item.id}`);
            onUpdate();
            message.success(t('删除成功'));
        } catch (error) {
            console.error("Failed to delete history item", error);
            message.error(t("删除失败。"));
        }
    };

    const handleRegenerateAbstract = async () => {
        try {
            await api.post(`/novels/${novelId}/workflow/history/${item.id}/regenerate-abstract`);
            onUpdate();
            message.success(t('摘要重新生成成功'));
        } catch (error) {
            console.error("Failed to regenerate abstract", error);
            message.error(t("摘要重新生成失败。"));
        }
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{item.isUserMessage ? t('您') : item.agentName}</Text>
                <Space>
                    {!item.isUserMessage && (
                        <>
                            <Switch
                                checkedChildren={t("摘要")}
                                unCheckedChildren={t("全文")}
                                checked={showAbstract}
                                onChange={setShowAbstract}
                            />
                            <Button icon={<RedoOutlined />} onClick={handleRegenerateAbstract} size="small" title={t('重新生成摘要')} />
                            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)} size="small" title={t('修改')} />
                            <Button icon={<BookOutlined />} onClick={() => onSaveAsChapter(item.content)} size="small" title={t('保存至章节')} />
                        </>
                    )}
                    <Popconfirm title={t("您确定要删除此项吗？")} onConfirm={handleDelete} okText={t("Yes")} cancelText={t("No")}>
                        <Button title={t('删除')} icon={<DeleteOutlined />} size="small" danger />
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
                        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} size="small">{t('保存')}</Button>
                        <Button icon={<CloseOutlined />} onClick={() => setIsEditing(false)} size="small">{t('取消')}</Button>
                    </Space>
                </div>
            ) : (
                <Paragraph style={{ whiteSpace: 'pre-wrap', margin: '8px 0' }}>
                    {showAbstract ? item.abstract : item.content}
                </Paragraph>
            )}
            <Text type="secondary" style={{ fontSize: '12px' }}>{toLocalTime(item.timestamp)}</Text>
        </div>
    );
};

export default HistoryItemView;
