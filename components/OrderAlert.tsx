import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Order } from '../types';

interface OrderAlertProps {
  newOrders: Order[];
  onDismiss: () => void;
}

export const OrderAlert: React.FC<OrderAlertProps> = ({ newOrders, onDismiss }) => {
  useEffect(() => {
    if (newOrders.length > 0) {
      // Play sound
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
      audio.play().catch(e => console.log('Audio autoplay blocked', e));
    }
  }, [newOrders]);

  if (newOrders.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <div className="bg-red-600 text-white rounded-lg shadow-lg p-4 max-w-sm flex items-start gap-3 relative">
        <div className="bg-white/20 p-2 rounded-full">
          <AlertTriangle size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg">New Order Received!</h4>
          <p className="text-sm text-red-100 mt-1">
            {newOrders.length} new order(s) waiting for preparation.
          </p>
          <div className="mt-2 text-xs bg-red-700/50 p-2 rounded">
            Latest: {newOrders[0].items} (Table {newOrders[0].tableNumber})
          </div>
        </div>
        <button 
          onClick={onDismiss}
          className="text-red-200 hover:text-white absolute top-2 right-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
