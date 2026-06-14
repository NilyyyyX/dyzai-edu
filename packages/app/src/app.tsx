import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ParentDashboard from './pages/parent/dashboard/index'
import ParentRecord from './pages/parent/record/index'
import ParentReport from './pages/parent/report/index'
import ChatAnalysis from './pages/parent/chat-analysis/index'
import StudentDashboard from './pages/student/dashboard/index'
import StudentHomework from './pages/student/homework/index'
import StudentWeaknesses from './pages/student/weaknesses/index'
import './app.css'

export default function App() {
  const [initialized, setInitialized] = useState(false)
  
  useEffect(() => {
    console.log('App launched.')
    setInitialized(true)
  }, [])
  
  if (!initialized) {
    return <div className="loading">加载中...</div>
  }
  
  return (
    <div id="app-root">
      <Routes>
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/parent/record" element={<ParentRecord />} />
        <Route path="/parent/report" element={<ParentReport />} />
        <Route path="/parent/chat-analysis" element={<ChatAnalysis />} />
        
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/homework" element={<StudentHomework />} />
        <Route path="/student/weaknesses" element={<StudentWeaknesses />} />
        
        <Route path="/" element={<Navigate to="/parent/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/parent/dashboard" replace />} />
      </Routes>
    </div>
  )
}
