'use client';

import Link from "next/link";
import { FaGithub, FaTwitter, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const icpBeian = process.env.NEXT_PUBLIC_ICP_BEIAN;
  const icpBeianUrl = process.env.NEXT_PUBLIC_ICP_BEIAN_URL;
  
  return (
    <footer className="mt-auto py-6 bg-white/60 backdrop-blur-md border-t border-gray-200">
      <div className="container-main">
        <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-between">
          <div className="text-sm text-gray-500 text-center md:text-left">
            © 2023-{currentYear} Toyconの世界探索記
          </div>
          
          {icpBeian && (
            <div className="text-sm text-gray-500 text-center md:text-left">
              <a 
                href={icpBeianUrl || "http://www.beian.miit.gov.cn"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                {icpBeian}
              </a>
            </div>
          )}
          
          <div className="text-sm text-gray-500 text-center md:text-left">
            Designed by Toycon | 神谷綺夜
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="https://github.com/wacome" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors"
              aria-label="GitHub"
            >
              <FaGithub size={20} />
            </Link>
            <Link 
              href="https://x.com/WacomTao" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <FaTwitter size={20} />
            </Link>
            <Link 
              href="mailto:toycon@foxmail.com" 
              className="text-gray-500 hover:text-primary transition-colors"
              aria-label="Email"
            >
              <FaEnvelope size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 