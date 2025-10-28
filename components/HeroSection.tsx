import { FaRocket, FaSearch, FaLightbulb } from 'react-icons/fa'

export default function HeroSection() {
  return (
    <section className="text-center mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
      <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold mb-3 sm:mb-4 text-dark leading-tight">
        让AI帮你深入思考，拓展思路
      </h2>
      <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed">
        无论是产品构思还是观点分析，AI都能为你提供深度洞察和拓展方向
      </p>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
        <div className="flex items-center bg-blue-50 text-primary px-3 py-2 rounded-full text-sm">
          <FaRocket className="mr-2 w-4 h-4" />
          <span>功能拓展建议</span>
        </div>
        <div className="flex items-center bg-green-50 text-secondary px-3 py-2 rounded-full text-sm">
          <FaSearch className="mr-2 w-4 h-4" />
          <span>深度观点分析</span>
        </div>
        <div className="flex items-center bg-orange-50 text-accent px-3 py-2 rounded-full text-sm">
          <FaLightbulb className="mr-2 w-4 h-4" />
          <span>创意启发</span>
        </div>
      </div>
    </section>
  )
}