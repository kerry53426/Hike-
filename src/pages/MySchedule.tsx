import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths, startOfToday, differenceInDays, startOfDay } from "date-fns";
import { zhTW } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Lock, RefreshCw, BarChart2, CheckCircle2, Timer, AlertCircle } from "lucide-react";
import { getRegistrations, updateRegistration } from "../lib/pantry";
import { useAuth } from "../lib/auth";
import { Registration } from "../types";
import clsx from "clsx";

const ScheduleRow = ({ 
  day, 
  todayDate, 
  appUser, 
  myRegistrations, 
  allRegistrations, 
  toggleStatus 
}: { 
  day: Date, 
  todayDate: Date, 
  appUser: any, 
  myRegistrations: Record<string, Registration>, 
  allRegistrations: Registration[],
  toggleStatus: (dateStr: string, field: "goingUp" | "goingDown" | "stayingZhudong") => void,
  key?: string
}) => {
  const [showOthers, setShowOthers] = useState(false);
  const dateStr = format(day, "yyyy-MM-dd");
  const reg = myRegistrations[dateStr];
  
  const isRestricted = differenceInDays(startOfDay(day), todayDate) <= 2;
  const isDisabled = isRestricted && appUser?.role === "employee";

  // Find others for this day
  const othersRegs = allRegistrations.filter(r => r.date === dateStr && r.userId !== appUser?.uid);
  const othersUp = othersRegs.filter(r => r.goingUp).map(r => r.userName);
  const othersDown = othersRegs.filter(r => r.goingDown).map(r => r.userName);

  return (
    <div 
      className={clsx(
        "flex flex-col md:grid md:grid-cols-4 gap-4 py-8 md:items-start group transition-all rounded-3xl",
        isToday(day) && "bg-[#1B4332]/5 ring-1 ring-[#1B4332]/10 -mx-4 px-8",
        isDisabled && "opacity-60"
      )}
    >
      <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4">
         <div className={clsx(
           "w-14 h-14 flex flex-col items-center justify-center rounded-2xl shrink-0 transition-all group-hover:shadow-lg shadow-sm border-2",
           isToday(day) ? "bg-[#1B4332] text-white border-[#1B4332]" : "bg-white text-slate-700 border-slate-100"
         )}>
           <span className="text-[10px] font-black opacity-80 leading-none mb-1 uppercase">{format(day, "EEE", { locale: zhTW })}</span>
           <span className="text-2xl font-black leading-none">{format(day, "dd")}</span>
         </div>
         
         <div className="flex flex-col flex-1">
            <div className="flex items-center gap-2">
               <span className={clsx("font-black text-slate-900 text-lg")}>
                  {format(day, "MM.dd")}
               </span>
               {isToday(day) && <span className="text-[10px] bg-[#1B4332] text-white px-2 py-0.5 rounded-lg font-black uppercase tracking-widest shrink-0">TODAY</span>}
            </div>
            
            {/* Others indicator */}
            <div className="mt-2 flex flex-col gap-1.5 translate-y-1">
               {othersDown.length > 0 && (
                 <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setShowOthers(!showOthers)}
                      className="flex items-center gap-1.5 hover:opacity-75 transition-opacity text-left outline-none"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-bold text-slate-500">
                        <span className="text-emerald-700">{othersDown.length}人</span> 已登記下山
                        {showOthers ? " (收合)" : " (查看姓名)"}
                      </span>
                    </button>
                    {showOthers && (
                      <div className="pl-3 flex flex-wrap gap-1">
                        {othersDown.map(name => (
                          <span key={name} className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold border border-emerald-100 animate-in fade-in zoom-in-95">{name}</span>
                        ))}
                      </div>
                    )}
                 </div>
               )}
               {othersUp.length > 0 && (
                 <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setShowOthers(!showOthers)}
                      className="flex items-center gap-1.5 hover:opacity-75 transition-opacity text-left outline-none"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="text-[10px] font-bold text-slate-500">
                        <span className="text-amber-600">{othersUp.length}人</span> 已登記上山
                        {showOthers ? " (收合)" : " (查看姓名)"}
                      </span>
                    </button>
                    {showOthers && (
                      <div className="pl-3 flex flex-wrap gap-1">
                        {othersUp.map(name => (
                          <span key={name} className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold border border-amber-100 animate-in fade-in zoom-in-95">{name}</span>
                        ))}
                      </div>
                    )}
                 </div>
               )}
               {othersRegs.length === 0 && !isDisabled && <span className="text-[10px] font-bold text-slate-300 italic">尚無其他員工登記</span>}
            </div>

            {isDisabled && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-[0.2em]">
                 <Lock className="w-3 h-3 text-slate-300" />
                 <span>近三日已鎖定</span>
              </div>
            )}
         </div>
      </div>

      <div className="w-full md:w-auto flex flex-row md:contents gap-2 items-stretch">
        
        {/* 下山 */}
        <button
          disabled={isDisabled}
          onClick={() => toggleStatus(dateStr, "goingDown")}
          className={clsx(
            "flex-1 md:flex-none flex items-center justify-center space-x-2 py-3 px-4 rounded-[1.25rem] font-black transition-all duration-300 border-2 text-sm sm:text-base",
            reg?.goingDown 
              ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200" 
              : "bg-white border-slate-100 text-slate-400 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
            isDisabled && "cursor-not-allowed opacity-50 gray"
          )}
        >
          下山
        </button>

        {/* 上山 */}
        <button
          disabled={isDisabled}
          onClick={() => toggleStatus(dateStr, "goingUp")}
          className={clsx(
            "flex-1 md:flex-none flex items-center justify-center space-x-2 py-3 px-4 rounded-[1.25rem] font-black transition-all duration-300 border-2 text-sm sm:text-base",
            reg?.goingUp 
              ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200" 
              : "bg-white border-slate-100 text-slate-400 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700",
            isDisabled && "cursor-not-allowed opacity-50 gray"
          )}
        >
          上山
        </button>

        {/* 竹東住宿 */}
        <button
          disabled={isDisabled}
          onClick={() => toggleStatus(dateStr, "stayingZhudong")}
          className={clsx(
            "flex-1 md:flex-none flex items-center justify-center space-x-2 py-3 px-4 rounded-[1.25rem] font-black transition-all duration-300 border-2 text-sm sm:text-base",
            reg?.stayingZhudong 
              ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
              : "bg-white border-slate-100 text-slate-400 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700",
            isDisabled && "cursor-not-allowed opacity-50 gray"
          )}
        >
          <span className="hidden sm:inline">竹東住宿</span>
          <span className="sm:hidden">住宿</span>
        </button>
      </div>
    </div>
  );
};

export const MySchedule = () => {
  const { appUser, updatePhone } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [myRegistrations, setMyRegistrations] = useState<Record<string, Registration>>({});
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    if (!appUser) return;
    setLoading(true);
    
    try {
      const data = await getRegistrations();
      const myData: Record<string, Registration> = {};
      const allDataList: Registration[] = [];
      let foundPhone = "";

      Object.entries(data).forEach(([key, reg]) => {
          if (!reg || reg.deleted) return;
          
          allDataList.push(reg);

          if (appUser.role === 'employee' && !appUser.phone && reg.userName === appUser.name && reg.phone && !foundPhone) {
              foundPhone = reg.phone;
          }

          if (reg.userId === appUser.uid) {
              myData[reg.date] = reg;
          }
      });

      if (foundPhone && !appUser.phone) {
          updatePhone(foundPhone);
      }

      setMyRegistrations(myData);
      setAllRegistrations(allDataList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [appUser, currentDate]); // also fetch on mode change maybe, though pantry cloud gets all at once. Assuming getRegistrations gets all.

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const allDays = eachDayOfInterval({ start, end });
    const today = startOfToday();
    
    // If current month, show from today onwards
    if (format(currentDate, "yyyy-MM") === format(today, "yyyy-MM")) {
      return allDays.filter(day => day >= today);
    }
    
    // If past month, hide all
    if (currentDate < startOfMonth(today)) {
      return [];
    }
    
    return allDays;
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const toggleStatus = async (dateStr: string, field: "goingUp" | "goingDown" | "stayingZhudong") => {
    if (!appUser) return;
    
    const existing = myRegistrations[dateStr];
    
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
    const isRemoving = existing && !newState.goingUp && !newState.goingDown && !newState.stayingZhudong && !newState.note;

    // Optimistic Update
    setMyRegistrations(prev => {
      const next = { ...prev };
      if (isRemoving) {
        delete next[dateStr];
      } else {
        next[dateStr] = { ...newState, updatedAt: new Date().toISOString() };
      }
      return next;
    });

    // Also update allRegistrations optimistically
    setAllRegistrations(prev => {
      const filtered = prev.filter(r => !(r.userId === appUser.uid && r.date === dateStr));
      if (isRemoving) return filtered;
      return [...filtered, { ...newState, updatedAt: new Date().toISOString() }];
    });
    
    try {
      if (isRemoving) {
        await updateRegistration(docId, { deleted: true });
      } else {
        const payload = {
          ...newState,
          updatedAt: new Date().toISOString(),
        };
        await updateRegistration(docId, payload);
      }
      setLastSaved(new Date().toLocaleTimeString());
      setTimeout(() => setLastSaved(null), 3000);
    } catch (error) {
      console.error(error);
      alert("儲存失敗，請重試");
      fetchRegistrations(); // revert on failure
    }
  };

  const todayDate = startOfToday();

  // Quick stats for current month
  const monthStats = useMemo(() => {
    let up = 0, down = 0, zhudong = 0;
    days.forEach(day => {
      const dateStr = format(day, "yyyy-MM-dd");
      const reg = myRegistrations[dateStr];
      if (reg?.goingUp) up++;
      if (reg?.goingDown) down++;
      if (reg?.stayingZhudong) zhudong++;
    });
    return { up, down, zhudong };
  }, [days, myRegistrations]);

  // Show setup screen if employee hasn't entered phone number yet
  if (appUser?.role === 'employee' && !appUser.phone) {
    if (loading) {
       return (
        <div className="flex-1 flex justify-center items-center h-full min-h-[400px]">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
       );
    }
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 max-w-md mx-auto mt-10 shadow-xl flex flex-col items-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-white to-emerald-50/30">
         <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
            <RefreshCw className="w-8 h-8" />
         </div>
         <h2 className="text-2xl font-black text-slate-900 mb-2 underline decoration-emerald-500/30 underline-offset-4">聯絡方式設定</h2>
         <p className="text-slate-500 mb-8 font-bold text-xs text-center leading-relaxed px-4 opacity-80 uppercase tracking-widest">
           Please provide your contact number for logistics coordination.
         </p>
         <form 
           className="w-full space-y-4"
           onSubmit={(e) => {
             e.preventDefault();
             const phone = (new FormData(e.currentTarget)).get('phone') as string;
             if (phone.trim()) updatePhone(phone.trim());
           }}
         >
           <div className="flex flex-col gap-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">聯絡電話 Phone Number</label>
             <input name="phone" required placeholder="例如: 0912345678" className="w-full px-5 py-4 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none font-bold text-lg text-slate-800 transition-all shadow-sm" />
           </div>
           <button className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-600 transition-all active:scale-95 text-lg">
             確認儲存並開始使用
           </button>
         </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-md border border-slate-200 overflow-hidden flex flex-col w-full h-full">
      <div className="p-5 sm:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-white">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900 mb-1">排班登記</h2>
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 <Lock className="w-3 h-3" /> 近三日已鎖定
               </span>
               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">三日後可自由修改</span>
            </div>
          </div>
          {lastSaved && (
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100 animate-in fade-in slide-in-from-left-2 transition-all">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">已存檔 {lastSaved}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-[1.5rem] border border-slate-200 shadow-inner w-full sm:w-auto justify-between sm:justify-start">
          <button onClick={fetchRegistrations} title="重新整理取得最新資料" className="p-2.5 hover:bg-white text-slate-600 rounded-2xl transition-all hover:shadow-sm hidden sm:block">
            <RefreshCw className={clsx("w-5 h-5 transition-transform duration-700", loading && "animate-spin text-emerald-600")} />
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
          <button onClick={prevMonth} className="p-2.5 hover:bg-white text-slate-700 rounded-2xl transition-all hover:shadow-sm">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-xl font-black text-slate-900 min-w-[140px] text-center tracking-tighter font-mono flex-1 sm:flex-none">
            {format(currentDate, "yyyy . MM")}
          </span>
          <button onClick={nextMonth} className="p-2.5 hover:bg-white text-slate-700 rounded-2xl transition-all hover:shadow-sm">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 space-y-6">
          <div className="h-40 bg-slate-50 rounded-3xl animate-pulse"></div>
          <div className="space-y-4">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="h-24 bg-slate-50/50 rounded-3xl animate-pulse flex items-center px-8 gap-4">
                  <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded-full w-1/4"></div>
                    <div className="h-2 bg-slate-100 rounded-full w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 h-10 bg-slate-100 rounded-xl"></div>
                    <div className="w-20 h-10 bg-slate-100 rounded-xl"></div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Enhanced Month Stats Panel */}
          <div className="bg-[#f8f9fa] border-b border-slate-100 p-4 sm:p-6 flex flex-col lg:flex-row items-center gap-6 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
             <div className="flex items-center gap-3 text-slate-500 shrink-0 font-black text-[10px] lg:text-xs uppercase tracking-[0.2em]">
               <BarChart2 className="w-5 h-5 text-emerald-600" />
               MONTHLY SUMMARY
             </div>
             <div className="w-px h-6 bg-slate-200 hidden lg:block"></div>
             <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
                <div className="bg-emerald-600 text-white p-3 sm:px-5 sm:py-2 rounded-2xl shadow-lg shadow-emerald-100 flex flex-col sm:flex-row sm:items-center gap-1">
                   <span className="text-[10px] font-black opacity-80 sm:hidden">下山</span>
                   <span className="font-black text-2xl leading-none">{monthStats.down}</span>
                   <span className="text-[10px] font-black hidden sm:inline ml-1 uppercase opacity-90">Days Down</span>
                </div>
                <div className="bg-amber-500 text-white p-3 sm:px-5 sm:py-2 rounded-2xl shadow-lg shadow-amber-100 flex flex-col sm:flex-row sm:items-center gap-1">
                   <span className="text-[10px] font-black opacity-80 sm:hidden">上山</span>
                   <span className="font-black text-2xl leading-none">{monthStats.up}</span>
                   <span className="text-[10px] font-black hidden sm:inline ml-1 uppercase opacity-90">Days Up</span>
                </div>
                <div className="bg-indigo-600 text-white p-3 sm:px-5 sm:py-2 rounded-2xl shadow-lg shadow-indigo-100 flex flex-col sm:flex-row sm:items-center gap-1 text-center">
                   <span className="text-[10px] font-black opacity-80 sm:hidden">住宿</span>
                   <span className="font-black text-2xl leading-none">{monthStats.zhudong}</span>
                   <span className="text-[10px] font-black hidden sm:inline ml-1 uppercase opacity-90">Overnights</span>
                </div>
             </div>
          </div>

          <div className="divide-y divide-slate-100/50 flex-1 overflow-auto bg-slate-50/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:grid sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-slate-100">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                 日期 DATE
              </div>
              <div className="text-center font-black">下山 DOWN-MTN</div>
              <div className="text-center font-black">上山 UP-MTN</div>
              <div className="text-center font-black">竹東住宿 STAY</div>
            </div>
            
            <div className="divide-y divide-slate-100/80 px-4 sm:px-8 pb-12">
              {days.map((day) => (
                <ScheduleRow 
                  key={format(day, "yyyy-MM-dd")}
                  day={day}
                  todayDate={todayDate}
                  appUser={appUser}
                  myRegistrations={myRegistrations}
                  allRegistrations={allRegistrations}
                  toggleStatus={toggleStatus}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
