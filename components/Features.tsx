import { FaBrain, FaCompass, FaRocket } from 'react-icons/fa'

export default function Features() {
  return (
    <section className="mt-12 sm:mt-16 mb-12 px-4">
      <h2 className="text-2xl font-bold text-center mb-8 sm:mb-10">为什么选择 AI 深度思考助手</h2>
      {/* 移动端单列布局，桌面端三列布局 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-white p-6 rounded-xl shadow-md card-hover">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FaBrain className="text-primary text-xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">深度分析</h3>
          <p className="text-gray-600">不仅仅是表面理解，AI能够深入分析问题本质，提供有价值的洞察</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md card-hover">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <FaCompass className="text-secondary text-xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">方向指引</h3>
          <p className="text-gray-600">为你的想法提供拓展方向，帮助你看到更多可能性和潜在价值</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md card-hover">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <FaRocket className="text-accent text-xl" />
          </div>
          <h3 className="text-lg font-semibold mb-2">行动建议</h3>
          <p className="text-gray-600">提供切实可行的操作建议，帮助你将想法转化为实际行动</p>
        </div>
      </div>
    </section>
  )
}