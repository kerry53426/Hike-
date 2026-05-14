import React, { useState, useEffect } from "react";
import { format, addDays, subDays, isToday } from "date-fns";
import { zhTW } from "date-fns/locale";
import { getRegistrations, updateRegistration } from "../lib/pantry";
import { Registration } from "../types";
import { ChevronLeft, ChevronRight, MapPin, ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import clsx from "clsx";

export const DailyManifest = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [allUsers, setAllUsers] = useState<{name: string, phone: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");

  const fetchDailyData = async (dateObj: Date) => {
    setLoading(true);
    const dateStr = format(dateObj, "yyyy-MM-dd");
    try {
      const allData = await getRegistrations();
      const data: Registration[] = [];
      const usersMap = new Map<string, string>();
      Object.entries(allData).forEach(([key, reg]) => {
          if (reg && reg.phone && reg.userName) {
              usersMap.set(reg.phone, reg.userName);
          }
          if (reg && reg.date === dateStr && !reg.deleted) {
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
    fetchDailyData(currentDate);
  }, [currentDate]);

  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    const fd = new FormData(e.currentTarget);
    const name = addName.trim() || (fd.get('name') as string).trim();
    const phone = addPhone.trim() || (fd.get('phone') as string).trim();
    const goingUp = fd.get('goingUp') === 'true';
    const goingDown = fd.get('goingDown') === 'true';
    const stayingZhudong = fd.get('stayingZhudong') === 'true';

    const docId = `${phone}_${format(currentDate, "yyyy-MM-dd")}`;
    const payload: Registration = {
        userId: phone,
        userName: name,
        phone: phone,
        date: format(currentDate, "yyyy-MM-dd"),
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
        fetchDailyData(currentDate);
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

  const goingUp = registrations.filter(r => r.goingUp);
  const goingDown = registrations.filter(r => r.goingDown);
  const stayingUser = registrations.filter(r => r.stayingZhudong);

  return (
    <div className="flex flex-col h-full gap-4 pb-8">
      {/* Header Controls in a Bento Box */}
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-slate-900 leading-none mb-1">
            {format(currentDate, "MM.dd")} <span className="text-slate-400 font-mono text-xl">{format(currentDate, "EEE", { locale: zhTW }).toUpperCase()}</span>
          </h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[#2D5A27]">每日接駁與住宿名單</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddForm(true)} 
            className="text-sm font-bold text-white bg-[#D35400] px-4 py-2 rounded-xl transition-colors hover:bg-[#b04500] flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-4 h-4" /> 代填登記
          </button>

          {!isToday(currentDate) && (
            <button onClick={goToToday} className="text-sm font-bold text-[#2D5A27] bg-[#EAF1EA] px-4 py-2 rounded-xl transition-colors">
              回到今天
            </button>
          )}
          <div className="flex items-center space-x-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            <button onClick={prevDay} className="p-2 bg-white shadow-sm hover:shadow text-slate-700 rounded-xl transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center justify-center min-w-[120px]">
               <span className="text-sm font-bold text-slate-900 font-mono">
                {format(currentDate, "yyyy-MM-dd")}
              </span>
            </div>
            <button onClick={nextDay} className="p-2 bg-white shadow-sm hover:shadow text-slate-700 rounded-xl transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-[2rem] border-2 border-[#D35400] p-6 shadow-lg relative animate-in fade-in slide-in-from-top-4">
           <button onClick={() => setShowAddForm(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-4 h-4" />
           </button>
           <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#D35400]">
              <Plus className="w-5 h-5" /> 司機代填乘車登記 (<span className="font-mono">{format(currentDate, "MM.dd")}</span>)
           </h2>
           <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <input 
                 name="name" 
                 required 
                 placeholder="員工姓名" 
                 list="name-list"
                 value={addName}
                 onChange={handleNameChange}
                 className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 font-medium" 
              />
              <datalist id="name-list">
                 {allUsers.map(u => <option key={`name_${u.phone}`} value={u.name} />)}
              </datalist>

              <input 
                 name="phone" 
                 required 
                 placeholder="員工聯絡電話" 
                 list="phone-list"
                 value={addPhone}
                 onChange={handlePhoneChange}
                 className="px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D35400] focus:ring-2 focus:ring-[#D35400]/20 font-medium" 
              />
              <datalist id="phone-list">
                 {allUsers.map(u => <option key={`phone_${u.phone}`} value={u.phone}>{u.name}</option>)}
              </datalist>

              <div className="flex gap-2">
                 <label className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-2 py-3 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" name="goingDown" value="true" className="w-4 h-4 accent-[#27AE60]" />
                    <span className="font-bold text-slate-700 text-sm">下山</span>
                 </label>
                 <label className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-2 py-3 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" name="goingUp" value="true" className="w-4 h-4 accent-[#D35400]" />
                    <span className="font-bold text-slate-700 text-sm">上山</span>
                 </label>
                 <label className="flex-1 flex items-center justify-center gap-2 border border-slate-200 rounded-xl px-2 py-3 cursor-pointer hover:bg-slate-50">
                    <input type="checkbox" name="stayingZhudong" value="true" className="w-4 h-4 accent-[#2980B9]" />
                    <span className="font-bold text-slate-700 text-sm hidden sm:inline">竹東住宿</span>
                    <span className="font-bold text-slate-700 text-sm sm:hidden">住宿</span>
                 </label>
              </div>
              <div className="md:col-span-3 flex justify-end mt-2">
                 <button disabled={adding} type="submit" className="bg-[#D35400] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b04500] transition-colors shadow-sm disabled:opacity-50">
                    {adding ? "儲存中..." : "確定新增"}
                 </button>
              </div>
           </form>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex justify-center items-center bg-white rounded-[2rem] border border-slate-200 shadow-sm min-h-[300px]">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D5A27]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 lg:grid-rows-3 auto-rows-min">
          {/* Stats Bento Box */}
          <div className="md:col-span-4 lg:col-span-3 lg:row-span-3 bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-col shadow-sm">
            <h2 className="text-xl font-bold mb-4">今日概覽</h2>
            <div className="space-y-4 flex-1">
              <div className="bg-[#EAF1EA] p-4 rounded-2xl flex flex-col justify-center min-h-[100px]">
                <p className="text-[10px] font-bold text-[#2D5A27] uppercase mb-1">下山總數</p>
                <p className="text-4xl font-black text-slate-900">{goingDown.length} <span className="text-lg font-normal text-slate-600">位</span></p>
              </div>
              <div className="bg-[#FFF4E5] p-4 rounded-2xl flex flex-col justify-center min-h-[100px]">
                <p className="text-[10px] font-bold text-[#D35400] uppercase mb-1">上山總數</p>
                <p className="text-4xl font-black text-slate-900">{goingUp.length} <span className="text-lg font-normal text-slate-600">位</span></p>
              </div>
              <div className="bg-[#EBF5FB] p-4 rounded-2xl flex flex-col justify-center min-h-[100px]">
                <p className="text-[10px] font-bold text-[#2980B9] uppercase mb-1">竹東過夜</p>
                <p className="text-4xl font-black text-slate-900">{stayingUser.length} <span className="text-lg font-normal text-slate-600">位</span></p>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 lg:col-span-5 lg:row-span-3 bg-white rounded-[2rem] border-2 border-[#2D5A27] p-6 shadow-md flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold tracking-widest text-[#2D5A27]">乘車名單</h2>
              <span className="bg-[#2D5A27] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">司機確認</span>
            </div>
            <div className="grid grid-cols-2 gap-6 h-full">
              <div className="flex flex-col border-r border-slate-100 pr-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3 flex items-center gap-1">
                  <span className="text-[#27AE60]">▼</span> 下山員工
                </span>
                {goingDown.length === 0 ? (
                  <span className="text-sm font-medium text-slate-400 mt-2">無人下山</span>
                ) : (
                  <ul className="text-sm space-y-3 font-bold text-slate-700">
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
              <div className="flex flex-col pl-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-3 flex items-center gap-1">
                  <span className="text-[#E67E22]">▲</span> 上山員工
                </span>
                {goingUp.length === 0 ? (
                  <span className="text-sm font-medium text-slate-400 mt-2">無人上山</span>
                ) : (
                  <ul className="text-sm space-y-3 font-bold text-slate-700">
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
            </div>
          </div>

          {/* Zhudong List (Dark Bento Box) */}
          <div className="md:col-span-4 lg:col-span-4 lg:row-span-3 bg-[#1A1C1E] rounded-[2rem] p-6 text-white overflow-hidden relative shadow-md min-h-[300px]">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-blue-400">竹東宿舍管理</h2>
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm font-bold text-slate-300">今日入住名單</span>
                  <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold">{stayingUser.length} 人</span>
                </div>
                {stayingUser.length === 0 ? (
                   <div className="text-xs text-slate-500 italic mt-4">今日無人住宿</div>
                ) : (
                   <ul className="text-sm text-slate-300 space-y-3 font-medium flex flex-wrap gap-2">
                     {stayingUser.map(user => (
                        <li key={`${user.userId}_zhudong`} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                           <div className="flex items-center gap-2">
                               <MapPin className="w-3 h-3 text-blue-400" />
                               {user.userName}
                           </div>
                           {user.phone && <a href={`tel:${user.phone}`} className="text-[10px] text-blue-300 font-mono border border-blue-400/30 px-1.5 py-0.5 rounded-md hover:bg-blue-400/10 shrink-0 w-fit">{user.phone}</a>}
                        </li>
                     ))}
                   </ul>
                )}
              </div>
            </div>
            {/* Background design pattern */}
            <div className="absolute -right-8 -bottom-8 opacity-[0.03]">
              <svg width="160" height="160" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
