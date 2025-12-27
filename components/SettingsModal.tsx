import React, { useState } from 'react';
import { SheetConfig } from '../types';
import { Save, X, Lock, Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SheetConfig;
  onSave: (config: SheetConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [formData, setFormData] = useState(config);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">Connection Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Spreadsheet ID</label>
            <div className="relative">
              <input 
                type="text" 
                value={formData.spreadsheetId}
                onChange={e => setFormData({...formData, spreadsheetId: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
              />
              <div className="absolute left-3 top-2.5 text-slate-400"><Key size={16} /></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">From the Google Sheets URL</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google API Key (Read Access)</label>
            <div className="relative">
              <input 
                type="password" 
                value={formData.apiKey}
                onChange={e => setFormData({...formData, apiKey: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                placeholder="Required for fetching data"
              />
              <div className="absolute left-3 top-2.5 text-slate-400"><Lock size={16} /></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Google Access Token (Write Access)</label>
            <div className="relative">
              <input 
                type="password" 
                value={formData.accessToken || ''}
                onChange={e => setFormData({...formData, accessToken: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm font-mono"
                placeholder="Optional: Required for updating menu"
              />
              <div className="absolute left-3 top-2.5 text-slate-400"><Lock size={16} /></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Short-lived OAuth2 token for editing.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">Cancel</button>
          <button 
            onClick={() => { onSave(formData); onClose(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
