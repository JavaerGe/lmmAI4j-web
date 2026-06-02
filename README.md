# lmmAI4j-web

<p align="center">
  <strong>AIGC 内容标识平台</strong> · 基于 <a href="https://openstd.samr.gov.cn/bzgk/gb/newGbInfo?hcno=3A4A4D4F83E5E5C9B6E5E8FA4C2F5A4F6E7F">GB 45438-2025</a> 标准
</p>

---

## 项目简介

lmmAI4j-web 是基于 [lmmAI4j](https://github.com/JavaerGe/lmmAI4j) SDK 的 AIGC 内容标识 Web 平台，为生成合成内容提供隐式标识（元数据）和显式标识（水印）的写入、检测和合规性判断能力，符合 **GB 45438-2025《网络安全技术 人工智能生成合成内容标识方法》** 附录E 规范。

## 系统架构

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│          Vite + TypeScript + 轻量级UI                │
│                   端口 5173                          │
└──────────────────────┬──────────────────────────────┘
                       │ /api (Vite Proxy)
┌──────────────────────▼──────────────────────────────┐
│                Backend (Spring Boot)                  │
│              REST API · 端口 8081                    │
│  LabelController · DetectController · FormatController │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  lmmAI4j SDK                         │
│    ImageMetadataHandler · AudioMetadataHandler       │
│    VideoMetadataHandler · Watermarker · Detector     │
└─────────────────────────────────────────────────────┘
```

## 功能特性

### 隐式标识（元数据）

将 AIGC 标识信息写入媒体文件元数据，符合 GB 45438-2025 附录E 的 JSON 结构：

```json
{
  "AIGC": {
    "Label": "1",
    "ContentProducer": "生成服务提供者编码",
    "ProduceID": "内容编号",
    "ReservedCode1": "保留编码1(可选)",
    "ContentPropagator": "内容传播者(传播时必填)",
    "PropagateID": "传播ID(传播时必填)",
    "ReservedCode2": "保留编码2(可选)"
  }
}
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| Label | 生成侧必填 | 固定为"1"，表示AI生成合成内容 |
| ContentProducer | 生成侧必填 | 生成合成服务提供者名称或编码 |
| ProduceID | 生成侧必填 | 制作唯一标识 |
| ReservedCode1 | 可选 | 保留编码1，可用于存放数字签名 |
| ContentPropagator | 传播侧必填 | 内容传播者名称或编码 |
| PropagateID | 传播侧必填 | 传播者为内容分配的唯一标识 |
| ReservedCode2 | 可选 | 保留编码2，未来扩展预留 |

### 显式标识（水印）

为媒体文件添加可视/可听的水印标识：
- **图片/视频**: 文字水印叠加
- **音频**: 摩尔斯电码/语音提示音

### 标识检测

检测媒体文件中的 AIGC 标识，生成合规性报告：
- 隐式标识存在性检测
- 显式标识推断
- 生成侧完整性校验（`Label + ContentProducer + ProduceID`）
- 传播侧完整性校验（`+ ContentPropagator + PropagateID`）

### 支持格式

| 类型 | 格式 | 元数据嵌入方式 |
|------|------|---------------|
| 图片 | JPEG | EXIF UserComment |
| 图片 | PNG | tEXt chunk |
| 图片 | GIF | Comment Extension (二进制) |
| 图片 | WEBP | EXIF chunk (二进制) |
| 图片 | BMP / TIFF / SVG / ICO | 尾部追加 AIGC 标记块 |
| 音频 | MP3 / WAV / FLAC / M4A / OGG / WMA / AIFF / OPUS / AAC | ID3v2 / jaudiotagger / FFmpeg |
| 视频 | MP4 / MKV / AVI / MOV / WMV / FLV / WEBM / 3GP / TS | FFmpeg 元数据注入 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, TypeScript, Vite 5, Axios |
| 后端 | Spring Boot 2.6.13, Java 8 |
| SDK | metadata-extractor, TwelveMonkeys ImageIO, jaudiotagger, JavaCV (FFmpeg), Jackson |
| 构建 | Maven (后端), npm (前端) |

## 快速开始

### 环境要求

- **JDK 1.8+**
- **Maven 3.6+**
- **Node.js 16+**
- **lmmAI4j SDK** — 需先构建安装

### 1. 构建 SDK

```bash
cd lmmAI4j
mvn install -DskipTests
```

### 2. 启动后端

```bash
cd lmmAI4j-web/backend
mvn spring-boot:run
```

后端运行在 `http://localhost:8081`

### 3. 启动前端

```bash
cd lmmAI4j-web/frontend
npm install
npm run dev
```

前端运行在 `http://localhost:5173`，自动代理 `/api` 到后端。

## API 接口

### 写入隐式标识

```
POST /api/label/metadata
Content-Type: multipart/form-data

参数:
  file               文件 (必填)
  label              标识值 (默认"1")
  contentProducer    内容生产者 (必填)
  produceId          生产唯一标识 (必填)
  reservedCode1      保留编码1 (可选)
  contentPropagator  内容传播者 (可选, 传播时必填)
  propagateId        传播ID (可选, 传播时必填)
  reservedCode2      保留编码2 (可选)
  producerDate       生产日期 (可选)
```

### 添加显式标识

```
POST /api/label/watermark
Content-Type: multipart/form-data

参数:
  file                 文件 (必填)
  text                 水印文字 (默认"AI生成")
  position             位置 (默认"BOTTOM_RIGHT")
  fontSizeRatio        字体比例 (默认0.05)
  opacity              不透明度 (默认0.5)
  videoStartDuration   视频水印时长 (默认2.0)
  audioPromptType      音频提示类型 (默认"MORSE_CODE")
  audioPromptPosition  音频提示位置 (默认"START")
```

### 一键标识（隐式+显式）

```
POST /api/label/all
Content-Type: multipart/form-data

参数: 同 metadata + watermark
```

### 检测标识

```
POST /api/detect
Content-Type: multipart/form-data

参数:
  file    文件 (必填)
```

### 获取支持格式

```
GET /api/formats
```

### 下载文件

```
GET /api/label/download?path={outputPath}
```

## 项目结构

```
lmmAI4j-web/
├── backend/                          # Spring Boot 后端
│   ├── src/main/java/.../web/
│   │   ├── controller/
│   │   │   ├── LabelController.java       # 标识写入接口
│   │   │   ├── DetectController.java      # 标识检测接口
│   │   │   └── FormatController.java      # 格式查询接口
│   │   ├── service/
│   │   │   └── LabelService.java          # 核心业务逻辑
│   │   └── dto/
│   │       ├── AigcLabelRequest.java      # 标识请求DTO
│   │       ├── WatermarkOptionsRequest.java
│   │       └── ApiResponse.java
│   └── src/main/resources/
│       └── application.yml
├── frontend/                         # React 前端
│   ├── src/
│   │   ├── App.tsx                       # 主应用 (标签页导航)
│   │   ├── api/                          # API 调用层
│   │   └── pages/                        # 页面组件
│   │       ├── Detect.tsx                 # 标识检测
│   │       ├── MetadataLabel.tsx          # 隐式标识
│   │       ├── WatermarkLabel.tsx         # 显式标识
│   │       ├── AllInOne.tsx               # 一键标识
│   │       └── Formats.tsx               # 支持格式
│   └── package.json
└── README.md
```

## 许可证

Apache License 2.0
