import { useState, useRef } from 'react'
import { labelAll, getDownloadUrl, LabelResultData } from '../api/label'

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

export default function AllInOne() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<LabelResultData | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const [label, setLabel] = useState('1')
  const [contentProducer, setContentProducer] = useState('')
  const [produceId, setProduceId] = useState('')
  const [reservedCode1, setReservedCode1] = useState('')
  const [contentPropagator, setContentPropagator] = useState('')
  const [propagateId, setPropagateId] = useState('')
  const [reservedCode2, setReservedCode2] = useState('')
  const [producerDate, setProducerDate] = useState('')

  const [wmText, setWmText] = useState('AI生成')
  const [wmPosition, setWmPosition] = useState('BOTTOM_RIGHT')
  const [fontSizeRatio, setFontSizeRatio] = useState(0.05)
  const [opacity, setOpacity] = useState(0.5)

  const mediaType = file ? getMediaTypeFromFileName(file.name) : undefined

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError('')
  }

  const handleSubmit = async () => {
    if (!file) return
    if (!contentProducer.trim() || !produceId.trim()) {
      setError('请填写内容生产者和生产唯一标识')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await labelAll(
        file,
        { label, contentProducer, produceId, reservedCode1, contentPropagator, propagateId, reservedCode2, producerDate },
        { text: wmText, position: wmPosition, fontSizeRatio, opacity, videoStartDuration: 2.0, audioPromptType: 'MORSE_CODE', audioPromptPosition: 'START' }
      )
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
        <div className="card-title">✨ 一键标识（隐式 + 显式） <span className="badge">完整标识</span></div>
        <p className="section-desc">同时写入 AIGC 元数据标识和添加显式水印，一步完成 GB 45438-2025 合规标识。</p>
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
            <span>✅</span> {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
        <h4 style={{ margin: '16px 0 8px', fontSize: 14, color: 'var(--primary)' }}>隐式标识参数</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>标识值 (label)</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} />
          </div>
          <div className="form-group">
            <label>内容生产者 *</label>
            <input type="text" value={contentProducer} onChange={e => setContentProducer(e.target.value)} placeholder="如：XX科技有限公司" />
          </div>
          <div className="form-group">
            <label>生产唯一标识 *</label>
            <input type="text" value={produceId} onChange={e => setProduceId(e.target.value)} placeholder="如：AIGC-20250101-0001" />
          </div>
          <div className="form-group">
            <label>保留编码1</label>
            <input type="text" value={reservedCode1} onChange={e => setReservedCode1(e.target.value)} placeholder="可选" />
          </div>
          <div className="form-group">
            <label>内容传播者</label>
            <input type="text" value={contentPropagator} onChange={e => setContentPropagator(e.target.value)} placeholder="传播时必填" />
          </div>
          <div className="form-group">
            <label>传播ID</label>
            <input type="text" value={propagateId} onChange={e => setPropagateId(e.target.value)} placeholder="传播时必填" />
          </div>
          <div className="form-group">
            <label>保留编码2</label>
            <input type="text" value={reservedCode2} onChange={e => setReservedCode2(e.target.value)} placeholder="可选" />
          </div>
          <div className="form-group">
            <label>生产日期</label>
            <input type="text" value={producerDate} onChange={e => setProducerDate(e.target.value)} placeholder="如：2025-01-01" />
          </div>
        </div>
        <h4 style={{ margin: '16px 0 8px', fontSize: 14, color: 'var(--primary)' }}>显式标识参数</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>水印文字</label>
            <input type="text" value={wmText} onChange={e => setWmText(e.target.value)} />
          </div>
          <div className="form-group">
            <label>水印位置</label>
            <select value={wmPosition} onChange={e => setWmPosition(e.target.value)}>
              <option value="TOP_LEFT">左上角</option>
              <option value="TOP_RIGHT">右上角</option>
              <option value="BOTTOM_LEFT">左下角</option>
              <option value="BOTTOM_RIGHT">右下角</option>
              <option value="CENTER">居中</option>
            </select>
          </div>
          <div className="form-group">
            <label>字体大小比例</label>
            <input type="number" value={fontSizeRatio} onChange={e => setFontSizeRatio(Number(e.target.value))} step={0.01} min={0.01} max={0.5} />
          </div>
          <div className="form-group">
            <label>不透明度</label>
            <input type="number" value={opacity} onChange={e => setOpacity(Number(e.target.value))} step={0.1} min={0.1} max={1.0} />
          </div>
        </div>
        <div className="action-bar">
          <button className="btn btn-primary btn-lg" disabled={!file || loading} onClick={handleSubmit}>
            {loading ? <><span className="spinner"></span> 处理中...</> : '一键标识'}
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
            <span style={{ fontWeight: 600 }}>标识结果</span>
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
