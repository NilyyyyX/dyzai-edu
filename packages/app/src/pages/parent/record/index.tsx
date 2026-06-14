import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { RecordType } from '@learning/shared'
import { api, isApiError } from '../../../utils/api'
import { SUBJECTS } from '@learning/shared'
import './index.css'

interface RecordForm {
  student_id: number | ''
  subject_id: number
  type: RecordType
  title: string
  score: string
  total_score: string
  record_date: string
}

export default function RecordPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RecordForm>({
    student_id: '',
    subject_id: 1,
    type: 'exam',
    title: '',
    score: '',
    total_score: '100',
    record_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  const validateForm = (): string | null => {
    if (!form.student_id) {
      return '请输入学生ID'
    }
    if (typeof form.student_id === 'string' || form.student_id <= 0) {
      return '学生ID必须为正整数'
    }
    if (!form.title.trim()) {
      return '请输入标题'
    }
    if (!form.score) {
      return '请输入得分'
    }
    const score = parseFloat(form.score)
    const total = parseFloat(form.total_score)
    if (isNaN(score) || score < 0) {
      return '得分必须大于等于0'
    }
    if (isNaN(total) || total <= 0) {
      return '总分必须大于0'
    }
    if (score > total) {
      return '得分不能超过总分'
    }
    const today = new Date().toISOString().split('T')[0]
    if (form.record_date > today) {
      return '日期不能晚于今天'
    }
    return null
  }

  const handleSubmit = async () => {
    const error = validateForm()
    if (error) {
      toast.error(error)
      return
    }

    try {
      setLoading(true)
      await api.createLearningRecord({
        student_id: form.student_id,
        subject_id: form.subject_id,
        type: form.type,
        title: form.title,
        score: parseFloat(form.score),
        total_score: parseFloat(form.total_score),
        record_date: form.record_date,
      })
      toast.success('录入成功')
      setTimeout(() => navigate(-1), 1000)
    } catch (err) {
      const message = isApiError(err) ? err.message : '录入失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const subjects = SUBJECTS as unknown as any[]

  return (
    <div className='record-page'>
      <div className='form-card'>
        <div className='form-group'>
          <label className='label'>学生ID</label>
          <input
            className='input'
            type='number'
            placeholder='请输入学生ID'
            value={form.student_id.toString()}
            onChange={(e) => setForm({ ...form, student_id: parseInt(e.target.value) || '' })}
          />
        </div>

        <div className='form-group'>
          <label className='label'>科目</label>
          <select
            className='select'
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: parseInt(e.target.value) })}
          >
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className='form-group'>
          <label className='label'>类型</label>
          <select
            className='select'
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as RecordType })}
          >
            <option value='exam'>考试</option>
            <option value='quiz'>测验</option>
            <option value='homework'>作业</option>
            <option value='feedback'>反馈</option>
          </select>
        </div>

        <div className='form-group'>
          <label className='label'>标题</label>
          <input
            className='input'
            placeholder='如：第一单元测试'
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className='form-row'>
          <div className='form-group half'>
            <label className='label'>得分</label>
            <input
              className='input'
              type='number'
              placeholder='得分'
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
            />
          </div>
          <div className='form-group half'>
            <label className='label'>总分</label>
            <input
              className='input'
              type='number'
              placeholder='总分'
              value={form.total_score}
              onChange={(e) => setForm({ ...form, total_score: e.target.value })}
            />
          </div>
        </div>

        <div className='form-group'>
          <label className='label'>日期</label>
          <input
            className='input'
            type='date'
            value={form.record_date}
            onChange={(e) => setForm({ ...form, record_date: e.target.value })}
          />
        </div>

        <button className='btn-submit' onClick={handleSubmit} disabled={loading}>
          {loading ? '提交中...' : '提交'}
        </button>
      </div>
    </div>
  )
}
