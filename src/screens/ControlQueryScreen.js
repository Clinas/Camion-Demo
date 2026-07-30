import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  AlertTriangle,
  CircleSlash2,
  FileText,
  ClipboardCheck,
  ChevronRight,
  ChevronDown,
  Info,
} from "lucide-react-native";
import {
  CAMIONES,
  PEDIDOS,
  CONTROLES_CARGA,
  REMITOS_DISPONIBLES,
} from "../data/mockData";

const getTruckSummary = (truck) => {
  const control = CONTROLES_CARGA[truck.id];
  const orders = truck.orders.map((id) => PEDIDOS[id]).filter(Boolean);
  const remittedCount = orders.filter((order) => REMITOS_DISPONIBLES[order.id]).length;
  return {
    control,
    orders,
    remittedCount,
    allRemitted: orders.length > 0 && remittedCount === orders.length,
    hasNotices: Boolean(control?.advertencias?.length || control?.observaciones?.length),
  };
};

function StatusBadge({ type, children }) {
  const palette = {
    success: { box: styles.badgeSuccess, text: styles.badgeSuccessText },
    warning: { box: styles.badgeWarning, text: styles.badgeWarningText },
    neutral: { box: styles.badgeNeutral, text: styles.badgeNeutralText },
  }[type];
  return (
    <View style={[styles.badge, palette.box]}>
      <Text style={[styles.badgeText, palette.text]}>{children}</Text>
    </View>
  );
}

export default function ControlQueryScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const compact = width < 850;
  const [selectedTruckId, setSelectedTruckId] = useState(CAMIONES[0]?.id);
  const [expandedOrders, setExpandedOrders] = useState([]);
  const selectedTruck = CAMIONES.find((truck) => truck.id === selectedTruckId);
  const summary = useMemo(
    () => (selectedTruck ? getTruckSummary(selectedTruck) : null),
    [selectedTruck],
  );
  const toggleOrder = (orderId) => {
    setExpandedOrders((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color="#e2e8f0" size={22} />
        </TouchableOpacity>
        <View>
          <Text style={styles.topbarTitle}>Consulta de controles de carga</Text>
          <Text style={styles.topbarSubtitle}>Prototipo de vista web para escritorio</Text>
        </View>
      </View>

      <View style={[styles.workspace, compact && styles.workspaceCompact]}>
        <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
          <Text style={styles.sidebarLabel}>CAMIONES</Text>
          <ScrollView horizontal={compact} showsHorizontalScrollIndicator={false}>
            <View style={compact ? styles.truckListCompact : null}>
              {CAMIONES.map((truck) => {
                const item = getTruckSummary(truck);
                const selected = truck.id === selectedTruckId;
                return (
                  <TouchableOpacity
                    key={truck.id}
                    style={[
                      styles.truckItem,
                      compact && styles.truckItemCompact,
                      selected && styles.truckItemSelected,
                    ]}
                    onPress={() => setSelectedTruckId(truck.id)}
                  >
                    <View style={styles.truckItemTop}>
                      <Truck color={selected ? "#2563eb" : "#64748b"} size={20} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.truckPlate}>{truck.plate}</Text>
                        <Text style={styles.truckMeta}>{truck.id} · {truck.driver}</Text>
                      </View>
                      {!compact && <ChevronRight color="#94a3b8" size={18} />}
                    </View>
                    <View style={styles.badgeRow}>
                      <StatusBadge type={item.control ? (item.hasNotices ? "warning" : "success") : "neutral"}>
                        {item.control ? (item.hasNotices ? "Control observado" : "Control OK") : "Sin control"}
                      </StatusBadge>
                      <StatusBadge type={item.allRemitted ? "success" : "warning"}>
                        Remitos {item.remittedCount}/{item.orders.length}
                      </StatusBadge>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator
        >
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.pageTitle}>{selectedTruck?.plate}</Text>
              <Text style={styles.pageSubtitle}>
                {selectedTruck?.id} · {selectedTruck?.driver} · {selectedTruck?.date}
              </Text>
            </View>
            <StatusBadge type={summary?.allRemitted ? "success" : "warning"}>
              {summary?.allRemitted
                ? "Todos los pedidos tienen remito"
                : `Faltan remitos (${summary?.remittedCount}/${summary?.orders.length})`}
            </StatusBadge>
          </View>

          {!summary?.control ? (
            <View style={styles.emptyCard}>
              <CircleSlash2 color="#64748b" size={42} />
              <Text style={styles.emptyTitle}>El camion no tiene control de carga</Text>
              <Text style={styles.emptyText}>
                Se muestran los pedidos y sus remitos disponibles para facilitar el seguimiento.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.controlHeader}>
                <View style={styles.controlHeaderTitle}>
                  <ClipboardCheck color="#2563eb" size={25} />
                  <View>
                    <Text style={styles.cardTitle}>Control {summary.control.id}</Text>
                    <Text style={styles.cardMeta}>
                      {summary.control.fecha} · Operador: {summary.control.operador}
                    </Text>
                  </View>
                </View>

                {summary.control.advertencias.length > 0 && (
                  <View style={styles.noticeGroup}>
                    <Text style={styles.warningGroupTitle}>ADVERTENCIAS</Text>
                    {summary.control.advertencias.map((warning) => (
                      <View key={warning} style={styles.noticeWarning}>
                        <AlertTriangle color="#b45309" size={18} />
                        <Text style={styles.noticeWarningText}>{warning}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {summary.control.observaciones.length > 0 && (
                  <View style={styles.noticeGroup}>
                    <Text style={styles.manualGroupTitle}>OBSERVACION MANUAL</Text>
                    {summary.control.observaciones.map((observation) => (
                      <View key={observation} style={styles.noticeInfo}>
                        <Info color="#1d4ed8" size={18} />
                        <Text style={styles.noticeInfoText}>{observation}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.stageRow}>
                  {summary.control.etapas.map((stage) => (
                    <View key={stage.id} style={styles.stageCard}>
                      <CheckCircle2 color="#16a34a" size={19} />
                      <View>
                        <Text style={styles.stageName}>{stage.nombre}: cumplida</Text>
                        <Text style={styles.stageNote}>{stage.observacion}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}

          {summary?.control?.incidencias?.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Detalle de advertencias y observaciones</Text>
              <Text style={styles.sectionHelp}>
                Trazabilidad guardada al momento del control: producto, pedido esperado, pedido leido y comprobantes involucrados.
              </Text>
              <View style={styles.incidentList}>
                {summary.control.incidencias.map((incident) => (
                  <View key={incident.id} style={styles.incidentCard}>
                    <View style={styles.incidentHeader}>
                      <AlertTriangle color="#b45309" size={19} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.incidentTitle}>
                          {incident.tipo === "faltante" ? "Producto faltante" : "Lectura fuera de orden"}
                        </Text>
                        <Text style={styles.incidentProduct}>
                          {incident.producto} · Codigo {incident.barcode}
                        </Text>
                      </View>
                      <Text style={styles.incidentId}>{incident.id}</Text>
                    </View>
                    <View style={styles.traceRow}>
                      <View style={styles.traceBox}>
                        <Text style={styles.traceLabel}>SE ESPERABA</Text>
                        <Text style={styles.traceValue}>{incident.pedidoEsperado}</Text>
                        <Text style={styles.traceDocument}>{incident.comprobanteEsperado}</Text>
                      </View>
                      <ChevronRight color="#94a3b8" size={20} />
                      <View style={styles.traceBox}>
                        <Text style={styles.traceLabel}>SE LEYO DE</Text>
                        <Text style={incident.pedidoLeido ? styles.traceValue : styles.traceMissing}>
                          {incident.pedidoLeido || "No se leyo"}
                        </Text>
                        <Text style={styles.traceDocument}>
                          {incident.comprobanteLeido || "Sin comprobante leido"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.incidentReason}>Motivo: {incident.motivo}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Detalle por pedido</Text>
          <Text style={styles.sectionHelp}>
            “Remito disponible” indica la documentacion actual. “Control realizado sobre” conserva el comprobante usado al momento del control.
          </Text>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, styles.orderCell, styles.headerText]}>Pedido</Text>
              <Text style={[styles.cell, styles.clientCell, styles.headerText]}>Cliente</Text>
              <Text style={[styles.cell, styles.documentCell, styles.headerText]}>Remito disponible</Text>
              <Text style={[styles.cell, styles.sourceCell, styles.headerText]}>Control realizado sobre</Text>
              <Text style={[styles.cell, styles.resultCell, styles.headerText]}>Resultado</Text>
              <View style={styles.expandCell} />
            </View>
            {summary?.orders.map((order) => {
              const remito = REMITOS_DISPONIBLES[order.id];
              const controlSource = summary.control?.comprobantePorPedido?.[order.id];
              const incidents = summary.control?.incidencias?.filter(
                (incident) =>
                  incident.pedidoEsperado === order.id || incident.pedidoLeido === order.id,
              ) || [];
              const document = summary.control?.documentosControlados?.find(
                (item) => item.pedidoId === order.id,
              );
              const expanded = expandedOrders.includes(order.id);
              return (
                <React.Fragment key={order.id}>
                  <TouchableOpacity
                    style={[styles.tableRow, compact && styles.tableRowCompact]}
                    onPress={() => toggleOrder(order.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.cell, styles.orderCell]}>
                      <Text style={styles.primaryCell}>{order.id}</Text>
                      <Text style={styles.secondaryCell}>Entrega #{order.delivery_order}</Text>
                    </View>
                    <Text style={[styles.cell, styles.clientCell, styles.primaryCell]}>{order.client}</Text>
                    <View style={[styles.cell, styles.documentCell]}>
                      {remito ? (
                        <View style={styles.inlineDocument}>
                          <FileText color="#16a34a" size={16} />
                          <Text style={styles.documentOk}>{remito.id}</Text>
                        </View>
                      ) : (
                        <Text style={styles.documentMissing}>Sin remito</Text>
                      )}
                    </View>
                    <View style={[styles.cell, styles.sourceCell]}>
                      <Text style={controlSource ? styles.primaryCell : styles.secondaryCell}>
                        {controlSource || "No fue controlado"}
                      </Text>
                    </View>
                    <View style={[styles.cell, styles.resultCell]}>
                      {!summary.control ? (
                        <StatusBadge type="neutral">Sin control</StatusBadge>
                      ) : incidents.length === 0 ? (
                        <StatusBadge type="success">Sin problemas</StatusBadge>
                      ) : (
                        <StatusBadge type="warning">
                          {incidents.length} advertencia{incidents.length === 1 ? "" : "s"}
                        </StatusBadge>
                      )}
                    </View>
                    <View style={styles.expandCell}>
                      {expanded
                        ? <ChevronDown color="#64748b" size={18} />
                        : <ChevronRight color="#64748b" size={18} />}
                    </View>
                  </TouchableOpacity>

                  {expanded && (
                    <View style={[styles.expandedRow, compact && styles.tableRowCompact]}>
                      {!document ? (
                        <Text style={styles.noDetailText}>
                          No existe una lista original guardada para este pedido.
                        </Text>
                      ) : (
                        <>
                          <View style={styles.expandedHeader}>
                            <View>
                              <Text style={styles.expandedTitle}>
                                {document.tipo} {document.id}
                              </Text>
                              <Text style={styles.expandedMeta}>
                                Lista original utilizada para controlar {order.id}
                              </Text>
                            </View>
                            <Text style={styles.snapshotBadge}>SNAPSHOT DEL CONTROL</Text>
                          </View>
                          <View style={styles.expandedColumns}>
                            <View style={styles.expandedProducts}>
                              <Text style={styles.detailLabel}>PRODUCTOS DEL DOCUMENTO</Text>
                              {document.productos.map((product) => (
                                <View key={`${document.id}-${product.barcode}`} style={styles.productRow}>
                                  <View style={{ flex: 1 }}>
                                    <Text style={styles.productName}>{product.articulo}</Text>
                                    <Text style={styles.productBarcode}>{product.barcode}</Text>
                                  </View>
                                  <StatusBadge type={product.resultado === "leido" ? "success" : "warning"}>
                                    {product.resultado === "leido"
                                      ? "Leido"
                                      : product.resultado === "faltante"
                                        ? "Faltante"
                                        : "Fuera de orden"}
                                  </StatusBadge>
                                </View>
                              ))}
                            </View>
                            <View style={styles.expandedIncidents}>
                              <Text style={styles.detailLabel}>ADVERTENCIAS RELACIONADAS</Text>
                              {incidents.length === 0 ? (
                                <View style={styles.orderOkBox}>
                                  <CheckCircle2 color="#16a34a" size={18} />
                                  <Text style={styles.orderOkText}>
                                    El pedido fue controlado sin problemas.
                                  </Text>
                                </View>
                              ) : incidents.map((incident) => (
                                <View key={incident.id} style={styles.orderIncidentBox}>
                                  <Text style={styles.orderIncidentTitle}>
                                    {incident.tipo === "faltante" ? "Producto faltante" : "Lectura fuera de orden"}
                                  </Text>
                                  <Text style={styles.orderIncidentText}>
                                    {incident.producto} ({incident.barcode})
                                  </Text>
                                  <Text style={styles.orderIncidentText}>
                                    Esperado: {incident.pedidoEsperado} · Leido: {incident.pedidoLeido || "No se leyo"}
                                  </Text>
                                  <Text style={styles.orderIncidentReason}>{incident.motivo}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: "#f1f5f9" },
  topbar: {
    minHeight: 76,
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 15,
    backgroundColor: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  backButton: { padding: 8, borderRadius: 8, backgroundColor: "#1e293b" },
  topbarTitle: { color: "#fff", fontSize: 19, fontWeight: "800" },
  topbarSubtitle: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  workspace: { flex: 1, minHeight: 0, flexDirection: "row", overflow: "hidden" },
  workspaceCompact: { flexDirection: "column" },
  sidebar: {
    width: 330,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    padding: 18,
  },
  sidebarCompact: { width: "100%", maxHeight: 168, borderRightWidth: 0, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  sidebarLabel: { fontSize: 11, color: "#64748b", fontWeight: "900", marginBottom: 10 },
  truckListCompact: { flexDirection: "row", gap: 10 },
  truckItem: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 13, marginBottom: 10, minWidth: 260 },
  truckItemCompact: { marginBottom: 0 },
  truckItemSelected: { borderColor: "#3b82f6", backgroundColor: "#eff6ff" },
  truckItemTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  truckPlate: { color: "#1e293b", fontSize: 15, fontWeight: "900" },
  truckMeta: { color: "#64748b", fontSize: 10, marginTop: 2 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 10, fontWeight: "900" },
  badgeSuccess: { backgroundColor: "#dcfce7" },
  badgeSuccessText: { color: "#166534" },
  badgeWarning: { backgroundColor: "#fef3c7" },
  badgeWarningText: { color: "#92400e" },
  badgeNeutral: { backgroundColor: "#e2e8f0" },
  badgeNeutralText: { color: "#475569" },
  content: { flex: 1, minHeight: 0 },
  contentInner: {
    padding: 26,
    paddingBottom: 60,
    maxWidth: 1250,
    width: "100%",
    alignSelf: "center",
  },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 },
  pageTitle: { color: "#0f172a", fontSize: 27, fontWeight: "900" },
  pageSubtitle: { color: "#64748b", fontSize: 13, marginTop: 3 },
  controlHeader: { backgroundColor: "#fff", borderRadius: 12, padding: 19, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 24 },
  controlHeaderTitle: { flexDirection: "row", alignItems: "center", gap: 11, marginBottom: 14 },
  cardTitle: { color: "#1e293b", fontSize: 17, fontWeight: "900" },
  cardMeta: { color: "#64748b", fontSize: 11, marginTop: 2 },
  noticeWarning: { flexDirection: "row", gap: 9, padding: 11, borderRadius: 8, backgroundColor: "#fff7ed", marginTop: 7 },
  noticeWarningText: { flex: 1, color: "#9a3412", fontSize: 12, fontWeight: "600" },
  noticeInfo: { flexDirection: "row", gap: 9, padding: 11, borderRadius: 8, backgroundColor: "#eff6ff", marginTop: 7 },
  noticeInfoText: { flex: 1, color: "#1e40af", fontSize: 12, fontWeight: "600" },
  noticeGroup: { marginTop: 8 },
  warningGroupTitle: { color: "#b45309", fontSize: 10, fontWeight: "900", marginBottom: 1 },
  manualGroupTitle: { color: "#1d4ed8", fontSize: 10, fontWeight: "900", marginBottom: 1 },
  stageRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 },
  stageCard: { flex: 1, minWidth: 220, flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 11, borderRadius: 8, backgroundColor: "#f0fdf4" },
  stageName: { color: "#166534", fontSize: 12, fontWeight: "800" },
  stageNote: { color: "#64748b", fontSize: 11, marginTop: 2 },
  emptyCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 28, marginBottom: 24, borderWidth: 1, borderColor: "#e2e8f0" },
  emptyTitle: { color: "#334155", fontSize: 17, fontWeight: "800", marginTop: 10 },
  emptyText: { color: "#64748b", fontSize: 12, textAlign: "center", marginTop: 5 },
  sectionTitle: { color: "#1e293b", fontSize: 17, fontWeight: "900" },
  sectionHelp: { color: "#64748b", fontSize: 11, lineHeight: 16, marginTop: 3, marginBottom: 12 },
  incidentList: { gap: 10, marginBottom: 25 },
  incidentCard: { backgroundColor: "#fff", borderRadius: 10, padding: 15, borderWidth: 1, borderColor: "#fed7aa" },
  incidentHeader: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  incidentTitle: { color: "#9a3412", fontSize: 14, fontWeight: "900" },
  incidentProduct: { color: "#475569", fontSize: 11, marginTop: 2 },
  incidentId: { color: "#94a3b8", fontSize: 10, fontWeight: "800" },
  traceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 13 },
  traceBox: { flex: 1, backgroundColor: "#f8fafc", borderRadius: 8, padding: 10 },
  traceLabel: { color: "#94a3b8", fontSize: 9, fontWeight: "900" },
  traceValue: { color: "#1e293b", fontSize: 13, fontWeight: "900", marginTop: 3 },
  traceMissing: { color: "#b91c1c", fontSize: 13, fontWeight: "900", marginTop: 3 },
  traceDocument: { color: "#64748b", fontSize: 10, marginTop: 2 },
  incidentReason: { color: "#92400e", fontSize: 11, fontWeight: "600", marginTop: 10 },
  table: { backgroundColor: "#fff", borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0" },
  tableRow: { flexDirection: "row", alignItems: "center", minHeight: 62, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  tableRowCompact: { minWidth: 720 },
  tableHeader: { minHeight: 42, backgroundColor: "#f8fafc" },
  cell: { paddingHorizontal: 13 },
  orderCell: { flex: 0.8 },
  clientCell: { flex: 1.5 },
  documentCell: { flex: 1.1 },
  sourceCell: { flex: 1.3 },
  resultCell: { flex: 1.05 },
  expandCell: { width: 38, alignItems: "center", justifyContent: "center" },
  headerText: { color: "#64748b", fontSize: 10, fontWeight: "900" },
  primaryCell: { color: "#334155", fontSize: 12, fontWeight: "700" },
  secondaryCell: { color: "#94a3b8", fontSize: 10, marginTop: 2 },
  inlineDocument: { flexDirection: "row", alignItems: "center", gap: 6 },
  documentOk: { color: "#166534", fontSize: 12, fontWeight: "800" },
  documentMissing: { color: "#b91c1c", fontSize: 12, fontWeight: "800" },
  snapshotBadge: { color: "#1d4ed8", backgroundColor: "#dbeafe", borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3, fontSize: 8, fontWeight: "900" },
  productRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  productName: { color: "#334155", fontSize: 11, fontWeight: "700" },
  productBarcode: { color: "#94a3b8", fontSize: 9, marginTop: 1 },
  expandedRow: { backgroundColor: "#f8fafc", padding: 16, borderBottomWidth: 1, borderBottomColor: "#cbd5e1" },
  expandedHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 },
  expandedTitle: { color: "#1e293b", fontSize: 13, fontWeight: "900" },
  expandedMeta: { color: "#64748b", fontSize: 10, marginTop: 2 },
  expandedColumns: { flexDirection: "row", flexWrap: "wrap", gap: 18 },
  expandedProducts: { flex: 1, minWidth: 300 },
  expandedIncidents: { flex: 1, minWidth: 300 },
  detailLabel: { color: "#64748b", fontSize: 9, fontWeight: "900", marginBottom: 5 },
  orderOkBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f0fdf4", borderRadius: 8, padding: 12 },
  orderOkText: { color: "#166534", fontSize: 11, fontWeight: "700" },
  orderIncidentBox: { backgroundColor: "#fff7ed", borderRadius: 8, padding: 11, marginBottom: 7 },
  orderIncidentTitle: { color: "#9a3412", fontSize: 11, fontWeight: "900" },
  orderIncidentText: { color: "#475569", fontSize: 10, marginTop: 3 },
  orderIncidentReason: { color: "#92400e", fontSize: 10, fontWeight: "600", marginTop: 5 },
  noDetailText: { color: "#64748b", fontSize: 11, fontStyle: "italic" },
});
