import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const storagedProducts = await AsyncStorage.getItem(
        '@gomarketplace:products',
      );

      setProducts(JSON.parse(String(storagedProducts)));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async ({ id, image_url, price, title }: Omit<Product, 'quantity'>) => {
      // TODO ADD A NEW ITEM TO THE CART
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex < 0) {
        const product = {
          id,
          image_url,
          price,
          title,
          quantity: 1,
        };

        setProducts([...products, product]);

        await AsyncStorage.setItem(
          '@gomarketplace:products',
          JSON.stringify(products),
        );
        return;
      }

      const newProducts = products.slice(0);
      newProducts[productIndex].quantity += 1;

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@gomarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex >= 0) {
        const newProducts = products.slice(0);

        newProducts[productIndex].quantity += 1;
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@gomarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productIndex = products.findIndex(product => product.id === id);

      if (productIndex <= 0) {
        const newProducts = products.slice(0);

        newProducts[productIndex].quantity -= 1;
        setProducts(newProducts);
        await AsyncStorage.setItem(
          '@gomarketplace:products',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
