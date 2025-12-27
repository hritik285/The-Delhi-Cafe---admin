import { MenuItem, Order, SheetConfig } from '../types';
import { SHEET_MENU, SHEET_ORDERS } from '../constants';

// Helper to convert sheet rows to objects
const mapRowsToMenu = (rows: any[]): MenuItem[] => {
  if (!rows || rows.length < 2) return [];
  // Assuming headers: ID, Name, Description, Price, Category, Available, Image
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `item-${index}`,
    name: row[1] || 'Unknown Item',
    description: row[2] || '',
    price: row[3] || '0',
    category: row[4] || 'General',
    available: (row[5] || 'TRUE').toUpperCase() === 'TRUE',
    imageUrl: row[6] || undefined
  }));
};

const mapRowsToOrders = (rows: any[]): Order[] => {
  if (!rows || rows.length < 2) return [];
  // Assuming headers: ID, Items, Total, Status, Table, Timestamp
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `ord-${index}`,
    items: row[1] || '',
    total: row[2] || '0',
    status: row[3] || 'Pending',
    tableNumber: row[4] || '?',
    timestamp: row[5] || new Date().toISOString()
  })).reverse(); // Newest first
};

export const fetchSheetData = async (config: SheetConfig, rangeName: string) => {
  if (!config.apiKey) return null;
  
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${rangeName}?key=${config.apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch sheet');
    }
    const data = await response.json();
    return data.values;
  } catch (error) {
    console.error(`Error fetching ${rangeName}:`, error);
    throw error;
  }
};

export const updateSheetRow = async (config: SheetConfig, range: string, values: any[]) => {
  if (!config.accessToken) {
    throw new Error("Access Token required for writing to Sheets. Please configure it in settings.");
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [values] })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Update failed');
  }
  
  return response.json();
};

export const getMenu = async (config: SheetConfig): Promise<MenuItem[]> => {
  const rows = await fetchSheetData(config, SHEET_MENU);
  return mapRowsToMenu(rows);
};

export const getOrders = async (config: SheetConfig): Promise<Order[]> => {
  const rows = await fetchSheetData(config, SHEET_ORDERS);
  return mapRowsToOrders(rows);
};

// Mock data for initial render if no API key
export const getMockMenu = (): MenuItem[] => [
  { id: '1', name: 'Spicy Ramen', description: 'Rich pork broth with chili oil', price: '14.50', category: 'Mains', available: true },
  { id: '2', name: 'Gyoza', description: 'Pan-fried dumplings (6pcs)', price: '8.00', category: 'Appetizers', available: true },
  { id: '3', name: 'Green Tea Mochi', description: 'Soft rice cake with ice cream', price: '5.50', category: 'Dessert', available: true },
];

export const getMockOrders = (): Order[] => [
  { id: '101', items: '2x Spicy Ramen, 1x Gyoza', total: '37.00', status: 'Pending', tableNumber: '4', timestamp: new Date().toLocaleTimeString() },
  { id: '100', items: '1x Green Tea Mochi', total: '5.50', status: 'Delivered', tableNumber: '2', timestamp: new Date(Date.now() - 1000000).toLocaleTimeString() },
];
