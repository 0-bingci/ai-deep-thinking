import Link from 'next/link'
import { FaLightbulb, FaEnvelope, FaGithub, FaTwitter } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 py-10">
      <div className="container mx-auto px-4">
        {/* 移动端单列布局，桌面端四列布局 */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 md:gap-8">
          {/* <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                <FaLightbulb size={16} className="text-white text-sm" />
              </div>
              <h3 className="text-xl font-bold text-white">AI 深度思考助手</h3>
            </div>
            <p className="text-sm">让AI助力你的思考，拓展无限可能</p>
          </div> */}
          
          {/* <div>
            <h4 className="text-white font-semibold mb-4">资源</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">使用指南</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">常见问题</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API文档</Link></li>
            </ul>
          </div> */}
          
          <div className="flex flex-col items-center text-center">
            <h4 className="text-gray-200 font-semibold mb-4">联系我们</h4>
            <ul className="flex justify-center space-x-6 text-sm">
              <li className="flex items-center"><FaEnvelope className="mr-2 flex-shrink-0" /> contact@aideepthink.com</li>
              <li className="flex items-center"><FaGithub className="mr-2 flex-shrink-0" /> GitHub</li>
              <li className="flex items-center"><FaTwitter className="mr-2 flex-shrink-0" /> Twitter</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} AI 深度思考助手. 保留所有权利.</p>
        </div>
      </div>
    </footer>
  )
}