import React from 'react';
import AgentManager from '../components/AgentManager';
import { useTranslation } from 'react-i18next';

const AgentsPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <h2>{t('Manage AI Agents')}</h2>
            <p>{t('These agents are used to automatically generate content for your novels.')}</p>
            <AgentManager />
        </div>
    );
};

export default AgentsPage;
