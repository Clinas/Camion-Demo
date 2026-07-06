import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from "react-native";
import { useStore } from "../context/StoreContext";
import { CheckCircle, AlertCircle, Package, Send, ArrowLeft } from "lucide-react-native";
import { PEDIDOS } from "../data/mockData";

export default function SummaryScreen({ navigation }) {
  const { expectedItems, extraItems, selectedTruck, isOffline } = useStore();

  const reportByOrder = useMemo(() => {
    const groups = expectedItems.reduce((acc, item) => {
      if (!acc[item.orderId]) {
        acc[item.orderId] = {
          id: item.orderId,
          client: PEDIDOS[item.orderId]?.client || item.client,
          orderIndex: item.orderIndex,
          missing: [],
          outOfOrder: [],
          total: 0,
          scanned: 0,
        };
      }
      acc[item.orderId].total += 1;
      if (item.status === "scanned") acc[item.orderId].scanned += 1;
      if (item.status !== "scanned") acc[item.orderId].missing.push(item);
      if (item.outOfOrder) acc[item.orderId].outOfOrder.push(item);
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => b.orderIndex - a.orderIndex);
  }, [expectedItems]);

  const scannedCount = expectedItems.filter((i) => i.status === "scanned").length;
  const pendingCount = expectedItems.length - scannedCount;
  const outOfOrderCount = expectedItems.filter((i) => i.outOfOrder).length;
  const allOk = pendingCount === 0 && outOfOrderCount === 0 && extraItems.length === 0;

  const handleSync = () => {
    const msg = isOffline
      ? "Los datos se guardaron localmente y se sincronizaran automaticamente."
      : "El control queda listo para grabarse en el ERP.";

    if (Platform.OS === "web") {
      window.alert(msg);
      navigation.popToTop();
    } else {
      Alert.alert("Control Finalizado", msg, [
        { text: "OK", onPress: () => navigation.popToTop() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerNavTitle}>Reporte de Carga</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
        showsVerticalScrollIndicator
      >
        <View style={styles.headerCard}>
          <Text style={styles.truckPlate}>{selectedTruck?.plate}</Text>
          <Text style={styles.truckDriver}>{selectedTruck?.driver}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{expectedItems.length}</Text>
              <Text style={styles.statLabel}>ESPERADO</Text>
            </View>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={[styles.statValue, { color: "#10b981" }]}>{scannedCount}</Text>
              <Text style={styles.statLabel}>LEIDO</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: "#ef4444" }]}>{pendingCount}</Text>
              <Text style={styles.statLabel}>FALTANTE</Text>
            </View>
          </View>
        </View>

        {reportByOrder.map((order) => {
          const hasMissing = order.missing.length > 0;
          const hasOrderIssues = order.outOfOrder.length > 0;
          const statusText = hasMissing
            ? "Productos faltantes"
            : hasOrderIssues
              ? "Productos fuera de orden"
              : "Orden correcto";

          return (
            <View key={order.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                {hasMissing || hasOrderIssues ? (
                  <AlertCircle color="#b45309" size={20} />
                ) : (
                  <CheckCircle color="#10b981" size={20} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle}>
                    {order.id} - {order.client}
                  </Text>
                  <Text style={styles.reportMeta}>
                    {order.scanned}/{order.total} productos - {statusText}
                  </Text>
                </View>
              </View>

              {order.missing.map((item) => (
                <View key={item.id} style={styles.detailRow}>
                  <Package color="#991b1b" size={14} />
                  <Text style={styles.detailText}>
                    Falta {item.articuloName} ({item.barcode})
                  </Text>
                </View>
              ))}

              {order.outOfOrder.map((item) => (
                <View key={`${item.id}-order`} style={styles.detailRow}>
                  <Package color="#92400e" size={14} />
                  <Text style={styles.detailText}>
                    Fuera de orden {item.articuloName} ({item.barcode}) - {item.exceptionReason}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

        {extraItems.length > 0 && (
          <View style={styles.extraCard}>
            <View style={styles.reportHeader}>
              <AlertCircle color="#b45309" size={20} />
              <Text style={styles.reportTitle}>Productos que no pertenecen a ningun pedido</Text>
            </View>
            {extraItems.map((item) => (
              <View key={item.barcode} style={styles.detailRow}>
                <Package color="#92400e" size={14} />
                <Text style={styles.detailText}>
                  {item.articuloName} ({item.barcode}) - {item.reason}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.statusBox, allOk ? styles.statusSuccess : styles.statusWarning]}>
          {allOk ? (
            <>
              <CheckCircle color="#10b981" size={40} />
              <Text style={styles.statusBoxTitle}>Todo en orden</Text>
              <Text style={styles.statusBoxText}>Todos los productos fueron leidos en el orden correcto.</Text>
            </>
          ) : (
            <>
              <AlertCircle color="#f59e0b" size={40} />
              <Text style={styles.statusBoxTitle}>Control con observaciones</Text>
              <Text style={styles.statusBoxText}>Revise faltantes, productos fuera de orden o productos adicionales antes de grabar.</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
          <Send color="#fff" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.syncBtnText}>Confirmar Control</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: "#f8fafc" },
  scroll: { flex: 1, minHeight: 0 },
  headerNav: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtnHeader: { padding: 8, marginLeft: -10 },
  headerNavTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b", marginLeft: 10 },

  scrollContent: { padding: 20 },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  truckPlate: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  truckDriver: { fontSize: 14, color: "#64748b", marginTop: 2 },
  statsRow: { flexDirection: "row", width: "100%", justifyContent: "space-around", marginTop: 24, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 20 },
  stat: { alignItems: "center", flex: 1 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#f1f5f9" },
  statValue: { fontSize: 22, fontWeight: "800", color: "#1e293b" },
  statLabel: { fontSize: 10, color: "#94a3b8", fontWeight: "800", marginTop: 4 },

  reportCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  extraCard: {
    backgroundColor: "#fffbeb",
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  reportHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  reportTitle: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  reportMeta: { fontSize: 12, color: "#64748b", marginTop: 2 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 6 },
  detailText: { flex: 1, fontSize: 12, color: "#475569", lineHeight: 17, fontWeight: "600" },

  statusBox: { borderRadius: 8, padding: 24, alignItems: "center", marginBottom: 25 },
  statusSuccess: { backgroundColor: "#f0fdf4" },
  statusWarning: { backgroundColor: "#fff7ed" },
  statusBoxTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b", marginTop: 12 },
  statusBoxText: { fontSize: 13, color: "#64748b", textAlign: "center", marginTop: 6, lineHeight: 18 },

  syncBtn: {
    backgroundColor: "#1e293b",
    height: 60,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  syncBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
