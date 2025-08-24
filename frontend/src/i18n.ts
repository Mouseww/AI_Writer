import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navbar
      "Dashboard": "Dashboard",
      "AI Agents": "AI Agents",
      "Settings": "Settings",
      "Login": "Login",
      "Register": "Register",
      "Logout": "Logout",
      
      // DashboardPage
      "Title": "Title",
      "Status": "Status",
      "Word Count": "Word Count",
      "Action": "Action",
      "Edit": "Edit",
      "Create New Novel": "Create New Novel",
      "Failed to fetch novels. You might need to log in.": "Failed to fetch novels. You might need to log in.",

      // Footer
      "AIWriter ©2025 Created by You": "AIWriter ©2025 Created by You",

      // AgentsPage & AgentManager
      "Manage AI Agents": "Manage AI Agents",
      "These agents are used to automatically generate content for your novels.": "These agents are used to automatically generate content for your novels.",
      "Failed to fetch agents": "Failed to fetch agents",
      "Failed to fetch models": "Failed to fetch models",
      "Agent updated successfully": "Agent updated successfully",
      "Agent added successfully": "Agent added successfully",
      "Failed to update agent": "Failed to update agent",
      "Failed to add agent": "Failed to add agent",
      "Agent deleted successfully": "Agent deleted successfully",
      "Failed to delete agent": "Failed to delete agent",
      "Name": "Name",
      "Model": "Model",
      "Order": "Order",
      "Are you sure to delete this agent?": "Are you sure to delete this agent?",
      "Add New Agent": "Add New Agent",
      "Edit Agent": "Edit Agent",
      "Agent Name": "Agent Name",
      "System Prompt": "System Prompt",
      "Update Agent": "Update Agent",
      "Add Agent": "Add Agent"
    }
  },
  zh: {
    translation: {
      // Navbar
      "Dashboard": "仪表盘",
      "AI Agents": "AI 代理",
      "Settings": "设置",
      "Login": "登录",
      "Register": "注册",
      "Logout": "登出",

      // DashboardPage
      "Title": "标题",
      "Status": "状态",
      "Word Count": "字数",
      "Action": "操作",
      "Edit": "编辑",
      "Create New Novel": "创建新小说",
      "Failed to fetch novels. You might need to log in.": "获取小说列表失败，请尝试重新登录。",

      // Footer
      "AIWriter ©2025 Created by You": "AIWriter ©2025 由你创建",

      // AgentsPage & AgentManager
      "Manage AI Agents": "管理 AI 代理",
      "These agents are used to automatically generate content for your novels.": "这些代理用于为你的小说自动生成内容。",
      "Failed to fetch agents": "获取代理列表失败",
      "Failed to fetch models": "获取模型列表失败",
      "Agent updated successfully": "代理更新成功",
      "Agent added successfully": "代理添加成功",
      "Failed to update agent": "更新代理失败",
      "Failed to add agent": "添加代理失败",
      "Agent deleted successfully": "代理删除成功",
      "Failed to delete agent": "删除代理失败",
      "Name": "名称",
      "Model": "模型",
      "Order": "顺序",
      "Are you sure to delete this agent?": "你确定要删除这个代理吗？",
      "Add New Agent": "添加新代理",
      "Edit Agent": "编辑代理",
      "Agent Name": "代理名称",
      "System Prompt": "系统提示",
      "Update Agent": "更新代理",
      "Add Agent": "添加代理"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
