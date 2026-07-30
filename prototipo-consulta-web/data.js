window.PROTOTYPE_DATA = {
  trucks: [
    {
      id: "TRK-001",
      plate: "AA 123 BB",
      driver: "Juan Pérez",
      date: "06/07/2026",
      control: {
        id: "CTRL-9001",
        date: "06/07/2026 14:35",
        operator: "María López",
        status: "observed",
        warnings: [
          {
            id: "ADV-001",
            type: "Lectura fuera de orden",
            product: "Morcilla criolla",
            barcode: "40002",
            expectedOrder: "PED-102",
            expectedDocument: "Colectada COL-201",
            readOrder: "PED-103",
            readDocument: "Remito REM-301",
            reason: "Se carga así por espacio en el camión",
          },
          {
            id: "ADV-002",
            type: "Producto faltante",
            product: "Chorizos bombón",
            barcode: "30003",
            expectedOrder: "PED-102",
            expectedDocument: "Colectada COL-201",
            readOrder: null,
            readDocument: null,
            reason: "No se encontró el producto al finalizar la etapa",
          },
        ],
        stages: [
          { name: "Cajas", status: "completed", manualObservation: "Sin novedades." },
          {
            name: "Correlativos",
            status: "completed",
            manualObservation: "Se acomodó un producto por espacio.",
          },
        ],
      },
      orders: [
        {
          id: "PED-101",
          client: "Frigorífico El Amigo",
          deliveryOrder: 1,
          currentRemito: { id: "REM-101", date: "06/07/2026" },
          controlledDocument: {
            id: "PED-101",
            type: "Pedido",
            snapshotDate: "06/07/2026 13:50",
            products: [
              { name: "Media res vaca", barcode: "10001", result: "read" },
              { name: "Chancho", barcode: "20001", result: "read" },
            ],
          },
        },
        {
          id: "PED-102",
          client: "Abasto Norte",
          deliveryOrder: 2,
          currentRemito: { id: "REM-102", date: "06/07/2026" },
          controlledDocument: {
            id: "COL-201",
            type: "Colectada",
            snapshotDate: "06/07/2026 13:50",
            products: [
              { name: "Chorizos bombón", barcode: "30001", result: "read" },
              { name: "Chorizos bombón", barcode: "30002", result: "read" },
              { name: "Chorizos bombón", barcode: "30003", result: "missing" },
            ],
          },
        },
        {
          id: "PED-103",
          client: "Abasto Central",
          deliveryOrder: 3,
          currentRemito: { id: "REM-301", date: "06/07/2026" },
          controlledDocument: {
            id: "REM-301",
            type: "Remito",
            snapshotDate: "06/07/2026 13:50",
            products: [
              { name: "Morcilla criolla", barcode: "40001", result: "read" },
              { name: "Morcilla criolla", barcode: "40002", result: "out-of-order" },
            ],
          },
        },
      ],
    },
    {
      id: "TRK-002",
      plate: "BC 456 DE",
      driver: "Ricardo Gómez",
      date: "06/07/2026",
      control: null,
      orders: [
        {
          id: "PED-201",
          client: "Mercado Sur",
          deliveryOrder: 1,
          currentRemito: null,
          controlledDocument: null,
        },
        {
          id: "PED-202",
          client: "Carnicería La Esquina",
          deliveryOrder: 2,
          currentRemito: { id: "REM-202", date: "06/07/2026" },
          controlledDocument: null,
        },
      ],
    },
    {
      id: "TRK-003",
      plate: "AC 908 FG",
      driver: "Laura Medina",
      date: "07/07/2026",
      control: {
        id: "CTRL-9002",
        date: "07/07/2026 09:12",
        operator: "Diego Ramos",
        status: "ok",
        warnings: [],
        stages: [
          { name: "Cajas", status: "completed", manualObservation: "" },
          { name: "Correlativos", status: "completed", manualObservation: "" },
        ],
      },
      orders: [
        {
          id: "PED-301",
          client: "Supermercado Oeste",
          deliveryOrder: 1,
          currentRemito: { id: "REM-401", date: "07/07/2026" },
          controlledDocument: {
            id: "REM-401",
            type: "Remito",
            snapshotDate: "07/07/2026 08:40",
            products: [
              { name: "Tapa de asado", barcode: "50010", result: "read" },
              { name: "Tapa de asado", barcode: "50011", result: "read" },
            ],
          },
        },
      ],
    },
  ],
};
