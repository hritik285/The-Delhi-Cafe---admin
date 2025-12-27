import React, { useEffect, useState, useCallback } from 'react';
import { MenuItem, Order, SheetConfig, Tab } from './types';
import { DEFAULT_SPREADSHEET_ID, POLLING_INTERVAL } from './constants';
import { getMenu, getOrders, getMockMenu, getMockOrders } from './services/sheetsService';
import { MenuGrid } from './components/MenuGrid';
import { OrderAlert } from './components/OrderAlert';
import { SettingsModal } from './components/SettingsModal';
import { ChatAssistant } from './components/ChatAssistant';
import { LayoutDashboard, ShoppingBag, Settings, AlertOctagon, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MENU);
  const [config, setConfig] = useState<SheetConfig>({
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    apiKey: '', // Empty initially, user needs to set via Modal for real data
  });

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial Data Load
  const fetchData = useCallback(async (isPolling = false) => {
    if (!config.apiKey) {
      if (!isPolling) {
        setMenu(getMockMenu());
        setOrders(getMockOrders());
        setLastOrderCount(getMockOrders().length);
      }
      return;
    }

    if (!isPolling) setLoading(true);
    setError(null);

    try {
      const [menuData, ordersData] = await Promise.all([
        getMenu(config),
        getOrders(config)
      ]);

      setMenu(menuData);
      setOrders(ordersData);

      // Check for new orders
      if (ordersData.length > lastOrderCount) {
        const diff = ordersData.length - lastOrderCount;
        const brandNew = ordersData.slice(0, diff);
        setNewOrders(brandNew);
      }
      setLastOrderCount(ordersData.length);

    } catch (err: any) {
      setError("Connection failed. Check Settings.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [config, lastOrderCount]);

  // Initial fetch and Polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Open settings if no API key on mount
  useEffect(() => {
    // Only auto-open if it's completely blank, but maybe user just wants to see mocks.
    // Let's not be too intrusive.
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">MenuMaster</h1>
              <p className="text-xs text-slate-500">Live Sync</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab(Tab.MENU)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === Tab.MENU ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <LayoutDashboard size={18} /> Menu
            </button>
            <button 
              onClick={() => setActiveTab(Tab.ORDERS)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${activeTab === Tab.ORDERS ? 'bg-orange-50 text-orange-600 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ShoppingBag size={18} /> Orders
              {orders.filter(o => o.status === 'Pending').length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {orders.filter(o => o.status === 'Pending').length}
                </span>
              )}
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => fetchData()}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
              title="Force Refresh"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Warning Banner if No API Key */}
        {!config.apiKey && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertOctagon className="text-yellow-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-yellow-900">Demo Mode</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You are viewing mock data. To connect to the real Google Sheet, click the Settings icon and enter your Google API Key.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            Error: {error}
          </div>
        )}

        {activeTab === Tab.MENU && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-bold text-slate-800">Menu Management</h2>
              <span className="text-sm text-slate-500">
                {menu.length} items found
              </span>
            </div>
            <MenuGrid 
              menu={menu} 
              config={config} 
              onRefresh={fetchData} 
            />
          </div>
        )}

        {activeTab === Tab.ORDERS && (
          <div className="animate-[fadeIn_0.5s_ease-out]">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 px-2">Live Order Stream</h2>
            <div className="bg-white shadow rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Table</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{order.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{order.tableNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{order.items}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-600">${order.total}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.status === 'Pending' ? 'bg-red-100 text-red-800 animate-pulse' : 
                              order.status === 'Ready' ? 'bg-green-100 text-green-800' : 
                              'bg-slate-100 text-slate-800'}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                          No active orders found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Components Overlay */}
      <OrderAlert newOrders={newOrders} onDismiss={() => setNewOrders([])} />
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSave={setConfig}
      />

      <ChatAssistant menu={menu} />

    </div>
  );
};

export default App;
