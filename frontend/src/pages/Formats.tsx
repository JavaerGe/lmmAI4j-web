import { useState, useEffect } from 'react'
import { getFormats, FormatsResponse } from '../api/label'

export default function Formats() {
  const [formats, setFormats] = useState<FormatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getFormats()
      .then(setFormats)
      .catch(e => setError(e.message || '加载失败'))
      .finally(() => setLoading(false))
  }, [])

  const categories = [
    { key: 'image' as const, title: '🖼 图片格式' },
    { key: 'audio' as const, title: '🎵 音频格式' },
    { key: 'video' as const, title: '🎬 视频格式' },
  ]

  return (
    <div className="card">
      <div className="card-title">📋 支持的媒体格式</div>
      <p className="section-desc">查看当前 lmmAI4j SDK 支持的媒体格式列表，以及每种格式对应的文件扩展名。</p>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>加载中...</div>}

      {error && <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>{error}，请确认后端服务已启动</div>}

      {formats && (
        <div className="formats-grid">
          {categories.map(cat => {
            const items = formats[cat.key]
            if (!items || items.length === 0) return null
            return (
              <div className="format-category" key={cat.key}>
                <h3>{cat.title}</h3>
                <div className="format-list">
                  {items.map((f: { name: string; extension: string; description: string }) => (
                    <div className="format-item" key={f.name}>
                      <span className="name">{f.name}</span>
                      <span className="desc">{f.description || ''}</span>
                      <span className="ext">.{f.extension}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
