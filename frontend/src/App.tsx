import { useState } from 'react'
import Detect from './pages/Detect'
import MetadataLabel from './pages/MetadataLabel'
import WatermarkLabel from './pages/WatermarkLabel'
import AllInOne from './pages/AllInOne'
import Formats from './pages/Formats'

const tabs = [
  { key: 'detect', icon: '🔍', label: '标识检测' },
  { key: 'metadata', icon: '📝', label: '隐式标识' },
  { key: 'watermark', icon: '💧', label: '显式标识' },
  { key: 'all', icon: '✨', label: '一键标识' },
  { key: 'formats', icon: '📋', label: '支持格式' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('detect')

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <h1>AIGC 标识平台<span>GB 45438-2025</span></h1>
          <div className="header-badge">lmmAI4j Web</div>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-inner">
          {tabs.map(tab => (
            <div
              key={tab.key}
              className={`nav-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="icon">{tab.icon}</span>{tab.label}
            </div>
          ))}
        </div>
      </nav>

      <main className="container">
        {activeTab === 'detect' && <Detect />}
        {activeTab === 'metadata' && <MetadataLabel />}
        {activeTab === 'watermark' && <WatermarkLabel />}
        {activeTab === 'all' && <AllInOne />}
        {activeTab === 'formats' && <Formats />}
      </main>
    </>
  )
}
