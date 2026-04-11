import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CAMIONES, PEDIDOS, COLECTAS, REMITOS, ARTICULOS } from '../data/mockData';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState({
    useOrders: true,
    useCollections: true,
    useRemitos: true,
  });
  const [scannedItems, setScannedItems] = useState([]); 
  const [isOffline, setIsOffline] = useState(false);
  const [expectedItems, setExpectedItems] = useState([]);

  const selectTruck = (truck) => {
    setSelectedTruck(truck);
    setScannedItems([]);
    
    const truckOrders = truck.orders.map(id => PEDIDOS[id]);
    const unified = [];
    
    truckOrders.forEach(order => {
      // Get all barcodes for this order from collections and remitos
      const orderCollections = Object.values(COLECTAS).filter(c => c.orderId === order.id);
      const orderRemitos = Object.values(REMITOS).filter(r => r.orderId === order.id);
      
      // Flatten all available items from collections/remitos for this order
      const collectionItems = orderCollections.flatMap(c => c.items);
      const remitoItems = orderRemitos.flatMap(r => r.items);

      order.items.forEach(orderItem => {
        const articulo = ARTICULOS[orderItem.articuloId];
        
        // Find barcodes that match this specific article
        const artCollections = collectionItems.filter(ci => ci.articuloId === orderItem.articuloId);
        const artRemitos = remitoItems.filter(ri => ri.articuloId === orderItem.articuloId);

        // We create 'cantidad' slots for this item in the expected list
        for (let i = 0; i < orderItem.cantidad; i++) {
          // Assign a barcode from remito if available, else from collection, else null
          const remitoBarcode = artRemitos[i]?.barcode;
          const collectionBarcode = artCollections[i]?.barcode;
          
          unified.push({
            orderId: order.id,
            articuloId: orderItem.articuloId,
            articuloName: articulo.name,
            sku: articulo.sku,
            status: 'pending',
            orderIndex: order.delivery_order,
            inCollection: !!collectionBarcode,
            inRemito: !!remitoBarcode,
            // Prefer remito barcode as the "official" expected barcode
            barcode: remitoBarcode || collectionBarcode || null,
          });
        }
      });
    });
    
    setExpectedItems(unified);
  };

  const addScan = (barcode) => {
    // 1. Check for duplicates
    if (scannedItems.some(s => s.barcode === barcode)) {
      return { success: false, error: 'Bulto ya escaneado (Duplicado)' };
    }

    // 2. Identify the Article by prefix
    const articulo = Object.values(ARTICULOS).find(a => barcode.startsWith(a.barcode_prefix));
    if (!articulo) {
      return { success: false, error: 'Código de barras no reconocido' };
    }

    // 3. Find the best match in the expected list
    // Priority 1: Match by exact barcode (if it was expected)
    // Priority 2: Match by articuloId (if it's a generic item in the order)
    let matchIndex = expectedItems.findIndex(item => 
      item.status === 'pending' && item.barcode === barcode
    );

    if (matchIndex === -1) {
      matchIndex = expectedItems.findIndex(item => 
        item.status === 'pending' && item.articuloId === articulo.id && !item.barcode
      );
    }
    
    // Fallback: If no exact barcode match and no generic slot, but we have a slot with DIFFERENT barcode
    // this means they are loading a different unit than expected (common in meat/bulk)
    if (matchIndex === -1) {
       matchIndex = expectedItems.findIndex(item => 
        item.status === 'pending' && item.articuloId === articulo.id
      );
    }

    if (matchIndex === -1) {
      return { success: false, error: `El producto ${articulo.name} no pertenece a este camión` };
    }

    // 4. Update state
    const updatedExpected = [...expectedItems];
    updatedExpected[matchIndex].status = 'scanned';
    updatedExpected[matchIndex].scannedBarcode = barcode;
    
    setExpectedItems(updatedExpected);
    setScannedItems([...scannedItems, { barcode, timestamp: new Date().toISOString(), articuloId: articulo.id }]);

    return { success: true };
  };

  const toggleOffline = () => setIsOffline(!isOffline);

  return (
    <StoreContext.Provider value={{
      selectedTruck,
      selectTruck,
      loadingConfig,
      setLoadingConfig,
      expectedItems,
      scannedItems,
      addScan,
      isOffline,
      toggleOffline,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
