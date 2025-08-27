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
      "AIWriter": "AIWriter",

      // DashboardPage
      "Title": "Title",
      "Status": "Status",
      "Word Count": "Word Count",
      "Action": "Action",
      "Edit": "Edit",
      "Create New Novel": "Create New Novel",
      "Failed to fetch novels. You might need to log in.": "Failed to fetch novels. You might need to log in.",
      "Failed to delete novel.": "Failed to delete novel.",
      "Failed to start writing.": "Failed to start writing.",
      "Failed to pause writing.": "Failed to pause writing.",
      "Latest Chapter": "Latest Chapter",
      "No chapters yet": "No chapters yet",
      "Actions": "Actions",
      "Start Writing": "Start Writing",
      "Pause Writing": "Pause Writing",
      "Edit Novel": "Edit Novel",
      "Are you sure to delete this novel?": "Are you sure to delete this novel?",
      "Delete Novel": "Delete Novel",

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
      "Add Agent": "Add Agent",

      // EditorPage
      "Failed to load novel data.": "Failed to load novel data.",
      "Failed to load chapter data.": "Failed to load chapter data.",
      "Failed to send message.": "Failed to send message.",
      "Chapter updated successfully!": "Chapter updated successfully!",
      "Failed to save chapter.": "Failed to save chapter.",
      "对话已保存为新章节!": "The conversation has been saved as a new chapter!",
      "Failed to save as chapter.": "Failed to save as chapter.",
      "Edit Chapter": "Edit Chapter",
      "Please input the title!": "Please input the title!",
      "Content": "Content",
      "Please input the content!": "Please input the content!",
      "Save Chapter": "Save Chapter",
      "Failed to start the writing process.": "Failed to start the writing process.",
      "Failed to pause the writing process.": "Failed to pause the writing process.",
      "状态:": "Status:",
      "开始自动写作": "Start Auto-Writing",
      "暂停自动写作": "Pause Auto-Writing",
      "对话历史": "Conversation History",
      "用户": "User",

      // HistoryItemView
      "保存成功": "Saved successfully",
      "Failed to update history item": "Failed to update history item",
      "保存失败。": "Failed to save.",
      "删除成功": "Deleted successfully",
      "Failed to delete history item": "Failed to delete history item",
      "删除失败。": "Failed to delete.",
      "摘要重新生成成功": "Abstract regenerated successfully",
      "Failed to regenerate abstract": "Failed to regenerate abstract",
      "摘要重新生成失败。": "Failed to regenerate abstract.",
      "您": "You",
      "摘要": "Abstract",
      "全文": "Full Text",
      "重新生成摘要": "Regenerate Abstract",
      "修改": "Edit",
      "保存至章节": "Save to Chapter",
      "您确定要删除此项吗？": "Are you sure you want to delete this item?",
      "Yes": "Yes",
      "No": "No",
      "删除": "Delete",
      "保存": "Save",
      "取消": "Cancel",

      // App
      "Invalid token": "Invalid token",
      "Invalid token on login": "Invalid token on login",
      "English": "English",
      "中文": "中文",

      // CreateNovelPage
      "Failed to create novel. Please try again.": "Failed to create novel. Please try again.",
      "Create a New Novel": "Create a New Novel",
      "Title:": "Title:",
      "Description:": "Description:",
      "Create Novel": "Create Novel",

      // EditNovelPage
      "Failed to update novel. Please try again.": "Failed to update novel. Please try again.",
      "Save Changes": "Save Changes",

      // LoginPage
      "Login failed. Please check your credentials.": "Login failed. Please check your credentials.",
      "Please input your Username!": "Please input your Username!",
      "Username": "Username",
      "Please input your Password!": "Please input your Password!",
      "Password": "Password",
      "Log in": "Log in",

      // RegisterPage
      "Registration successful! Please log in.": "Registration successful! Please log in.",
      "Registration failed. Please try again.": "Registration failed. Please try again.",

      // SettingsPage
      "Could not load your settings.": "Could not load your settings.",
      "Settings saved successfully!": "Settings saved successfully!",
      "Failed to save settings. Please try again.": "Failed to save settings. Please try again.",
      "AI Settings": "AI Settings",
      "Configure your AI model provider here.": "Configure your AI model provider here.",
      "AI Proxy URL:": "AI Proxy URL:",
      "e.g., https://api.openai.com/v1": "e.g., https://api.openai.com/v1",
      "API Key:": "API Key:",
      "Save Settings": "Save Settings",

      // ChapterList
      "Failed to fetch chapters": "Failed to fetch chapters",
      "Chapter deleted successfully": "Chapter deleted successfully",
      "Failed to delete chapter": "Failed to delete chapter",
      "Chapter updated successfully": "Chapter updated successfully",
      "Failed to update chapter": "Failed to update chapter",
      "章节列表": "Chapter List",
      "编辑": "Edit",
      "Are you sure to delete this chapter?": "Are you sure to delete this chapter?",
      "字数:": "Word Count:",

      // ChapterDetailPage
      "正在加载章节...": "Loading chapter...",
      "创建于:": "Created at:",
      "最后更新于:": "Last updated at:"
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
      "AIWriter": "AI作家",

      // DashboardPage
      "Title": "标题",
      "Status": "状态",
      "Word Count": "字数",
      "Action": "操作",
      "Edit": "编辑",
      "Create New Novel": "创建新小说",
      "Failed to fetch novels. You might need to log in.": "获取小说列表失败，请尝试重新登录。",
      "Failed to delete novel.": "删除小说失败。",
      "Failed to start writing.": "开始写作失败。",
      "Failed to pause writing.": "暂停写作失败。",
      "Latest Chapter": "最新章节",
      "No chapters yet": "暂无章节",
      "Actions": "操作",
      "Start Writing": "开始写作",
      "Pause Writing": "暂停写作",
      "Edit Novel": "编辑小说",
      "Are you sure to delete this novel?": "你确定要删除这本小说吗？",
      "Delete Novel": "删除小说",

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
      "Add Agent": "添加代理",

      // EditorPage
      "Failed to load novel data.": "加载小说数据失败。",
      "Failed to load chapter data.": "加载章节数据失败。",
      "Failed to send message.": "发送消息失败。",
      "Chapter updated successfully!": "章节更新成功！",
      "Failed to save chapter.": "保存章节失败。",
      "对话已保存为新章节!": "对话已保存为新章节!",
      "Failed to save as chapter.": "保存为章节失败。",
      "Edit Chapter": "编辑章节",
      "Please input the title!": "请输入标题！",
      "Content": "内容",
      "Please input the content!": "请输入内容！",
      "Save Chapter": "保存章节",
      "Failed to start the writing process.": "启动写作流程失败。",
      "Failed to pause the writing process.": "暂停写作流程失败。",
      "状态:": "状态:",
      "开始自动写作": "开始自动写作",
      "暂停自动写作": "暂停自动写作",
      "对话历史": "对话历史",
      "用户": "用户",

      // HistoryItemView
      "保存成功": "保存成功",
      "Failed to update history item": "更新历史记录失败",
      "保存失败。": "保存失败。",
      "删除成功": "删除成功",
      "Failed to delete history item": "删除历史记录失败",
      "删除失败。": "删除失败。",
      "摘要重新生成成功": "摘要重新生成成功",
      "Failed to regenerate abstract": "重新生成摘要失败",
      "摘要重新生成失败。": "摘要重新生成失败。",
      "您": "您",
      "摘要": "摘要",
      "全文": "全文",
      "重新生成摘要": "重新生成摘要",
      "修改": "修改",
      "保存至章节": "保存至章节",
      "您确定要删除此项吗？": "您确定要删除此项吗？",
      "Yes": "是",
      "No": "否",
      "删除": "删除",
      "保存": "保存",
      "取消": "取消",

      // App
      "Invalid token": "无效的令牌",
      "Invalid token on login": "登录时令牌无效",
      "English": "English",
      "中文": "中文",

      // CreateNovelPage
      "Failed to create novel. Please try again.": "创建小说失败，请重试。",
      "Create a New Novel": "创建一本新小说",
      "Title:": "标题:",
      "Description:": "描述:",
      "Create Novel": "创建小说",

      // EditNovelPage
      "Failed to update novel. Please try again.": "更新小说失败，请重试。",
      "Save Changes": "保存更改",

      // LoginPage
      "Login failed. Please check your credentials.": "登录失败，请检查您的凭据。",
      "Please input your Username!": "请输入您的用户名！",
      "Username": "用户名",
      "Please input your Password!": "请输入您的密码！",
      "Password": "密码",
      "Log in": "登录",

      // RegisterPage
      "Registration successful! Please log in.": "注册成功！请登录。",
      "Registration failed. Please try again.": "注册失败，请重试。",

      // SettingsPage
      "Could not load your settings.": "无法加载您的设置。",
      "Settings saved successfully!": "设置已成功保存！",
      "Failed to save settings. Please try again.": "保存设置失败，请重试。",
      "AI Settings": "AI 设置",
      "Configure your AI model provider here.": "在此处配置您的 AI 模型提供商。",
      "AI Proxy URL:": "AI 代理 URL:",
      "e.g., https://api.openai.com/v1": "例如，https://api.openai.com/v1",
      "API Key:": "API 密钥:",
      "Save Settings": "保存设置",

      // ChapterList
      "Failed to fetch chapters": "获取章节列表失败",
      "Chapter deleted successfully": "章节删除成功",
      "Failed to delete chapter": "删除章节失败",
      "Chapter updated successfully": "章节更新成功",
      "Failed to update chapter": "更新章节失败",
      "章节列表": "章节列表",
      "编辑": "编辑",
      "Are you sure to delete this chapter?": "你确定要删除这个章节吗？",
      "字数:": "字数:",

      // ChapterDetailPage
      "正在加载章节...": "正在加载章节...",
      "创建于:": "创建于:",
      "最后更新于:": "最后更新于:"
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
