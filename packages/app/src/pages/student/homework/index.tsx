import { useState } from 'react'
import toast from 'react-hot-toast'
import type { CreateHomeworkLogInput } from '@learning/shared'
import { api, isApiError } from '../../../utils/api'
import { SUBJECTS } from '@learning/shared'
import './index.css'

export default function HomeworkPage() {
  const [form, setForm] = useState<CreateHomeworkLogInput>({
    subject_id: 1,
    status: 'completed',
    difficulty_rating: 3,
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await api.createHomeworkLog(form)
      toast.success('打卡成功 +5积分')
      setForm({ ...form, notes: '' })
    } catch (err) {
      const message = isApiError(err) ? err.message : '打卡失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='homework-page'>
      <div className='form-card'>
        <div className='form-group'>
          <label className='label'>科目</label>
          <select
            className='select'
            value={form.subject_id}
            onChange={(e) => setForm({ ...form, subject_id: parseInt(e.target.value) })}
          >
            {(SUBJECTS as unknown as any[]).map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className='form-group'>
          <label className='label'>完成状态</label>
          <select
            className='select'
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
          >
            <option value='completed'>已完成</option>
            <option value='partial'>部分完成</option>
            <option value='not_done'>未完成</option>
          </select>
        </div>

        <div className='form-group'>
          <label className='label'>难度评分 (1-5)</label>
          <div className='rating'>
            {[1, 2, 3, 4, 5].map(n => (
              <span
                key={n}
                className={`star ${n <= (form.difficulty_rating || 0) ? 'active' : ''}`}
                onClick={() => setForm({ ...form, difficulty_rating: n })}
              >
                ⭐
              </span>
            ))}
          </div>
        </div>

        <div className='form-group'>
          <label className='label'>备注</label>
          <textarea
            className='textarea'
            placeholder='今天作业的感受...'
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            maxLength={200}
          />
        </div>

        <button className='btn-submit' onClick={handleSubmit} disabled={loading}>
          {loading ? '提交中...' : '提交打卡'}
        </button>
      </div>
    </div>
  )
}
