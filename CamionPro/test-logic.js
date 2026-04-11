const ValidationEngine = require('./src/utils/validationEngine');
const { CAMIONES } = require('./src/data/mockDataNode');

console.log("=== TEST DE CARGA DE CAMIÓN (NODE.JS) ===");

const truck = CAMIONES[0]; // Juan Pérez con 2 pedidos
const engine = new ValidationEngine(truck);

console.log(`\nCargando Camión: ${truck.plate} (${truck.driver})`);
console.log(`Bultos esperados en total: ${engine.expectedItems.length}\n`);

// 1. Escaneo Correcto (Basado en Remito)
console.log("Acción: Escaneando bulto válido del remito (1000001)...");
const res1 = engine.processScan('1000001');
console.log(res1.success ? `✅ OK: ${res1.item.articuloName}` : `❌ ${res1.error}`);

// 2. Intento de Duplicado
console.log("\nAcción: Intentando escanear el MISMO bulto (1000001)...");
const res2 = engine.processScan('1000001');
console.log(res2.success ? "✅ OK" : `❌ ${res2.error}`);

// 3. Producto de otro camión
console.log("\nAcción: Escaneando bulto inexistente en este viaje (9990001)...");
const res3 = engine.processScan('9990001');
console.log(res3.success ? "✅ OK" : `❌ ${res3.error}`);

// 4. Salto de orden (Carga Ladrillos antes que Cemento/Cal)
console.log("\nAcción: Escaneando Ladrillo (Prefijo 300) que es del 2do pedido...");
const res4 = engine.processScan('3000001');
if (res4.success) {
    console.log(`✅ OK: ${res4.item.articuloName}`);
    if (res4.warning) console.log(`⚠️  ADVERTENCIA: ${res4.warning}`);
}

// 5. Resumen final
const summary = engine.getSummary();
console.log("\n=== RESUMEN FINAL DEL TEST ===");
console.log(`Total Esperado: ${summary.total}`);
console.log(`Efectivamente Cargado: ${summary.scanned}`);
console.log(`Pendientes (Discrepancias): ${summary.discrepancies.length}`);

if (summary.discrepancies.length > 0) {
    console.log("Faltaron bultos que estaban en colecta/remito:");
    summary.discrepancies.forEach(d => console.log(` - ${d.articuloName} (Pedido: ${d.orderId})`));
}
