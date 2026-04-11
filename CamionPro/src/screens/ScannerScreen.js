import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useStore } from "../context/StoreContext";
import {
  ScanBarcode,
  WifiOff,
  Wifi,
  CheckCircle2,
  Circle,
  ArrowLeft,
  Package,
  Info,
} from "lucide-react-native";
import { PEDIDOS } from "../data/mockData";

export default function ScannerScreen({ navigation }) {
  const { expectedItems, addScan, isOffline, toggleOffline, selectedTruck } =
    useStore();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "info" });
  const inputRef = useRef(null);

  const sections = useMemo(() => {
    const groups = expectedItems.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = {
          id: item.orderId,
          title: `Pedido: ${item.orderId}`,
          client: PEDIDOS[item.orderId]?.client || "Cliente Desconocido",
          orderIndex: item.orderIndex,
          data: [],
        };
      }
      acc[item.orderId].data.push(item);
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) => a.orderIndex - b.orderIndex);
  }, [expectedItems]);

  const showStatus = (text, type) => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: "", type: "info" }), 3000);
  };

  const handleScan = () => {
    if (!barcodeInput) return;
    const result = addScan(barcodeInput);
    if (result.success) showStatus(`Cargado: ${barcodeInput}`, "success");
    else showStatus(result.error, "error");
    setBarcodeInput("");
    inputRef.current?.focus();
  };

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLine}>
        <Package color="#2563eb" size={16} />
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>
            ENTREGA #{section.orderIndex}
          </Text>
        </View>
      </View>
      <Text style={styles.sectionClient}>{section.client}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const isScanned = item.status === "scanned";
    return (
      <View style={[styles.itemCard, isScanned && styles.itemScanned]}>
        <View style={styles.itemIcon}>
          {isScanned ? (
            <CheckCircle2 color="#10b981" size={20} />
          ) : (
            <Circle color="#94a3b8" size={20} />
          )}
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.articuloName}</Text>
          <View style={styles.skuRow}>
            <Text style={styles.itemSku}>ID: {item.articuloId}</Text>
            {item.barcode && !isScanned && (
              <Text style={styles.expectedBarcode}>Esp: {item.barcode}</Text>
            )}
          </View>
        </View>
        {isScanned && (
          <View style={styles.scannedBadge}>
            <Text style={styles.scannedTag}>{item.scannedBarcode}</Text>
          </View>
        )}
      </View>
    );
  };

  const scannedCount = expectedItems.filter(
    (i) => i.status === "scanned",
  ).length;
  const progress = (scannedCount / expectedItems.length) * 100;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* 1. HEADER (FLEX: AUTO) */}
      <View style={styles.headerNav}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtnHeader}
        >
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>{selectedTruck?.plate}</Text>
        </View>
        <TouchableOpacity style={styles.statusToggle} onPress={toggleOffline}>
          {isOffline ? (
            <WifiOff color="#f59e0b" size={20} />
          ) : (
            <Wifi color="#10b981" size={20} />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. BANNER (FLEX: AUTO) */}
      {statusMsg.text !== "" && (
        <View style={[styles.statusBanner, styles[`banner_${statusMsg.type}`]]}>
          <Info color="#fff" size={16} />
          <Text style={styles.statusBannerText}>{statusMsg.text}</Text>
        </View>
      )}

      {/* 3. CONTROLES (FLEX: AUTO) */}
      <View style={styles.topControl}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {scannedCount}/{expectedItems.length} bultos
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <View style={styles.scanWrapper}>
          <ScanBarcode color="#64748b" size={20} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Escanear..."
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            onSubmitEditing={handleScan}
            autoFocus
          />
          <TouchableOpacity style={styles.okBtn} onPress={handleScan}>
            <Text style={styles.okBtnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. LISTADO (FLEX: 1 - EL QUE SCROLLEA) */}
      <ScrollView>
        <SectionList
          sections={sections}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.articuloId + index}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
        />
      </ScrollView>

      {/* 5. FOOTER (FLEX: AUTO) */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.finishBtn}
          onPress={() => navigation.navigate("Summary")}
        >
          <Text style={styles.finishBtnText}>Finalizar Control</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
  },
  headerNav: {
    paddingTop: Platform.OS === "web" ? 15 : 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtnHeader: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 10 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  headerSubtitle: { fontSize: 12, color: "#64748b" },

  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    justifyContent: "center",
    gap: 8,
  },
  banner_info: { backgroundColor: "#3b82f6" },
  banner_success: { backgroundColor: "#10b981" },
  banner_error: { backgroundColor: "#ef4444" },
  statusBannerText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  topControl: {
    backgroundColor: "#fff",
    padding: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { fontSize: 12, color: "#64748b", fontWeight: "600" },
  progressPercent: { fontSize: 12, color: "#1e293b", fontWeight: "800" },
  progressBarBg: { height: 4, backgroundColor: "#f1f5f9", borderRadius: 2 },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 2,
  },

  scanWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 14 },
  okBtn: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
  },
  okBtnText: { color: "#fff", fontWeight: "700", fontSize: 11 },

  listContent: {
    paddingBottom: 20,
  },

  sectionHeader: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sectionHeaderLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#1e293b" },
  orderBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: "auto",
  },
  orderBadgeText: { fontSize: 9, fontWeight: "900", color: "#166534" },
  sectionClient: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    marginLeft: 24,
  },

  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemScanned: { backgroundColor: "#f0fdf4" },
  itemIcon: { marginRight: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  skuRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 1 },
  itemSku: { fontSize: 11, color: "#64748b" },
  expectedBarcode: { fontSize: 10, color: "#2563eb", fontStyle: "italic" },
  scannedBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  scannedTag: { color: "#fff", fontSize: 9, fontWeight: "700" },

  footer: {
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  finishBtn: {
    backgroundColor: "#2563eb",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  finishBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
