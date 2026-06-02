import { useState, useRef } from 'react'
import { detect, DetectResultData } from '../api/detect'

export default function Detect() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DetectResultData | null>(null)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResult(null)
    setError('')
  }

  const handleDetect = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const res = await detect(file)
      setResult(res)
    } catch (e: any) {
      setError(e.message || '检测失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-title">🔍 AIGC 标识检测 <span className="badge">检测</span></div>
        <p className="section-desc">上传媒体文件，检测其中是否包含 AIGC 隐式标识（元数据）和显式标识（水印），并给出合规性报告。</p>
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
        <div className="action-bar">
          <button className="btn btn-primary btn-lg" disabled={!file || loading} onClick={handleDetect}>
            {loading ? <><span className="spinner"></span> 检测中...</> : '开始检测'}
          </button>
        </div>
      </div>

      {error && (
        <div className="card">
          <div className="result-header">
            <span style={{ fontWeight: 600 }}>检测失败</span>
            <span className="status error">错误</span>
          </div>
          <p style={{ color: '#991b1b' }}>{error}</p>
        </div>
      )}

      {result && (
        <div className="card">
          <div className="result-header">
            <span style={{ fontWeight: 600 }}>检测结果</span>
            <span className={`status ${result.isCompliant ? 'success' : 'error'}`}>
              {result.isCompliant ? '合规' : '不合规'}
            </span>
          </div>
          <div className="detect-summary">
            <div className={`detect-item ${result.hasImplicitLabel ? 'positive' : 'negative'}`}>
              <div className="value">{result.hasImplicitLabel ? '✅ 有' : '❌ 无'}</div>
              <div className="label-text">隐式标识</div>
            </div>
            <div className={`detect-item ${result.hasExplicitLabel ? 'positive' : 'negative'}`}>
              <div className="value">{result.hasExplicitLabel ? '✅ 有' : '❌ 无'}</div>
              <div className="label-text">显式标识</div>
            </div>
            <div className={`detect-item ${result.isCompliant ? 'positive' : 'negative'}`}>
              <div className="value">{result.isCompliant ? '✅ 合规' : '❌ 不合规'}</div>
              <div className="label-text">合规状态</div>
            </div>
            <div className="detect-item positive">
              <div className="value">{result.mediaFormat || '-'}</div>
              <div className="label-text">媒体格式</div>
            </div>
          </div>
          {result.report && <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>{result.report}</p>}
          {result.missingFields && result.missingFields.length > 0 && (
            <p style={{ marginBottom: 12, fontSize: 13, color: 'var(--danger)' }}>缺失字段: {result.missingFields.join(', ')}</p>
          )}
          <div className="result-body">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </>
  )
}
