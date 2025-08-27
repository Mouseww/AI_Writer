import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api.ts';

interface UserSettings {
    aiProxyUrl: string;
    encryptedApiKey: string;
}

const SettingsPage: React.FC = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<UserSettings>({ aiProxyUrl: '', encryptedApiKey: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(response.data);
            } catch (error) {
                console.error('Failed to fetch settings', error);
                setMessage(t('Could not load your settings.'));
            }
        };
        fetchSettings();
    }, [t]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post('/settings', settings);
            setMessage(t('Settings saved successfully!'));
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage(t('Failed to save settings. Please try again.'));
        }
    };

    return (
        <div>
            <h2>{t('AI Settings')}</h2>
            <p>{t('Configure your AI model provider here.')}</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="aiProxyUrl">{t('AI Proxy URL:')}</label>
                    <input
                        type="text"
                        id="aiProxyUrl"
                        name="aiProxyUrl"
                        value={settings.aiProxyUrl || ''}
                        onChange={handleChange}
                        placeholder={t('e.g., https://api.openai.com/v1')}
                    />
                </div>
                <div>
                    <label htmlFor="encryptedApiKey">{t('API Key:')}</label>
                    <input
                        type="password"
                        id="encryptedApiKey"
                        name="encryptedApiKey"
                        value={settings.encryptedApiKey || ''}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">{t('Save Settings')}</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SettingsPage;
