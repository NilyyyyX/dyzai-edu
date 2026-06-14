import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Student } from '@learning/shared'
import { api, isApiError } from '../../../utils/api'
import './index.css'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const list = await api.getStudents()
      setStudents(list)
      if (list.length > 0) {
        setSelectedStudent(list[0])
      }
    } catch (err) {
      const message = isApiError(err) ? err.message : '加载失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (url: string) => {
    if (!selectedStudent) {
      toast.error('请先选择孩子')
      return
    }
    navigate(url)
  }

  return (
    <div className='dashboard-page'>
      <div className='header'>
        <h1 className='title'>家长中心</h1>
      </div>

      <div className='student-selector'>
        <p className='section-label'>选择孩子：</p>
        <div className='student-list'>
          {students.map(s => (
            <div
              key={s.id}
              className={`student-card ${selectedStudent?.id === s.id ? 'active' : ''}`}
              onClick={() => setSelectedStudent(s)}
            >
              <span className='student-name'>{s.name}</span>
              <span className='student-grade'>{s.grade}年级</span>
            </div>
          ))}
        </div>
      </div>

      <div className='action-grid'>
        <div className='action-card' onClick={() => handleNavigate('/parent/record')}>
          <span className='action-icon'>📝</span>
          <span className='action-title'>录入成绩</span>
          <span className='action-desc'>录入考试/作业成绩</span>
        </div>

        <div className='action-card' onClick={() => handleNavigate('/parent/report')}>
          <span className='action-icon'>📊</span>
          <span className='action-title'>分析报告</span>
          <span className='action-desc'>查看学情分析报告</span>
        </div>

        <div className='action-card' onClick={() => {
          if (!selectedStudent) return
          navigate(`/parent/report?studentId=${selectedStudent.id}&trigger=true`)
        }}>
          <span className='action-icon'>🤖</span>
          <span className='action-title'>AI分析</span>
          <span className='action-desc'>生成智能分析报告</span>
        </div>

        <div className='action-card' onClick={() => handleNavigate('/parent/chat-analysis')}>
          <span className='action-icon'>💬</span>
          <span className='action-title'>聊天记录分析</span>
          <span className='action-desc'>分析家教发送的学习情况</span>
        </div>
      </div>

      {loading && <p className='loading'>加载中...</p>}
    </div>
  )
}
