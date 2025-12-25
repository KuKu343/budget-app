import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, PieChart, List, Wallet, Utensils, Bus, ShoppingBag, Home, Coffee, MoreHorizontal, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'food', name: '餐饮', icon: <Utensils size={18} />, color: '#EF4444' },
  { id: 'transport', name: '交通', icon: <Bus size={18} />, color: '#3B82F6' },
  { id: 'shopping', name: '购物', icon: <ShoppingBag size={18} />, color: '#F59E0B' },
  { id: 'housing', name: '居住', icon: <Home size={18} />, color: '#10B981' },
  { id: 'entertainment', name: '娱乐', icon: <Coffee size={18} />, color: '#8B5CF6' },
  { id: 'other', name: '其他', icon: <MoreHorizontal size={18} />, color: '#6B7280' },
];

const SimplePieChart = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let cumulativePercent = 0;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="w-40 h-40 rounded-full border-4 border-gray-100 flex items-center justify-center bg-gray-50">
          <span className="text-sm">暂无数据</span>
        </div>
      </div>
    );
  }

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((slice) => {
    const startPercent = cumulativePercent;
    const slicePercent = slice.value / total;
    cumulativePercent += slicePercent;
    const endPercent = cumulativePercent;

    if (slicePercent === 1) {
      return (
        <circle key={slice.name} cx="0" cy="0" r="1" fill={slice.color} />
      );
    }

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);
    const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`,
    ].join(' ');

    return (
      <path d={pathData} fill={slice.color} key={slice.name} stroke="white" strokeWidth="0.02" />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 my-6">
        <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90 shadow-xl rounded-full">
          {slices}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-xs text-gray-500">总支出</span>
            <span className="font-bold text-gray-800">¥{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full px-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-600">{item.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-medium text-gray-800">¥{item.value.toFixed(0)}</span>
              <span className="text-xs text-gray-400">{Math.round((item.value / total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('budgetApp_transactions');
    if (savedData) {
      setTransactions(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('budgetApp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    const newTransaction = {
      id: Date.now(),
      amount: parseFloat(amount),
      category,
      note: note || CATEGORIES.find(c => c.id === category).name,
      date: new Date().toISOString(),
    };
    setTransactions([newTransaction, ...transactions]);
    setAmount('');
    setNote('');
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalExpense = useMemo(() => {
    return transactions.reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const chartData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const cat = CATEGORIES.find(c => c.id === t.category);
      if (!acc[t.category]) {
        acc[t.category] = { name: cat.name, value: 0, color: cat.color };
      }
      acc[t.category].value += t.amount;
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const activeCategory = CATEGORIES.find(c => c.id === category);

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-slate-800 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl overflow-hidden flex flex-col h-screen sm:h-[800px] sm:my-8 sm:rounded-3xl border-gray-200 border">
        <div className="bg-slate-900 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg z-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={120} /></div>
          <div className="relative z-10">
            <h1 className="text-lg font-medium text-slate-300 mb-1">本月总支出 柏智超</h1>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-light">¥</span>
              <span className="text-5xl font-bold tracking-tight">{totalExpense.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mt-4 flex gap-3 text-sm">
               <div className="bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 backdrop-blur-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                {transactions.length} 笔记录
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 -mt-6 z-20 flex justify-center">
          <div className="bg-white p-1 rounded-xl shadow-md flex w-full max-w-[200px] border border-gray-100">
            <button onClick={() => setActiveTab('list')} className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><List size={16} className="mr-1" />明细</button>
            <button onClick={() => setActiveTab('chart')} className={`flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'chart' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><PieChart size={16} className="mr-1" />分析</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
          {activeTab === 'list' ? (
            <div className="space-y-3 pb-20">
              {transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400"><p>还没有记账记录</p></div>
              ) : (
                transactions.map((t) => {
                  const catConfig = CATEGORIES.find(c => c.id === t.category) || CATEGORIES[5];
                  return (
                    <div key={t.id} className="bg-white border border-gray-100 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: catConfig.color }}>{catConfig.icon}</div>
                        <div><p className="font-semibold text-gray-800">{catConfig.name}</p><p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()} · {t.note}</p></div>
                      </div>
                      <div className="flex items-center gap-3"><span className="font-bold text-gray-800">- {t.amount.toFixed(2)}</span><button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button></div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="pb-20 animate-in fade-in zoom-in duration-300"><h2 className="text-lg font-bold text-gray-800 mb-2 px-2">消费类别占比</h2><SimplePieChart data={chartData} /></div>
          )}
        </div>
        <div className="absolute bottom-6 right-6 z-30">
          <button onClick={() => setShowAddModal(true)} className="bg-slate-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all"><Plus size={28} /></button>
        </div>
        {showAddModal && (
          <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full rounded-t-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-gray-800">记一笔</h2><button onClick={() => setShowAddModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"><X size={20} className="text-gray-600"/></button></div>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">金额</label><div className="relative"><span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl text-gray-400 font-light">¥</span><input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus className="w-full pl-8 py-2 text-4xl font-bold text-gray-800 border-b-2 border-gray-100 focus:border-slate-900 focus:outline-none bg-transparent placeholder-gray-200 transition-colors" /></div></div>
                <div><label className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">分类</label><div className="grid grid-cols-6 gap-2">{CATEGORIES.map((cat) => (<button key={cat.id} type="button" onClick={() => setCategory(cat.id)} className={`flex flex-col items-center gap-1 transition-all duration-200 ${category === cat.id ? 'transform scale-110' : 'opacity-60 hover:opacity-100'}`}><div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${category === cat.id ? 'shadow-md ring-2 ring-offset-2 ring-slate-900 text-white' : 'bg-gray-100 text-gray-500'}`} style={{ backgroundColor: category === cat.id ? cat.color : undefined }}>{cat.icon}</div><span className={`text-[10px] font-medium ${category === cat.id ? 'text-gray-800' : 'text-gray-400'}`}>{cat.name}</span></button>))}</div></div>
                <div><label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">备注 (可选)</label><input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={activeCategory ? `例如: ${activeCategory.name}支出` : "添加备注..."} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all" /></div>
                <button type="submit" disabled={!amount} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">确认记录</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}