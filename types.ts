export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl?: string;
  available: boolean;
}

export interface Order {
  id: string;
  items: string;
  total: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered';
  tableNumber: string;
  timestamp: string;
}

export interface SheetConfig {
  spreadsheetId: string;
  apiKey: string;
  accessToken?: string; // For writing
}

export enum Tab {
  MENU = 'MENU',
  ORDERS = 'ORDERS',
  SETTINGS = 'SETTINGS'
}
