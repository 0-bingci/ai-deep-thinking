'use client'

import { useState } from 'react'
import { FaCogs, FaPencilAlt, FaHistory, FaComment, FaCopy, FaSync, FaExpand, FaLightbulb, FaQuestionCircle, FaCheckCircle, FaCheckCircle as FaCheckCircleSolid } from 'react-icons/fa'

export default function MainFunction() {
  const [currentFunction, setCurrentFunction] = useState<'function-expand' | 'analysis'>('function-expand')
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showInitial, setShowInitial] = useState(true)
  const [showResult, setShowResult] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // 处理功能选择变化
  const handleFunctionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFunction(e.target.value === '功能拓展建议' ? 'function-expand' : 'analysis')
    setShowInitial(true)
    setShowResult(false)
    setShowAnalysis(false)
  }

  // 提交按钮点击事件
  const handleSubmit = () => {
    if (!userInput.trim()) {
      alert('请输入你的想法或观点')
      return
    }

    setIsLoading(true)
    setShowInitial(false)
    setShowResult(false)
    setShowAnalysis(false)

    // 模拟AI处理延迟
    setTimeout(() => {
      setIsLoading(false)
      if (currentFunction === 'function-expand') {
        setShowResult(true)
      } else {
        setShowAnalysis(true)
      }
    }, 1500)
  }

  // 清空按钮点击事件
  const handleClear = () => {
    setUserInput('')
    setShowInitial(true)
    setShowResult(false)
    setShowAnalysis(false)
  }

  // 复制按钮点击事件
  const handleCopy = () => {
    let textToCopy = ''
    
    if (showResult) {
      textToCopy = document.getElementById('result-content')?.textContent || ''
    } else if (showAnalysis) {
      textToCopy = document.getElementById('analysis-content')?.textContent || ''
    }
    
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy.trim())
      setShowToast(true)
      
      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    }
  }

  // 重新生成按钮点击事件
  const handleRegenerate = () => {
    if (!userInput.trim()) {
      alert('请输入你的想法或观点')
      return
    }

    setIsLoading(true)
    setShowResult(false)
    setShowAnalysis(false)

    // 模拟AI处理延迟
    setTimeout(() => {
      setIsLoading(false)
      if (currentFunction === 'function-expand') {
        setShowResult(true)
      } else {
        setShowAnalysis(true)
      }
    }, 1500)
  }

  return (
    <section className="max-w-4xl mx-auto px-4">
      {/* 移动端单列布局，桌面端两列布局 */}
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
                {/* <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg> */}
                清空输入
              </button>
            </div>
          </div>

          {/* 历史记录 - 在移动端作为底部组件显示 */}
          <div className="bg-white rounded-xl shadow-md p-6 card-hover hidden md:block md:order-3">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FaHistory className="text-primary mr-2" />
              历史记录
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
              <div 
                className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setUserInput('实现一个小红书首页效果')}
              >
                实现一个小红书首页效果
              </div>
              <div 
                className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setUserInput('大学生就应该大一寒假就开始学习')}
              >
                大学生就应该大一寒假就开始学习
              </div>
              <div 
                className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setUserInput('如何提高前端开发效率')}
              >
                如何提高前端开发效率
              </div>
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
                >
                  <FaCopy />
                </button>
                <button 
                  onClick={handleRegenerate}
                  className="text-gray-500 hover:text-primary p-2 rounded-full hover:bg-gray-100 transition-colors" 
                  title="重新生成"
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

            {/* 结果展示区域 */}
            {showResult && !isLoading && (
              <div id="result-content" className="flex-1 overflow-y-auto pr-2">
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-700 mb-2">你的输入：</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm italic">
                    {userInput || '实现一个小红书首页效果'}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-sm">
                        <FaExpand size={16} />
                      </span>
                      可扩展的功能方向
                    </h4>
                    <ul className="space-y-3 pl-8">
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>除了完成基本的样式布局，如瀑布流展示，还可以实现虚拟列表来优化大量数据渲染性能</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>实现图片和内容的预加载机制，提升用户浏览体验</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>添加无限滚动功能，实现内容的按需加载</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>实现内容缓存策略，减少重复请求，提升页面加载速度</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>添加交互反馈，如点赞、收藏、评论的动画效果</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center mr-2 text-sm">
                        <FaLightbulb size={16} />
                      </span>
                      技术实现建议
                    </h4>
                    <ul className="space-y-3 pl-8">
                      <li className="flex items-start">
                        <span className="text-accent mr-2 mt-1">•</span>
                        <span>使用CSS Grid或Flexbox实现瀑布流布局，或考虑使用成熟的第三方库如Masonry</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2 mt-1">•</span>
                        <span>虚拟列表可考虑使用react-window或vue-virtual-scroller等库</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-accent mr-2 mt-1">•</span>
                        <span>图片懒加载可使用Intersection Observer API实现</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 观点分析结果 */}
            {showAnalysis && !isLoading && (
              <div id="analysis-content" className="flex-1 overflow-y-auto pr-2">
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-700 mb-2">你的输入：</h4>
                  <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm italic">
                    {userInput || '大学生就应该大一寒假就开始学习'}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-sm">
                        <FaQuestionCircle size={16} />
                      </span>
                      Why：背后的原因与逻辑
                    </h4>
                    <ul className="space-y-3 pl-8">
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>提前积累知识和技能，为未来的职业发展或深造打下基础</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>利用寒假时间弥补薄弱环节，避免后续学习压力过大</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>培养自律习惯，形成良好的学习态度和时间管理能力</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-primary mr-2 mt-1">•</span>
                        <span>在竞争激烈的就业市场中提前获得优势</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mr-2 text-sm">
                        <FaCheckCircle size={16} />
                      </span>
                      How：可操作的建议
                    </h4>
                    <ul className="space-y-3 pl-8">
                      <li className="flex items-start">
                        <span className="text-secondary mr-2 mt-1">•</span>
                        <span>制定合理的学习计划，平衡学习与休息，避免 burnout</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-secondary mr-2 mt-1">•</span>
                        <span>结合专业方向选择学习内容，可先从基础课程或感兴趣的领域入手</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-secondary mr-2 mt-1">•</span>
                        <span>寻找学习伙伴或加入学习小组，提高学习动力和效率</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-secondary mr-2 mt-1">•</span>
                        <span>尝试将所学知识应用到实际项目中，如参与开源项目或个人小项目</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 移动端历史记录 - 显示在结果区下方 */}
      <div className="mt-6 bg-white rounded-xl shadow-md p-6 card-hover md:hidden">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaHistory className="text-primary mr-2" />
          历史记录
        </h3>
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
          <div 
            className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setUserInput('实现一个小红书首页效果')}
          >
            实现一个小红书首页效果
          </div>
          <div 
            className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setUserInput('大学生就应该大一寒假就开始学习')}
          >
            大学生就应该大一寒假就开始学习
          </div>
          <div 
            className="p-2 bg-gray-50 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => setUserInput('如何提高前端开发效率')}
          >
            如何提高前端开发效率
          </div>
        </div>
      </div>

      {/* 复制成功提示 - 在移动端居中显示 */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-dark text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 flex items-center">
          <FaCheckCircleSolid className="mr-2" />
          <span>复制成功！</span>
        </div>
      )}
    </section>
  )
}