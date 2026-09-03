import React from 'react';
import { CategoryId } from '../types';
import { Compass } from 'lucide-react';

interface FooterProps {
  onSelectCategory?: (categoryId: CategoryId) => void;
  onNavigateHome: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateHome }) => {
  return (
    <footer className="bg-[#263B3F] text-[#F6F3EA] pt-12 pb-10 border-t border-[#263B3F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-white/10">
          {/* Brand Philosophy */}
          <div className="md:col-span-7">
            <div
              onClick={onNavigateHome}
              className="cursor-pointer inline-flex flex-col mb-4"
            >
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-white font-serif-brand">
                  Good on ya !
                </span>
              </div>
            </div>

            <p className="text-xs text-[#F6F3EA]/75 leading-relaxed max-w-lg mb-6">
              嗨！歡迎來到 Good on ya。我們住在陽光明媚的澳洲，每週親自為大家挑選、打包南半球最純淨安心的生活好物，就像朋友幫你代購一樣貼心又放心！
            </p>

            <div className="flex items-center gap-2 text-xs text-[#FFB94B]">
              <Compass className="w-3.5 h-3.5" />
              <span>Sydney ∙ Melbourne ∙ Brisbane ∙ Byron Bay</span>
            </div>
          </div>

          {/* Customer Service & Consultation */}
          <div className="md:col-span-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-4">
              代購小幫手與諮詢
            </h3>
            <ul className="space-y-2 text-xs text-[#F6F3EA]/70">
              <li>聊聊時間：週一至週五 10:00 - 18:00</li>
              <li>聯絡信箱：hello@goodonya.com</li>
              <li>全台配送：宅配 / 超商取貨</li>
              <li className="pt-2 text-[11px] text-[#438DB8] font-medium">
                ✦ 滿額 NT$ 2,000 即享全島免運
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#F6F3EA]/50">
          <div>
            © {new Date().getFullYear()} Good on ya. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>隱私權政策</span>
            <span>服務條款</span>
            <span>代購小指南</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
