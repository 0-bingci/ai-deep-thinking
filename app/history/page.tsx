'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaLightbulb,
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
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化 IndexedDB 并加载历史记录
  const initIndexedDB = () => {
    if (typeof window === 'undefined' || !window.indexedDB) return;

    const request = window.indexedDB.open('aiAnalysisDB', 1);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains('history')) {
        dbInstance.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      setDb(dbInstance);
      loadHistory(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB 初始化失败：', (event.target as IDBOpenDBRequest).error);
      setIsLoading(false);
    };
  };

  // 加载历史记录
  const loadHistory = (dbInstance: IDBDatabase) => {
    if (!dbInstance) return;

    try {
      const transaction = dbInstance.transaction('history', 'readonly');
      const store = transaction.objectStore('history');
      const request = store.getAll();

      request.onsuccess = () => {
        const result = request.result as Array<{
          id: number;
          inputText: string;
          functionType: 'function-expand' | 'analysis';
          result: any;
          createdAt: string;
        }>;

        // 格式化数据（适配页面展示）
        const formattedItems = result.map(item => ({
          id: item.id,
          type: item.functionType === 'function-expand' ? 'function' : 'analysis',
          title: item.inputText,
          preview: item.result?.sections?.[0]?.items?.[0] || '查看完整分析结果',
          date: new Date(item.createdAt).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-'),
          fullResult: item.result
        }));

        // 按时间倒序排列
        formattedItems.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setHistoryItems(formattedItems);
        setIsLoading(false);
      };

      request.onerror = () => {
        console.error('加载历史记录失败：', request.error);
        setIsLoading(false);
      };
    } catch (error) {
      console.error('加载历史记录异常：', error);
      setIsLoading(false);
    }
  };

  // 滚动监听 - 用于导航栏样式变化
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 组件挂载时初始化数据库
  useEffect(() => {
    initIndexedDB();

    return () => {
      if (db) db.close();
    };
  }, []);

  // 数据库实例变化时重新加载数据
  useEffect(() => {
    if (db) {
      loadHistory(db);
    }
  }, [db]);

  // 显示提示消息
  const showActionToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 处理删除操作（从 IndexedDB 中删除）
  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!db) return;

    if (confirm('确定要删除这条记录吗？')) {
      try {
        const transaction = db.transaction('history', 'readwrite');
        const store = transaction.objectStore('history');
        store.delete(id);

        transaction.oncomplete = () => {
          showActionToast('记录已删除');
          // 重新加载数据
          loadHistory(db);
        };

        transaction.onerror = () => {
          console.error('删除记录失败：', transaction.error);
          showActionToast('删除失败，请重试');
        };
      } catch (error) {
        console.error('删除记录异常：', error);
        showActionToast('删除失败，请重试');
      }
    }
  };

  // 处理复制操作（复制完整分析结果）
  const handleCopy = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.fullResult?.sections) return;

    const textToCopy = item.fullResult.sections.map((section: any) =>
      `${section.title}\n${section.items.map((i: string) => `- ${i}`).join('\n')}`
    ).join('\n\n');

    navigator.clipboard.writeText(textToCopy.trim())
      .then(() => showActionToast('结果已复制'))
      .catch(() => showActionToast('复制失败，请重试'));
  };

  // 处理筛选切换
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
  };

  // 筛选和搜索数据
  const getFilteredItems = () => {
    let filtered = [...historyItems];

    // 筛选类型
    if (activeFilter === 'function') {
      filtered = filtered.filter(item => item.type === 'function');
    } else if (activeFilter === 'analysis') {
      filtered = filtered.filter(item => item.type === 'analysis');
    } else if (activeFilter === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(item => new Date(item.createdAt) >= oneWeekAgo);
    } else if (activeFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(item => new Date(item.createdAt) >= oneMonthAgo);
    }

    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.preview.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

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
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeFilter === 'all' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              onClick={() => handleFilterChange('all')}
            >
              全部记录
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeFilter === 'function' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              onClick={() => handleFilterChange('function')}
            >
              功能拓展建议
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeFilter === 'analysis' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              onClick={() => handleFilterChange('analysis')}
            >
              观点深度分析
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeFilter === 'week' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              onClick={() => handleFilterChange('week')}
            >
              本周
            </button>
            <button
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${activeFilter === 'month' ? 'bg-gray-200 text-black' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              onClick={() => handleFilterChange('month')}
            >
              本月
            </button>
          </div>

          {/* 加载状态 */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">加载历史记录中...</p>
            </div>
          )}

          {/* 历史记录为空状态 */}
          {!isLoading && filteredItems.length === 0 && (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <FaFolderOpen className="text-primary text-2xl" />
              </div>
              <h3 className="text-lg font-medium mb-2">暂无历史记录</h3>
              <p className="text-gray-500 mb-6">你的分析记录将保存在这里，开始使用AI深度思考助手吧</p>
              <Link href="/" className="inline-block bg-primary hover:bg-primary/90 text-black px-5 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                返回首页
              </Link>
            </div>
          )}

          {/* 历史记录列表 */}
          {!isLoading && filteredItems.length > 0 && (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden card-hover group"
                >
                  <div className="p-5 hover:bg-gray-50 transition-all duration-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full mb-2 ${item.type === 'function'
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
                          onClick={(e) => handleCopy(item, e)}
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
                      {/* 关键修改：跳转到详情页，携带记录ID */}
                      <Link href={`/history/${item.id}`} className="text-primary hover:underline">
                        查看完整结果
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 分页控件（只有数据足够多时显示） */}
          {!isLoading && filteredItems.length > 0 && filteredItems.length > 5 && (
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
          )}
        </section>
      </main>
      {/* 操作提示弹窗 */}
      <div className={`fixed bottom-6 right-6 bg-dark text-white px-4 py-2 rounded-lg shadow-lg transform transition-all duration-300 flex items-center ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}>
        <FaCheckCircle className="mr-2" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}