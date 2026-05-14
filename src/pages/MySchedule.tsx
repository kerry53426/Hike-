import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, startOfToday, differenceInDays, startOfDay } from "date-fns";
import { zhTW } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { getRegistrations, updateRegistration } from "../lib/pantry";
import { useAuth } from "../lib/auth";
import { Registration } from "../types";
import clsx from "clsx";

export const MySchedule = () => {
  const { appUser, updatePhone } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [registrations, setRegistrations] = useState<Record<string, Registration>>({});
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    if (!appUser) return;
    setLoading(true);
    
    try {
      const data = await getRegistrations();
      const myData: Record<string, Registration> = {};
      Object.entries(data).forEach(([key, reg]) => {
          if (reg && reg.userId === appUser.uid && !reg.deleted) {
              myData[reg.date] = reg;
          }
      });
      setRegistrations(myData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [appUser, currentDate]); // also fetch on mode change maybe, though pantry cloud gets all at once. Assuming getRegistrations gets all.

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const toggleStatus = async (dateStr: string, field: "goingUp" | "goingDown" | "stayingZhudong") => {
    if (!appUser) return;
    
    setSavingDate(dateStr);
    const existing = registrations[dateStr];
    
    const newState = existing 
      ? { ...existing, [field]: !existing[field] } 
      : {
          userId: appUser.uid,
          userName: appUser.name,
          phone: appUser.phone || "",
          date: dateStr,
          goingUp: field === "goingUp",
          goingDown: field === "goingDown",
          stayingZhudong: field === "stayingZhudong",
          note: "",
        };

    const docId = `${appUser.uid}_${dateStr}`;
    
    try {
      if (existing && !newState.goingUp && !newState.goingDown && !newState.stayingZhudong && !newState.note) {
        await updateRegistration(docId, { deleted: true });
        const newRegs = { ...registrations };
        delete newRegs[dateStr];
        setRegistrations(newRegs);
      } else {
        const payload = {
          ...newState,
          updatedAt: new Date().toISOString(),
        };
        await updateRegistration(docId, payload);
        
        setRegistrations({
          ...registrations,
          [dateStr]: payload
        });
      }
    } catch (error) {
      console.error(error);
      alert("儲存失敗，請重試");
    } finally {
      setSavingDate(null);
    }
  };

  const todayDate = startOfToday();

  // Show setup screen if employee hasn't entered phone number yet
  if (appUser?.role === 'employee' && !appUser.phone) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 p-10 max-w-md mx-auto mt-10 shadow-sm flex flex-col items-center">
         <h2 className="text-2xl font-black text-slate-900 mb-2">聯絡方式設定</h2>
         <p className="text-slate-500 mb-8 font-medium text-sm text-center">為了讓司機方便聯絡接駁事宜，請輸入您的聯絡電話。填寫後將記錄於系統中，未來登入不再顯示。</p>
         <form 
           className="w-full"
           onSubmit={(e) => {
             e.preventDefault();
             const phone = (new FormData(e.currentTarget)).get('phone') as string;
             if (phone.trim()) updatePhone(phone.trim());
           }}
         >
           <input name="phone" required placeholder="例如: 0912345678" className="w-full px-4 py-3 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-[#D35400]/20 focus:border-[#D35400] outline-none font-medium" />
           <button className="w-full bg-[#D35400] text-white font-bold py-3 rounded-xl shadow-sm hover:bg-[#b04500] transition-colors">確認送出</button>
         </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col w-full h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">排班登記</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">只能填寫三天後的資訊，近三日請聯繫司機代填</span>
        </div>
        <div className="flex items-center space-x-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-bold text-slate-900 min-w-[100px] text-center tracking-wide font-mono">
            {format(currentDate, "yyyy . MM")}
          </span>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center flex-1 justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A27] mb-4"></div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100/50 flex-1 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-6 py-3 bg-[#f8f9fa] text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden md:grid sticky top-0 z-10 backdrop-blur-md bg-[#f8f9fa]/90">
            <div>日期</div>
            <div className="text-center text-[#27AE60]">下山 (綠)</div>
            <div className="text-center text-[#D35400]">上山 (橘)</div>
            <div className="text-center text-[#2980B9]">竹東住宿 (藍)</div>
          </div>
          
          <div className="divide-y divide-slate-100 pb-8">
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const reg = registrations[dateStr];
              const isSaving = savingDate === dateStr;
              
              const isRestricted = differenceInDays(startOfDay(day), todayDate) <= 2;
              const isDisabled = isRestricted && appUser?.role === "employee";

              return (
                <div 
                  key={dateStr} 
                  className={clsx(
                    "flex flex-col md:grid md:grid-cols-4 gap-4 px-6 py-4 items-center transition-colors hover:bg-slate-50/50",
                    isToday(day) && "bg-[#EAF1EA]/40",
                    isDisabled && "opacity-60 bg-slate-50/50 cursor-not-allowed"
                  )}
                >
                  <div className="w-full md:w-auto flex items-center justify-between md:justify-start">
                    <span className={clsx(
                      "font-black font-mono text-lg",
                      isToday(day) ? "text-[#2D5A27]" : "text-slate-700"
                    )}>
                      {format(day, "MM.dd")}
                    </span>
                    <span className={clsx("ml-2 text-xs font-bold", isToday(day) ? "text-[#2D5A27]" : "text-slate-400")}>
                      {format(day, "EEE", { locale: zhTW }).toUpperCase()}
                    </span>
                    {isToday(day) && <span className="ml-3 text-[10px] bg-[#2D5A27] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">TODAY</span>}
                    {isDisabled && (
                      <span className="ml-3 flex items-center gap-1 text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold tracking-widest" title="近三日內無法直接修改，請聯繫司機代填">
                        <Lock className="w-3 h-3" />
                        鎖定
                      </span>
                    )}
                  </div>

                  <div className="w-full md:w-auto flex flex-row md:contents gap-3 justify-end">
                    
                    {/* 下山 */}
                    <button
                      disabled={isSaving || isDisabled}
                      onClick={() => toggleStatus(dateStr, "goingDown")}
                      className={clsx(
                        "flex-1 md:flex-none flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-black transition-all duration-200 border-2",
                        reg?.goingDown 
                          ? "bg-[#EAF1EA] border-[#27AE60] text-[#2D5A27] shadow-sm transform scale-[1.02]" 
                          : "bg-white border-slate-200 text-slate-300",
                        !isDisabled && !reg?.goingDown && "hover:border-[#27AE60]/30 hover:bg-[#EAF1EA]/20 hover:text-[#27AE60]"
                      )}
                    >
                      下山
                    </button>

                    {/* 上山 */}
                    <button
                      disabled={isSaving || isDisabled}
                      onClick={() => toggleStatus(dateStr, "goingUp")}
                      className={clsx(
                        "flex-1 md:flex-none flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-black transition-all duration-200 border-2",
                        reg?.goingUp 
                          ? "bg-[#FFF4E5] border-[#D35400] text-[#D35400] shadow-sm transform scale-[1.02]" 
                          : "bg-white border-slate-200 text-slate-300",
                        !isDisabled && !reg?.goingUp && "hover:border-[#D35400]/30 hover:bg-[#FFF4E5]/20 hover:text-[#D35400]"
                      )}
                    >
                      上山
                    </button>

                    {/* 竹東住宿 */}
                    <button
                      disabled={isSaving || isDisabled}
                      onClick={() => toggleStatus(dateStr, "stayingZhudong")}
                      className={clsx(
                        "flex-1 md:flex-none flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-black transition-all duration-200 border-2",
                        reg?.stayingZhudong 
                          ? "bg-[#EBF5FB] border-[#2980B9] text-[#2980B9] shadow-sm transform scale-[1.02]" 
                          : "bg-white border-slate-200 text-slate-300",
                        !isDisabled && !reg?.stayingZhudong && "hover:border-[#2980B9]/30 hover:bg-[#EBF5FB]/20 hover:text-[#2980B9]"
                      )}
                    >
                      <span className="hidden sm:inline">竹東住宿</span>
                      <span className="sm:hidden">過夜</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
