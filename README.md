# CamionPro - Prototipo de Control de Carga (V7)

Este prototipo funcional permite realizar el proceso de validación física de mercadería cargada en camiones, integrando datos de Pedidos, Colectas y Remitos.

## Estado Actual: Versión 7
- **Dominio:** Logística de carnes (Media res, Chancho, Chorizos, etc.).
- **UI Agrupada:** El scanner organiza los bultos por Pedido y Cliente, mostrando el orden de entrega prioritario.
- **Mapeo Inteligente:** Los códigos de barras de colectas y remitos se asignan secuencialmente a los artículos del pedido, evitando duplicados en la lista de pretendidos.
- **Web Optimized:** Diseño con `absoluteFill` y scroll interno funcional para navegadores.
- **Feedback Ágil:** Banners de estado superiores en lugar de alertas intrusivas.

## Funcionalidades
- **Validación Multi-fuente:** Cruce de datos entre el Pedido original, la Colecta de depósito y el Remito legal.
- **Motor de Validación:**
  - Detección de bultos duplicados.
  - Alerta de producto no perteneciente al camión.
  - Advertencia de carga fuera de orden (FIFO por pedido).
- **Modo Offline:** Persistencia local de escaneos para sincronización posterior.

## Cómo Ejecutar
1. `cd CamionPro`
2. `npm install`
3. `npx expo start --web` (para probar en navegador) o `npx expo start` (para Expo Go).

## Datos de Prueba (Prefijos de Barcode)
Usa estos prefijos en el scanner para simular productos:
- **100:** Media res vaca (ID: A001)
- **200:** Chancho (ID: A002)
- **300:** Chorizos bombón (ID: A003)
- **400:** Morcilla criolla (ID: A004)

## Test de Lógica (Node.js)
Puedes probar el "cerebro" de la aplicación sin la interfaz:
```bash
node CamionPro/test-logic.js
```
