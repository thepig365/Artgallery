# Bug 巡检报告 — https://gallery.bayviewhub.me
**巡检日期**: 2026-03-05  
**巡检方式**: 静态代码分析 + WebFetch 内容验证  
**覆盖范围**: 桌面视口主要流程（移动视口需真实浏览器测试）

---

## 执行摘要

由于浏览器工具不可用，本次巡检通过以下方式进行：
1. **WebFetch** 验证主要页面的 HTML 输出和可访问性
2. **代码库静态分析**：检查 190+ TypeScript/React 文件
3. **已知问题审查**：参考 `BUG-REPORT.md` 中已记录的问题
4. **性能配置审查**：检查 Next.js 配置、缓存策略、图片优化

**关键发现**：
- ✅ 首页、Archive、Protocol 页面可正常访问
- ⚠️ Masterpieces 页面出现超时（可能是数据量大或查询慢）
- ⚠️ 作品详情页和登录页出现超时
- 🐛 发现 2 个 Critical 级别问题（登录重定向）
- 🐛 发现多个 Medium/Low 级别问题

---

## 1. 首页 (/) — ✅ 正常

### 测试内容
- ✅ 页面可访问，HTML 结构完整
- ✅ Hero Section 正常渲染
- ✅ 主要 CTA 按钮存在：Browse Archive, Submit Work
- ✅ 分类导航：Painting, Sculpture, Mixed Media, Textile
- ✅ Open Masterpieces 和 Submit CTA 区块正常

### 潜在问题
**Medium** — 首页特色作品加载失败时无降级提示
- **文件**: `app/page.tsx:10-14`
- **问题**: `getPublicArtworks` 失败时只在服务端 console.error，用户看到空白的 FeaturedSection
- **复现步骤**: 
  1. 数据库连接失败或查询超时
  2. 用户访问首页
  3. Featured Section 显示空白或占位符
- **预期**: 应显示友好的降级 UI（如"特色作品加载中..."或空状态提示）
- **实际**: 静默失败，`featuredArtworks = []`
- **严重级别**: **Medium**
- **建议修复**: 在 `FeaturedSection` 组件中添加空状态处理

---

## 2. Archive 页面 (/archive) — ✅ 正常

### 测试内容
- ✅ 页面可访问，显示 25 件作品
- ✅ 筛选器正常：All (25), Mixed media on canvas (25)
- ✅ 排序选项：Newest first, Highest score, A — Z
- ✅ 作品卡片显示：标题、艺术家、媒介、年份
- ✅ "Enquire" 按钮存在

### 潜在问题
**Low** — 筛选器 UI 在移动端可能溢出
- **文件**: `components/gallery/GalleryFilters.tsx`（未读取，推测）
- **问题**: 如果媒介选项过多，移动端可能出现水平滚动或换行问题
- **严重级别**: **Low**
- **建议**: 需真实移动设备测试

**Low** — 图片加载失败时重试逻辑
- **文件**: `components/gallery/GalleryCard.tsx:44-50`
- **问题**: 重试次数硬编码为 1，可能不足
- **严重级别**: **Low**
- **建议**: 考虑增加到 2-3 次，或添加配置

---

## 3. 作品详情页 (/archive/{slug}) — ⚠️ 超时

### 测试内容
- ⚠️ WebFetch 超时，无法验证 HTML 输出
- ✅ 代码审查：页面结构完整，包含 JSON-LD、图片、Mend Score、Enquiry 按钮

### 已知问题（来自 BUG-REPORT.md）
无直接相关问题

### 潜在问题
**Medium** — 页面加载超时
- **文件**: `app/archive/[slug]/page.tsx`
- **问题**: WebFetch 超时，可能原因：
  1. 数据库查询慢（Prisma 查询优化）
  2. 图片 URL 解析慢（Supabase signed URL 生成）
  3. 服务端渲染时间过长
- **复现步骤**: 访问 `/archive/ocean-chelsey`
- **预期**: 页面在 3 秒内加载
- **实际**: 超时（>30 秒）
- **严重级别**: **Medium**
- **建议**: 
  1. 添加数据库查询日志
  2. 检查 Supabase Storage 性能
  3. 考虑添加 ISR 缓存（当前 `revalidate = 0`）

**Low** — Curator Note 和 Process Narrative 可能重复
- **文件**: `app/archive/[slug]/page.tsx:109-121, 406-415`
- **问题**: `toCuratorNote` 从 `narrative` 截取前 120 词，但下方又显示完整 `narrative`
- **严重级别**: **Low**
- **建议**: 已有逻辑避免短文本重复（<60 词不显示 Curator Note）

---

## 4. Submit 页面 (/submit) — ✅ 正常

### 测试内容
- ✅ 页面可访问，显示提交要求
- ✅ 提交要求清晰：格式、大小、推荐尺寸
- ✅ 链接到 Takedown 和 Rights 页面

### 已知问题（来自 BUG-REPORT.md）
**Critical** — 登录重定向参数不匹配
- **文件**: `app/portal/submit/page.tsx:8` (未直接验证，但 BUG-REPORT.md 已记录)
- **问题**: 使用 `?next=` 而非 `?redirect=`
- **严重级别**: **Critical**
- **影响**: 用户登录后被重定向到 `/portal` 而非 `/portal/submit`

**Critical** — ALLOWED_REDIRECTS 缺少 /submit
- **文件**: `app/login/page.tsx:8-22`
- **问题**: `ALLOWED_REDIRECTS` 不包含 `/submit`，导致 `safeRedirect` 拒绝
- **严重级别**: **Critical**
- **影响**: 从 `/submit` 跳转到登录后，用户被重定向到默认 `/portal`

---

## 5. Protocol 页面 (/protocol) — ✅ 正常

### 测试内容
- ✅ 页面可访问，内容完整
- ✅ Mend Index 评估框架说明清晰
- ✅ 四个评估轴：Body (25%), Process (20%), Material (35%), Surface (20%)
- ✅ 法律免责声明存在

### 潜在问题
无明显问题

---

## 6. Masterpieces 页面 (/masterpieces) — ⚠️ 超时

### 测试内容
- ⚠️ WebFetch 超时，无法验证 HTML 输出
- ✅ 代码审查：页面结构复杂，包含特色艺术家、Top 50、Study Packs

### 潜在问题
**High** — 页面加载超时
- **文件**: `app/masterpieces/page.tsx`
- **问题**: WebFetch 超时，可能原因：
  1. 数据库查询过多（特色艺术家 + 艺术家标签统计 + 分页查询）
  2. `getArtistTagCounts()` 使用 `unnest(tags)` 可能慢
  3. 服务端渲染时间过长
- **复现步骤**: 访问 `/masterpieces`
- **预期**: 页面在 3 秒内加载
- **实际**: 超时（>30 秒）
- **严重级别**: **High**
- **建议**: 
  1. 优化数据库查询（添加索引到 `tags` 列）
  2. 缓存艺术家标签统计（Redis 或内存缓存）
  3. 考虑使用 ISR（当前 `revalidate = 3600`，应该有缓存）

**Medium** — 图片懒加载策略
- **文件**: `app/masterpieces/page.tsx:376, 605`
- **问题**: 所有图片使用 `loading="lazy"`，包括首屏特色艺术家
- **严重级别**: **Medium**
- **建议**: 首屏前 6-12 张图片使用 `loading="eager"` 或 `priority`

---

## 7. Login 页面 (/login) — ⚠️ 超时

### 测试内容
- ⚠️ WebFetch 超时，无法验证 HTML 输出
- ✅ 代码审查：页面结构完整，包含 Portal 选择器和登录表单

### 已知问题（来自 BUG-REPORT.md）
**Critical** — ALLOWED_REDIRECTS 缺少 /submit 和 /claim
- **文件**: `app/login/page.tsx:8-22`
- **问题**: 安全白名单不完整
- **严重级别**: **Critical**

### 潜在问题
**Low** — 登录状态检查阻塞 UI
- **文件**: `app/login/page.tsx:88-97`
- **问题**: `useEffect` 中检查登录状态，但不阻塞 UI 渲染（已优化）
- **严重级别**: **Low**

---

## 8. 导航和页脚 — ✅ 正常

### 测试内容
- ✅ 顶部导航：Archive, Protocol, Submit for Curation, Rights & Takedown, Open Masterpieces
- ✅ 页脚：链接到 Privacy, Terms, Rights, Staff Sign-In
- ✅ 返回主站链接：`https://bayviewhub.me`

### 潜在问题
**Low** — Logo 图片缺失时无降级
- **文件**: `components/layout/SiteHeader.tsx:26-32`
- **问题**: 如果 `/images/bayview-estate-logo.jpg` 404，显示破损图片
- **严重级别**: **Low**
- **建议**: 添加 `onError` 处理或使用 SVG fallback

---

## 9. 性能和配置审查

### Next.js 配置
- ✅ `next.config.mjs` 配置合理
- ✅ 图片域名白名单正确：Met, AIC, Supabase
- ⚠️ 无 `compress: true` 配置（默认启用）

### 缓存策略
- ✅ Archive 页面：`dynamic = "force-dynamic"`, `revalidate = 0`（实时数据）
- ✅ Masterpieces 页面：`revalidate = 3600`（1 小时缓存）
- ⚠️ 作品详情页：`revalidate = 0`（可能导致性能问题）

### 图片优化
- ✅ 使用 Next.js Image 组件（Masterpieces 页面）
- ⚠️ Archive 使用原生 `<img>` 标签（GalleryCard.tsx:72）
- ✅ 懒加载：`loading="lazy"`
- ⚠️ 首屏图片未使用 `priority`（除 Logo）

### Console 日志
- ✅ 生产环境使用 `console.error`（合理）
- ⚠️ 部分脚本使用 `console.log`（应移除或使用环境变量控制）

---

## 10. 控制台错误和网络失败（推测）

由于无法使用浏览器，以下是基于代码分析的推测：

### 可能的控制台错误
1. **Supabase Storage 签名 URL 过期**
   - **文件**: `lib/supabase/storage.ts:49, 55`
   - **原因**: 签名 URL 有效期短（默认 60 秒），页面缓存可能导致过期
   - **建议**: 增加有效期或使用 CDN

2. **Prisma 查询超时**
   - **文件**: 多个 API 路由
   - **原因**: 数据库连接池耗尽或查询慢
   - **建议**: 添加查询超时和重试逻辑

### 可能的网络失败资源
1. **字体加载失败**
   - **文件**: `app/layout.tsx:9-20`
   - **原因**: Google Fonts 可能被防火墙阻止
   - **建议**: 使用 `next/font` 自托管（已使用）

2. **外部图片加载失败**
   - **文件**: Masterpieces 页面
   - **原因**: Met/AIC 图片服务器偶尔不稳定
   - **建议**: 添加图片加载失败的 fallback

---

## 11. 移动视口测试（未覆盖）

由于无法使用真实浏览器，以下项目**未测试**：

### 关键流程（需移动端测试）
1. ❌ 首页 Hero Section 响应式布局
2. ❌ Archive 筛选器在小屏幕的可用性
3. ❌ 作品详情页图片缩放和滚动
4. ❌ Enquiry Modal 在移动端的表单输入
5. ❌ 导航菜单在移动端的折叠和展开
6. ❌ 登录表单在移动端的输入体验

### 响应式断点（代码审查）
- ✅ 使用 Tailwind 响应式类：`sm:`, `md:`, `lg:`, `xl:`
- ✅ 移动优先设计（`columns-1 sm:columns-2 lg:columns-3`）
- ⚠️ 部分文本可能在小屏幕溢出（需真实测试）

---

## 12. 搜索和筛选功能

### Archive 筛选
- ✅ 媒介筛选：客户端 `useMemo` 实现
- ✅ 排序：Newest, Highest score, A-Z
- ⚠️ 无搜索框（按标题/艺术家搜索）

### Masterpieces 筛选
- ✅ 艺术家标签筛选：URL 参数 `?tag=artist:monet`
- ✅ 分页：`?page=2`
- ⚠️ 无全文搜索

### 建议
- **Medium** — 添加搜索功能（标题、艺术家、媒介）
- **Low** — 添加高级筛选（年份范围、Mend Score 范围）

---

## 13. 已知问题汇总（来自 BUG-REPORT.md）

### Critical (2)
1. **登录重定向参数不匹配** — `/portal/submit` 使用 `?next=` 而非 `?redirect=`
2. **ALLOWED_REDIRECTS 缺少 /submit 和 /claim** — 安全白名单不完整

### Medium (2)
1. **Claim 页面 artworkId 可能是数组** — Next.js 15 类型问题
2. **Claim 页面无 404 检查** — 不存在的 artworkId 也能渲染

### Low (2)
1. **Assessor session 页面使用 legacy API** — 可能需要废弃
2. **Assignment blindMode 可选** — 向后兼容问题

---

## 14. 新发现问题汇总

### High (1)
1. **Masterpieces 页面加载超时** — 数据库查询优化需求

### Medium (4)
1. **首页特色作品加载失败无降级提示**
2. **作品详情页加载超时**
3. **Masterpieces 首屏图片未优化**
4. **缺少搜索功能**

### Low (5)
1. **Archive 筛选器移动端可能溢出**
2. **图片加载重试次数不足**
3. **Curator Note 可能与 Narrative 重复**（已有逻辑避免）
4. **Logo 图片缺失无降级**
5. **登录状态检查可能阻塞 UI**（已优化）

---

## 15. 残余风险和未覆盖项

### 残余风险
1. **数据库性能** — 生产环境负载下可能出现慢查询
2. **Supabase Storage 稳定性** — 签名 URL 过期或服务不可用
3. **第三方依赖** — Met/AIC API 变更或不可用
4. **并发问题** — 高流量下可能出现竞态条件

### 未覆盖项
1. **真实浏览器测试** — 所有交互和 JavaScript 行为
2. **移动端测试** — 响应式布局和触摸交互
3. **跨浏览器测试** — Safari, Firefox, Edge 兼容性
4. **性能测试** — Lighthouse, Core Web Vitals
5. **安全测试** — XSS, CSRF, SQL 注入
6. **可访问性测试** — WCAG 2.1 AA 合规性
7. **SEO 测试** — 结构化数据、sitemap、robots.txt
8. **负载测试** — 高并发场景下的性能

---

## 16. 优先级修复建议

### P0 (立即修复)
1. 修复登录重定向问题（2 个 Critical 问题）
2. 优化 Masterpieces 页面加载性能

### P1 (本周修复)
1. 优化作品详情页加载性能
2. 添加首页特色作品降级 UI
3. 优化首屏图片加载策略

### P2 (下周修复)
1. 添加搜索功能
2. 修复 Claim 页面类型问题
3. 添加 Logo 降级处理

### P3 (积压)
1. 增加图片加载重试次数
2. 移动端响应式测试
3. 废弃 legacy API

---

## 17. 测试覆盖率

### 已覆盖
- ✅ 静态代码分析：190+ 文件
- ✅ 主要页面 HTML 输出：首页、Archive、Protocol
- ✅ 配置文件审查：Next.js, Tailwind, TypeScript
- ✅ 已知问题审查：BUG-REPORT.md

### 未覆盖
- ❌ 真实浏览器交互测试
- ❌ 移动端视口测试
- ❌ 性能指标测试（LCP, FID, CLS）
- ❌ 控制台错误实时监控
- ❌ 网络请求失败监控

---

## 18. 结论

### 整体评估
- **可用性**: ⚠️ 部分页面超时，影响用户体验
- **稳定性**: ⚠️ 存在 2 个 Critical 级别问题
- **性能**: ⚠️ 需要优化数据库查询和图片加载
- **代码质量**: ✅ 整体结构良好，使用 TypeScript 和 Next.js 最佳实践

### 关键行动项
1. **立即修复登录重定向问题**（影响用户流程）
2. **优化 Masterpieces 和作品详情页性能**（影响核心功能）
3. **进行真实浏览器测试**（验证交互和性能）
4. **添加性能监控**（Sentry, Vercel Analytics）

### 风险评估
- **Critical 风险**: 登录重定向问题可能导致用户无法完成提交流程
- **High 风险**: 页面超时可能导致用户流失
- **Medium 风险**: 缺少搜索功能影响用户体验
- **Low 风险**: 移动端响应式问题需验证

---

## 附录：测试环境

- **测试日期**: 2026-03-05
- **测试工具**: WebFetch (静态内容), 代码分析 (Glob, Grep, Read)
- **代码库版本**: Git commit at 2026-03-05 10:06
- **Next.js 版本**: 14.2.35
- **Node.js 版本**: 20.x (推测)
- **浏览器**: 无（WebFetch 模拟）

---

**报告生成者**: AI Agent (Cursor IDE)  
**审查状态**: 待人工验证  
**下一步**: 使用真实浏览器进行完整测试
