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
  Modal,
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
  AlertTriangle,
  X,
} from "lucide-react-native";
import { EXCEPTION_REASONS, PEDIDOS } from "../data/mockData";

export default function ScannerScreen({ navigation }) {
  const {
    expectedItems,
    extraItems,
    addScan,
    acceptScanException,
    isOffline,
    toggleOffline,
    selectedTruck,
    controlIssues,
    activeOrderId,
  } = useStore();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "info" });
  const [pendingScan, setPendingScan] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [manualReason, setManualReason] = useState("");
  const inputRef = useRef(null);

  const sections = useMemo(() => {
    const groups = expectedItems.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = {
          id: item.orderId,
          title: `Pedido: ${item.orderId}`,
          client: PEDIDOS[item.orderId]?.client || "Cliente Desconocido",
          orderIndex: item.orderIndex,
          sourceLabel: item.sourceLabel,
          data: [],
        };
      }
      acc[item.orderId].data.push(item);
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) => b.orderIndex - a.orderIndex);
  }, [expectedItems]);

  const showStatus = (text, type) => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: "", type: "info" }), 3000);
  };

  const handleScan = () => {
    if (!barcodeInput) return;
    const result = addScan(barcodeInput);
    if (result.success) showStatus(`Cargado: ${barcodeInput}`, "success");
    else if (result.needsConfirmation) {
      setPendingScan(result);
      setSelectedReason("");
      setManualReason("");
    }
    else showStatus(result.error, "error");
    setBarcodeInput("");
    inputRef.current?.focus();
  };

  const confirmException = () => {
    const reason = selectedReason === "manual" ? manualReason : selectedReason;
    const result = acceptScanException(pendingScan, reason);
    if (result.success) {
      showStatus(
        result.observed
          ? `Aceptado con observacion: ${pendingScan.barcode}`
          : `Cargado: ${pendingScan.barcode}`,
        "success",
      );
      setPendingScan(null);
      setSelectedReason("");
      setManualReason("");
      inputRef.current?.focus();
    } else {
      showStatus(result.error, "error");
    }
  };

  const renderSectionHeader = ({ section }) => {
    const isActive = section.id === activeOrderId;
    return (
    <View style={[styles.sectionHeader, isActive && styles.sectionHeaderActive]}>
      <View style={styles.sectionHeaderLine}>
        <Package color={isActive ? "#1d4ed8" : "#64748b"} size={16} />
        <Text style={styles.sectionTitle}>{section.title}</Text>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>LEYENDO AHORA</Text>
          </View>
        )}
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>{section.sourceLabel}</Text>
        </View>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>
            ENTREGA #{section.orderIndex}
          </Text>
        </View>
      </View>
      <Text style={styles.sectionClient}>{section.client}</Text>
    </View>
    );
  };

  const renderItem = ({ item }) => {
    const isScanned = item.status === "scanned";
    const isActivePending = item.orderId === activeOrderId && !isScanned;
    return (
      <View
        style={[
          styles.itemCard,
          isActivePending && styles.itemActivePending,
          isScanned && styles.itemScanned,
          item.outOfOrder && styles.itemOutOfOrder,
        ]}
      >
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
            {item.outOfOrder && (
              <Text style={styles.outOfOrderInline}>Fuera de orden</Text>
            )}
          </View>
          {item.outOfOrder && (
            <Text style={styles.reasonText}>
              Producto leido fuera de orden, motivo: {item.exceptionReason}
            </Text>
          )}
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
  const progress =
    expectedItems.length > 0 ? (scannedCount / expectedItems.length) * 100 : 0;
  const isBlocked = controlIssues.length > 0;

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

      {isBlocked && (
        <View style={[styles.statusBanner, styles.banner_error]}>
          <AlertTriangle color="#fff" size={16} />
          <Text style={styles.statusBannerText}>{controlIssues[0]}</Text>
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
            placeholder={
              activeOrderId
                ? `Pedido activo ${activeOrderId}`
                : "Escanear codigo de 5 digitos..."
            }
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            onSubmitEditing={handleScan}
            autoFocus
            editable={!isBlocked}
          />
          <TouchableOpacity
            style={[styles.okBtn, isBlocked && styles.okBtnDisabled]}
            onPress={handleScan}
            disabled={isBlocked}
          >
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
        {extraItems.length > 0 && (
          <View style={styles.extraSection}>
            <Text style={styles.extraTitle}>Productos adicionales</Text>
            {extraItems.map((item) => (
              <View key={item.barcode} style={[styles.itemCard, styles.extraCard]}>
                <AlertTriangle color="#b45309" size={20} style={{ marginRight: 15 }} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.articuloName}</Text>
                  <Text style={styles.reasonText}>
                    No pertenece a ningun pedido, motivo: {item.reason}
                  </Text>
                </View>
                <View style={styles.extraBadge}>
                  <Text style={styles.extraBadgeText}>{item.barcode}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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

      <Modal visible={Boolean(pendingScan)} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AlertTriangle color="#b45309" size={22} />
              <Text style={styles.modalTitle}>Revisar lectura</Text>
              <TouchableOpacity onPress={() => setPendingScan(null)} style={styles.modalClose}>
                <X color="#64748b" size={20} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalMessage}>{pendingScan?.message}</Text>
            <Text style={styles.reasonLabel}>Motivo para aceptar</Text>
            {EXCEPTION_REASONS.map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text
                  style={[
                    styles.reasonOptionText,
                    selectedReason === reason && styles.reasonOptionTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[
                styles.reasonOption,
                selectedReason === "manual" && styles.reasonOptionSelected,
              ]}
              onPress={() => setSelectedReason("manual")}
            >
              <Text
                style={[
                  styles.reasonOptionText,
                  selectedReason === "manual" && styles.reasonOptionTextSelected,
                ]}
              >
                Otro motivo
              </Text>
            </TouchableOpacity>
            {selectedReason === "manual" && (
              <TextInput
                style={styles.manualInput}
                placeholder="Ingresar motivo..."
                value={manualReason}
                onChangeText={setManualReason}
              />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.correctBtn}
                onPress={() => setPendingScan(null)}
              >
                <Text style={styles.correctBtnText}>Corregir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={confirmException}>
                <Text style={styles.acceptBtnText}>Aceptar error</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  okBtnDisabled: { backgroundColor: "#94a3b8" },
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
  sectionHeaderActive: {
    backgroundColor: "#eff6ff",
    borderBottomColor: "#bfdbfe",
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  sectionHeaderLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#1e293b" },
  activeBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeBadgeText: { color: "#fff", fontSize: 9, fontWeight: "900" },
  sourceBadge: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceBadgeText: { color: "#334155", fontSize: 9, fontWeight: "900" },
  orderBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: "auto",
  },
  orderBadgeText: { fontSize: 9, fontWeight: "900", color: "#475569" },
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
  itemActivePending: {
    backgroundColor: "#eff6ff",
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    paddingLeft: 16,
  },
  itemOutOfOrder: { backgroundColor: "#fffbeb" },
  itemIcon: { marginRight: 15 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#1e293b" },
  skuRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 1 },
  itemSku: { fontSize: 11, color: "#64748b" },
  outOfOrderInline: {
    fontSize: 11,
    color: "#92400e",
    backgroundColor: "#fde68a",
    borderRadius: 15,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  reasonText: {
    color: "#92400e",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  expectedBarcode: { fontSize: 10, color: "#2563eb", fontStyle: "italic" },
  scannedBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  scannedTag: { color: "#fff", fontSize: 9, fontWeight: "700" },
  extraSection: { marginTop: 8, marginBottom: 20 },
  extraTitle: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: "800",
    color: "#92400e",
    backgroundColor: "#fffbeb",
  },
  extraCard: { backgroundColor: "#fffbeb" },
  extraBadge: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  extraBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },

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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: "800", color: "#1e293b" },
  modalClose: { padding: 4 },
  modalMessage: { color: "#475569", fontSize: 13, lineHeight: 18, marginTop: 10 },
  reasonLabel: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 16,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  reasonOption: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  reasonOptionSelected: { borderColor: "#2563eb", backgroundColor: "#eff6ff" },
  reasonOptionText: { color: "#334155", fontSize: 13, fontWeight: "600" },
  reasonOptionTextSelected: { color: "#1d4ed8" },
  manualInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 8,
  },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 8 },
  correctBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  correctBtnText: { color: "#334155", fontWeight: "800" },
  acceptBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f59e0b",
  },
  acceptBtnText: { color: "#fff", fontWeight: "800" },
});
