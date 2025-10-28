'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaCopy, FaTrash, FaCheckCircle, FaExpand, FaLightbulb, FaQuestionCircle } from 'react-icons/fa';

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recordId = Number(params.id); // 获取URL中的记录ID

  const [record, setRecord] = useState<any>(null);
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 初始化IndexedDB并加载单条记录
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
      loadRecord(dbInstance, recordId);
    };

    request.onerror = (event) => {
      console.error('IndexedDB 初始化失败：', (event.target as IDBOpenDBRequest).error);
      setIsLoading(false);
    };
  };

  // 加载单条记录详情
  const loadRecord = (dbInstance: IDBDatabase, id: number) => {
    if (!dbInstance) return;

    try {
      const transaction = dbInstance.transaction('history', 'readonly');
      const store = transaction.objectStore('history');
      const request = store.get(id); // 根据ID查询单条记录

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          // 记录不存在，跳回历史列表
          router.push('/history');
          return;
        }

        // 格式化记录数据
        setRecord({
          ...result,
          type: result.functionType === 'function-expand' ? 'function' : 'analysis',
          date: new Date(result.createdAt).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-')
        });
        setIsLoading(false);
      };

      request.onerror = () => {
        console.error('加载记录详情失败：', request.error);
        setIsLoading(false);
        router.push('/history');
      };
    } catch (error) {
      console.error('加载记录详情异常：', error);
      setIsLoading(false);
      router.push('/history');
    }
  };

  // 复制完整结果
  const handleCopy = () => {
    if (!record?.result?.sections) return;

    const textToCopy = record.result.sections.map((section: any) => 
      `${section.title}\n${section.items.map((i: string) => `- ${i}`).join('\n')}`
    ).join('\n\n');

    navigator.clipboard.writeText(textToCopy.trim())
      .then(() => showActionToast('结果已复制'))
      .catch(() => showActionToast('复制失败，请重试'));
  };

  // 删除当前记录
  const handleDelete = () => {
    if (!db || !record) return;

    if (confirm('确定要删除这条记录吗？')) {
      try {
        const transaction = db.transaction('history', 'readwrite');
        const store = transaction.objectStore('history');
        store.delete(record.id);

        transaction.oncomplete = () => {
          showActionToast('记录已删除');
          setTimeout(() => router.push('/history'), 1500);
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

  // 显示提示消息
  const showActionToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 组件挂载时初始化
  useEffect(() => {
    initIndexedDB();

    return () => {
      if (db) db.close();
    };
  }, [recordId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">加载详情中...</p>
      </div>
    );
  }

  if (!record) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 顶部导航 */}
        <div className="mb-8 flex items-center">
          <Link href="/history" className="flex items-center text-gray-700 hover:text-primary transition-colors">
            <FaArrowLeft className="mr-2" />
            <span>返回历史记录</span>
          </Link>
        </div>

        {/* 记录头部信息 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full mb-2 ${
                record.type === 'function' 
                  ? 'bg-blue-50 text-primary' 
                  : 'bg-green-50 text-secondary'
              }`}>
                {record.type === 'function' ? '功能拓展建议' : '观点深度分析'}
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{record.inputText}</h1>
              <p className="text-gray-500 text-sm">{record.date}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleCopy}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center text-sm"
              >
                <FaCopy className="mr-1.5 text-sm" />
                复制结果
              </button>
              <button 
                onClick={handleDelete}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center text-sm"
              >
                <FaTrash className="mr-1.5 text-sm" />
                删除
              </button>
            </div>
          </div>
        </div>

        {/* 完整分析结果 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <FaCheckCircle className="text-primary mr-2" />
            完整分析结果
          </h2>

          <div className="space-y-8">
            {record.result.sections.map((section: any, index: number) => (
              <div key={index}>
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2 text-sm">
                    {section.title.includes('拓展') ? <FaExpand size={16} /> : 
                     section.title.includes('Why') ? <FaQuestionCircle size={16} /> : 
                     <FaLightbulb size={16} />}
                  </span>
                  {section.title}
                </h3>
                <ul className="space-y-3 pl-8">
                  {section.items.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="flex items-start">
                      <span className={`mr-2 mt-1 ${
                        record.type === 'function' ? 'text-primary' : 'text-secondary'
                      }`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
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