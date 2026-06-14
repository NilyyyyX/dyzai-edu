import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import type { AnalysisReport } from '@learning/shared'
import { api, isApiError } from '../../../utils/api'
import './index.css'

export default function ReportPage() {
  const [report, setReport] = useState<AnalysisReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [triggering, setTriggering] = useState(false)

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const students = await api.getStudents()
      if (students.length > 0) {
        const data = await api.getLatestReport(String(students[0].id))
        setReport(data)
      }
    } catch (err) {
      const message = isApiError(err) ? err.message : '加载失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerAnalysis = async () => {
    try {
      setTriggering(true)
      const students = await api.getStudents()
      if (students.length > 0) {
        const result = await api.triggerAnalysis(String(students[0].id), { report_type: 'weekly' })
        setReport(result)
        toast.success('分析完成')
      }
    } catch (err) {
      const message = isApiError(err) ? err.message : '分析失败'
      toast.error(message)
    } finally {
      setTriggering(false)
    }
  }

  if (loading) {
    return <div className='loading'>加载中...</div>
  }

  return (
    <div className='report-page'>
      <div className='report-actions'>
        <button className='btn-mini' onClick={handleTriggerAnalysis} disabled={triggering}>
          {triggering ? '分析中...' : '生成分析报告'}
        </button>
        <button className='btn-mini' onClick={fetchReport}>刷新</button>
      </div>

      {!report && (
        <div className='empty'>
          <p>暂无分析报告</p>
          <p className='hint'>点击"生成分析报告"开始AI分析</p>
        </div>
      )}

      {report && (
        <div className='report-content'>
          <div className='section'>
            <h3 className='section-title'>学习总结</h3>
            <p className='section-text'>{report.summary}</p>
          </div>

          <div className='section'>
            <h3 className='section-title'>知识强项</h3>
            {report.strengths?.map((s, i) => (
              <div key={i} className='item good'>
                <span>✓ {typeof s === 'string' ? s : s.knowledge_point}</span>
              </div>
            ))}
          </div>

          <div className='section'>
            <h3 className='section-title'>薄弱知识点</h3>
            {report.weaknesses?.map((w, i) => (
              <div key={i} className='item weak'>
                <span>✗ {w.knowledge_point}</span>
                {w.severity && <span className='severity'>({w.severity === 'mild' ? '轻度' : w.severity === 'moderate' ? '中度' : '重度'})</span>}
              </div>
            ))}
          </div>

          <div className='section'>
            <h3 className='section-title'>学习建议</h3>
            {report.recommendations?.map((r, i) => (
              <div key={i} className='item tip'>
                <span>💡 {typeof r === 'string' ? r : r.action}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
