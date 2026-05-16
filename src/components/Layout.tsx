import { ReactNode, useState } from "react";
import { useAuth } from "../lib/auth";
import { Mountain, LogOut, LogIn, Calendar, Bus } from "lucide-react";
import clsx from "clsx";

export const Layout = ({ children, activeTab, setActiveTab }: { children: ReactNode, activeTab: string, setActiveTab: (tab: string) => void }) => {
  const { user, appUser, loading, login, updatePhone, logout } = useAuth();
  const [loginRole, setLoginRole] = useState("employee");
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#fdfcfb] flex flex-col p-4 sm:p-6 font-sans text-slate-800 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 w-full max-w-6xl mx-auto">
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#1B4332] mb-1 flex items-center gap-1.5 opacity-80">
            <Mountain className="w-4 h-4 shrink-0 fill-[#1B4332]/10" />
            <span className="truncate">SHEI-PA LEISURE FARM / 雪霸農場</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-none tracking-tighter">
            交通接駁系統 <span className="text-[#2D5A27] text-2xl sm:text-3xl ml-1 font-serif italic border-b-4 border-[#2D5A27]/20">{new Date().getMonth() + 1}月</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {loading ? null : user ? (
            <>
              <div className="flex bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-xl items-center gap-2 shadow-sm relative group cursor-pointer hover:bg-slate-50 transition-colors flex-1 sm:flex-none justify-center" role="button" onClick={() => appUser?.role === 'employee' && setShowPhoneEdit(true)}>
                <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse shrink-0"></div>
                <span className="text-sm font-bold text-slate-700 select-none truncate">
                  {appUser?.name} <span className="opacity-60 text-xs ml-1 hidden sm:inline">({appUser?.role === 'driver' ? '司機' : appUser?.role === 'admin' ? '櫃台' : '員工'})</span>
                </span>
                {appUser?.role === 'employee' && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    點擊修改電話
                  </div>
                )}
              </div>
              <button
                onClick={logout}
                className="bg-white text-slate-500 border border-slate-200 p-2 sm:px-4 sm:py-2 rounded-xl font-bold flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm shrink-0"
                title="登出"
              >
                <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </>
          ) : (
            <span className="bg-slate-200 text-slate-600 px-5 py-2 rounded-xl font-bold flex items-center shadow-sm w-full sm:w-auto justify-center">
              未登入
            </span>
          )}
        </div>
      </header>

      {showPhoneEdit && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
             <h3 className="text-2xl font-black mb-2 text-slate-900">修改聯絡電話</h3>
             <p className="text-sm text-slate-500 mb-6 font-medium">更新您的電話，司機才能順利聯絡到您喔！</p>
             <form onSubmit={(e) => {
               e.preventDefault();
               const phone = (new FormData(e.currentTarget)).get('phone') as string;
               if (phone.trim()) {
                 updatePhone(phone.trim());
                 setShowPhoneEdit(false);
               }
             }}>
                <input 
                  name="phone" 
                  defaultValue={appUser?.phone || ""}
                  required
                  placeholder="輸入新電話號碼"
                  className="w-full px-4 py-3 border border-slate-200 focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] outline-none rounded-xl font-medium mb-6"
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowPhoneEdit(false)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">取消</button>
                  <button type="submit" className="flex-1 py-3 font-bold text-white bg-[#2D5A27] hover:bg-[#1f3f1b] rounded-xl transition-colors shadow-sm">儲存</button>
                </div>
             </form>
           </div>
        </div>
      )}

      {user && !loading && (
        <div className="mb-6 flex flex-wrap gap-2 sm:gap-3 w-full max-w-6xl mx-auto">
            {appUser?.role === 'employee' && (
              <button
                onClick={() => setActiveTab('my-schedule')}
                className={clsx(
                  "px-5 sm:px-6 py-3 rounded-2xl font-black flex items-center justify-center space-x-2 transition-all shadow-sm flex-1 sm:flex-none uppercase tracking-widest text-xs",
                  activeTab === 'my-schedule' 
                    ? "bg-[#1B4332] text-white shadow-lg shadow-emerald-900/20" 
                    : "bg-white border border-slate-200 text-slate-500 hover:text-[#1B4332] hover:border-emerald-200"
                )}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">我的登記</span>
              </button>
            )}
            
            <button
                onClick={() => setActiveTab('daily-manifest')}
                className={clsx(
                  "px-5 sm:px-6 py-3 rounded-2xl font-black flex items-center justify-center space-x-2 transition-all shadow-sm flex-1 sm:flex-none uppercase tracking-widest text-xs",
                  activeTab === 'daily-manifest' 
                    ? "bg-[#1B4332] text-white shadow-lg shadow-emerald-900/20" 
                    : "bg-white border border-slate-200 text-slate-500 hover:text-[#1B4332] hover:border-emerald-200"
                )}
              >
                <Bus className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{appUser?.role === 'admin' ? '代填與管理' : '每日接駁名單'}</span>
              </button>
        </div>
      )}

      <main className="flex-1 flex flex-col relative w-full mx-auto max-w-6xl">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A27]"></div>
          </div>
        ) : !user ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col items-center shadow-xl max-w-md mx-auto mt-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#1B4332]"></div>
            <Mountain className="w-20 h-20 text-[#1B4332] mx-auto mb-8 opacity-20" />
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">雪霸交通接駁</h2>
            <p className="text-slate-500 mb-8 font-bold text-sm text-center">
              {loginRole === 'employee' ? '歡迎回來！請輸入您的姓名登入。' : '系統後台，請輸入存取密碼。'}
            </p>
            <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const role = loginRole;
                const password = fd.get('password') as string;
                
                if (role !== 'employee') {
                  if (password !== '8888') {
                    alert('密碼錯誤！');
                    return;
                  }
                }

                const name = role === 'employee' ? (fd.get('name') as string) : (role === 'driver' ? '司機專用' : '櫃台管理員');
                if (name.trim()) {
                  login(name.trim(), role);
                }
              }} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">登入身分 LOGIN AS</label>
                <select name="role" value={loginRole} onChange={e => setLoginRole(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#1B4332] focus:ring-4 focus:ring-emerald-600/5 transition-all font-black text-slate-700 bg-slate-50 shadow-inner">
                  <option value="employee">一般員工 Staff</option>
                  <option value="driver">司機 Driver</option>
                  <option value="admin">櫃台 Reception</option>
                </select>
              </div>

              {loginRole === 'employee' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">您的姓名 NAME</label>
                  <input name="name" required placeholder="例: 王小明" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#1B4332] focus:ring-4 focus:ring-emerald-600/5 transition-all font-black text-lg" />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">存取密碼 PASSWORD</label>
                  <input type="password" name="password" required placeholder="請輸入密碼" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#1B4332] focus:ring-4 focus:ring-emerald-600/5 transition-all font-black" />
                </div>
              )}
              <button type="submit" className="w-full bg-[#1B4332] hover:bg-slate-900 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-emerald-900/10 transition-all mt-4 text-lg active:scale-95">
                登入系統
              </button>
            </form>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
};
