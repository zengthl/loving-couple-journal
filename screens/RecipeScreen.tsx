import React from 'react';
import { ArrowLeft, Share2, Heart, Clock, BarChart3, Flame, ShoppingBasket, BookOpen, Utensils } from 'lucide-react';

interface RecipeScreenProps {
  onBack: () => void;
}

export const RecipeScreen: React.FC<RecipeScreenProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-background-light">
      <div className="relative flex-1 overflow-y-auto no-scrollbar pb-24">
        {/* Header Image Area */}
        <div className="relative h-[420px] w-full shrink-0 group">
          {/* Navbar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pt-6">
            <button onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform active:scale-95 text-white hover:bg-white/30">
              <ArrowLeft size={24} />
            </button>
            <div className="flex gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform active:scale-95 text-white hover:bg-white/30">
                <Share2 size={24} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-transform active:scale-95 text-white hover:bg-white/30">
                <Heart size={24} fill="currentColor" />
              </button>
            </div>
          </div>
          {/* Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBswNwG1G049026CxT-Zdan5VMvX1LcDz6XB02dK1bnNCc_5gfg2BvklKegJoieLcwll0VtHc_pIjdeDvikpQlRrezHfWCMOJkNdxo44F2RNO9c3Fy8ayJfbn6THi2HHOQ8CGSxt_WU2WuW0C26COm4tS0zyvkC7yS9TOuO79xhpqepZlJGy64J0hsgbwYMoZnrXkRXNzKtszipgK5A5mAiuc1-Ma7b8xnbHxo2Rxu21Ks8_S4hzmFNF_ptba0Be0UBwZ1leeZ5tGM')"}}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>
        </div>

        {/* Content Card (Overlapping) */}
        <div className="relative z-10 -mt-10 flex flex-col rounded-t-[2.5rem] bg-background-light px-6 pt-8 shadow-soft">
          {/* Title Header */}
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-text-main tracking-tight leading-tight">爱心蛋包饭</h1>
              <div className="flex flex-col items-center justify-center rounded-xl bg-primary/10 px-3 py-1.5">
                <span className="text-xs font-bold text-primary">4.9</span>
                <div className="flex text-primary gap-0.5">
                  {[1,2,3,4].map(i => <Heart key={i} size={10} fill="currentColor" />)}
                  <Heart size={10} fill="currentColor" className="opacity-50" />
                </div>
              </div>
            </div>
            
            {/* Chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                <Clock size={18} className="text-primary" />
                <span className="text-sm font-medium text-text-sub">30 分钟</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                <BarChart3 size={18} className="text-primary" />
                <span className="text-sm font-medium text-text-sub">难度: 中等</span>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-sm">
                <Flame size={18} className="text-primary" />
                <span className="text-sm font-medium text-text-sub">450 kcal</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-text-main flex items-center gap-2">
              <ShoppingBasket size={20} className="text-primary" />
              食材清单
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                {name: '鸡蛋', amount: '3个'},
                {name: '米饭', amount: '1碗'},
                {name: '番茄酱', amount: '适量'},
                {name: '火腿丁', amount: '50g'}
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-card">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary/40"></div>
                    <span className="text-sm font-medium text-text-main">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-text-main flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              制作步骤
            </h2>
            <div className="relative flex flex-col gap-6 pl-2">
              <div className="absolute bottom-4 left-[19px] top-4 w-0.5 bg-gray-100"></div>
              {[
                { title: '准备配料', desc: '将火腿切丁，洋葱切碎。锅中热油，将米饭、火腿丁、洋葱碎翻炒均匀，加入番茄酱调味。' },
                { title: '制作蛋皮', desc: '鸡蛋打散加少许牛奶。平底锅刷油，倒入蛋液，小火摊成半熟的嫩蛋皮。' },
                { title: '包裹与装饰', desc: '将炒饭放在蛋皮一侧，小心卷起包裹。出锅后用番茄酱画上爱心即可！' }
              ].map((step, idx) => (
                <div key={idx} className="relative flex gap-4">
                  <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${idx === 0 ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white border-2 border-primary text-primary shadow-sm'}`}>
                    <span className="text-sm font-bold">{idx + 1}</span>
                  </div>
                  <div className="flex-1 space-y-2 pt-1">
                    <h3 className="text-base font-bold text-text-main">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-text-sub">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Story Card */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#fff0f0] p-5">
              <Heart className="absolute -right-4 -top-4 text-primary/10 rotate-12 pointer-events-none w-32 h-32" />
              <h2 className="relative z-10 mb-4 text-lg font-bold text-[#8a4a4a] flex items-center gap-2">
                <Heart size={20} fill="currentColor" />
                我们当时的故事
              </h2>
              <div className="relative z-10 flex gap-4">
                <div className="shrink-0 rotate-[-3deg] transform rounded-lg bg-white p-1.5 shadow-md">
                   <div 
                     className="h-24 w-24 overflow-hidden rounded bg-gray-100 bg-cover bg-center" 
                     style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEx6Koq4-PSFnTAE4ddV7QRC1JqfwFD_vtWIH12Mp6fxI0Y2Gjwn5OlPWD6e80Y6HG5wi2Nxgeac_DunmaGgEcYFyEVRiLdv_WmXYdpDpU2FqLGcknV74RVRWP7PYazjEhXT6f7bqkMK5e8eze9LQWqAEXIiFbvlL4iehXgebO4P01iW0JMfVs9aFBDfpZVHiofPxs0JOq1NYycxW2SJ-hKF8tyZjgHM9y4b2HD7_kDBFOlymAHpO74-Xz-K1VXS_CEc6slmLnRPw')"}}
                   ></div>
                </div>
                <div className="flex-1 py-1">
                  <p className="text-sm italic leading-6 text-[#8a4a4a]">
                    "记得第一次做这个的时候，你想画个爱心，结果手抖画成了一个土豆...哈哈，虽然卖相一般，但味道真的超级棒！"
                  </p>
                  <p className="mt-2 text-right text-xs font-medium text-[#8a4a4a]/70">— 2023.10.14</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white to-transparent pb-8 pt-12 px-6">
        <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-white shadow-lg shadow-primary/40 transition-transform active:scale-95 hover:bg-primary-dark">
          <Utensils size={20} />
          <span className="font-bold tracking-wide">开始制作</span>
        </button>
      </div>
    </div>
  );
};
