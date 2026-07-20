export const ARTICULOS = {
  A001: {
    id: "A001",
    name: "Media res vaca",
    sku: "ME-RE-VA",
    barcode_prefix: "1",
  },
  A002: { id: "A002", name: "Chancho", sku: "CH-AN-CH", barcode_prefix: "2" },
  A003: {
    id: "A003",
    name: "Chorizos bombon",
    sku: "CHO-BO",
    barcode_prefix: "3",
  },
  A004: {
    id: "A004",
    name: "Morcilla criolla",
    sku: "MOR-CR",
    barcode_prefix: "4",
  },
  A005: {
    id: "A005",
    name: "Tapa de asado",
    sku: "TA-AS",
    barcode_prefix: "5",
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
