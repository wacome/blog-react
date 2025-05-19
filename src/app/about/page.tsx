import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaTwitter, FaEnvelope, FaBook } from "react-icons/fa";
import dynamic from "next/dynamic";

const AvatarWithFallback = dynamic(() => import("@/components/AvatarWithFallback"), { ssr: false });

export default function AboutPage() {
  return (
    <div className="animate-fade-in px-2 md:px-0">
      <div className="card p-4 md:p-8 mb-8 max-w-full overflow-x-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 w-full">
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 mx-auto md:mx-0">
            <AvatarWithFallback
              src="https://blog-1257292087.cos.ap-nanjing.myqcloud.com/avatar.png"
              alt="Toycon"
              className="object-cover w-full h-full"
              fallback="https://blog-1257292087.cos.ap-nanjing.myqcloud.com/default-avatar.png"
            />
          </div>
          
          <div className="w-full max-w-xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 border-l-4 border-primary pl-3 bg-gradient-to-r from-[#d4b483] to-[#a3c293] bg-clip-text text-transparent">关于我</h1>
            
            <div className="space-y-4 text-gray-700 break-words">
              <p className="text-base md:text-lg">你好，我是 <span className="font-semibold text-primary">Toycon</span>，也可以叫我 <span className="font-semibold text-primary">神谷綺夜</span> 。</p>
              <p>我是一名大三学生，目前就读于某大学计算机科学与技术专业。我对编程语言、Web开发、数据分析和人工智能等技术领域有着浓厚的兴趣。追求优雅的代码和简洁的逻辑。</p>
              <p>在闲暇时间，我喜欢阅读各类书籍，尤其是文学类和技术类书籍。我还喜欢通过博客记录学习心得和生活感悟，与更多朋友分享交流。</p>
              <p>这个博客是我的个人空间，记录了我的学习历程、技术笔记和一些随想。希望我的分享能对你有所帮助或启发。</p>
            </div>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                href="https://github.com/wacome" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary flex items-center"
              >
                <FaGithub className="mr-2" />
                GitHub
              </Link>
              <Link 
                href="https://x.com/WacomTao" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-secondary flex items-center"
              >
                <FaTwitter className="mr-2" />
                Twitter
              </Link>
              <Link 
                href="mailto:toycon@foxmail.com" 
                className="btn btn-secondary flex items-center"
              >
                <FaEnvelope className="mr-2" />
                Email
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* 技能和兴趣 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
        <div className="card p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-primary pl-3">技能</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="w-24 font-medium">编程语言:</span>
              <span>Go, JavaScript, Scala, Python</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">前端开发:</span>
              <span>React, Next.js, Vue.js</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">后端开发:</span>
              <span>Django, Gin, Express</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">数据处理:</span>
              <span>Flink, Kafka, Spark</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">数据库:</span>
              <span>MySQL, PostgreSQL, Redis</span>
            </li>
          </ul>
        </div>
        
        <div className="card p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-primary pl-3">兴趣爱好</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="w-24 font-medium">阅读:</span>
              <span>文学、哲学、技术类书籍</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">音乐:</span>
              <span>J-POP、ACG、古典音乐</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">游戏:</span>
              <span>Elden Ring、GT7</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">运动:</span>
              <span>骑行、乒乓球</span>
            </li>
            <li className="flex items-center">
              <span className="w-24 font-medium">其他:</span>
              <span>摄影、乐器</span>
            </li>
          </ul>
        </div>
      </div>
      
      {/* 图书馆入口 */}
      <div className="card p-4 md:p-8 bg-gradient-to-r from-accent/30 to-primary/30 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">我的图书馆</h2>
          <p className="text-gray-700 mb-4">探索我读过的书籍和个人推荐。</p>
        </div>
        <Link href="/books" className="btn btn-primary flex items-center">
          <FaBook className="mr-2" />
          浏览图书馆
        </Link>
      </div>
    </div>
  );
} 