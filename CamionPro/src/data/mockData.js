export const ARTICULOS = {
  'A001': { id: 'A001', name: 'Media res vaca', sku: 'ME-RE-VA', barcode_prefix: '100' },
  'A002': { id: 'A002', name: 'Chancho', sku: 'CH-AN-CH', barcode_prefix: '200' },
  'A003': { id: 'A003', name: 'Chorizos bombón', sku: 'CHO-BO', barcode_prefix: '300' },
  'A004': { id: 'A004', name: 'Morcilla criolla', sku: 'MOR-CR', barcode_prefix: '400' },
};

export const CAMIONES = [
  {
    id: 'TRK-001',
    plate: 'AA-123-BB',
    driver: 'Juan Pérez',
    date: '2026-04-10',
    orders: ['ORD-101', 'ORD-102'],
  },
  {
    id: 'TRK-002',
    plate: 'BC-456-DE',
    driver: 'Ricardo Gomez',
    date: '2026-04-10',
    orders: ['ORD-103'],
  },
];

export const PEDIDOS = {
  'ORD-101': {
    id: 'ORD-101',
    client: 'Frigorífico El Amigo',
    delivery_order: 1,
    items: [
      { id: 'I-101-1', articuloId: 'A001', cantidad: 5 },
      { id: 'I-101-2', articuloId: 'A002', cantidad: 4 },
    ],
  },
  'ORD-102': {
    id: 'ORD-102',
    client: 'Abasto Norte',
    delivery_order: 2,
    items: [
      { id: 'I-102-1', articuloId: 'A003', cantidad: 5 },
    ],
  },
  'ORD-103': {
    id: 'ORD-103',
    client: 'Abasto Central',
    delivery_order: 1,
    items: [
      { id: 'I-103-1', articuloId: 'A004', cantidad: 4 },
    ],
  },
};

export const COLECTAS = {
  'COL-201': {
    id: 'COL-201',
    orderId: 'ORD-101',
    items: [
      { barcode: '1000001', articuloId: 'A001' },
      { barcode: '1000002', articuloId: 'A001' },
      { barcode: '2000001', articuloId: 'A002' },
    ],
  },
  'COL-202': {
    id: 'COL-202',
    orderId: 'ORD-102',
    items: [
      { barcode: '3000001', articuloId: 'A003' },
      { barcode: '3000002', articuloId: 'A003' },
      { barcode: '3000003', articuloId: 'A003' },
    ],
  },
};

export const REMITOS = {
  'REM-301': {
    id: 'REM-301',
    orderId: 'ORD-101',
    items: [
      { barcode: '1000001', articuloId: 'A001' },
      { barcode: '1000002', articuloId: 'A001' },
      { barcode: '1000003', articuloId: 'A001' },
      { barcode: '2000001', articuloId: 'A002' },
      { barcode: '2000002', articuloId: 'A002' },
    ],
  },
};
