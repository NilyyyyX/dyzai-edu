import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Student, HomeworkLog } from '@learning/shared'
import { api, isApiError } from '../../../utils/api'
import './index.css'

interface StudentProfileData {
  student: Student
  today_homework: HomeworkLog[]
  weakness_count: number
  points: number
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<StudentProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await api.getProfile()
      setProfile(data)
    } catch (err) {
      const message = isApiError(err) ? err.message : '加载失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className='loading'>加载中...</div>

  return (
    <div className='student-page'>
      <div className='header'>
        <div className='user-info'>
          <h2 className='name'>{profile?.student?.name || '学生'}</h2>
          <p className='grade'>{profile?.student?.grade}年级</p>
        </div>
      </div>

      <div className='stats-grid'>
        <div className='stat-card'>
          <p className='stat-value'>{profile?.points || 0}</p>
          <p className='stat-label'>积分</p>
        </div>
        <div className='stat-card warning'>
          <p className='stat-value'>{profile?.weakness_count || 0}</p>
          <p className='stat-label'>薄弱点</p>
        </div>
      </div>

      <div className='menu-list'>
        <div className='menu-item' onClick={() => navigate('/student/homework')}>
          <span className='menu-icon'>📝</span>
          <div className='menu-content'>
            <h3 className='menu-title'>作业打卡</h3>
            <p className='menu-desc'>记录今日作业</p>
          </div>
          <span className='menu-arrow'>→</span>
        </div>

        <div className='menu-item' onClick={() => navigate('/student/weaknesses')}>
          <span className='menu-icon'>🎯</span>
          <div className='menu-content'>
            <h3 className='menu-title'>薄弱知识点</h3>
            <p className='menu-desc'>查看需要加强的知识点</p>
          </div>
          <span className='menu-arrow'>→</span>
        </div>
      </div>
    </div>
  )
}
