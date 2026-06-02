import { useState, useRef } from 'react'
import { addWatermark, getDownloadUrl, LabelResultData } from '../api/label'

function getMediaTypeFromFileName(fileName: string): 'IMAGE' | 'AUDIO' | 'VIDEO' | undefined {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'tif', 'heic', 'heif', 'avif', 'svg', 'ico']
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'aiff', 'aif', 'opus']
  const videoExts = ['mp4', 'mkv', 'avi', 'mov', 'wmv', 'flv', 'webm', '3gp', 'ts']
  if (imageExts.includes(ext)) return 'IMAGE'
  if (audioExts.includes(ext)) return 'AUDIO'
  if (videoExts.includes(ext)) return 'VIDEO'
  return undefined
}

export default function WatermarkLabel() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LabelResultData | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('AI生成')
  const [position, setPosition] = useState('BOTTOM_RIGHT')
  const [fontSizeRatio, setFontSizeRatio] = useState(0.05)
  const [opacity, setOpacity] = useState(0.5)
  const [videoDuration, setVideoDuration] = useState(2.0)
  const [audioType, setAudioType] = useState('MORSE_CODE')
  const [audioPosition, setAudioPosition] = useState('START')

  const mediaType = file ? getMediaTypeFromFileName(file.name) : undefined

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError('')
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const res = await addWatermark(file, { text, position, fontSizeRatio, opacity, videoStartDuration: videoDuration, audioPromptType: audioType, audioPromptPosition: audioPosition })
      setResult(res)
    } catch (e: any) {
      setError(e.message || '操作失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-title">💧 添加显式标识（水印） <span className="badge">水印</span></div>
        <p className="section-desc">在媒体文件中添加可见水印（图片/视频）或音频提示（音频），实现显式 AIGC 标识。</p>
        <div
          className={`file-upload ${dragOver ? 'drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]) }}
        >
          <div className="icon">📁</div>
          <div className="text">拖拽文件到此处，或 <strong>点击选择文件</strong></div>
          <input ref={inputRef} type="file" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
        {file && (
          <div className="file-info">
            <span>✅</span> {file.name} ({(file.size / 1024).toFixed(1)} KB) — 媒体类型: {mediaType || '未知'}
          </div>
        )}
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>水印文字</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)} />
          </div>
          {(mediaType === 'IMAGE' || mediaType === 'VIDEO') && (
            <div className="form-group">
              <label>水印位置</label>
              <select value={position} onChange={e => setPosition(e.target.value)}>
                <option value="TOP_LEFT">左上角</option>
                <option value="TOP_RIGHT">右上角</option>
                <option value="BOTTOM_LEFT">左下角</option>
                <option value="BOTTOM_RIGHT">右下角</option>
                <option value="CENTER">居中</option>
              </select>
            </div>
          )}
          {(mediaType === 'IMAGE' || mediaType === 'VIDEO') && (
            <div className="form-group">
              <label>字体大小比例</label>
              <input type="number" value={fontSizeRatio} onChange={e => setFontSizeRatio(Number(e.target.value))} step={0.01} min={0.01} max={0.5} />
            </div>
          )}
          {(mediaType === 'IMAGE' || mediaType === 'VIDEO') && (
            <div className="form-group">
              <label>不透明度</label>
              <input type="number" value={opacity} onChange={e => setOpacity(Number(e.target.value))} step={0.1} min={0.1} max={1.0} />
            </div>
          )}
          {mediaType === 'VIDEO' && (
            <div className="form-group">
              <label>视频起始画面时长(秒)</label>
              <input type="number" value={videoDuration} onChange={e => setVideoDuration(Number(e.target.value))} step={0.5} min={0.5} />
            </div>
          )}
          {mediaType === 'AUDIO' && (
            <div className="form-group">
              <label>音频提示类型</label>
              <select value={audioType} onChange={e => setAudioType(e.target.value)}>
                <option value="MORSE_CODE">摩斯码</option>
                <option value="VOICE_PROMPT">语音提示</option>
              </select>
            </div>
          )}
          {mediaType === 'AUDIO' && (
            <div className="form-group">
              <label>音频提示位置</label>
              <select value={audioPosition} onChange={e => setAudioPosition(e.target.value)}>
                <option value="START">起始</option>
                <option value="END">末尾</option>
                <option value="BOTH">两端</option>
              </select>
            </div>
          )}
        </div>
        <div className="action-bar">
          <button className="btn btn-primary btn-lg" disabled={!file || loading} onClick={handleSubmit}>
            {loading ? <><span className="spinner"></span> 处理中...</> : '添加水印'}
          </button>
        </div>
      </div>

      {error && (
        <div className="card" style={{ borderLeftColor: 'var(--danger)' }}>
          <p style={{ color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="result-header">
            <span style={{ fontWeight: 600 }}>水印结果</span>
            <span className={`status ${result.success ? 'success' : 'error'}`}>
              {result.success ? '成功' : '失败'}
            </span>
          </div>
          <div className="result-body">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
          {result.outputPath && (
            <div className="download-bar">
              <a className="btn btn-success" href={getDownloadUrl(result.outputPath)} target="_blank" rel="noreferrer">
                ⬇ 下载处理后的文件
              </a>
            </div>
          )}
        </div>
      )}
    </>
  )
}
