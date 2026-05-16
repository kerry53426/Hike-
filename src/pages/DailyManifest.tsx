import React, { useState, useEffect, useMemo } from "react";
import { format, addDays, subDays, isToday, startOfToday } from "date-fns";
import { zhTW } from "date-fns/locale";
import { getRegistrations, updateRegistration } from "../lib/pantry";
import { Registration } from "../types";
import { ChevronLeft, ChevronRight, MapPin, ArrowUp, ArrowDown, Plus, X, RefreshCw, Calendar as CalendarIcon, ChevronDown, ChevronUp, Phone, Eye, EyeOff, Trash2, Users, Download } from "lucide-react";
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
      isToday(dayDate) ? "border-[#1B4332]/30 shadow-md ring-1 ring-[#1B4332]/5" : "border-slate-200"
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
                 isToday(dayDate) ? "bg-[#1B4332] text-white" : "bg-slate-100 text-slate-600"
               )}>
                 <span className="text-xs font-black opacity-80 leading-none">{format(dayDate, "MMM")}</span>
                 <span className="text-xl sm:text-2xl font-black leading-none">{format(dayDate, "dd")}</span>
               </div>
               <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-slate-900">{format(dayDate, "EEEE", { locale: zhTW })}</span>
                    {isToday(dayDate) && <span className="text-[9px] bg-[#1B4332] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">今天 Today</span>}
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
  const [deletingUser, setDeletingUser] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addDateStr, setAddDateStr] = useState(format(new Date(), "yyyy-MM-dd"));
  const [addDirection, setAddDirection] = useState<"up" | "down" | "stay">("down");
  const [addNote, setAddNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isStaffListExpanded, setIsStaffListExpanded] = useState(false);

  const filteredUsers = allUsers.filter(u => u.name.includes(searchTerm) || u.phone.includes(searchTerm));

  const fetchDailyData = async () => {
    setLoading(true);
    try {
      const allData = await getRegistrations();
      const data: Registration[] = [];
      const usersMap = new Map<string, string>(); // name -> phone
      Object.entries(allData).forEach(([key, reg]) => {
          if (reg && reg.userName && !reg.deleted) {
              if (!usersMap.has(reg.userName) || reg.phone) {
                  usersMap.set(reg.userName, reg.phone || "");
              }
              data.push(reg);
          }
      });
      setRegistrations(data);
      setAllUsers(Array.from(usersMap.entries()).map(([name, phone]) => ({ phone, name })).sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
  }, []);

  const handleDeleteUser = async (userName: string) => {
    if (!confirm(`確定要刪除員工「${userName}」的所有登記資料嗎？\n此操作無法復原。`)) return;
    
    setLoading(true);
    try {
      const allData = await getRegistrations();
      const userRegEntries = Object.entries(allData).filter(([_, reg]) => reg.userName === userName);
      
      for (const [id, reg] of userRegEntries) {
        await updateRegistration(id, { ...reg, deleted: true });
      }
      
      await fetchDailyData();
      alert(`已刪除員工 ${userName} 的所有資料`);
    } catch (err) {
      console.error(err);
      alert("刪除失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    try {
      const payload: Partial<Registration> = {
        userId: addName,
        userName: addName,
        phone: addPhone,
        date: addDateStr,
        goingUp: addDirection === 'up',
        goingDown: addDirection === 'down',
        stayingZhudong: addDirection === 'stay',
        note: addNote,
        updatedAt: new Date().toISOString()
      };
      await updateRegistration(`${addName}_${addDateStr}`, payload as Registration);
      setAddName("");
      setAddPhone("");
      setAddNote("");
      setShowAddForm(false);
      await fetchDailyData();
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const exportToCSV = (dayDate: Date) => {
    const dateStr = format(dayDate, "yyyy-MM-dd");
    const dayRegs = registrations.filter(r => r.date === dateStr);
    
    const goingDown = dayRegs.filter(r => r.goingDown);
    const goingUp = dayRegs.filter(r => r.goingUp);
    const stayingZhudong = dayRegs.filter(r => r.stayingZhudong);

    let csvContent = "\uFEFF"; 
    csvContent += `雪霸農場交通接駁登記表 - ${format(dayDate, "yyyy/MM/dd")}\n\n`;

    csvContent += "=== 下山名單 (DOWN-MTN) ===\n";
    csvContent += "姓名 Name,電話 Phone\n";
    goingDown.forEach(r => csvContent += `${r.userName},'${r.phone || ""}\n`);
    csvContent += `共計: ${goingDown.length} 人\n\n`;

    csvContent += "=== 上山名單 (UP-MTN) ===\n";
    csvContent += "姓名 Name,電話 Phone\n";
    goingUp.forEach(r => csvContent += `${r.userName},'${r.phone || ""}\n`);
    csvContent += `共計: ${goingUp.length} 人\n\n`;

    csvContent += "=== 竹東住宿 (STAY) ===\n";
    csvContent += "姓名 Name,電話 Phone\n";
    stayingZhudong.forEach(r => csvContent += `${r.userName},'${r.phone || ""}\n`);
    csvContent += `共計: ${stayingZhudong.length} 人\n`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `雪霸接駁_${format(dayDate, "MMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const daysToShow = useMemo(() => {
    const today = startOfToday();
    return [baseDate, addDays(baseDate, 1), addDays(baseDate, 2)].filter(day => day >= today);
  }, [baseDate]);

  if (appUser?.role === 'admin') {
     return (
       <div className="space-y-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
             {/* Left: Staff Management */}
             <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-xl shadow-emerald-900/5 p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-4 mb-6 relative z-20">
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-[#1B4332] text-white rounded-2xl flex items-center justify-center shadow-lg">
                           <Users className="w-7 h-7" />
                         </div>
                         <div>
                           <h2 className="text-2xl font-black text-slate-900 leading-tight">員工管理</h2>
                           <p className="text-xs font-black text-emerald-600 tracking-widest uppercase opacity-60">Staff Directory</p>
                         </div>
                       </div>
                       <button 
                         onClick={() => setIsStaffListExpanded(!isStaffListExpanded)} 
                         className="p-3 text-slate-400 bg-white hover:bg-slate-50 hover:text-emerald-700 rounded-2xl transition-all shadow-sm border border-slate-100"
                       >
                         {isStaffListExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                       </button>
                    </div>

                    {isStaffListExpanded && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="relative mb-6">
                           <input 
                             type="text" 
                             placeholder="搜尋姓名或電話..." 
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-[#1B4332] transition-all font-bold text-slate-700 outline-none"
                           />
                           <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        </div>

                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                           {filteredUsers.length === 0 ? (
                             <div className="text-center py-10 text-slate-300 font-bold italic">找不到員工資料</div>
                           ) : (
                             filteredUsers.map(u => (
                               <div key={u.name} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-emerald-200 hover:bg-white transition-all group">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-emerald-600 shadow-sm">
                                        {u.name.charAt(0)}
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="font-bold text-slate-700">{u.name}</span>
                                        <span className="text-[10px] font-mono text-slate-400">{u.phone || "未留電話"}</span>
                                     </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                     {u.phone && (
                                       <a href={`tel:${u.phone}`} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                         <Phone className="w-4 h-4" />
                                       </a>
                                     )}
                                     <button 
                                       onClick={() => handleDeleteUser(u.name)}
                                       className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                     >
                                       <Trash2 className="w-4 h-4" />
                                     </button>
                                     <button 
                                       onClick={() => {
                                          setAddName(u.name);
                                          setAddPhone(u.phone || "");
                                          setShowAddForm(true);
                                       }}
                                       className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                       title="代填登記"
                                     >
                                       <Plus className="w-4 h-4" />
                                     </button>
                                  </div>
                               </div>
                             ))
                           )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-[#1B4332] text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-900/10 hover:bg-slate-900 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <Plus className="w-6 h-6" /> 新增代填登記
                </button>
             </div>

             {/* Right: Manifest Overview */}
             <div className="lg:col-span-12 xl:col-span-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 leading-tight">接駁概覽</h2>
                        <p className="text-xs font-black text-slate-400 tracking-widest uppercase opacity-60">System Manifest Tracking</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                          <button onClick={() => setBaseDate(subDays(baseDate, 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm">
                            <ChevronLeft className="w-5 h-5 text-slate-400" />
                          </button>
                          <div className="px-4 font-black font-mono text-emerald-800">{format(baseDate, "MM.dd")}</div>
                          <button onClick={() => setBaseDate(addDays(baseDate, 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-none hover:shadow-sm">
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </button>
                        </div>
                        <button onClick={fetchDailyData} className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all">
                          <RefreshCw className={clsx("w-5 h-5", loading && "animate-spin")} />
                        </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                      {Array.from({length: 7}).map((_, i) => addDays(baseDate, i)).map(day => (
                        <DayView key={day.toISOString()} dayDate={day} registrations={registrations} />
                      ))}
                   </div>
                </div>
             </div>
          </div>

          {showAddForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
              <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#1B4332]"></div>
                <button onClick={() => setShowAddForm(false)} className="absolute top-6 right-6 p-3 text-slate-300 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
                
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center">
                      <Plus className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">幫員工代填</h3>
                      <p className="text-sm font-bold text-slate-400">Proxy Registration Form</p>
                    </div>
                  </div>

                  <form onSubmit={handleAddSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">員工姓名 STAFF</label>
                        <input 
                          required 
                          list="staff-names"
                          placeholder="請輸入或選擇姓名"
                          value={addName}
                          onChange={e => {
                            setAddName(e.target.value);
                            const found = allUsers.find(u => u.name === e.target.value);
                            if (found) setAddPhone(found.phone);
                          }}
                          className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-[#1B4332] transition-all font-bold outline-none"
                        />
                        <datalist id="staff-names">
                          {allUsers.map(u => <option key={u.name} value={u.name} />)}
                        </datalist>
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">日期 DATE</label>
                         <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar items-center">
                           {[0, 1, 2].map(offset => {
                             const dStr = format(addDays(new Date(), offset), "yyyy-MM-dd");
                             return (
                               <button
                                 key={offset}
                                 type="button"
                                 onClick={() => setAddDateStr(dStr)}
                                 className={clsx(
                                   "flex-1 px-3 py-3 rounded-xl font-black text-sm transition-all whitespace-nowrap",
                                   addDateStr === dStr ? "bg-white shadow-sm text-[#1B4332]" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                                 )}
                               >
                                 {offset === 0 ? "今天" : offset === 1 ? "明天" : "後天"}
                                 <span className="text-[10px] font-mono ml-1.5 opacity-60">({format(addDays(new Date(), offset), "MM.dd")})</span>
                               </button>
                             )
                           })}
                           <input 
                             type="date" 
                             required 
                             value={addDateStr}
                             onChange={e => setAddDateStr(e.target.value)}
                             title="選擇其他日期"
                             className="bg-transparent text-slate-400 font-bold ml-1 outline-none p-2 rounded-xl hover:bg-slate-100 transition-colors shrink-0 w-8 flex justify-center [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer relative overflow-hidden"
                             style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', color: 'transparent' }}
                           />
                         </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">方向 DIRECTION</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['down', 'up', 'stay'].map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => setAddDirection(dir as any)}
                            className={clsx(
                              "py-4 rounded-2xl font-black transition-all border-2",
                              addDirection === dir 
                                ? "bg-[#1B4332] border-[#1B4332] text-white shadow-lg" 
                                : "bg-white border-slate-100 text-slate-400 hover:border-emerald-100 shadow-sm"
                            )}
                          >
                            {dir === 'down' ? '下山' : dir === 'up' ? '上山' : '住宿'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">備註 NOTE (選填)</label>
                      <input 
                        placeholder="例: 行李較多、攜帶寵物..."
                        value={addNote}
                        onChange={e => setAddNote(e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-[#1B4332] transition-all font-bold outline-none"
                      />
                    </div>

                    <button 
                      type="submit" 
                      disabled={adding || !addName}
                      className="w-full bg-[#1B4332] hover:bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-emerald-900/10 transition-all disabled:opacity-50 mt-4 active:scale-95"
                    >
                      {adding ? "儲存中..." : "確認登記"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
       </div>
     );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-white p-4 sm:p-5 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between w-full xl:w-auto">
           <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex flex-wrap items-center gap-2 shrink-0">
             每日接駁名單 <span className="bg-[#FFF4E5] text-[#D35400] text-xs sm:text-sm px-2.5 py-1 rounded-xl tracking-widest font-black uppercase">三日檢視</span>
           </h2>
        </div>
        
        <div className="flex flex-wrap items-center justify-end gap-2 w-full xl:w-auto">
          <button onClick={fetchDailyData} title="重新整理取得最新資料" className="p-2 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors bg-white border border-slate-200 shadow-sm shrink-0">
            <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin text-[#D35400]")} />
          </button>

          <div className="flex items-center gap-1 bg-white border border-slate-100 p-1 rounded-xl shadow-sm overflow-x-auto no-scrollbar w-full sm:w-auto mt-2 sm:mt-0 xl:w-auto">
             <button onClick={() => setBaseDate(new Date())} className={clsx("text-[10px] uppercase tracking-widest font-black px-4 py-2 rounded-lg whitespace-nowrap transition-all flex-1 sm:flex-none", isToday(baseDate) ? "bg-[#1B4332] text-white shadow-md shadow-emerald-900/10" : "text-slate-400 hover:bg-slate-50 hover:text-emerald-800")}>回到今天</button>
          </div>

          <div className="flex items-center justify-between space-x-1 bg-white p-1.5 rounded-2xl border border-slate-100 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 xl:w-auto">
            <button onClick={() => setBaseDate(subDays(baseDate, 3))} className="p-2 bg-slate-50 shadow-sm hover:shadow text-slate-700 rounded-xl transition-all" title="前三天">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center justify-center min-w-[150px] relative px-4">
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
               <span className="text-sm font-black text-[#1B4332] font-mono pointer-events-none">
                {format(baseDate, "MM.dd")} - {format(addDays(baseDate, 2), "MM.dd")}
              </span>
            </div>
            <button onClick={() => setBaseDate(addDays(baseDate, 3))} className="p-2 bg-slate-50 shadow-sm hover:shadow text-slate-700 rounded-xl transition-all" title="後三天">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

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
