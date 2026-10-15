# QxBlog

一个以 GitHub Discussions 为内容源的静态博客。新版采用阅读优先的极简杂志布局：大字号、细线条、留白，以及深浅两套主题。

文章、导航和索引在构建时生成完整 HTML。JavaScript 负责搜索、主题和阅读辅助；没有 JavaScript 也能浏览内容。

## 快速开始

需要 Node.js 22 或更新版本（CI 使用 Node.js 24）。

```sh
npm ci
npm run dev
```

打开终端输出的地址，默认是 `http://127.0.0.1:5502/`。开发服务器监听源码、配置与文章变化并重新构建，刷新浏览器查看结果。修改部署路径或服务配置后请重启开发服务器。

```sh
npm run build          # 生成 dist/
npm run preview        # 预览 dist/
npm test               # 内容、同步、模板、搜索与构建测试
npm run check          # 测试并构建
```

Bun 用户也可以使用 `bun install` 与 `bun run dev`；可复现 CI 使用已提交的 npm 锁文件。

## 写文章

### GitHub Discussions

1. 开启仓库 Discussions。
2. 在 `config/buildConfig.json` 的 `author` 填写允许发布的 **GitHub 登录名**，与站点展示名称独立。
3. Discussion 标题和正文成为文章，Category 成为分类，Labels 成为标签。
4. 工作流会同步文章到 `content/posts/`，构建后部署到 Pages。

带 `no-article` 标签、已回答、已关闭、非指定作者的 Discussion 不发布。删除、关闭或标记回答会下架对应的同步文章；恢复后可重新发布。同步通过游标读取完整列表，不限制在前 100 篇。

同步文章带有 `source: github-discussion`、仓库和 Discussion 编号标记。同步只管理带这些标记的文件；不会覆盖同 ID 的本地原创文章。远程内容读取或验证失败时不会删除原有内容。不要手工编辑同步文章的正文，下一次同步会以 Discussions 为准。

本地同步需要 `GH_TOKEN`（或 `GITHUB_TOKEN`）与 `GITHUB_REPOSITORY=owner/repository` 环境变量：

```sh
npm run sync
npm run build
```

令牌需要读取对应仓库 Discussions 的权限。普通本地开发不需要令牌。

### 本地 Markdown

在 `content/posts/` 新建文件，例如 `1.md`：

```markdown
---
id: 1
title: 我的第一篇文章
date: '2026-10-15T09:00:00+08:00'
tags: [随笔, 技术]
category: 思考
draft: false
---

## 从这里开始

正文支持 GFM、代码高亮、数学公式、表格与图片。
```

文章链接保持为 `/posts/1.html`。`id` 必须唯一，且不能包含斜杠或目录穿越字符。日期推荐 ISO 8601，包含明确时区。支持 `updated`、`author`、`excerpt`、`tagSlugs`、`categorySlug` 和 `discussionUrl`。正文中的危险 HTML 会被移除。

`draft: true` 默认不发布；显式预览草稿可运行 `npm run dev -- --drafts`。不提供文章时，站点显示真实空状态，不自动发布示例内容。

## 配置与部署路径

- `config/siteConfig.json`：站点名称、作者、正式 URL、首页标题、个人介绍、友链和页脚。
- `config/buildConfig.json`：发布作者、Discussion 编号偏移 `githubStartId`、每页文章条数 `maxArticlesPerPage`、展示时区 `timezoneOffset`、robots 规则。
- `public/img/Avatar.png`：作者头像；`public/favicon.svg`：站点图标。

`site.url` 必须填写正式站点地址。项目站点可使用 `https://username.github.io/QxBlog/`；构建器会据此生成 `/QxBlog/` 前缀。也可显式覆盖：

```sh
npm run build -- --base /QxBlog/
npm run preview -- --base /QxBlog/
```

站点同时生成 `feed.xml`、`sitemap.xml`、`robots.txt` 和搜索索引。静态文件全部输出到 `dist/`。额外公开文件（例如自定义域名所需的 `CNAME`）放入 `public/`。

GitHub 仓库 Settings → Pages → Source 选择 **GitHub Actions**。工作流支持 `main` 分支 push、Discussions 事件与手动运行。Discussions/手动运行会先同步内容，只提交 `content/posts/`；构建文件不回写源码仓库。Pages 配置提供实际路径前缀。如果默认分支不是 `main`，请修改工作流的 push 分支。

## 目录结构

```text
config/                 站点和构建配置
content/posts/          Markdown 内容
public/                 原样复制的字体、头像、图标
src/
  content/              解析、规范化、渲染、GitHub 同步
  build/                配置、资产、索引、feed 与构建编排
  templates/            公共布局、组件和各类页面
  styles/               tokens、布局、正文与搜索样式
  client/               主题、导航、搜索和文章增强
scripts/                build、dev、preview、sync 入口
tests/                  行为测试与非生产示例
.github/workflows/      自动构建部署
dist/                   生成结果（Git 忽略）
```

UI 改动通常位于 `src/templates/` 和 `src/styles/`；客户端只增强模板中的 `data-*` 交互标记。内容处理与页面模板通过统一 Post 数据结构连接，避免以页面 DOM 推断业务状态。

## 从旧结构迁移

- 保留原有 `config/` 配置，以及文章 ID、分类和标签 slug。
- 构建器仍可读取 `blogData/markdown/`；同 ID 时优先使用新 `content/posts/` 中的版本。确认迁移完成后可自行移除旧文件。
- 旧 Markdown 没有来源标记时按本地内容处理。若希望它重新由 Discussions 管理，请先备份旧文件并解决同 ID 冲突，然后同步；不自动猜测文章来源。
- 不再使用根目录页面、旧 `js/`、`css/`、JSON 索引和 `.github/script/qxBlogBuild.js`。统一使用根目录 npm 命令，部署 `dist/`。
- `.git/qxblog-before-rebuild/` 保存此次重构前的工作区文件，包括原有未提交修改；这是本机备份，不会提交到远程。

## 浏览器验证

```sh
npx playwright install chromium
npm run test:browser
```

Windows 上已有 Edge 时可设置 `PLAYWRIGHT_CHANNEL=msedge` 使用本机浏览器。测试启动独立的 `/QxBlog/` 子路径站点，覆盖无 JS 阅读、全文搜索、主题持久化、代码复制、目录、移动导航与布局溢出。

只查看有内容的测试界面：

```sh
npm run build -- --content tests/fixtures/posts --out .preview/demo
npm run preview -- --out .preview/demo --port 5504
```

这些示例仅用于验证，不会进入正常 `npm run build` 的生产输出。

## 许可证

[GNU General Public License v3.0](LICENSE)。
