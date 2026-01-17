import { create } from 'zustand';
import { IProduct, IDispensationItem } from '@/lib';

interface DispensationState {
  items: IDispensationItem[];
  notes: string;
  reference: string;
  location: 'farmacia' | 'bodega' | null;

  // Actions
  setLocation: (location: 'farmacia' | 'bodega') => void;
  addItem: (product: IProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemNotes: (productId: string, notes: string) => void;
  setNotes: (notes: string) => void;
  setReference: (reference: string) => void;
  clearCart: () => void;

  // Computed
  getTotalItems: () => number;
  getTotalQuantity: () => number;
  getStockByLocation: (product: IProduct) => number;
}

// Helper para calcular stock por ubicación
const calculateStockByLocation = (
  product: IProduct,
  location: 'farmacia' | 'bodega' | null
): number => {
  if (!location) {
    return product.totalStock;
  }
  const backendLocation = location.toUpperCase() as 'FARMACIA' | 'BODEGA';
  return product.batches
    .filter((batch) => batch.location === backendLocation && batch.status === 'ACTIVE')
    .reduce((sum, batch) => sum + batch.quantity, 0);
};

export const useDispensationStore = create<DispensationState>((set, get) => ({
  items: [],
  notes: '',
  reference: '',
  location: null,

  setLocation: (location: 'farmacia' | 'bodega') => set({ location }),

  addItem: (product: IProduct, quantity: number = 1) => {
    const { items } = get();
    const existingItem = items.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Si ya existe, incrementar cantidad
      set({
        items: items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      });
    } else {
      // Si no existe, agregar nuevo item
      set({
        items: [...items, { product, quantity }],
      });
    }
  },

  removeItem: (productId: string) => {
    set({
      items: get().items.filter((item) => item.product.id !== productId),
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    });
  },

  updateItemNotes: (productId: string, notes: string) => {
    set({
      items: get().items.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    });
  },

  setNotes: (notes: string) => set({ notes }),

  setReference: (reference: string) => set({ reference }),

  clearCart: () => set({ items: [], notes: '', reference: '' }),

  getTotalItems: () => get().items.length,

  getTotalQuantity: () =>
    get().items.reduce((total, item) => total + item.quantity, 0),

  getStockByLocation: (product: IProduct) =>
    calculateStockByLocation(product, get().location),
}));
