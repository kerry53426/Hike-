import { ReactNode, useState } from "react";
import { useAuth } from "../lib/auth";
import { Mountain, LogOut, LogIn, Calendar, Bus } from "lucide-react";
import clsx from "clsx";

export const Layout = ({ children, activeTab, setActiveTab }: { children: ReactNode, activeTab: string, setActiveTab: (tab: string) => void }) => {
  const { user, appUser, loading, login, updatePhone, logout } = useAuth();
  const [loginRole, setLoginRole] = useState("employee");
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] flex flex-col p-4 sm:p-6 font-sans text-slate-800">
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6 w-full max-w-6xl mx-auto">
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2D5A27] mb-1 flex items-center gap-1">
            <Mountain className="w-4 h-4 shrink-0" />
            <span className="truncate">SHEI-PA LEISURE FARM</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-none">
            交通接駁登記 <span className="text-[#2D5A27] text-2xl sm:text-3xl ml-1">{new Date().getMonth() + 1}月</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {loading ? null : user ? (
            <>
              <div className="flex bg-white border border-slate-200 px-3 sm:px-4 py-2 rounded-xl items-center gap-2 shadow-sm relative group cursor-pointer hover:bg-slate-50 transition-colors flex-1 sm:flex-none justify-center" role="button" onClick={() => appUser?.role === 'employee' && setShowPhoneEdit(true)}>
                <div className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse shrink-0"></div>
                <span className="text-sm font-bold text-slate-700 select-none truncate">
                  {appUser?.name} <span className="opacity-60 text-xs ml-1 hidden sm:inline">({appUser?.role === 'driver' ? '司機' : appUser?.role === 'admin' ? '管理員' : '員工'})</span>
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
            {appUser?.role !== 'driver' && (
              <button
                onClick={() => setActiveTab('my-schedule')}
                className={clsx(
                  "px-4 sm:px-5 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-sm flex-1 sm:flex-none",
                  activeTab === 'my-schedule' 
                    ? "bg-[#2D5A27] text-white" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">我的登記</span>
              </button>
            )}
            
            {(appUser?.role === 'driver' || appUser?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('daily-manifest')}
                className={clsx(
                  "px-4 sm:px-5 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-sm flex-1 sm:flex-none",
                  activeTab === 'daily-manifest' 
                    ? "bg-[#2D5A27] text-white" 
                    : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                <Bus className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">每日接駁名單</span>
              </button>
            )}
        </div>
      )}

      <main className="flex-1 flex flex-col relative w-full mx-auto max-w-6xl">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A27]"></div>
          </div>
        ) : !user ? (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-10 flex flex-col items-center shadow-sm max-w-md mx-auto mt-10">
            <Mountain className="w-16 h-16 text-[#2D5A27] mx-auto mb-6 opacity-80" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">歡迎使用接駁系統</h2>
            <p className="text-slate-500 mb-8 font-medium">
              {loginRole === 'employee' ? '請輸入您的姓名以登入系統。' : '請直接登入系統。'}
            </p>
            <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const role = loginRole;
                const name = role === 'employee' ? (fd.get('name') as string) : (role === 'driver' ? '司機' : '管理員');
                if (name.trim()) {
                  login(name.trim(), role);
                }
              }} className="w-full flex flex-col gap-4">
              <select name="role" value={loginRole} onChange={e => setLoginRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 transition-all font-medium text-slate-700 bg-white">
                <option value="employee">一般員工</option>
                <option value="driver">司機</option>
                <option value="admin">管理員</option>
              </select>
              {loginRole === 'employee' && (
                <input name="name" required placeholder="您的姓名 (例: 王小明)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 transition-all font-medium" />
              )}
              <button type="submit" className="w-full bg-[#2D5A27] hover:bg-[#1f3f1b] text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-all mt-4">
                開始使用
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
