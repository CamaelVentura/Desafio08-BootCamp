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
      const storagedProducts = await AsyncStorage.getItem(
        '@Marketplace:products',
      );
      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const productId = await products.findIndex(
        mapProduct => mapProduct.id === product.id,
      );
      if (productId === -1) {
        const newProduct = product;
        newProduct.quantity = 1;
        const newProducts = [...products, newProduct];
        setProducts([...newProducts]);

        await AsyncStorage.setItem(
          '@Marketplace:products',
          JSON.stringify(newProducts),
        );
      } else {
        const newProducts = products;
        newProducts[productId].quantity += 1;
        setProducts([...newProducts]);
        await AsyncStorage.setItem(
          '@Marketplace:products',
          JSON.stringify(newProducts),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productId = await products.findIndex(
        mapProduct => mapProduct.id === id,
      );
      const newProducts = products;
      newProducts[productId].quantity += 1;
      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@Marketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productId = await products.findIndex(
        mapProduct => mapProduct.id === id,
      );
      const newProducts = products;
      newProducts[productId].quantity -= 1;
      if (newProducts[productId].quantity <= 0) {
        newProducts.splice(productId, 1);
      }
      setProducts([...newProducts]);
      await AsyncStorage.setItem(
        '@Marketplace:products',
        JSON.stringify(products),
      );
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
