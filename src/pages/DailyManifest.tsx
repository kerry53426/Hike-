import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { zhTW } from "date-fns/locale";
import { getRegistrations, updateRegistration } from "../lib/pantry";
import { Registration } from "../types";
import { ChevronLeft, ChevronRight, MapPin, ArrowUp, ArrowDown, Plus, X, RefreshCw, Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

const DayView = ({ dayDate, registrations }: { dayDate: Date, registrations: Registration[] }) => {
  const [expanded, setExpanded] = useState(isToday(dayDate));
  
  const dateStr = format(dayDate, "yyyy-MM-dd");
  const dayRegs = registrations.filter(r => r.date === dateStr);
  const goingUp = dayRegs.filter(r => r.goingUp);
  const goingDown = dayRegs.filter(r => r.goingDown);
  const stayingUser = dayRegs.filter(r => r.stayingZhudong);

  return (
    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all">
       <div 
         onClick={() => setExpanded(!expanded)}
         className={clsx("p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors", expanded && "bg-slate-50 border-b border-slate-100")}
       >
           <div className="flex items-center gap-3">
               <span className={clsx("font-black font-mono text-xl sm:text-2xl", isToday(dayDate) ? "text-[#2D5A27]" : "text-slate-800")}>{format(dayDate, "MM.dd")}</span>
               <span className={clsx("text-sm font-bold", isToday(dayDate) ? "text-[#2D5A27]" : "text-slate-500")}>{format(dayDate, "EEE", { locale: zhTW }).toUpperCase()}</span>
               {isToday(dayDate) && <span className="text-[10px] bg-[#2D5A27] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shrink-0">TODAY</span>}
           </div>

           <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-0.5" title="下山">
                 <span className="text-[10px] font-bold text-slate-400">下山</span>
                 <div className="flex items-center gap-1.5">
                    <ArrowDown className="w-3.5 h-3.5 text-[#27AE60]" />
                    <span className="font-black text-slate-700 text-lg leading-none">{goingDown.length}</span>
                 </div>
              </div>
              <div className="flex flex-col items-center gap-0.5" title="上山">
                 <span className="text-[10px] font-bold text-slate-400">上山</span>
                 <div className="flex items-center gap-1.5">
                    <ArrowUp className="w-3.5 h-3.5 text-[#D35400]" />
                    <span className="font-black text-slate-700 text-lg leading-none">{goingUp.length}</span>
                 </div>
              </div>
              <div className="flex flex-col items-center gap-0.5" title="住宿">
                 <span className="text-[10px] font-bold text-slate-400">住宿</span>
                 <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2980B9]" />
                    <span className="font-black text-slate-700 text-lg leading-none">{stayingUser.length}</span>
                 </div>
              </div>
              <div className="w-8 h-8 ml-2 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shrink-0 shadow-sm">
                 {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
           </div>
       </div>

       {expanded && (
         <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white animate-in zoom-in-95 duration-200 origin-top">
            <div className="space-y-3">
              <h3 className="text-[11px] uppercase tracking-widest font-black text-[#27AE60] flex items-center gap-2 bg-[#EAF1EA] px-3 py-1.5 rounded-lg w-fit">
                <ArrowDown className="w-3.5 h-3.5" /> 下山名單 <span className="bg-[#27AE60] text-white px-1.5 py-0.5 rounded-md text-[10px] ml-1">{goingDown.length}</span>
              </h3>
              {goingDown.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
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

            <div className="space-y-3">
              <h3 className="text-[11px] uppercase tracking-widest font-black text-[#D35400] flex items-center gap-2 bg-[#FFF4E5] px-3 py-1.5 rounded-lg w-fit">
                <ArrowUp className="w-3.5 h-3.5" /> 上山名單 <span className="bg-[#D35400] text-white px-1.5 py-0.5 rounded-md text-[10px] ml-1">{goingUp.length}</span>
              </h3>
              {goingUp.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
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

            <div className="space-y-3">
              <h3 className="text-[11px] font-black tracking-widest text-[#2980B9] uppercase flex items-center gap-2 bg-[#EBF5FB] px-3 py-1.5 rounded-lg w-fit">
                <MapPin className="w-3.5 h-3.5" /> 竹東住宿 <span className="bg-[#2980B9] text-white px-1.5 py-0.5 rounded-md text-[10px] ml-1">{stayingUser.length}</span>
              </h3>
              {stayingUser.length === 0 ? (
                <div className="text-sm font-medium text-slate-400 py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  無人登記
                </div>
              ) : (
                  <ul className="text-sm text-slate-500 font-medium flex flex-wrap gap-2">
                    {stayingUser.map(user => (
                      <li key={`${user.userId}_zhudong`} className="bg-slate-50 border border-slate-200/60 px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                          <span className="text-xs font-bold">{user.userName}</span>
                          {user.phone && <a href={`tel:${user.phone}`} title={user.phone} className="text-[#2980B9] hover:text-[#1A5276]">
                             <CalendarIcon className="w-3 h-3" />
                          </a>}
                      </li>
                    ))}
                  </ul>
              )}
            </div>
         </div>
       )}
    </div>
  );
};

export const DailyManifest = () => {
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

    const docId = `${phone}_${dateStr}`;
    const payload: Registration = {
        userId: phone,
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
           <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 shrink-0">
             每日接駁名單 <span className="bg-[#FFF4E5] text-[#D35400] text-sm px-2.5 py-1 rounded-xl tracking-widest font-black uppercase">三日檢視</span>
           </h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
          <button 
            onClick={() => {
              setAddDateStr(format(baseDate, "yyyy-MM-dd"));
              setShowAddForm(true);
            }} 
            className="text-sm font-bold text-white bg-[#D35400] px-4 py-2 rounded-xl transition-colors hover:bg-[#b04500] flex items-center gap-1 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> 代填登記
          </button>

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
        <div className="bg-white rounded-[2rem] border-2 border-[#D35400] p-6 shadow-lg relative animate-in fade-in slide-in-from-top-4 z-20">
           <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-4 h-4" />
           </button>
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#D35400]">
              <Plus className="w-5 h-5" /> 司機代填乘車登記
           </h2>
           <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2 items-start">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">日期</label>
                <input 
                  type="date" 
                  name="dateStr" 
                  required 
                  value={addDateStr}
                  onChange={e => setAddDateStr(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 font-medium font-mono text-slate-700 bg-white" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">員工姓名</label>
                <input 
                   name="name" 
                   required 
                   placeholder="王大明" 
                   list="name-list"
                   value={addName}
                   onChange={handleNameChange}
                   className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 font-medium bg-white" 
                />
                <datalist id="name-list">
                   {allUsers.map(u => <option key={`name_${u.phone}`} value={u.name} />)}
                </datalist>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">聯絡電話</label>
                <input 
                   name="phone" 
                   required 
                   placeholder="09..." 
                   list="phone-list"
                   value={addPhone}
                   onChange={handlePhoneChange}
                   className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 font-medium bg-white" 
                />
                <datalist id="phone-list">
                   {allUsers.map(u => <option key={`phone_${u.phone}`} value={u.phone}>{u.name}</option>)}
                </datalist>
              </div>

              <div className="flex flex-col gap-1">
                 <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">選項</label>
                 <div className="flex gap-2">
                   <label className="flex-1 flex flex-col items-center justify-center gap-1 border border-slate-200 rounded-xl px-1 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input type="checkbox" name="goingDown" value="true" className="w-4 h-4 accent-[#27AE60]" />
                      <span className="font-bold text-slate-700 text-xs">下山</span>
                   </label>
                   <label className="flex-1 flex flex-col items-center justify-center gap-1 border border-slate-200 rounded-xl px-1 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input type="checkbox" name="goingUp" value="true" className="w-4 h-4 accent-[#D35400]" />
                      <span className="font-bold text-slate-700 text-xs">上山</span>
                   </label>
                   <label className="flex-1 flex flex-col items-center justify-center gap-1 border border-slate-200 rounded-xl px-1 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input type="checkbox" name="stayingZhudong" value="true" className="w-4 h-4 accent-[#2980B9]" />
                      <span className="font-bold text-slate-700 text-xs text-center leading-tight">住宿</span>
                   </label>
                </div>
              </div>
              <div className="md:col-span-4 flex justify-end mt-2">
                 <button disabled={adding} type="submit" className="bg-[#D35400] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b04500] transition-colors shadow-sm disabled:opacity-50">
                    {adding ? "儲存中..." : "確定新增"}
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
        <div className="flex flex-col gap-4 flex-1 items-stretch pb-8">
           {daysToShow.map(day => <DayView key={format(day, 'yyyy-MM-dd')} dayDate={day} registrations={registrations} />)}
        </div>
      )}
    </div>
  );
};
