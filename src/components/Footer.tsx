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
                  波嶼
                </span>
                <span className="text-xs font-semibold tracking-[0.2em] text-[#438DB8] uppercase">
                  BO YU
                </span>
              </div>
              <span className="text-[10px] tracking-widest text-[#F6F3EA]/60 uppercase font-light">
                Australian Coastal Nature
              </span>
            </div>

            <p className="text-xs text-[#F6F3EA]/75 leading-relaxed max-w-lg mb-6">
              波嶼，意指棲居於波瀾海洋與島嶼之境。我們跨越太平洋，將澳洲海岸純淨、陽光燦爛且愜意自在的日常氣息，溫柔帶入您的居所。
            </p>

            <div className="flex items-center gap-2 text-xs text-[#FFB94B]">
              <Compass className="w-3.5 h-3.5" />
              <span>Byron Bay ∙ Sydney ∙ Melbourne ∙ Tasmania</span>
            </div>
          </div>

          {/* Customer Service & Consultation */}
          <div className="md:col-span-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90 mb-4">
              選物服務與諮詢
            </h3>
            <ul className="space-y-2 text-xs text-[#F6F3EA]/70">
              <li>服務時間：週一至週五 10:00 - 18:00</li>
              <li>電子信箱：hello@boyu-coastal.com</li>
              <li>全台配送：宅配 / 超商取貨</li>
              <li className="pt-2 text-[11px] text-[#438DB8] font-medium">
                ✦ 滿額 NT$ 1,500 即享全島免運
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#F6F3EA]/50">
          <div>
            © {new Date().getFullYear()} 波嶼 BoYu ∙ 澳洲自然生活選物. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>隱私權政策</span>
            <span>服務條款</span>
            <span>選物指南</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
