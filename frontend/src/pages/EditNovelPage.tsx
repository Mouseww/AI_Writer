import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api.ts';
import { Novel } from '../types';

const EditNovelPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNovel = async () => {
            try {
                const response = await api.get<Novel>(`/novels/${id}`);
                setTitle(response.data.title);
                setDescription(response.data.description);
                setStatus(response.data.status);
            } catch (err) {
                setError('Failed to load novel data.');
            }
        };
        fetchNovel();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await api.put(`/novels/${id}`, { id: parseInt(id!, 10), title, description, status });
            navigate('/'); // Redirect to dashboard on success
        } catch (err) {
            setError('Failed to update novel. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="container">
            <h2>Edit Novel</h2>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
};

export default EditNovelPage;
