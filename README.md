# 邪恶贝利亚 (Evil Belial) - 纸牌游戏

你被邪恶贝利亚绑架了！唯一的逃脱机会就是在纸牌对决中赢过他。这是一款充满悬疑、动画精致且极具挑战性的纸牌游戏。

## 部署到 Vercel 指南

由于我是一个 AI 助手，无法直接访问您的 GitHub 或 Vercel 账户，请按照以下步骤手动完成同步和部署：

### 1. 同步到 GitHub

1.  在 GitHub 上创建一个新的仓库（例如 `evil-belial-game`）。
2.  在本地终端中运行以下命令（确保您已经安装了 Git）：

    ```bash
    # 初始化 git
    git init

    # 添加所有文件
    git add .

    # 提交更改
    git commit -m "Initial commit: Evil Belial Card Game"

    # 关联远程仓库 (替换为您的仓库地址)
    git remote add origin https://github.com/您的用户名/evil-belial-game.git

    # 推送到 GitHub
    git branch -M main
    git push -u origin main
    ```

### 2. 部署到 Vercel

1.  登录 [Vercel 官网](https://vercel.com/)。
2.  点击 **"Add New"** -> **"Project"**。
3.  在 **"Import Git Repository"** 中选择您刚刚创建的 GitHub 仓库。
4.  Vercel 会自动识别这是一个 Vite 项目。
5.  **配置环境变量**（如果您的游戏使用了 Gemini API）：
    *   在部署设置中找到 **Environment Variables**。
    *   添加 `GEMINI_API_KEY`，并填入您的 API Key。
6.  点击 **"Deploy"**。

### 3. 运行环境说明

*   **构建命令**: `npm run build`
*   **输出目录**: `dist`
*   **框架预设**: Vite

## 技术栈

*   **Frontend**: React 19 + TypeScript
*   **Styling**: Tailwind CSS 4
*   **Animation**: Motion (Framer Motion)
*   **Icons**: Lucide React
*   **Effects**: Canvas Confetti

## 游戏特色

*   **邪恶贝利亚主题**: 深度定制的视觉效果，包括贝利亚奥特曼的 SVG 形象。
*   **动态卡牌**: 每一张牌都有精致的动画效果，特别是金色的 "8" 号牌。
*   **沉浸式体验**: 包含故障艺术效果、震动反馈和悬疑的氛围。
