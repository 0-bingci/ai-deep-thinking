'use client'

import { useState, useEffect } from 'react'
import { FaCogs, FaPencilAlt, FaHistory, FaComment, FaCopy, FaSync, FaExpand, FaLightbulb, FaQuestionCircle, FaCheckCircle, FaCheckCircle as FaCheckCircleSolid } from 'react-icons/fa'

export default function MainFunction() {
  const [currentFunction, setCurrentFunction] = useState<'function-expand' | 'analysis'>('function-expand')
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInitial, setShowInitial] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [db, setDb] = useState<IDBDatabase | null>(null)
  const [historyList, setHistoryList] = useState<any[]>([])

   // 初始化 IndexedDB
  const initIndexedDB = () => {
    // 兼容浏览器全局对象（避免 SSR 残留问题）
    if (typeof window === 'undefined' || !window.indexedDB) return

    const request = window.indexedDB.open('aiAnalysisDB', 1)
    
    // 数据库创建/升级时触发
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id', autoIncrement: true })
      }
    }
    
    // 数据库打开成功后，立即加载历史记录
    request.onsuccess = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result
      setDb(dbInstance)
      loadHistory(dbInstance) // 直接传入数据库实例，避免依赖状态更新
    }
    
    // 错误处理
    request.onerror = (event) => {
      console.error('IndexedDB 初始化失败：', (event.target as IDBOpenDBRequest).error)
    }
  }

  // 加载历史记录（接收 db 实例参数，确保拿到有效连接）
  const loadHistory = (dbInstance: IDBDatabase) => {
    if (!dbInstance) return

    try {
      const transaction = dbInstance.transaction('history', 'readonly')
      const store = transaction.objectStore('history')
      const request = store.getAll()

      request.onsuccess = () => {
        const result = request.result as Array<{
          id: number
          inputText: string
          functionType: string
          result: any
          createdAt: string
        }>
        
        // 按时间倒序排列（最新的在前）
        const sortedHistory = result.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        
        setHistoryList(sortedHistory)
      }

      request.onerror = () => {
        console.error('加载历史记录失败：', request.error)
      }
    } catch (error) {
      console.error('加载历史记录异常：', error)
    }
  }

  // 保存记录到 IndexedDB
  const saveToHistory = (inputText: string, result: any) => {
    if (!db || !inputText) return

    try {
      const transaction = db.transaction('history', 'readwrite')
      const store = transaction.objectStore('history')
      const record = {
        inputText,
        functionType: currentFunction,
        result,
        createdAt: new Date().toISOString()
      }
      store.add(record)

      // 保存成功后刷新历史记录
      transaction.oncomplete = () => {
        loadHistory(db) // 传入当前 db 实例，确保加载最新数据
      }

      transaction.onerror = () => {
        console.error('保存历史记录失败：', transaction.error)
      }
    } catch (error) {
      console.error('保存历史记录异常：', error)
    }
  }

  // 删除历史记录
  const deleteHistoryItem = (id: number) => {
    if (!db) return

    try {
      const transaction = db.transaction('history', 'readwrite')
      const store = transaction.objectStore('history')
      store.delete(id)

      // 删除成功后刷新历史记录
      transaction.oncomplete = () => {
        loadHistory(db)
      }

      transaction.onerror = () => {
        console.error('删除历史记录失败：', transaction.error)
      }
    } catch (error) {
      console.error('删除历史记录异常：', error)
    }
  }

  // 组件挂载时初始化数据库，刷新后重新加载
  useEffect(() => {
    initIndexedDB()

    // 组件卸载时关闭数据库连接
    return () => {
      if (db) {
        db.close()
      }
    }
  }, [])

  // 数据库实例变化时，重新加载历史记录（关键修复）
  useEffect(() => {
    if (db) {
      loadHistory(db)
    }
  }, [db])


  const handleFunctionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFunction(e.target.value === '功能拓展建议' ? 'function-expand' : 'analysis')
    setShowInitial(true)
    setShowResult(false)
    setShowAnalysis(false)
    setAiResult(null)
  }

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert('请输入你的想法或观点')
      return
    }

    setIsLoading(true)
    setShowInitial(false)
    setShowResult(false)
    setShowAnalysis(false)
    setAiResult(null)

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: userInput, functionType: currentFunction }),
      })

      const data = await response.json()
      if (data.success) {
        setAiResult(data.data.result)
        saveToHistory(userInput, data.data.result)
        currentFunction === 'function-expand' ? setShowResult(true) : setShowAnalysis(true)
      } else {
        alert('AI 分析失败：' + (data.error || '未知错误'))
        setShowInitial(true)
      }
    } catch (error) {
      console.error('API 请求失败：', error)
      alert('服务器错误，请重试')
      setShowInitial(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setUserInput('')
    setShowInitial(true)
    setShowResult(false)
    setShowAnalysis(false)
    setAiResult(null)
  }

  const handleCopy = () => {
    if (!aiResult) return

    let textToCopy = aiResult.sections.map((section: any) => 
      `${section.title}\n${section.items.map((item: string) => `- ${item}`).join('\n')}`
    ).join('\n\n')

    navigator.clipboard.writeText(textToCopy.trim())
    setShowToast(true)
    
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleRegenerate = async () => {
    if (!userInput.trim()) {
      alert('请输入你的想法或观点')
      return
    }

    setIsLoading(true)
    setShowResult(false)
    setShowAnalysis(false)
    setAiResult(null)

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputText: userInput, functionType: currentFunction }),
      })

      const data = await response.json()
      if (data.success) {
        setAiResult(data.data.result)
        currentFunction === 'function-expand' ? setShowResult(true) : setShowAnalysis(true)
      } else {
        alert('AI 分析失败：' + (data.error || '未知错误'))
        setShowInitial(true)
      }
    } catch (error) {
      console.error('API 请求失败：', error)
      alert('服务器错误，请重试')
      setShowInitial(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* 左侧输入区 */}
        <div className="md:col-span-5 space-y-6">
          {/* 功能选择卡片 */}
          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaCogs className="text-primary mr-2" />
              选择功能
            </h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="function" 
                  value="功能拓展建议"
                  className="mr-3 text-primary" 
                  checked={currentFunction === 'function-expand'}
                  onChange={handleFunctionChange}
                />
                <span>功能拓展建议</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="radio" 
                  name="function" 
                  value="观点深度分析"
                  className="mr-3 text-primary" 
                  checked={currentFunction === 'analysis'}
                  onChange={handleFunctionChange}
                />
                <span>观点深度分析 (Why/How)</span>
              </label>
            </div>
          </div>

          {/* 输入卡片 */}
          <div className="bg-white rounded-xl shadow-md p-6 card-hover">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaPencilAlt className="text-primary mr-2" />
              输入你的想法
            </h3>
            <div className="space-y-4">
              <textarea 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={6} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                placeholder="例如：我需要实现一个小红书的首页"
              />
              <button 
                onClick={handleSubmit}
                className="w-full bg-primary hover:bg-primary/90 text-gray-700 py-3 px-4 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                获取深度分析
              </button>
              <button 
                onClick={handleClear}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-all duration-300"
              >
                清空输入
              </button>
            </div>
          </div>

          {/* 历史记录 - 桌面端 */}
          <div className="bg-white rounded-xl shadow-md p-6 card-hover hidden md:block md:order-3">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaHistory className="text-primary mr-2" />
              历史记录
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              {historyList.length === 0 ? (
                <p className="text-sm text-gray-500">暂无历史记录</p>
              ) : (
                historyList.map((item) => (
                  <div 
                    key={item.id}
                    className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center"
                  >
                    <span onClick={() => setUserInput(item.inputText)}>
                      {item.inputText.length > 20 
                        ? `${item.inputText.slice(0, 20)}...` 
                        : item.inputText}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteHistoryItem(item.id)
                      }}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      删除
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右侧结果区 */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-xl shadow-md p-6 h-full flex flex-col card-hover">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <FaComment className="text-primary mr-2" />
                AI 分析结果
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors" 
                  title="复制结果"
                  disabled={!aiResult}
                >
                  <FaCopy />
                </button>
                <button 
                  onClick={handleRegenerate}
                  className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors" 
                  title="重新生成"
                  disabled={isLoading || !userInput.trim()}
                >
                  <FaSync className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* 加载状态 */}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500">AI正在深度思考中...</p>
              </div>
            )}

            {/* 初始提示状态 */}
            {showInitial && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <FaLightbulb className="text-primary text-2xl" />
                </div>
                <h4 className="text-lg font-medium mb-2">等待你的想法输入</h4>
                <p>请在左侧输入框中提交你的想法或观点，AI将为你提供深度分析</p>
              </div>
            )}

            {/* 功能拓展结果 */}
            {showResult && !isLoading && aiResult && (
              <div id="result-content" className="flex-1 overflow-y-auto pr-2">
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-700 mb-2">你的输入：</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm italic">
                    {userInput}
                  </div>
                </div>

                <div className="space-y-6">
                  {aiResult.sections.map((section: any, index: number) => (
                    <div key={index}>
                      <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-sm">
                          {section.title.includes('拓展') ? <FaExpand size={16} /> : <FaLightbulb size={16} />}
                        </span>
                        {section.title}
                      </h4>
                      <ul className="space-y-3 pl-8">
                        {section.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-primary mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 观点分析结果 */}
            {showAnalysis && !isLoading && aiResult && (
              <div id="analysis-content" className="flex-1 overflow-y-auto pr-2">
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-700 mb-2">你的输入：</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm italic">
                    {userInput}
                  </div>
                </div>

                <div className="space-y-6">
                  {aiResult.sections.map((section: any, index: number) => (
                    <div key={index}>
                      <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-sm">
                          {section.title.includes('Why') ? <FaQuestionCircle size={16} /> : <FaCheckCircle size={16} />}
                        </span>
                        {section.title}
                      </h4>
                      <ul className="space-y-3 pl-8">
                        {section.items.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className="flex items-start">
                            <span className="text-secondary mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 移动端历史记录 */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 card-hover md:hidden">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaHistory className="text-primary mr-2" />
          历史记录
        </h3>
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
          {historyList.length === 0 ? (
            <p className="text-sm text-gray-500">暂无历史记录</p>
          ) : (
            historyList.map((item) => (
              <div 
                key={item.id}
                className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors flex justify-between items-center"
              >
                <span onClick={() => setUserInput(item.inputText)}>
                  {item.inputText.length > 20 
                    ? `${item.inputText.slice(0, 20)}...` 
                    : item.inputText}
                </span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteHistoryItem(item.id)
                  }}
                  className="text-gray-400 hover:text-red-500 text-xs"
                >
                  删除
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 复制成功提示 */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-dark text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center">
          <FaCheckCircleSolid className="mr-2" />
          <span>复制成功！</span>
        </div>
      )}
    </section>
  )
}