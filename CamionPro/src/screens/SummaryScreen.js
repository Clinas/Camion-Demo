import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useStore } from '../context/StoreContext';
import { CheckCircle, AlertCircle, Package, Send, ArrowLeft } from 'lucide-react-native';

export default function SummaryScreen({ navigation }) {
  const { expectedItems, selectedTruck, isOffline } = useStore();

  const scannedCount = expectedItems.filter(i => i.status === 'scanned').length;
  const pendingCount = expectedItems.length - scannedCount;
  const discrepancies = expectedItems.filter(i => i.status === 'pending' && (i.inCollection || i.inRemito));

  const handleSync = () => {
    const msg = isOffline 
      ? 'Los datos se han guardado localmente y se sincronizarán automáticamente.' 
      : 'El ERP ha sido actualizado con el control de carga.';
    
    if (Platform.OS === 'web') {
      window.alert(msg);
      navigation.popToTop();
    } else {
      Alert.alert('Control Finalizado', msg, [
        { text: 'OK', onPress: () => navigation.popToTop() }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header for Web */}
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerNavTitle}>Resumen de Carga</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={{ flex: 1 }}>
        <View style={styles.headerCard}>
          <Text style={styles.truckPlate}>{selectedTruck?.plate}</Text>
          <Text style={styles.truckDriver}>{selectedTruck?.driver}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{expectedItems.length}</Text>
              <Text style={styles.statLabel}>ESPERADO</Text>
            </View>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={[styles.statValue, { color: '#10b981' }]}>{scannedCount}</Text>
              <Text style={styles.statLabel}>CARGADO</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{pendingCount}</Text>
              <Text style={styles.statLabel}>FALTANTE</Text>
            </View>
          </View>
        </View>

        {discrepancies.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertCircle color="#ef4444" size={20} />
              <Text style={styles.alertTitle}>Discrepancias Críticas</Text>
            </View>
            <Text style={styles.alertText}>
              Bultos en Colecta/Remito que NO fueron escaneados:
            </Text>
            {discrepancies.map((item, idx) => (
              <View key={idx} style={styles.discrepancyItem}>
                <Package color="#991b1b" size={14} />
                <Text style={styles.discrepancyName}>{item.articuloName} (SKU: {item.sku})</Text>
              </View>
            ))}
          </View>
        )}

        <View style={[styles.statusBox, pendingCount === 0 ? styles.statusSuccess : styles.statusWarning]}>
          {pendingCount === 0 ? (
            <>
              <CheckCircle color="#10b981" size={40} />
              <Text style={styles.statusBoxTitle}>Todo en Orden</Text>
              <Text style={styles.statusBoxText}>La carga física coincide al 100% con los documentos.</Text>
            </>
          ) : (
            <>
              <AlertCircle color="#f59e0b" size={40} />
              <Text style={styles.statusBoxTitle}>Carga Incompleta</Text>
              <Text style={styles.statusBoxText}>Se detectaron faltantes. Verifique antes de despachar.</Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.syncBtn} onPress={handleSync}>
          <Send color="#fff" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.syncBtnText}>Confirmar y Sincronizar</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerNav: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtnHeader: { padding: 8, marginLeft: -10 },
  headerNavTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginLeft: 10 },

  scrollContent: { padding: 20 },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  truckPlate: { fontSize: 22, fontWeight: '900', color: '#1e293b' },
  truckDriver: { fontSize: 14, color: '#64748b', marginTop: 2 },
  
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 },
  stat: { alignItems: 'center', flex: 1 },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f1f5f9' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '800', marginTop: 4 },
  
  alertCard: { backgroundColor: '#fef2f2', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#fee2e2' },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  alertTitle: { fontSize: 15, fontWeight: '800', color: '#991b1b' },
  alertText: { fontSize: 13, color: '#b91c1c', marginBottom: 12, fontWeight: '500' },
  discrepancyItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  discrepancyName: { fontSize: 12, color: '#b91c1c', fontWeight: '600' },

  statusBox: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 25 },
  statusSuccess: { backgroundColor: '#f0fdf4' },
  statusWarning: { backgroundColor: '#fff7ed' },
  statusBoxTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginTop: 12 },
  statusBoxText: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 6, lineHeight: 18 },

  syncBtn: {
    backgroundColor: '#1e293b',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  syncBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
