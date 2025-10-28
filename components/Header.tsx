'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaBars, FaTimes, FaLightbulb } from 'react-icons/fa'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 滚动时改变导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 点击外部关闭移动端菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [mobileMenuOpen])

  return (
    <header className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'py-2 shadow' : 'py-4 shadow-sm'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
            <FaLightbulb className="text-white text-xl" />
          </div> */}
          <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-black bg-gradient-to-r from-primary to-blue-600">
            AI 深度思考助手
          </h1>
        </div>
        
        {/* 桌面端导航 */}
        <div className="hidden md:flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-primary transition-colors">首页</Link>
          <Link href="#" className="text-gray-300 hover:text-primary transition-colors">使用指南</Link>
          <Link href="/history" className="text-gray-600 hover:text-primary transition-colors">历史记录</Link>
          <button className="bg-primary hover:bg-primary/90 text-black px-5 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
            登录
          </button>
        </div>
        
        {/* 移动端菜单按钮 */}
        <button 
          className="md:hidden text-gray-600 mobile-menu-button" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="菜单"
        >
          {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
        </button>
        
        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg z-50 py-4 px-6 mobile-menu animate-fade-in-down">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-primary transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                首页
              </Link>
              <Link 
                href="#" 
                className="text-gray-600 hover:text-primary transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                使用指南
              </Link>
              <Link 
                href="/history" 
                className="text-gray-600 hover:text-primary transition-colors py-2 border-b border-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                历史记录
              </Link>
              <button className="bg-primary hover:bg-primary/90 text-black py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg mt-2">
                登录
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}