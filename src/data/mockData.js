export const ARTICULOS = {
  A001: {
    id: "A001",
    name: "Media res vaca",
    sku: "ME-RE-VA",
    barcode_prefix: "1",
    grupoArticulo: "CORRELATIVOS",
  },
  A002: {
    id: "A002",
    name: "Chancho",
    sku: "CH-AN-CH",
    barcode_prefix: "2",
    grupoArticulo: "CORRELATIVOS",
  },
  A003: {
    id: "A003",
    name: "Chorizos bombon",
    sku: "CHO-BO",
    barcode_prefix: "3",
    grupoArticulo: "CAJAS",
  },
  A004: {
    id: "A004",
    name: "Morcilla criolla",
    sku: "MOR-CR",
    barcode_prefix: "4",
    grupoArticulo: "CAJAS",
  },
  A005: {
    id: "A005",
    name: "Tapa de asado",
    sku: "TA-AS",
    barcode_prefix: "5",
    grupoArticulo: "CAJAS",
  },
};

export const CAMIONES = [
  {
    id: "TRK-001",
    plate: "AA-123-BB",
    driver: "Juan Perez",
    date: "2026-07-06",
    orders: ["PED-101", "PED-102", "PED-103"],
  },
  {
    id: "TRK-002",
    plate: "BC-456-DE",
    driver: "Ricardo Gomez",
    date: "2026-07-06",
    orders: ["PED-201", "PED-202"],
  },
];

export const PEDIDOS = {
  "PED-101": {
    id: "PED-101",
    client: "Frigorifico El Amigo",
    delivery_order: 1,
    items: [
      { id: "I-101-1", articuloId: "A001", barcode: "10001" },
      { id: "I-101-2", articuloId: "A002", barcode: "20001" },
    ],
  },
  "PED-102": {
    id: "PED-102",
    client: "Abasto Norte",
    delivery_order: 2,
    items: [{ id: "I-102-1", articuloId: "A003", cantidad: 3 }],
  },
  "PED-103": {
    id: "PED-103",
    client: "Abasto Central",
    delivery_order: 3,
    items: [{ id: "I-103-1", articuloId: "A004", cantidad: 2 }],
  },
  "PED-201": {
    id: "PED-201",
    client: "Mercado Sur",
    delivery_order: 1,
    items: [{ id: "I-201-1", articuloId: "A001", cantidad: 4 }],
  },
  "PED-202": {
    id: "PED-202",
    client: "Carniceria La Esquina",
    delivery_order: 2,
    items: [
      { id: "I-202-1", articuloId: "A005", barcode: "50001" },
      { id: "I-202-2", articuloId: "A005", barcode: "50002" },
    ],
  },
};

export const COLECTAS = {
  "COL-201": {
    id: "COL-201",
    orderId: "PED-102",
    items: [
      { barcode: "30001", articuloId: "A003" },
      { barcode: "30002", articuloId: "A003" },
      { barcode: "30003", articuloId: "A003" },
    ],
  },
};

export const REMITOS = {
  "REM-301": {
    id: "REM-301",
    orderId: "PED-103",
    items: [
      { barcode: "40001", articuloId: "A004" },
      { barcode: "40002", articuloId: "A004" },
    ],
  },
};

export const EXCEPTION_REASONS = [
  "No hay mas productos del pedido esperado",
  "Pertenece al siguiente pedido del mismo cliente",
  "Se carga asi por espacio en el camion",
  "Instruccion del supervisor",
];

// Datos de ejemplo para la consulta web. El remito disponible se informa
// independientemente del comprobante que se utilizo al realizar el control.
export const REMITOS_DISPONIBLES = {
  "PED-101": { id: "REM-101", fecha: "2026-07-06" },
  "PED-102": { id: "REM-102", fecha: "2026-07-06" },
  "PED-103": { id: "REM-301", fecha: "2026-07-06" },
  "PED-202": { id: "REM-202", fecha: "2026-07-06" },
};

export const CONTROLES_CARGA = {
  "TRK-001": {
    id: "CTRL-9001",
    fecha: "2026-07-06 14:35",
    operador: "Maria Lopez",
    estado: "finalizado_observado",
    advertencias: [
      "Se acepto una lectura fuera del orden de carga previsto.",
    ],
    observaciones: [
      "Cajas: control completo.",
      "Correlativos: un producto se acomodo por espacio en el camion.",
    ],
    incidencias: [
      {
        id: "INC-001",
        tipo: "fuera_de_orden",
        producto: "Morcilla criolla",
        barcode: "40002",
        pedidoEsperado: "PED-102",
        pedidoLeido: "PED-103",
        comprobanteEsperado: "Colectada COL-201",
        comprobanteLeido: "Remito REM-301",
        motivo: "Se carga asi por espacio en el camion",
      },
      {
        id: "INC-002",
        tipo: "faltante",
        producto: "Chorizos bombon",
        barcode: "30003",
        pedidoEsperado: "PED-102",
        pedidoLeido: null,
        comprobanteEsperado: "Colectada COL-201",
        comprobanteLeido: null,
        motivo: "No se encontro el producto al finalizar la etapa",
      },
    ],
    etapas: [
      { id: "cajas", nombre: "Cajas", estado: "cumplida", observacion: "Sin novedades" },
      {
        id: "correlativos",
        nombre: "Correlativos",
        estado: "cumplida",
        observacion: "Se acomodo un producto por espacio",
      },
    ],
    comprobantePorPedido: {
      "PED-101": "Pedido",
      "PED-102": "Colectada COL-201",
      "PED-103": "Remito REM-301",
    },
    // Snapshot de los documentos y productos tal como estaban al iniciar el control.
    documentosControlados: [
      {
        id: "PED-101",
        tipo: "Pedido",
        pedidoId: "PED-101",
        cliente: "Frigorifico El Amigo",
        productos: [
          { articulo: "Media res vaca", barcode: "10001", resultado: "leido" },
          { articulo: "Chancho", barcode: "20001", resultado: "leido" },
        ],
      },
      {
        id: "COL-201",
        tipo: "Colectada",
        pedidoId: "PED-102",
        cliente: "Abasto Norte",
        productos: [
          { articulo: "Chorizos bombon", barcode: "30001", resultado: "leido" },
          { articulo: "Chorizos bombon", barcode: "30002", resultado: "leido" },
          { articulo: "Chorizos bombon", barcode: "30003", resultado: "faltante" },
        ],
      },
      {
        id: "REM-301",
        tipo: "Remito",
        pedidoId: "PED-103",
        cliente: "Abasto Central",
        productos: [
          { articulo: "Morcilla criolla", barcode: "40001", resultado: "leido" },
          { articulo: "Morcilla criolla", barcode: "40002", resultado: "fuera_de_orden" },
        ],
      },
    ],
  },
};
