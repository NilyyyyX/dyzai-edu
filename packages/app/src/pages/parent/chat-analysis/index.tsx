import { useState } from 'react'
import toast from 'react-hot-toast'
import { api, isApiError } from '../../../utils/api'
import './index.css'

interface AnalysisResult {
  knowledge_points: string[]
  weaknesses: string[]
  summary: string
  recommendations: string[]
}

export default function ChatAnalysisPage() {
  const [chatText, setChatText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!chatText.trim()) {
      toast.error('请粘贴聊天记录')
      return
    }

    if (chatText.length < 50) {
      toast.error('聊天记录太短，请提供更多内容')
      return
    }

    try {
      setLoading(true)
      setResult(null)
      const res = await api.analyzeChatRecord({ chat_text: chatText })
      setResult(res)
      toast.success('分析完成')
    } catch (err) {
      const message = isApiError(err) ? err.message : '分析失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!result) return

    try {
      setLoading(true)
      await api.saveWeaknesses({
        weaknesses: result.weaknesses,
        knowledge_points: result.knowledge_points
      })
      toast.success('已保存到薄弱点库')
    } catch (err) {
      const message = isApiError(err) ? err.message : '保存失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='chat-analysis-page'>
      <div className='page-header'>
        <h1>聊天记录分析</h1>
        <p>粘贴家教发送的学习情况，AI 自动分析薄弱项</p>
      </div>

      <div className='input-section'>
        <label>聊天记录</label>
        <textarea
          className='chat-input'
          placeholder='请粘贴家教发送的学习情况消息...&#10;&#10;例如：&#10;老师：今天数学课学习了分数的加减法，小明做对了8道题，错2道&#10;老师：英语单词听写10个对了7个，apple和banana拼错了&#10;老师：语文阅读理解做得不错，但生字"鼎"写错了'
          value={chatText}
          onChange={(e) => setChatText(e.target.value)}
          rows={12}
        />
        <div className='char-count'>{chatText.length} 字</div>
      </div>

      <div className='action-buttons'>
        <button
          className='btn-primary'
          onClick={handleAnalyze}
          disabled={loading || !chatText.trim()}
        >
          {loading ? '分析中...' : '开始分析'}
        </button>
        {result && (
          <button
            className='btn-secondary'
            onClick={handleSave}
            disabled={loading}
          >
            保存到薄弱点库
          </button>
        )}
      </div>

      {loading && (
        <div className='loading-section'>
          <div className='spinner'></div>
          <p>正在分析聊天记录，请稍候...</p>
        </div>
      )}

      {result && !loading && (
        <div className='result-section'>
          <div className='result-card'>
            <h3>📊 分析总结</h3>
            <p className='summary'>{result.summary}</p>
          </div>

          <div className='result-card'>
            <h3>📚 涉及的知识点</h3>
            <ul className='kp-list'>
              {result.knowledge_points.map((kp, i) => (
                <li key={i} className='kp-item'>{kp}</li>
              ))}
            </ul>
          </div>

          <div className='result-card weak'>
            <h3>⚠️ 发现的薄弱项</h3>
            <ul className='weak-list'>
              {result.weaknesses.map((w, i) => (
                <li key={i} className='weak-item'>{w}</li>
              ))}
            </ul>
          </div>

          <div className='result-card tip'>
            <h3>💡 学习建议</h3>
            <ul className='tip-list'>
              {result.recommendations.map((r, i) => (
                <li key={i} className='tip-item'>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
