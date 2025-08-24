import React, { useEffect, useState } from 'react';
import api from '../services/api.ts';

interface UserSettings {
    aiProxyUrl: string;
    encryptedApiKey: string;
}

const SettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<UserSettings>({ aiProxyUrl: '', encryptedApiKey: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/settings');
                setSettings(response.data);
            } catch (error) {
                console.error('Failed to fetch settings', error);
                setMessage('Could not load your settings.');
            }
        };
        fetchSettings();
    }, []);

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
            setMessage('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage('Failed to save settings. Please try again.');
        }
    };

    return (
        <div>
            <h2>AI Settings</h2>
            <p>Configure your AI model provider here.</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="aiProxyUrl">AI Proxy URL:</label>
                    <input
                        type="text"
                        id="aiProxyUrl"
                        name="aiProxyUrl"
                        value={settings.aiProxyUrl || ''}
                        onChange={handleChange}
                        placeholder="e.g., https://api.openai.com/v1/chat/completions"
                    />
                </div>
                <div>
                    <label htmlFor="encryptedApiKey">API Key:</label>
                    <input
                        type="password"
                        id="encryptedApiKey"
                        name="encryptedApiKey"
                        value={settings.encryptedApiKey || ''}
                        onChange={handleChange}
                    />
                </div>
                <button type="submit">Save Settings</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default SettingsPage;
