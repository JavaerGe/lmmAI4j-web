import { useState, useRef } from 'react'
import { writeMetadata, getDownloadUrl, LabelResultData } from '../api/label'

export default function MetadataLabel() {
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
      const res = await writeMetadata(file, { label, contentProducer, produceId, reservedCode1, contentPropagator, propagateId, reservedCode2, producerDate })
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
        <div className="card-title">📝 写入隐式标识（元数据） <span className="badge">GB 45438-2025</span></div>
        <p className="section-desc">将 AIGC 标识信息写入媒体文件的元数据中，符合 GB 45438-2025 附录E 标准要求。</p>
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
        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="form-group">
            <label>标识值 (label)</label>
            <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="固定为1" />
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
            <input type="text" value={reservedCode1} onChange={e => setReservedCode1(e.target.value)} placeholder="可选，如数字签名" />
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
        <div className="action-bar">
          <button className="btn btn-primary btn-lg" disabled={!file || loading} onClick={handleSubmit}>
            {loading ? <><span className="spinner"></span> 写入中...</> : '写入元数据'}
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
            <span style={{ fontWeight: 600 }}>写入结果</span>
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
