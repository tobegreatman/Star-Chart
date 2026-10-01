# star-chart 全栈开发规范

> 项目开发统一宪法。目标：频繁迭代中保持代码优良、设计精美、测试完善、协作高效。
> 根目录：`C:\Users\chenhao\Desktop\star-chart` | 设计系统：[DESIGN.md](./DESIGN.md)（强制遵循）| OS：Windows/PowerShell | 包管理：pnpm

---

## 1. 项目结构

### 1.1 顶层目录结构（monorepo）
```
star-chart/
├── CLAUDE.md                 # 本文件，开发规范
├── DESIGN.md                 # 设计系统（Apple 风格，强制遵循）
├── README.md                 # 项目说明（按需创建）
├── package.json              # 根工作区配置
├── pnpm-workspace.yaml       # monorepo 工作区
├── tsconfig.base.json        # 共享 TS 配置
├── .editorconfig             # 编辑器统一配置
├── .prettierrc               # 代码格式化
├── .eslintrc.cjs             # 代码检查
├── .gitignore
├── apps/                     # 应用层
│   ├── web/                  # 前端应用
│   └── server/               # 后端服务
├── packages/                 # 共享包
│   ├── ui/                   # 共享 UI 组件库
│   ├── config/               # 共享配置（eslint/tsconfig 等）
│   ├── types/                # 共享类型定义
│   └── utils/                # 共享工具函数
├── .claude/                  # Claude 配置与技能
│   ├── skills/
│   └── settings.json
└── docs/                     # 项目文档（按需）
```

### 1.2 前端结构（apps/web）
```
apps/web/
├── src/
│   ├── app/                  # 路由与页面入口（按框架约定）
│   ├── components/           # 业务组件
│   │   ├── common/           # 通用组件
│   │   └── [domain]/         # 按业务域划分
│   ├── features/             # 功能模块（feature-based 组织）
│   │   └── [feature]/
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types.ts
│   │       └── index.ts      # 模块出口（barrel export）
│   ├── hooks/                # 全局自定义 hooks
│   ├── services/             # API 调用层
│   ├── stores/               # 状态管理
│   ├── styles/               # 全局样式与设计 token
│   │   ├── tokens.css        # 设计系统 CSS 变量（来自 DESIGN.md）
│   │   └── globals.css
│   ├── types/                # 全局类型
│   ├── utils/                # 工具函数
│   └── constants/            # 常量
├── public/
└── tests/                    # 前端测试
```

### 1.3 后端结构（apps/server）
```
apps/server/
├── src/
│   ├── modules/              # 业务模块（module-based 组织）
│   │   └── [module]/
│   │       ├── controller/   # 路由与请求处理
│   │       ├── service/      # 业务逻辑
│   │       ├── repository/   # 数据访问层
│   │       ├── dto/          # 数据传输对象与校验
│   │       └── index.ts
│   ├── middleware/           # 中间件
│   ├── config/               # 配置管理
│   ├── database/             # 数据库迁移与种子
│   │   ├── migrations/
│   │   └── seeders/
│   ├── shared/               # 共享代码（异常、工具、类型）
│   └── app.ts                # 应用入口
└── tests/
```

### 1.4 命名规范
| 类型 | 规范 | 示例 |
|------|------|------|
| 目录/文件 | kebab-case | `user-profile/`, `auth.service.ts` |
| 组件文件 | PascalCase | `UserProfile.tsx` |
| 组件名 | PascalCase | `UserProfile` |
| 函数/变量 | camelCase | `getUserById` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| 类型/接口 | PascalCase | `UserProfile`, `IUserRepository` |
| 枚举 | PascalCase + PascalCase 成员 | `UserRole.Admin` |
| CSS 类 | kebab-case 或 CSS Modules | `user-card-title` |
| 环境变量 | UPPER_SNAKE_CASE | `DATABASE_URL` |
| 数据库表 | snake_case 复数 | `user_profiles` |

---

## 2. 开发规范

### 技术栈
TypeScript 前后端统一（禁裸 JS）· React/Next.js · Node.js(Express/Fastify/NestJS) · PostgreSQL+Redis · Prisma · Zustand/Jotai · Tailwind+CSS Modules

### 代码质量基线
- **类型安全**：禁 `any`，用 `unknown`+类型守卫；`strict: true`
- **体量限制**：函数<50行 · 类<300行 · 文件<400行 · 圈复杂度<10 · 参数≤4 · 嵌套≤3层
- **纯函数优先**：副作用集中在 service/adapter 层
- **自文档化命名**：`isUserLoggedIn` 优于 `flag`
- **注释解释"为什么"**，删除注释代码，TODO 格式 `// TODO[作者]: 描述`

### 错误处理
- 分层：Controller 捕获转换，Service 抛业务错误
- 统一 `AppError` 基类派生 `ValidationError`/`AuthError`
- 禁空 catch；前端异步必须 loading+error+success 三态

### API 设计
- RESTful：复数名词 `/api/v1/users`，方法语义化
- 状态码：200/201/204/400/401/403/404/422/500
- 分页：`?page=1&pageSize=20` → `{ data, total, page, pageSize }`
- DTO 必须，Zod/class-validator 运行时校验
- 时间 ISO 8601(UTC)，ID 用字符串

### 数据库
迁移优先(禁手改库) · 高频/外键字段建索引 · 业务表软删除(`deletedAt`) · 审计字段(`createdAt/updatedAt/createdBy/updatedBy`) · 多表写入用事务

### 安全
JWT(access+refresh) · RBAC/ABAC 后端校验 · 输入双重校验 · 参数化查询(禁拼接SQL) · CSP+转义防 XSS · SameSite 防 CSRF · 密钥用 `.env` · 定期 `pnpm audit`

---

## 3. UI/UX 设计规范

### 强制遵循 [DESIGN.md](./DESIGN.md)（Apple 风格）
- **色彩**：`#000000`/`#f5f5f7`/`#ffffff` 中性基础，`#0071e3` 蓝色仅用于动作与链接
- **字体**：SF Pro Display(标题)+SF Pro Text(正文)，替代用 Inter/Inter Tight
- **圆角层级**：5px(微小)→8-12px(控件)→16-18px(卡片)→28-36px(模块)→56px+(胶囊)
- **间距**：8px 基础单位
- **深度**：克制阴影，优先色调对比与表面分层

### 设计 token
在 `apps/web/src/styles/tokens.css` 定义 CSS 变量：`--color-{black,gray-pale,white,ink,blue-action,blue-link,text-secondary,border-soft,border-strong}` · `--radius-{xs,sm,md,lg,xl,pill}` · `--space-{1..10}`

### UX 原则
响应式移动优先(375→1440px+) · 异步必有 skeleton 禁白屏 · 表单即时校验 · 空状态引导 · WCAG AA 可达性 · 操作<100ms 即时反馈/>1s 显示 loading · 过渡 200-300ms ease

### 组件规范
原子→分子→业务→页面分层 · props≤6(超出对象化) · 表单支持受控+非受控 · 交互元素必有 `aria-label`，图片必有 `alt` · 先查 `packages/ui` 复用

---

## 4. 测试体系

### 金字塔
单元 70%(Vitest/Jest+Testing Library) · 集成 25%(Supertest) · E2E 5%(Playwright)

### 覆盖率
行≥80% · 分支≥75% · 核心模块(支付/认证/权限)≥95% · 工具函数≥90%

### 原则
- 文件同目录：`user.service.ts` → `user.service.test.ts`
- AAA 模式(Arrange→Act→Assert)，单一断言，用例独立
- 命名 `it('should [行为] when [条件]')`
- 只 mock 外部依赖(网络/DB/FS)，不 mock 内部代码
- 快照慎用

### 命令
`pnpm test` · `pnpm test:watch` · `pnpm test:coverage` · `pnpm test:e2e` · `pnpm test --filter @star-chart/web`

---

## 5. 代码审查

### 审查清单（PR 前必核）
- **功能**：实现需求 · 边界处理(空值/极值/并发) · 错误路径覆盖 · 无 console.log/debugger
- **质量**：命名清晰 · 职责单一 · 无重复 · 类型完整 · 遵循目录规范
- **设计**：遵循 DESIGN.md · 响应式适配 · 加载/错误/空状态 · a11y 属性
- **安全性能**：输入校验 · 权限校验 · 无 SQL注入/XSS · 无 N+1 查询 · 无硬编码密钥
- **测试**：新功能有测试 · 覆盖率未降 · 断言准确
- **维护**：复杂逻辑有意图注释 · 公共 API 有类型 · 破坏性变更有迁移说明

### 审查指令
代码审查调用 `TRAE-code-review` 技能，安全扫描调用 `TRAE-security-review` 技能。

---

## 6. Git 规范

### 分支
`main`(生产,受保护) · `develop`(主干) · `feature/<scope>-<desc>` · `fix/<scope>-<desc>` · `refactor/<scope>-<desc>` · `release/<version>`

### Commit（Conventional Commits）
格式：`<type>(<scope>): <subject>` + body(解释为什么,≤72字符/行) + footer(关联issue)
Type：`feat`/`fix`/`docs`/`style`/`refactor`/`perf`/`test`/`build`/`ci`/`chore`/`revert`
subject 祈使句、首字母小写、≤50字符、无句号

### 提交流程
```bash
git status && git diff                              # 查看变更
git add src/path/to/file.ts                         # 按文件暂存(避免 -A)
git commit -m "$(cat <<'EOF'                        # HEREDOC 保证格式
feat(<scope>): <描述>

<说明>
EOF
)"
git push origin <branch-name>
```

### PR 模板
变更说明 · 变更类型(feat/fix/refactor/perf/其他) · 自检清单(遵循CLAUDE.md/DESIGN.md · 有测试 · 本地通过 · 无残留) · 关联 Issue

---

## 7. 扩展性与迭代

### 模块化
高内聚低耦合 · feature-based 组织 · 单向依赖(禁循环) · 复用≥2 模块抽到 `packages/`

### 扩展策略
开闭原则(扩展优先于修改) · 策略模式替代 if-else 链 · 配置驱动 · 接口先行 · API 版本化(`/api/v2/`)

### 技术债
发现坏味道立即小步重构 · TODO 关联 issue 定期清理 · 重构与功能变更分离提交 · 每月依赖审计+死代码清理

### 性能基线
LCP<2.5s · FID<100ms · CLS<0.1 · API P95<300ms · Bundle<200KB(gzip) · Lighthouse≥90

---

## 8. Agent 任务原则

1. **先读后写**：修改前先理解既有代码
2. **最小变更**：只做被要求的变更，不擅自重构/加功能
3. **遵循规范**：产出必须符合本文件
4. **验证闭环**：变更后验证(类型检查/测试/构建)
5. **上下文感知**：考虑对周边代码影响，避免破坏性变更
6. **复杂任务**：拆解子任务并用 TodoWrite 跟踪，分阶段交付
7. **失败处理**：提供明确错误信息，不暴力重试，不可逆操作前确认

### 技能调用
代码审查 `TRAE-code-review` · 安全扫描 `TRAE-security-review` · 运行时调试 `TRAE-debugger` · 小程序 `TRAE-generate-mini-app` · 高质量 UI `.claude/skills/frontend-design/SKILL.md`

---

## 9. 工作流速查

### 新功能流程
建分支 → 编码(遵循规范) → 编测试 → 本地验证(`pnpm lint && pnpm test && pnpm build`) → 提交(Conventional Commits) → PR → 审查合并

### 常用命令
`pnpm install` · `pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm typecheck` · `pnpm format`

### 环境变量
`.env.example`(提交,无真实值) · `.env`(本地,不提交) · `.env.production`(CI/CD 注入) · 启动时校验 + `env.d.ts` 类型定义

---

## 10. 附录

### 相关文件
[DESIGN.md](./DESIGN.md) · [frontend-design SKILL](./.claude/skills/frontend-design/SKILL.md) · [settings.json](./.claude/settings.json)

### 规范优先级
安全性 > DESIGN.md 设计系统 > 本文件规范 > 框架默认 > 个人风格
