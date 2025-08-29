# AIWriter 项目用户手册

本手册提供 AIWriter 应用程序的部署、配置和使用说明。

## 1. 简介

AIWriter 是一个基于 Web 的应用程序，旨在帮助用户撰写小说。它由一个基于 React 的前端、一个 .NET 后端 API 和一个 MySQL 数据库组成。该应用程序利用 AI 模型完成各种写作任务。

## 2. 部署

AIWriter 项目可以使用 Docker 和 Docker Compose 进行部署，为本地开发和生产环境提供灵活的选项。

### 2.1 先决条件

在部署之前，请确保您已安装以下软件：
*   **Docker:** [安装 Docker](https://docs.docker.com/get-docker/)
*   **Docker Compose:** [安装 Docker Compose](https://docs.docker.com/compose/install/) (通常随 Docker Desktop 一起提供)

### 2.2 本地开发部署

对于本地开发，请使用 `docker-compose.yml` 文件。此设置从源代码构建镜像并暴露端口以便于访问。

1.  **克隆仓库：**
    ```bash
    git clone <repository_url>
    cd AIWriter
    ```
2.  **构建并运行服务：**
    导航到 `docker-compose.yml` 所在的项目的根目录，然后运行：
    ```bash
    docker-compose up --build
    ```
    此命令将：
    *   从 `backend/Dockerfile` 构建 `backend` Docker 镜像。
    *   从 `frontend/Dockerfile` 构建 `frontend` Docker 镜像。
    *   拉取 `mysql:8.0` 镜像作为数据库。
    *   启动所有三个服务 (`db`、`backend`、`frontend`)。
    *   暴露以下端口：
        *   MySQL: `3306` (主机) -> `3306` (容器)
        *   后端 API: `8080` (主机) -> `8080` (容器)
        *   前端: `3000` (主机) -> `80` (容器)

3.  **访问应用程序：**
    所有服务启动并运行后，打开您的 Web 浏览器并导航到 `http://localhost:3000`。

### 2.3 生产环境部署

对于生产环境，部署通过直接运行 `docker-compose` 命令和 `docker-compose.prod.yml` 文件来执行。此设置假定已预构建 Docker 镜像（例如，来自 Docker 注册表）并使用更安全的数据库凭据。

1.  **确保镜像可用：**
    `docker-compose.prod.yml` 文件引用 `webber896/aiwriter-backend:latest` 和 `webber896/aiwriter-frontend:latest`。请确保这些镜像已从 Docker Hub 拉取或已构建并推送到您的私有注册表。
    要构建并推送您自己的镜像（替换 `your_docker_username`）：
    ```bash
    docker build -t your_docker_username/aiwriter-backend:latest -f backend/Dockerfile .
    docker push your_docker_username/aiwriter-backend:latest

    docker build -t your_docker_username/aiwriter-frontend:latest -f frontend/Dockerfile .
    docker push your_docker_username/aiwriter-frontend:latest
    ```
    然后，更新 `docker-compose.prod.yml` 以使用您的镜像名称。

2.  **执行部署：**
    导航到 `docker-compose.prod.yml` 所在的项目的根目录，然后运行以下命令：
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```
    此命令直接执行 `docker-compose.prod.yml` 中定义的部署。`-d` 标志在分离模式（后台）下运行服务。

3.  **访问应用程序：**
    前端将可通过 `http://localhost:3000` 访问。请确保您的服务器防火墙允许此端口的流量。

## 3. 基本配置

### 3.1 后端配置

后端使用 `appsettings.json` 进行配置。`docker-compose.yml` 和 `docker-compose.prod.yml` 中的环境变量会覆盖这些设置。

*   **JWT 设置：**
    *   `Jwt:Key`: JWT 令牌签名的密钥。**在生产环境中，请将其更改为强大、唯一的密钥。**
    *   `Jwt:Issuer`: JWT 令牌的颁发者。
    *   `Jwt:Audience`: JWT 令牌的受众。
*   **连接字符串：**
    *   `ConnectionStrings:DefaultConnection`: 数据库连接字符串。这通常会被 Docker Compose 环境变量覆盖。
*   **AI 代理设置：**
    这些设置在应用程序的数据库（用户设置）中进行管理，并通过前端 UI 进行配置。后端 `AIClientService` 使用这些设置与外部 AI 模型进行通信。

### 3.2 前端配置

前端由 Nginx 提供服务，通过 `frontend/nginx.conf` 进行配置。

*   **API 代理：**
    `nginx.conf` 中的 `location /api` 块将所有以 `/api` 开头的请求代理到在 `http://backend:8080` 运行的后端服务（Docker 服务名称和端口）。如果您的后端服务名称或端口发生变化，请更新此配置。

## 4. 使用说明

### 4.1 启动和停止应用程序

*   **启动 (开发环境):** `docker-compose up --build`
*   **启动 (生产环境):** `docker-compose -f docker-compose.prod.yml up -d`
*   **停止:** `docker-compose down` (停止并移除 Compose 文件中定义的容器、网络和卷)

### 4.2 用户注册和登录

1.  在浏览器中打开应用程序 (`http://localhost:3000`)。
2.  导航到注册页面（如果可用，否则登录页面可能会有注册链接）。
3.  按照屏幕上的说明注册新用户帐户。
4.  使用您注册的凭据登录。

### 4.3 管理小说

*   **创建小说：** 从仪表板，您可以通过提供标题和描述来创建新小说。
*   **查看小说：** 您创建的小说将列在仪表板上。
*   **编辑小说：** 选择一本小说以编辑其详细信息。
*   **删除小说：** 您可以从仪表板删除小说。删除小说也会删除所有相关的章节和对话历史记录。

### 4.4 管理代理

*   **查看代理：** 访问代理管理部分以查看已配置的 AI 代理列表。
*   **创建代理：** 通过指定其名称、提示和应使用的 AI 模型来定义新的 AI 代理。
*   **更新代理：** 修改现有代理详细信息。
*   **删除代理：** 从您的配置中移除代理。

### 4.5 写作工作流

应用程序支持 AI 辅助写作工作流。

1.  **选择小说：** 选择您要处理的小说。
2.  **开始写作：** 启动小说的写作过程。编排服务将使用配置的 AI 代理（作家、优化器、摘要器）来生成内容。
3.  **监控进度：** 跟踪写作工作流的进度，包括生成的内容和与 AI 代理的对话历史记录。
4.  **停止写作：** 您可以随时暂停或停止写作过程。
5.  **重新生成摘要：** 对于特定的历史记录项，您可以触发 AI 重新生成摘要。

---
**注意：** 本手册假定您对 Docker 和 Docker Compose 有基本了解。有关更高级的配置或故障排除，请参阅官方 Docker 文档和项目源代码。
