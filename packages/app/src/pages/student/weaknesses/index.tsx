import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api, isApiError } from '../../../utils/api'
import type { WeaknessWithDetails } from '../../../utils/api'
import './index.css'

export default function WeaknessesPage() {
  const [weaknesses, setWeaknesses] = useState<WeaknessWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWeaknesses()
  }, [])

  const fetchWeaknesses = async () => {
    try {
      setLoading(true)
      const list = await api.getWeaknesses()
      setWeaknesses(list)
    } catch (err) {
      const message = isApiError(err) ? err.message : '加载失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const severityMap: Record<string, { label: string; color: string }> = {
    mild: { label: '轻度', color: '#f59e0b' },
    moderate: { label: '中度', color: '#ef4444' },
    severe: { label: '严重', color: '#dc2626' },
  }

  if (loading) {
    return <div className='loading'>加载中...</div>
  }

  return (
    <div className='weaknesses-page'>
      {weaknesses.length === 0 ? (
        <div className='empty'>
          <p className='empty-icon'>🎉</p>
          <p className='empty-text'>暂无薄弱知识点</p>
          <p className='empty-hint'>继续保持，你真棒！</p>
        </div>
      ) : (
        <div className='list'>
          {weaknesses.map((w, i) => {
            const severity = severityMap[w.severity] || severityMap.mild
            return (
              <div key={i} className='weakness-card'>
                <div className='card-header'>
                  <span className='subject'>{w.subject_name}</span>
                  <div className='severity-badge' style={{ background: severity.color }}>
                    <span className='severity-text'>{severity.label}</span>
                  </div>
                </div>
                <p className='kp-name'>{w.knowledge_point_name}</p>
                <p className='detected-at'>发现时间: {new Date(w.detected_at).toLocaleDateString()}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
