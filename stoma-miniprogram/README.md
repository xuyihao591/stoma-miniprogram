# 造口智护微信小程序 — 开发文档

## 项目概览

**造口智护** 是一个面向造口患者和医护人员的智能护理管理平台，分为**患者端**和**医生端**两套界面，集成AI评估、3D重建模型查看、随访管理等核心功能。

---

## 目录结构

```
stoma-miniprogram/
├── app.js               # 全局逻辑（登录、token管理、角色路由）
├── app.json             # 全局配置（页面路由、TabBar、权限）
├── app.wxss             # 全局样式（卡片、按钮、标签等公共组件）
├── project.config.json  # 开发者工具配置
├── sitemap.json
│
├── pages/
│   ├── login/           # 登录页（患者/医生角色切换）
│   │
│   ├── patient/         # 患者端
│   │   ├── home/        # 首页：拍照、上传图片/视频、提交评估、AI分析进度
│   │   ├── guide/       # 拍摄引导页：步骤卡片、角度图、FAQ
│   │   ├── report/      # AI评估报告：3D模型展示、指标卡片、专家意见
│   │   ├── profile/     # 我的档案：基本信息、造口信息、既往病史
│   │   ├── followup/    # 随访记录：列表视图 + Canvas趋势图
│   │   └── consult/     # 在线咨询：发起问题、查看专家回复
│   │
│   └── doctor/          # 医生端
│       ├── list/        # 待审核列表：按时间/紧急程度排序、快速确认
│       ├── model3d/     # 3D模型交互查看：视角预设、测量、截图
│       ├── detail/      # 评估详情：图片/视频/3D模型入口、AI指标
│       ├── review/      # 审核操作：修改等级/指标、填写意见、快捷模板
│       ├── patients/    # 患者管理：搜索、随访历史
│       └── stats/       # 统计面板：本周处理量柱状图、感染分布
│
└── utils/
    ├── api.js           # 所有接口定义（REST API调用封装）
    ├── request.js       # HTTP请求封装（token注入、401处理、错误提示）
    ├── storage.js       # 本地存储封装
    └── util.js          # 通用工具（时间格式化、toast、文件大小、严重程度标签）
```

---

## 关键功能说明

### 1. 媒体上传（图片 + 视频）

```javascript
// 患者端 home.js - 支持拍照/录视频/从相册选择
wx.chooseMedia({
  count: 5,
  mediaType: ['image'],       // 或 ['video']
  sourceType: ['camera'],     // 或 ['album']
  maxDuration: 30,            // 视频最长30秒
  success: (res) => this.addMedia(res.tempFiles, 'image')
})
```

视频同样走 `wx.uploadFile` 接口上传，后端接收后交给 3DGS 流水线。

---

### 2. AI分析轮询机制

```javascript
// 提交评估后开始轮询（3秒一次，最多40次 = 2分钟）
this._pollingTimer = setInterval(async () => {
  const status = await api.getAssessmentStatus(assessmentId)
  if (status.done) {
    clearInterval(this._pollingTimer)
    // 弹窗提示查看报告
  }
}, 3000)
```

同时使用 `wx.requestSubscribeMessage` 申请订阅通知，后端分析完成后可主动推送。

---

### 3. 3D模型查看（glTF格式）

医生端使用微信小程序内置 `three-dimensional-model` 组件：

```wxml
<three-dimensional-model
  src="{{modelUrl}}"          <!-- 指向 OSS 上的 .glb 文件 -->
  bindload="onModelLoad"
  binderror="onModelError"
  initial-theta="{{90}}"
  initial-phi="{{30}}"
/>
```

**3D模型工作流**：
1. 患者上传照片/视频
2. 后端用 COLMAP + 3DGS 训练，生成 `.ply` 格式
3. 后端将 `.ply` 转换为 `.glb`（glTF二进制格式）
4. 上传至 OSS，返回 URL 给小程序
5. 医生端用 `three-dimensional-model` 组件渲染，支持旋转/缩放/视角预设

---

### 4. 医生审核流程

```
查看待审核列表 → 进入评估详情 → 查看3D模型 → 审核页填写意见
                                              ↓
                              确认等级 + 修改AI指标 + 填写建议
                                              ↓
                              提交 → 后端推送报告至患者端
```

---

## 后端 API 约定

所有接口统一格式：
```json
{ "code": 0, "data": {...}, "message": "success" }
```

| 接口 | 方法 | 说明 |
|------|------|------|
| `/auth/wx-login` | POST | 微信登录，传 code |
| `/assessment/upload-image` | POST (multipart) | 上传图片 |
| `/assessment/upload-video` | POST (multipart) | 上传视频 |
| `/assessment/submit` | POST | 提交评估任务 |
| `/assessment/:id/status` | GET | 查询分析状态 |
| `/assessment/:id/report` | GET | 获取完整报告 |
| `/doctor/pending` | GET | 获取待审核列表 |
| `/doctor/review/:id` | POST | 提交审核结论 |
| `/model/:id/gltf-url` | GET | 获取glTF模型URL |

---

## 接入前配置

1. 修改 `utils/request.js` 中的 baseUrl：
   ```javascript
   globalData.baseUrl = 'https://your-actual-domain.com/api/v1'
   ```

2. 修改 `project.config.json` 中的 `appid`

3. 在微信公众平台添加合法域名：
   - request 域名：你的 API 域名
   - uploadFile 域名：你的 API 域名
   - downloadFile 域名：你的 OSS 域名

4. 开发调试阶段可在「项目设置」勾选「不校验合法域名」

---

## 开发/调试说明

- **Mock 数据**：所有页面都内置了 `catch (e)` fallback，API 未就绪时自动使用 mock 数据，可直接在微信开发者工具中预览完整UI
- **角色切换**：登录页可切换患者/医生身份，开发调试时非常方便
- **3D模型**：开发阶段可用任意公开的 `.glb` 文件 URL 测试渲染效果

---

## 后续待开发

- [ ] 患者档案编辑功能
- [ ] 图片增强引导（实时检测拍摄质量）
- [ ] 消息通知中心
- [ ] 深色模式支持
- [ ] 造口测量引导动画
