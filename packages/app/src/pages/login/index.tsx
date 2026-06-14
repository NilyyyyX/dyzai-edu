import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api, isApiError } from '../../utils/api'
import { storage } from '../../utils/storage'
import type { User } from '@learning/shared'
import './index.css'

const PHONE_REGEX = /^1[3-9]\d{9}$/

export default function LoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = storage.get<string>('token')
    if (token) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  const validateForm = (): string | null => {
    if (!phone) {
      return '请输入手机号'
    }
    if (!PHONE_REGEX.test(phone)) {
      return '请输入有效的手机号'
    }
    if (!password) {
      return '请输入密码'
    }
    if (password.length < 6) {
      return '密码至少6位'
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
      let result
      if (isRegister) {
        result = await api.register({ phone, password, nickname: nickname || phone })
      } else {
        result = await api.login({ phone, password })
      }

      storage.set('token', result.token)
      storage.set('user', result.user)

      if (result.user.role === 'parent') {
        navigate('/parent/dashboard', { replace: true })
      } else {
        navigate('/student/dashboard', { replace: true })
      }
    } catch (err) {
      const message = isApiError(err) ? err.message : '操作失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='login-page'>
      <div className='login-header'>
        <h1 className='login-title'>学习分析小程序</h1>
        <p className='login-subtitle'>学练测评闭环分析</p>
      </div>

      <div className='login-form'>
        <div className='form-group'>
          <label className='form-label'>手机号</label>
          <input
            className='form-input'
            type='tel'
            placeholder='请输入手机号'
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
          />
        </div>

        <div className='form-group'>
          <label className='form-label'>密码</label>
          <input
            className='form-input'
            type='password'
            placeholder='请输入密码'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isRegister && (
          <div className='form-group'>
            <label className='form-label'>昵称（可选）</label>
            <input
              className='form-input'
              placeholder='请输入昵称'
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        )}

        <button className='btn-submit' onClick={handleSubmit} disabled={loading}>
          {loading ? '处理中...' : isRegister ? '注册' : '登录'}
        </button>

        <span className='toggle-link' onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
        </span>
      </div>
    </div>
  )
}
