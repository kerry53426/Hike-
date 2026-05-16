import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { zhTW } from "date-fns/locale";
import { getRegistrations, updateRegistration } from "../lib/pantry";
import { Registration } from "../types";
import { ChevronLeft, ChevronRight, MapPin, ArrowUp, ArrowDown, Plus, X, RefreshCw, Calendar as CalendarIcon, ChevronDown, ChevronUp, Phone, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../lib/auth";
import clsx from "clsx";

interface DayViewProps {
  dayDate: Date;
  registrations: Registration[];
  key?: string;
}

const UserItem = ({ user, type }: { user: Registration, type: 'up' | 'down' | 'stay', key?: string }) => {
  const [showPhone, setShowPhone] = useState(false);
  
  const colors = {
    up: { bg: 'bg-amber-50', text: 'text-amber-600', hover: 'hover:bg-amber-50/50', active: 'bg-amber-100', accent: 'text-amber-700' },
    down: { bg: 'bg-emerald-50', text: 'text-emerald-600', hover: 'hover:bg-emerald-50/50', active: 'bg-emerald-100', accent: 'text-emerald-700' },
    stay: { bg: 'bg-indigo-50', text: 'text-indigo-600', hover: 'hover:bg-indigo-50/50', active: 'bg-indigo-100', accent: 'text-indigo-700' }
  };

  const theme = colors[type];

  if (type === 'stay') {
    return (
      <div 
        onClick={() => user.phone && setShowPhone(!showPhone)}
        className={clsx(
          "bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2 group transition-all cursor-pointer",
          showPhone ? "ring-2 ring-indigo-500/20 bg-white shadow-sm border-indigo-200" : "hover:border-indigo-300"
        )}
      >
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] font-black text-indigo-500 shadow-sm">{user.userName.charAt(0)}</div>
          <div className="flex flex-col flex-1 min-w-0">
             <span className="text-xs font-bold text-slate-700 truncate">{user.userName}</span>
             {showPhone && user.phone && (
               <span className="text-[9px] font-black font-mono text-indigo-500 animate-in fade-in slide-in-from-top-1">{user.phone}</span>
             )}
          </div>
          {user.phone && (
            <div className="flex items-center gap-1">
               {showPhone ? (
                 <a href={`tel:${user.phone}`} onClick={e => e.stopPropagation()} className="p-1 bg-indigo-600 text-white rounded-md shadow-sm">
                    <Phone className="w-3 h-3" />
                 </a>
               ) : (
                 <CalendarIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500" />
               )}
            </div>
          )}
      </div>
    );
  }

  return (
    <li 
      className={clsx(
        "flex items-center justify-between gap-3 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 transition-all cursor-pointer",
        showPhone ? "bg-white shadow-md ring-2 ring-slate-100 border-slate-200" : theme.hover
      )}
      onClick={() => user.phone && setShowPhone(!showPhone)}
    >
      <div className="flex items-center gap-3">
          <div className={clsx("w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold shadow-sm transition-transform", showPhone && "scale-110", theme.text)}>
             {user.userName.charAt(0)}
          </div>
          <div className="flex flex-col">
             <span className="font-bold text-slate-700">{user.userName}</span>
             {showPhone && user.phone ? (
               <span className={clsx("text-xs font-mono font-black animate-in fade-in slide-in-from-left-1", theme.accent)}>{user.phone}</span>
             ) : (
               user.phone && <span className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">點擊查看電話</span>
             )}
          </div>
      </div>
      {user.phone && (
        <div className="flex items-center gap-2">
           {showPhone ? (
             <a 
               href={`tel:${user.phone}`} 
               onClick={e => e.stopPropagation()}
               className={clsx("flex items-center justify-center w-9 h-9 text-white rounded-xl shadow-lg transition-all active:scale-95", type === 'up' ? 'bg-amber-500' : 'bg-emerald-600')}
             >
                <Phone className="w-4 h-4" />
             </a>
           ) : (
             <div className="w-9 h-9 flex items-center justify-center text-slate-300">
                <Eye className="w-4 h-4" />
             </div>
           )}
        </div>
      )}
    </li>
  );
};

const DayView = ({ dayDate, registrations }: DayViewProps) => {
  const [expanded, setExpanded] = useState(isToday(dayDate));
  
  const dateStr = format(dayDate, "yyyy-MM-dd");
  const dayRegs = registrations.filter(r => r.date === dateStr);
  const goingUp = dayRegs.filter(r => r.goingUp);
  const goingDown = dayRegs.filter(r => r.goingDown);
  const stayingUser = dayRegs.filter(r => r.stayingZhudong);

  return (
    <div className={clsx(
      "bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border shadow-sm flex flex-col overflow-hidden transition-all duration-300",
      isToday(dayDate) ? "border-[#2D5A27]/30 shadow-md ring-1 ring-[#2D5A27]/5" : "border-slate-200"
    )}>
       <div 
         onClick={() => setExpanded(!expanded)}
         className={clsx(
           "p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors",
           expanded ? "bg-slate-50/80 border-b border-slate-100" : "hover:bg-slate-50"
         )}
       >
           <div className="flex items-center gap-4">
               <div className={clsx(
                 "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center shadow-inner",
                 isToday(dayDate) ? "bg-[#2D5A27] text-white" : "bg-slate-100 text-slate-600"
               )}>
                 <span className="text-xs font-black opacity-80 leading-none">{format(dayDate, "MMM")}</span>
                 <span className="text-xl sm:text-2xl font-black leading-none">{format(dayDate, "dd")}</span>
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-slate-900">{format(dayDate, "EEEE", { locale: zhTW })}</span>
                    {isToday(dayDate) && <span className="text-[9px] bg-[#27AE60] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">今天</span>}
                  </div>
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">{dateStr}</span>
               </div>
           </div>

           <div className="flex items-center gap-3 sm:gap-6 ml-auto sm:ml-0 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-2xl shadow-sm" title="下山">
                 <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ArrowDown className="w-4 h-4 text-emerald-600" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 leading-none">下山</span>
                    <span className="font-black text-emerald-700 text-lg leading-tight">{goingDown.length}</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-2xl shadow-sm" title="上山">
                 <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <ArrowUp className="w-4 h-4 text-amber-600" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 leading-none">上山</span>
                    <span className="font-black text-amber-700 text-lg leading-tight">{goingUp.length}</span>
                 </div>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-2 rounded-2xl shadow-sm" title="住宿">
                 <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 leading-none">住宿</span>
                    <span className="font-black text-indigo-700 text-lg leading-tight">{stayingUser.length}</span>
                 </div>
              </div>
              <div className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shrink-0 shadow-sm transition-transform duration-300">
                 {expanded ? <ChevronUp className="w-5 h-5 text-slate-600" /> : <ChevronDown className="w-5 h-5" />}
              </div>
           </div>
       </div>

       {expanded && (
         <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-white animate-in slide-in-from-top-2 duration-300 origin-top">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-emerald-50 pb-3">
                <h3 className="text-sm font-black text-emerald-800 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  下山清單
                </h3>
                <span className="bg-emerald-500 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-black">{goingDown.length} PRSN</span>
              </div>
              {goingDown.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  當日尚無登記
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {goingDown.map(user => (
                      <UserItem key={`${user.userId}_down`} user={user} type="down" />
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-amber-50 pb-3">
                <h3 className="text-sm font-black text-amber-800 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                  上山清單
                </h3>
                <span className="bg-amber-500 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-black">{goingUp.length} PRSN</span>
              </div>
              {goingUp.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  當日尚無登記
                </div>
              ) : (
                <ul className="space-y-2.5">
                    {goingUp.map(user => (
                      <UserItem key={`${user.userId}_up`} user={user} type="up" />
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-indigo-50 pb-3">
                <h3 className="text-sm font-black text-indigo-800 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                  宿舍管理
                </h3>
                <span className="bg-indigo-500 text-white px-2.5 py-0.5 rounded-lg text-[11px] font-black">{stayingUser.length} BED</span>
              </div>
              {stayingUser.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  目前無入住
                </div>
              ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {stayingUser.map(user => (
                      <UserItem key={`${user.userId}_zhudong`} user={user} type="stay" />
                    ))}
                  </div>
              )}
            </div>
         </div>
       )}
    </div>
  );
};

export const DailyManifest = () => {
  const { appUser } = useAuth();
  const [baseDate, setBaseDate] = useState(new Date());
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allUsers, setAllUsers] = useState<{name: string, phone: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addDateStr, setAddDateStr] = useState(format(new Date(), "yyyy-MM-dd"));

  const fetchDailyData = async () => {
    setLoading(true);
    try {
      const allData = await getRegistrations();
      const data: Registration[] = [];
      const usersMap = new Map<string, string>();
      Object.entries(allData).forEach(([key, reg]) => {
          if (reg && reg.phone && reg.userName) {
              usersMap.set(reg.phone, reg.userName);
          }
          if (reg && !reg.deleted) {
              data.push(reg);
          }
      });
      setRegistrations(data);
      setAllUsers(Array.from(usersMap.entries()).map(([phone, name]) => ({ phone, name })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
  }, []); // Only fetch once, we don't need to refetch on date change since we have all data

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    const fd = new FormData(e.currentTarget);
    const name = addName.trim() || (fd.get('name') as string).trim();
    const phone = addPhone.trim() || (fd.get('phone') as string).trim();
    const goingUp = fd.get('goingUp') === 'true';
    const goingDown = fd.get('goingDown') === 'true';
    const stayingZhudong = fd.get('stayingZhudong') === 'true';
    const dateStr = addDateStr;

    const docId = `${name}_${dateStr}`;
    const payload: Registration = {
        userId: name,
        userName: name,
        phone: phone,
        date: dateStr,
        goingUp,
        goingDown,
        stayingZhudong,
        note: "司機代填",
        updatedAt: new Date().toISOString()
    };

    try {
        await updateRegistration(docId, payload);
        setShowAddForm(false);
        setAddName("");
        setAddPhone("");
        fetchDailyData();
    } catch (err) {
        console.error(err);
        alert("新增失敗，請重試");
    } finally {
        setAdding(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddName(val);
    const found = allUsers.find(u => u.name === val);
    if (found) setAddPhone(found.phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddPhone(val);
    const found = allUsers.find(u => u.phone === val);
    if (found) setAddName(found.name);
  };

  const daysToShow = [baseDate, addDays(baseDate, 1), addDays(baseDate, 2)];

  const renderDayColumn = (dayDate: Date) => {
    const dateStr = format(dayDate, "yyyy-MM-dd");
    const dayRegs = registrations.filter(r => r.date === dateStr);
    const goingUp = dayRegs.filter(r => r.goingUp);
    const goingDown = dayRegs.filter(r => r.goingDown);
    const stayingUser = dayRegs.filter(r => r.stayingZhudong);

    return (
      <div key={dateStr} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
         <div className="bg-slate-50 border-b border-slate-100 p-4 rounded-t-[2rem] flex items-center justify-between sticky top-0 z-10">
             <div className="flex items-center gap-2">
                 <span className={clsx("font-black font-mono text-xl", isToday(dayDate) ? "text-[#2D5A27]" : "text-slate-800")}>{format(dayDate, "MM.dd")}</span>
                 <span className={clsx("text-sm font-bold", isToday(dayDate) ? "text-[#2D5A27]" : "text-slate-500")}>{format(dayDate, "EEE", { locale: zhTW }).toUpperCase()}</span>
                 {isToday(dayDate) && <span className="text-[10px] bg-[#2D5A27] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shrink-0">TODAY</span>}
             </div>
         </div>
         <div className="p-4 flex-1 flex flex-col gap-6">
            <div className="space-y-3 flex-1 flex flex-col">
              <h3 className="text-[11px] uppercase tracking-widest font-black text-[#27AE60] flex items-center gap-2 bg-[#EAF1EA] px-3 py-1.5 rounded-lg w-fit">
                <ArrowDown className="w-3.5 h-3.5" /> 下山名單 <span className="bg-[#27AE60] text-white px-1.5 py-0.5 rounded-md text-[10px] ml-1">{goingDown.length}</span>
              </h3>
              {goingDown.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 flex-1 flex items-center justify-center content-center">
                  尚無登記
                </div>
              ) : (
                <ul className="text-sm space-y-2 font-bold text-slate-700">
                  {goingDown.map(user => (
                      <li key={`${user.userId}_down`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 min-w-[6px] rounded-full bg-[#27AE60]"></div>
                            {user.userName}
                        </div>
                        {user.phone && <a href={`tel:${user.phone}`} className="text-[10px] text-[#27AE60] font-mono border border-[#27AE60]/30 px-1.5 py-0.5 rounded-md hover:bg-[#27AE60]/10 shrink-0 w-fit">{user.phone}</a>}
                      </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3 flex-1 flex flex-col">
              <h3 className="text-[11px] uppercase tracking-widest font-black text-[#D35400] flex items-center gap-2 bg-[#FFF4E5] px-3 py-1.5 rounded-lg w-fit">
                <ArrowUp className="w-3.5 h-3.5" /> 上山名單 <span className="bg-[#D35400] text-white px-1.5 py-0.5 rounded-md text-[10px] ml-1">{goingUp.length}</span>
              </h3>
              {goingUp.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 flex-1 flex items-center justify-center content-center">
                  尚無登記
                </div>
              ) : (
                <ul className="text-sm space-y-2 font-bold text-slate-700">
                    {goingUp.map(user => (
                      <li key={`${user.userId}_up`} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 bg-slate-50 px-3 py-2 rounded-xl">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 min-w-[6px] rounded-full bg-[#E67E22]"></div>
                            {user.userName}
                        </div>
                        {user.phone && <a href={`tel:${user.phone}`} className="text-[10px] text-[#D35400] font-mono border border-[#D35400]/30 px-1.5 py-0.5 rounded-md hover:bg-[#FFF4E5]/50 shrink-0 w-fit">{user.phone}</a>}
                      </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-auto border-t border-slate-100 pt-5">
              <h3 className="text-[10px] font-black tracking-widest text-[#2980B9] uppercase mb-3 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> 竹東住宿 ({stayingUser.length})
              </h3>
              {stayingUser.length === 0 ? (
                <div className="text-xs font-medium text-slate-400">無人登記</div>
              ) : (
                  <ul className="text-sm text-slate-500 font-medium flex flex-wrap gap-2">
                    {stayingUser.map(user => (
                      <li key={`${user.userId}_zhudong`} className="bg-slate-50 border border-slate-200/60 px-2.5 py-1 rounded-lg flex items-center gap-2">
                          <span className="text-xs">{user.userName}</span>
                          {user.phone && <a href={`tel:${user.phone}`} title={user.phone} className="text-[#2980B9] hover:text-[#1A5276]">
                             <CalendarIcon className="w-3 h-3" />
                          </a>}
                      </li>
                    ))}
                  </ul>
              )}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-white p-4 sm:p-5 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between w-full xl:w-auto">
           <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex flex-wrap items-center gap-2 shrink-0">
             每日接駁名單 <span className="bg-[#FFF4E5] text-[#D35400] text-xs sm:text-sm px-2.5 py-1 rounded-xl tracking-widest font-black uppercase">三日檢視</span>
           </h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
          {(appUser?.role === 'driver' || appUser?.role === 'admin') && (
            <button 
              onClick={() => {
                setAddDateStr(format(baseDate, "yyyy-MM-dd"));
                setShowAddForm(true);
              }} 
              className="text-sm font-bold text-white bg-[#D35400] px-4 py-2 rounded-xl transition-colors hover:bg-[#b04500] flex items-center gap-1 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" /> 代填登記
            </button>
          )}

          <button onClick={fetchDailyData} title="重新整理取得最新資料" className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin text-[#D35400]")} />
          </button>

          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm overflow-x-auto w-full sm:w-auto mt-2 sm:mt-0 xl:w-auto">
             <button onClick={() => setBaseDate(new Date())} className={clsx("text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex-1 sm:flex-none", isToday(baseDate) ? "bg-[#2D5A27] text-white" : "text-slate-600 hover:bg-slate-50")}>回到今天</button>
          </div>

          <div className="flex items-center justify-between space-x-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 xl:w-auto">
            <button onClick={() => setBaseDate(subDays(baseDate, 3))} className="p-2 bg-white shadow-sm hover:shadow text-slate-700 rounded-xl transition-all" title="前三天">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center justify-center min-w-[150px] relative">
               <input 
                 type="date" 
                 value={format(baseDate, 'yyyy-MM-dd')}
                 onChange={(e) => {
                   if (e.target.value) {
                     setBaseDate(new Date(e.target.value));
                   }
                 }}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <span className="text-sm font-bold text-slate-900 font-mono pointer-events-none">
                {format(baseDate, "MM.dd")} - {format(addDays(baseDate, 2), "MM.dd")}
              </span>
            </div>
            <button onClick={() => setBaseDate(addDays(baseDate, 3))} className="p-2 bg-white shadow-sm hover:shadow text-slate-700 rounded-xl transition-all" title="後三天">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-[2.5rem] border-2 border-orange-500/30 p-8 shadow-xl relative animate-in fade-in slide-in-from-top-4 z-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-white to-orange-50/40">
           <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-orange-600 bg-slate-50 hover:bg-orange-50 rounded-2xl transition-all shadow-sm">
              <X className="w-5 h-5" />
           </button>
           <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                <Plus className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">司機代填乘車登記</h2>
                <p className="text-xs font-bold text-orange-600/70 tracking-widest uppercase">Proxy Registration Form</p>
              </div>
           </div>
           
           <form onSubmit={handleAddSubmit} className="flex flex-col md:grid md:grid-cols-4 gap-6 items-end w-full">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">排班日期</label>
                <input 
                  type="date" 
                  name="dateStr" 
                  required 
                  value={addDateStr}
                  onChange={e => setAddDateStr(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold font-mono text-slate-700 bg-white transition-all shadow-sm" 
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">員工姓名</label>
                <input 
                   name="name" 
                   required 
                   placeholder="王大明"
                   list="name-list"
                   value={addName}
                   onChange={handleNameChange}
                   className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-700 bg-white transition-all shadow-sm" 
                />
                <datalist id="name-list">
                   {allUsers.map(u => <option key={`name_${u.phone}`} value={u.name} />)}
                </datalist>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">聯絡電話</label>
                <input 
                   name="phone" 
                   required 
                   placeholder="09..."
                   list="phone-list"
                   value={addPhone}
                   onChange={handlePhoneChange}
                   className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 font-bold font-mono text-slate-700 bg-white transition-all shadow-sm" 
                />
                <datalist id="phone-list">
                   {allUsers.map(u => <option key={`phone_${u.phone}`} value={u.phone}>{u.name}</option>)}
                </datalist>
              </div>

              <div className="flex flex-col gap-2 w-full">
                 <label className="text-xs font-black text-slate-500 uppercase tracking-wider ml-1">乘車選項</label>
                 <div className="flex gap-2 w-full">
                   <label className="flex-1 flex flex-col items-center justify-center gap-1 border border-slate-200 rounded-2xl px-2 py-3 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 group transition-all shadow-sm bg-white">
                      <input type="checkbox" name="goingDown" value="true" className="w-5 h-5 accent-emerald-600" />
                      <span className="font-black text-slate-600 group-hover:text-emerald-700 text-[10px] sm:text-xs">下山</span>
                   </label>
                   <label className="flex-1 flex flex-col items-center justify-center gap-1 border border-slate-200 rounded-2xl px-2 py-3 cursor-pointer hover:bg-amber-50 hover:border-amber-200 group transition-all shadow-sm bg-white">
                      <input type="checkbox" name="goingUp" value="true" className="w-5 h-5 accent-amber-600" />
                      <span className="font-black text-slate-600 group-hover:text-amber-700 text-[10px] sm:text-xs">上山</span>
                   </label>
                   <label className="flex-1 flex flex-col items-center justify-center gap-1 border border-slate-200 rounded-2xl px-2 py-3 cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 group transition-all shadow-sm bg-white">
                      <input type="checkbox" name="stayingZhudong" value="true" className="w-5 h-5 accent-indigo-600" />
                      <span className="font-black text-slate-600 group-hover:text-indigo-700 text-[10px] sm:text-xs text-center leading-tight">住宿</span>
                   </label>
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end mt-4 w-full">
                 <button disabled={adding} type="submit" className="w-full md:w-auto bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-orange-700 transition-all shadow-xl shadow-orange-200 disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2">
                    {adding ? "儲存中..." : (<><RefreshCw className="w-5 h-5" /> 立即登記資料</>)}
                 </button>
              </div>
           </form>
        </div>
      )}

      {loading && registrations.length === 0 ? (
        <div className="flex-1 flex justify-center items-center bg-white rounded-[2rem] border border-slate-200 shadow-sm min-h-[300px]">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D35400]"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 flex-1 items-stretch pb-12">
           {daysToShow.map(day => <DayView key={format(day, 'yyyy-MM-dd')} dayDate={day} registrations={registrations} />)}
        </div>
      )}
    </div>
  );
};
