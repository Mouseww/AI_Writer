import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';
import 'antd/dist/reset.css';
import './i18n';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <App />
);
