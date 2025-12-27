import React, { useState } from 'react';
import { MenuItem, SheetConfig } from '../types';
import { Edit2, Save, X, Utensils, Check, AlertCircle } from 'lucide-react';
import { updateSheetRow } from '../services/sheetsService';
import { SHEET_MENU } from '../constants';

interface MenuGridProps {
  menu: MenuItem[];
  config: SheetConfig;
  onRefresh: () => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ menu, config, onRefresh }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditClick = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({ ...item });
    setError(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setError(null);
  };

  const handleSave = async (originalItem: MenuItem, index: number) => {
    if (!config.accessToken) {
      setError("Cannot save: No Google Access Token provided in Settings.");
      return;
    }

    setIsSaving(true);
    try {
      // Construct the row array. Assuming index maps directly to row + 1 (header) + index + 1 (1-based)
      // CAUTION: This is a simplified logic relying on list order.
      // In a real app, we'd search for the ID in the sheet first.
      const rowNumber = index + 2; 
      const range = `${SHEET_MENU}!A${rowNumber}:G${rowNumber}`;
      
      const values = [
        editForm.id || originalItem.id,
        editForm.name || originalItem.name,
        editForm.description || originalItem.description,
        editForm.price || originalItem.price,
        editForm.category || originalItem.category,
        editForm.available !== undefined ? String(editForm.available).toUpperCase() : String(originalItem.available).toUpperCase(),
        editForm.imageUrl || originalItem.imageUrl || ''
      ];

      await updateSheetRow(config, range, values);
      setEditingId(null);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {menu.map((item, index) => (
        <div key={item.id} className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md ${!item.available ? 'opacity-75' : ''}`}>
          {editingId === item.id ? (
            <div className="p-4 space-y-3 bg-blue-50/50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-blue-900">Edit Item</h3>
                <button onClick={handleCancel} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
              </div>
              <input 
                value={editForm.name} 
                onChange={e => setEditForm({...editForm, name: e.target.value})}
                className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Item Name"
              />
              <textarea 
                value={editForm.description} 
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                placeholder="Description"
              />
              <div className="flex gap-2">
                <input 
                  value={editForm.price} 
                  onChange={e => setEditForm({...editForm, price: e.target.value})}
                  className="w-1/2 p-2 text-sm border rounded"
                  placeholder="Price"
                />
                <input 
                  value={editForm.category} 
                  onChange={e => setEditForm({...editForm, category: e.target.value})}
                  className="w-1/2 p-2 text-sm border rounded"
                  placeholder="Category"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={editForm.available} 
                  onChange={e => setEditForm({...editForm, available: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                Available in stock
              </label>
              
              {error && <p className="text-xs text-red-500">{error}</p>}

              <button 
                onClick={() => handleSave(item, index)}
                disabled={isSaving}
                className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isSaving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
              </button>
            </div>
          ) : (
            <>
              <div className="h-32 bg-slate-100 relative">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Utensils size={40} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {item.available ? 'Available' : 'Sold Out'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-lg">{item.name}</h3>
                  <span className="font-mono font-semibold text-slate-600">${item.price}</span>
                </div>
                <p className="text-slate-500 text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.category}</span>
                  <button 
                    onClick={() => handleEditClick(item)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
