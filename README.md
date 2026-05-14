# QxBlog

基于 GitHub Issues 驱动的静态个人博客。通过 Issues 撰写 Markdown 文章，GitHub Actions 自动构建生成静态页面，无需本地环境。

## 技术栈

- **前端**：原生 ES6 Modules，零框架依赖
- **样式**：纯 CSS，支持亮/暗主题切换
- **构建**：Node.js + jsdom + featherdown
- **部署**：GitHub Actions + GitHub Pages

## 功能

- 文章动态分页（省略号、页码跳转、前进后退）
- 分类标签系统，每个分类独立分页
- 文章目录侧边栏，平滑滚动锚点跳转
- 代码块一键复制
- 亮/暗主题自动跟随系统，支持手动切换
- 友情链接动态渲染
- 返回顶部按钮

## 目录结构

```
├── index.html                  # 首页
├── articles/                   # 文章列表 + 详情页
├── categories/                 # 分类列表 + 分类详情
├── about/                      # 关于页
├── blogData/                   # 动态数据（JSON）
│   ├── articles.json           # 文章索引
│   ├── articles/               # 分页数据
│   ├── categories.json         # 分类列表
│   └── categories/             # 分类分页
├── js/                         # 前端模块
│   ├── default.js              # 入口
│   ├── config.js               # 站点配置加载
│   ├── articles.js             # 文章加载 + 分页
│   ├── categories.js           # 分类加载
│   ├── nav.js                  # 导航（主题 + 侧边栏）
│   └── toc.js                  # 文章目录
├── css/
│   └── default.css             # 全局样式
├── config/
│   ├── siteConfig.json         # 站点配置
│   └── buildConfig.json        # 构建配置
└── .github/
    ├── workflows/              # CI/CD 工作流
    └── script/                 # 静态站点生成器
```

## 使用方式

1. **创建 Issue** 撰写文章，支持 Markdown，添加 Label 作为分类
2. **GitHub Actions** 自动触发构建，生成文章页面并更新列表
3. **编辑或删除 Issue** 会同步更新对应文章
4. 站点配置修改 `config/siteConfig.json`，关于页、友链、版权等信息均在此集中管理

## 构建配置

`config/buildConfig.json`：

```json
{
    "timezoneOffset": "+08:00",
    "maxArticlesPerPage": 15
}
```
