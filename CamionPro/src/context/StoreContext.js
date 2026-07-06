import React, { createContext, useState, useContext } from "react";
import { CAMIONES, PEDIDOS, COLECTAS, REMITOS, ARTICULOS } from "../data/mockData";

const StoreContext = createContext();
const ADVANCE_ORDER_REASON = "No hay mas productos del pedido esperado";

const getArticuloByBarcode = (barcode) =>
  Object.values(ARTICULOS).find((articulo) =>
    barcode?.startsWith(articulo.barcode_prefix),
  );

const getSourceForOrder = (order) => {
  const remitos = Object.values(REMITOS).filter((r) => r.orderId === order.id);
  if (remitos.length > 0) {
    return { type: "remito", label: "Remito", rows: remitos.flatMap((r) => r.items) };
  }

  const colectas = Object.values(COLECTAS).filter((c) => c.orderId === order.id);
  if (colectas.length > 0) {
    return { type: "colectada", label: "Colectada", rows: colectas.flatMap((c) => c.items) };
  }

  const everyItemHasBarcode = order.items.every((item) => item.barcode);
  if (!everyItemHasBarcode) {
    return {
      type: "bloqueado",
      label: "Pedido",
      rows: [],
      issue: `El pedido ${order.id} tiene cantidades genericas y no tiene colectada ni remito con SKUs definidos.`,
    };
  }

  return { type: "pedido", label: "Pedido", rows: order.items };
};

const buildExpectedItems = (truck) => {
  const issues = [];
  const sortedOrders = truck.orders
    .map((id) => PEDIDOS[id])
    .filter(Boolean)
    .sort((a, b) => b.delivery_order - a.delivery_order);

  const expected = sortedOrders.flatMap((order) => {
    const source = getSourceForOrder(order);
    if (source.issue) {
      issues.push(source.issue);
      return [];
    }

    return source.rows.map((row, index) => {
      const articulo = ARTICULOS[row.articuloId];
      return {
        id: `${order.id}-${source.type}-${row.barcode}-${index}`,
        orderId: order.id,
        client: order.client,
        articuloId: row.articuloId,
        articuloName: articulo?.name || "Articulo desconocido",
        sku: articulo?.sku || row.articuloId,
        barcode: row.barcode,
        status: "pending",
        orderIndex: order.delivery_order,
        sourceType: source.type,
        sourceLabel: source.label,
      };
    });
  });

  return { expected, issues };
};

export const StoreProvider = ({ children }) => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState({
    useOrders: true,
    useCollections: true,
    useRemitos: true,
  });
  const [scannedItems, setScannedItems] = useState([]);
  const [extraItems, setExtraItems] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [expectedItems, setExpectedItems] = useState([]);
  const [controlIssues, setControlIssues] = useState([]);
  const [skippedOrderIds, setSkippedOrderIds] = useState([]);

  const selectTruck = (truck) => {
    const { expected, issues } = buildExpectedItems(truck);
    setSelectedTruck(truck);
    setScannedItems([]);
    setExtraItems([]);
    setExpectedItems(expected);
    setControlIssues(issues);
    setSkippedOrderIds([]);
  };

  const isDuplicate = (barcode) =>
    scannedItems.some((s) => s.barcode === barcode) ||
    extraItems.some((s) => s.barcode === barcode);

  const getOrderedOrderIds = () =>
    expectedItems.reduce((ids, item) => {
      if (!ids.includes(item.orderId)) ids.push(item.orderId);
      return ids;
    }, []);

  const getActiveOrderId = () => {
    const orderedOrderIds = getOrderedOrderIds();
    return orderedOrderIds.find((orderId) =>
      !skippedOrderIds.includes(orderId) &&
      expectedItems.some((item) => item.orderId === orderId && item.status === "pending"),
    );
  };

  const analyzeScan = (barcode) => {
    if (controlIssues.length > 0) {
      return {
        success: false,
        error: "No se puede iniciar el control: hay pedidos con cantidades genericas sin SKU definido.",
      };
    }

    if (isDuplicate(barcode)) {
      return { success: false, error: "El producto ya fue leido y no puede cargarse otra vez." };
    }

    const articulo = getArticuloByBarcode(barcode);
    if (!articulo) {
      return {
        needsConfirmation: true,
        kind: "unexpected",
        barcode,
        articuloName: "Codigo no reconocido",
        message: `El codigo ${barcode} no pertenece a ningun producto conocido.`,
      };
    }

    const matchIndex = expectedItems.findIndex(
      (item) => item.status === "pending" && item.barcode === barcode,
    );

    if (matchIndex === -1) {
      return {
        needsConfirmation: true,
        kind: "unexpected",
        barcode,
        articuloId: articulo.id,
        articuloName: articulo.name,
        message: `${articulo.name} no pertenece a ningun pedido/colectada/remito de este camion.`,
      };
    }

    const activeOrderId = getActiveOrderId();
    if (expectedItems[matchIndex].orderId !== activeOrderId) {
      return {
        needsConfirmation: true,
        kind: "out_of_order",
        barcode,
        itemIndex: matchIndex,
        articuloId: articulo.id,
        articuloName: articulo.name,
        expectedOrderId: activeOrderId,
        targetOrderId: expectedItems[matchIndex]?.orderId,
        message: `${articulo.name} pertenece al pedido ${expectedItems[matchIndex]?.orderId}. El pedido activo es ${activeOrderId}.`,
      };
    }

    return commitExpectedScan(matchIndex, barcode);
  };

  const commitExpectedScan = (
    itemIndex,
    barcode,
    exceptionReason = "",
    forceOutOfOrder = Boolean(exceptionReason),
  ) => {
    const updatedExpected = [...expectedItems];
    updatedExpected[itemIndex] = {
      ...updatedExpected[itemIndex],
      status: "scanned",
      scannedBarcode: barcode,
      exceptionReason,
      outOfOrder: forceOutOfOrder,
      scannedAt: new Date().toISOString(),
    };

    setExpectedItems(updatedExpected);
    setScannedItems((current) => [
      ...current,
      {
        barcode,
        timestamp: new Date().toISOString(),
        articuloId: updatedExpected[itemIndex].articuloId,
        orderId: updatedExpected[itemIndex].orderId,
        outOfOrder: forceOutOfOrder,
        reason: exceptionReason,
      },
    ]);

    return { success: true, observed: forceOutOfOrder };
  };

  const acceptScanException = (pendingScan, reason) => {
    if (!pendingScan || !reason?.trim()) {
      return { success: false, error: "Debe indicar un motivo para aceptar la lectura." };
    }

    if (pendingScan.kind === "out_of_order") {
      const reasonText = reason.trim();
      const orderedOrderIds = getOrderedOrderIds();
      const activeOrderId = getActiveOrderId();
      const activeIndex = orderedOrderIds.indexOf(activeOrderId);
      const targetIndex = orderedOrderIds.indexOf(pendingScan.targetOrderId);
      const advancesToNextOrder =
        reasonText === ADVANCE_ORDER_REASON && targetIndex === activeIndex + 1;
      const result = commitExpectedScan(
        pendingScan.itemIndex,
        pendingScan.barcode,
        advancesToNextOrder ? "" : reasonText,
        !advancesToNextOrder,
      );

      if (result.success && reasonText === ADVANCE_ORDER_REASON && activeIndex >= 0) {
        setSkippedOrderIds((current) => [...new Set([...current, activeOrderId])]);
      }
      return result;
    }

    const articulo = getArticuloByBarcode(pendingScan.barcode);
    setExtraItems((current) => [
      ...current,
      {
        barcode: pendingScan.barcode,
        articuloId: articulo?.id,
        articuloName: articulo?.name || pendingScan.articuloName,
        reason: reason.trim(),
        scannedAt: new Date().toISOString(),
      },
    ]);
    setScannedItems((current) => [
      ...current,
      {
        barcode: pendingScan.barcode,
        timestamp: new Date().toISOString(),
        articuloId: articulo?.id,
        unexpected: true,
        reason: reason.trim(),
      },
    ]);

    return { success: true, observed: true };
  };

  const toggleOffline = () => setIsOffline((current) => !current);
  const activeOrderId = getActiveOrderId();

  return (
    <StoreContext.Provider
      value={{
        selectedTruck,
        selectTruck,
        loadingConfig,
        setLoadingConfig,
        expectedItems,
        scannedItems,
        extraItems,
        controlIssues,
        activeOrderId,
        addScan: analyzeScan,
        acceptScanException,
        isOffline,
        toggleOffline,
        camiones: CAMIONES,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
