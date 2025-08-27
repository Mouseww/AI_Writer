import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const CreateNovelPage: React.FC = () => {
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            // The backend defaults the status, so we only need to send title and description
            await api.post('/novels', { title, description });
            navigate('/'); // Redirect to dashboard on success
        } catch (err) {
            setError(t('Failed to create novel. Please try again.'));
            console.error(err);
        }
    };

    return (
        <div className="container">
            <h2>{t('Create a New Novel')}</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="title">{t('Title:')}</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">{t('Description:')}</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit">{t('Create Novel')}</button>
            </form>
        </div>
    );
};

export default CreateNovelPage;
