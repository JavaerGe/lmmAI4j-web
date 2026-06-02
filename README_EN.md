# lmmAI4j-web

<p align="center">
  <strong>AIGC Content Labeling Platform</strong> · Based on <a href="https://openstd.samr.gov.cn/bzgk/gb/newGbInfo?hcno=3A4A4D4F83E5E5C9B6E5E8FA4C2F5A4F6E7F">GB 45438-2025</a> Standard
</p>

---

## Overview

lmmAI4j-web is an AIGC content labeling web platform built on the [lmmAI4j](https://github.com/JavaerGe/lmmAI4j) SDK. It provides the ability to write, detect, and verify implicit labels (metadata) and explicit labels (watermarks) for AI-generated content, compliant with **GB 45438-2025 "Cybersecurity Technology — Methods for Labeling AI-Generated Synthetic Content"**, Appendix E.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                   │
│          Vite + TypeScript + Lightweight UI          │
│                   Port 5173                          │
└──────────────────────┬──────────────────────────────┘
                       │ /api (Vite Proxy)
┌──────────────────────▼──────────────────────────────┐
│                Backend (Spring Boot)                  │
│              REST API · Port 8081                    │
│  LabelController · DetectController · FormatController │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  lmmAI4j SDK                         │
│    ImageMetadataHandler · AudioMetadataHandler       │
│    VideoMetadataHandler · Watermarker · Detector     │
└─────────────────────────────────────────────────────┘
```

## Features

### Implicit Label (Metadata)

Writes AIGC identification information into media file metadata, conforming to the JSON structure specified in GB 45438-2025 Appendix E:

```json
{
  "AIGC": {
    "Label": "1",
    "ContentProducer": "Generator service provider code",
    "ProduceID": "Content unique ID",
    "ReservedCode1": "Reserved code 1 (optional)",
    "ContentPropagator": "Content propagator (required for propagation)",
    "PropagateID": "Propagation ID (required for propagation)",
    "ReservedCode2": "Reserved code 2 (optional)"
  }
}
```

**Field descriptions:**

| Field | Required | Description |
|-------|----------|-------------|
| Label | Generation side | Fixed as "1", indicates AI-generated content |
| ContentProducer | Generation side | Name or code of the generative AI service provider |
| ProduceID | Generation side | Unique production identifier |
| ReservedCode1 | Optional | Reserved code 1, can store digital signature |
| ContentPropagator | Propagation side | Name or code of the content propagator |
| PropagateID | Propagation side | Unique identifier assigned by propagator |
| ReservedCode2 | Optional | Reserved code 2, reserved for future use |

### Explicit Label (Watermark)

Adds visible/audible watermark labels to media files:
- **Image/Video**: Text watermark overlay
- **Audio**: Morse code / voice prompt tone

### Label Detection

Detects AIGC labels in media files and generates compliance reports:
- Implicit label presence detection
- Explicit label inference
- Generation-side completeness check (`Label + ContentProducer + ProduceID`)
- Propagation-side completeness check (`+ ContentPropagator + PropagateID`)

### Supported Formats

| Type | Formats | Metadata Embedding Method |
|------|---------|--------------------------|
| Image | JPEG | EXIF UserComment |
| Image | PNG | tEXt chunk |
| Image | GIF | Comment Extension (binary) |
| Image | WEBP | EXIF chunk (binary) |
| Image | BMP / TIFF / SVG / ICO | Tail-append AIGC marker block |
| Audio | MP3 / WAV / FLAC / M4A / OGG / WMA / AIFF / OPUS / AAC | ID3v2 / jaudiotagger / FFmpeg |
| Video | MP4 / MKV / AVI / MOV / WMV / FLV / WEBM / 3GP / TS | FFmpeg metadata injection |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 5, Axios |
| Backend | Spring Boot 2.6.13, Java 8 |
| SDK | metadata-extractor, TwelveMonkeys ImageIO, jaudiotagger, JavaCV (FFmpeg), Jackson |
| Build | Maven (Backend), npm (Frontend) |

## Getting Started

### Prerequisites

- **JDK 1.8+**
- **Maven 3.6+**
- **Node.js 16+**
- **lmmAI4j SDK** — must be built and installed first

### 1. Build the SDK

```bash
cd lmmAI4j
mvn install -DskipTests
```

### 2. Start the Backend

```bash
cd lmmAI4j-web/backend
mvn spring-boot:run
```

The backend runs at `http://localhost:8081`

### 3. Start the Frontend

```bash
cd lmmAI4j-web/frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` and automatically proxies `/api` requests to the backend.

## API Reference

### Write Implicit Label

```
POST /api/label/metadata
Content-Type: multipart/form-data

Parameters:
  file               File (required)
  label              Label value (default "1")
  contentProducer    Content producer (required)
  produceId          Production unique ID (required)
  reservedCode1      Reserved code 1 (optional)
  contentPropagator  Content propagator (optional, required for propagation)
  propagateId        Propagation ID (optional, required for propagation)
  reservedCode2      Reserved code 2 (optional)
  producerDate       Production date (optional)
```

### Add Explicit Label

```
POST /api/label/watermark
Content-Type: multipart/form-data

Parameters:
  file                 File (required)
  text                 Watermark text (default "AI生成")
  position             Position (default "BOTTOM_RIGHT")
  fontSizeRatio        Font size ratio (default 0.05)
  opacity              Opacity (default 0.5)
  videoStartDuration   Video watermark duration (default 2.0)
  audioPromptType      Audio prompt type (default "MORSE_CODE")
  audioPromptPosition  Audio prompt position (default "START")
```

### One-Click Labeling (Implicit + Explicit)

```
POST /api/label/all
Content-Type: multipart/form-data

Parameters: Same as metadata + watermark combined
```

### Detect Labels

```
POST /api/detect
Content-Type: multipart/form-data

Parameters:
  file    File (required)
```

### Get Supported Formats

```
GET /api/formats
```

### Download File

```
GET /api/label/download?path={outputPath}
```

## Project Structure

```
lmmAI4j-web/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/.../web/
│   │   ├── controller/
│   │   │   ├── LabelController.java       # Label writing endpoints
│   │   │   ├── DetectController.java      # Detection endpoint
│   │   │   └── FormatController.java      # Format query endpoint
│   │   ├── service/
│   │   │   └── LabelService.java          # Core business logic
│   │   └── dto/
│   │       ├── AigcLabelRequest.java      # Label request DTO
│   │       ├── WatermarkOptionsRequest.java
│   │       └── ApiResponse.java
│   └── src/main/resources/
│       └── application.yml
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── App.tsx                       # Main app (tab navigation)
│   │   ├── api/                          # API layer
│   │   └── pages/                        # Page components
│   │       ├── Detect.tsx                 # Label detection
│   │       ├── MetadataLabel.tsx          # Implicit label
│   │       ├── WatermarkLabel.tsx         # Explicit label
│   │       ├── AllInOne.tsx               # One-click labeling
│   │       └── Formats.tsx               # Supported formats
│   └── package.json
└── README.md
```

## License

Apache License 2.0
