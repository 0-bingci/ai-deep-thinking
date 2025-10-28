// app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FaLightbulb, 
  FaBars, 
  FaSearch, 
  FaFilter, 
  FaFolderOpen, 
  FaEye, 
  FaCopy, 
  FaTrash, 
  FaChevronLeft, 
  FaChevronRight,   
  FaCheckCircle 
} from 'react-icons/fa';

export default function HistoryPage() {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [scrolled, setScrolled] = useState(false);

  // 模拟历史记录数据
  const historyItems = [
    {
      id: 1,
      type: 'function',
      title: '实现一个小红书首页效果',
      preview: '除了完成基本的样式布局，如瀑布流展示，还可以实现虚拟列表来优化大量数据渲染性能...',
      date: '2023-11-15 14:30'
    },
    {
      id: 2,
      type: 'analysis',
      title: '大学生就应该大一寒假就开始学习',
      preview: 'Why：提前积累知识和技能，为未来的职业发展或深造打下基础；利用寒假时间弥补薄弱环节...',
      date: '2023-11-12 09:15'
    },
    {
      id: 3,
      type: 'function',
      title: '如何提高前端开发效率',
      preview: '可扩展的功能方向：1. 引入代码片段管理工具，实现常用代码的快速复用；2. 配置自动化测试流程...',
      date: '2023-11-10 16:45'
    },
    {
      id: 4,
      type: 'analysis',
      title: '每天应该花多少时间学习编程',
      preview: 'Why：编程学习需要持续投入才能形成肌肉记忆和思维模式；分散式学习比突击式学习效果更好...',
      date: '2023-11-08 11:20'
    }
  ];

  // 滚动监听 - 用于导航栏样式变化
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 显示提示消息
  const showActionToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 处理删除操作
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这条记录吗？')) {
      showActionToast('记录已删除');
      // 实际项目中这里会有API调用删除数据
    }
  };

  // 处理复制操作
  const handleCopy = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    showActionToast('结果已复制');
    // 实际项目中这里会复制对应记录的内容
  };

  // 处理筛选切换
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 页面标题区域 */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-dark">历史记录</h2>
              <p className="text-gray-600">查看和管理你的所有分析记录</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="搜索记录..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all w-full md:w-64"
                />
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-all duration-300 flex items-center">
                <FaFilter className="mr-2" />
                <span className="hidden md:inline">筛选</span>
              </button>
            </div>
          </div>
        </section>

        {/* 历史记录列表 */}
        <section className="max-w-5xl mx-auto">
          {/* 记录筛选标签 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button 
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeFilter === 'all' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleFilterChange('all')}
            >
              全部记录
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeFilter === 'function' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleFilterChange('function')}
            >
              功能拓展建议
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeFilter === 'analysis' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleFilterChange('analysis')}
            >
              观点深度分析
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeFilter === 'week' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleFilterChange('week')}
            >
              本周
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                activeFilter === 'month' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => handleFilterChange('month')}
            >
              本月
            </button>
          </div>

          {/* 历史记录为空状态 (默认隐藏) */}
          {/* <div id="empty-state" className="bg-white rounded-xl shadow-md p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <FaFolderOpenO className="text-primary text-2xl" />
            </div>
            <h3 className="text-lg font-medium mb-2">暂无历史记录</h3>
            <p className="text-gray-500 mb-6">你的分析记录将保存在这里，开始使用AI深度思考助手吧</p>
            <Link href="/" className="inline-block bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              返回首页
            </Link>
          </div> */}

          {/* 历史记录列表 */}
          <div className="space-y-4">
            {historyItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl shadow-sm overflow-hidden card-hover group"
              >
                <div className="p-5 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full mb-2 ${
                        item.type === 'function' 
                          ? 'bg-blue-50 text-primary' 
                          : 'bg-green-50 text-secondary'
                      }`}>
                        {item.type === 'function' ? '功能拓展建议' : '观点深度分析'}
                      </span>
                      <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    </div>
                    
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors" 
                        title="查看详情"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-full transition-colors" 
                        title="复制结果"
                        onClick={(e) => handleCopy(item.id, e)}
                      >
                        <FaCopy />
                      </button>
                      <button 
                        className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors" 
                        title="删除"
                        onClick={(e) => handleDelete(item.id, e)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.preview}
                  </p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{item.date}</span>
                    <Link href="#" className="text-primary hover:underline">查看完整结果</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页控件 */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-1">
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-colors">
                <FaChevronLeft className="text-xs" />
              </button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-black">1</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors">2</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors">3</button>
              <span className="text-gray-500">...</span>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:border-primary hover:text-primary transition-colors">8</button>
              <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-primary hover:text-primary transition-colors">
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        </section>
      </main>
      {/* 操作提示弹窗 */}
      <div className={`fixed bottom-6 right-6 bg-dark text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 flex items-center ${
        showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}>
        <FaCheckCircle className="mr-2" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}