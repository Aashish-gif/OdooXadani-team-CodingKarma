import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ['warn', 'error'] })

async function seedRoles() {
  const roles = [
    { name: 'Admin', description: 'Full system access and user management', permissions: 'Full Access' },
    { name: 'Engineer', description: 'Create and modify products, BoMs, ECOs', permissions: 'Read/Write' },
    { name: 'Approver', description: 'Approve or reject ECOs', permissions: 'Approve' },
    { name: 'Operations', description: 'View and implement approved ECOs', permissions: 'Read/Implement' },
  ]
  for (const role of roles) {
    const exists = await prisma.role.findUnique({ where: { name: role.name } })
    if (!exists) {
      await prisma.role.create({ data: role })
    }
  }
  console.log('✓ Roles seeded')
}

async function seedUsers() {
  const users = [
    { name: 'System Admin', email: 'admin@example.com', password: 'password123', role: 'Admin', status: 'Active' },
    { name: 'Sarah Engineer', email: 'sarah@example.com', password: 'password123', role: 'Engineer', status: 'Active' },
    { name: 'Michael Approver', email: 'michael@example.com', password: 'password123', role: 'Approver', status: 'Active' },
    { name: 'John Operations', email: 'john@example.com', password: 'password123', role: 'Operations', status: 'Active' },
    { name: 'Emma Engineer', email: 'emma@example.com', password: 'password123', role: 'Engineer', status: 'Active' },
    { name: 'David Admin', email: 'david@example.com', password: 'password123', role: 'Admin', status: 'Active' },
    { name: 'Lisa Approver', email: 'lisa@example.com', password: 'password123', role: 'Approver', status: 'Active' },
  ]
  for (const user of users) {
    const exists = await prisma.user.findUnique({ where: { email: user.email } })
    if (!exists) {
      await prisma.user.create({ data: user })
    }
  }
  console.log('✓ Users seeded (7 users)')
}

async function seedProducts() {
  const products = [
    {
      productId: 'P001',
      name: 'Office Chair Deluxe',
      category: 'Furniture',
      currentVersion: 'v2.3',
      salePrice: 459.99,
      costPrice: 287.5,
      sku: 'SKU-OCD-001',
      manufacturer: 'ComfortWorks',
      description: 'Premium ergonomic office chair with lumbar support',
    },
    {
      productId: 'P002',
      name: 'Industrial Pump XR-500',
      category: 'Industrial',
      currentVersion: 'v1.8',
      salePrice: 2450.0,
      costPrice: 1680.0,
      sku: 'SKU-IPX-500',
      manufacturer: 'PumpTech',
      description: 'Heavy-duty industrial centrifugal pump',
    },
    {
      productId: 'P003',
      name: 'LED Monitor 27"',
      category: 'Electronics',
      currentVersion: 'v1.5',
      salePrice: 349.99,
      costPrice: 210.0,
      sku: 'SKU-LED-27',
      manufacturer: 'DisplayTech',
      description: '4K UHD LED monitor with HDR support',
    },
    {
      productId: 'P004',
      name: 'Hydraulic Cylinder HC-50',
      category: 'Industrial',
      currentVersion: 'v2.0',
      salePrice: 899.0,
      costPrice: 520.0,
      sku: 'SKU-HC-50',
      manufacturer: 'HydroSystems',
      description: '50-ton capacity hydraulic cylinder',
    },
    {
      productId: 'P005',
      name: 'Wireless Keyboard',
      category: 'Electronics',
      currentVersion: 'v1.2',
      salePrice: 89.99,
      costPrice: 45.0,
      sku: 'SKU-WK-BT',
      manufacturer: 'TechPeripheral',
      description: 'Bluetooth wireless mechanical keyboard',
    },
    {
      productId: 'P006',
      name: 'Stainless Steel Work Table',
      category: 'Furniture',
      currentVersion: 'v1.0',
      salePrice: 1299.0,
      costPrice: 750.0,
      sku: 'SKU-SWT-60',
      manufacturer: 'IndustrialFurniture',
      description: '60x30 stainless steel work table for laboratories',
    },
    {
      productId: 'P007',
      name: 'Electric Motor EM-3HP',
      category: 'Industrial',
      currentVersion: 'v2.1',
      salePrice: 650.0,
      costPrice: 380.0,
      sku: 'SKU-EM-3HP',
      manufacturer: 'MotorCorp',
      description: '3 HP three-phase electric motor',
    },
  ]

  for (const p of products) {
    const exists = await prisma.product.findUnique({ where: { productId: p.productId } })
    if (!exists) {
      await prisma.product.create({ data: p as any })
    }
  }
  console.log('✓ Products seeded (7 products)')
}

async function seedProductVersions() {
  const productVersions: Record<
    string,
    Array<{ version: string; changes: string; daysAgo: number }>
  > = {
    P001: [
      { version: 'v2.3', changes: 'Reinforced armrest and improved cushion density', daysAgo: 0 },
      { version: 'v2.2', changes: 'Updated armrest design', daysAgo: 30 },
      { version: 'v2.1', changes: 'Improved base stability', daysAgo: 60 },
      { version: 'v2.0', changes: 'Initial v2 release', daysAgo: 90 },
    ],
    P002: [
      { version: 'v1.8', changes: 'Seal material upgraded to ceramic composite', daysAgo: 0 },
      { version: 'v1.7', changes: 'Motor efficiency improved by 5%', daysAgo: 45 },
      { version: 'v1.6', changes: 'Fixed impeller alignment issue', daysAgo: 90 },
      { version: 'v1.5', changes: 'Initial production release', daysAgo: 180 },
    ],
    P003: [
      { version: 'v1.5', changes: 'Added HDR10+ support', daysAgo: 10 },
      { version: 'v1.4', changes: 'Improved color accuracy', daysAgo: 40 },
      { version: 'v1.3', changes: 'Updated firmware for USB-C', daysAgo: 70 },
      { version: 'v1.2', changes: 'Initial 4K release', daysAgo: 120 },
    ],
    P004: [
      { version: 'v2.0', changes: 'Enhanced piston rod coating', daysAgo: 5 },
      { version: 'v1.9', changes: 'Pressure rating increased to 210 bar', daysAgo: 35 },
      { version: 'v1.8', changes: 'Improved seal assembly', daysAgo: 75 },
      { version: 'v1.7', changes: 'Initial design finalized', daysAgo: 150 },
    ],
    P005: [
      { version: 'v1.2', changes: 'Added macro recording functionality', daysAgo: 3 },
      { version: 'v1.1', changes: 'Extended battery life to 60 hours', daysAgo: 50 },
      { version: 'v1.0', changes: 'Initial release', daysAgo: 100 },
    ],
    P006: [
      { version: 'v1.0', changes: 'Initial design and production', daysAgo: 0 },
    ],
    P007: [
      { version: 'v2.1', changes: 'Improved cooling system design', daysAgo: 2 },
      { version: 'v2.0', changes: 'Enhanced insulation materials', daysAgo: 40 },
      { version: 'v1.9', changes: 'Increased efficiency rating to 92%', daysAgo: 85 },
      { version: 'v1.8', changes: 'Reduced vibration levels', daysAgo: 130 },
    ],
  }

  for (const [productId, versions] of Object.entries(productVersions)) {
    const product = await prisma.product.findUnique({ where: { productId } })
    if (!product) continue

    for (const v of versions) {
      const date = new Date()
      date.setDate(date.getDate() - v.daysAgo)
      const exists = await prisma.productVersion.findFirst({
        where: { productId: product.id, version: v.version },
      })
      if (!exists) {
        await prisma.productVersion.create({
          data: { version: v.version, changes: v.changes, date, productId: product.id },
        })
      }
    }
  }
  console.log('✓ Product versions seeded (3-4 per product)')
}

async function seedBoMs() {
  const boms = [
    { bomId: 'BOM001', productId: 'P001', version: 'v2.3', status: 'Active' },
    { bomId: 'BOM002', productId: 'P002', version: 'v1.8', status: 'Active' },
    { bomId: 'BOM003', productId: 'P003', version: 'v1.5', status: 'Active' },
    { bomId: 'BOM004', productId: 'P004', version: 'v2.0', status: 'Active' },
    { bomId: 'BOM005', productId: 'P005', version: 'v1.2', status: 'Active' },
    { bomId: 'BOM006', productId: 'P006', version: 'v1.0', status: 'Active' },
    { bomId: 'BOM007', productId: 'P007', version: 'v2.1', status: 'Active' },
  ]

  for (const b of boms) {
    const product = await prisma.product.findUnique({ where: { productId: b.productId } })
    if (!product) continue

    const exists = await prisma.boM.findUnique({ where: { bomId: b.bomId } })
    if (!exists) {
      await prisma.boM.create({
        data: { bomId: b.bomId, version: b.version, status: b.status, productId: product.id },
      })
    }
  }
  console.log('✓ BoMs seeded (7 BoMs)')
}

async function seedBoMComponents() {
  const components: Record<string, Array<{ name: string; quantity: number; unit: string; supplier: string }>> = {
    BOM001: [
      { name: 'Seat Cushion', quantity: 1, unit: 'pcs', supplier: 'FoamCo' },
      { name: 'Steel Base', quantity: 1, unit: 'pcs', supplier: 'MetalWorks' },
      { name: 'Armrest Pair', quantity: 2, unit: 'pcs', supplier: 'PlasticForm' },
      { name: 'Gas Cylinder', quantity: 1, unit: 'pcs', supplier: 'GasParts Inc' },
      { name: 'Wheel Set', quantity: 5, unit: 'pcs', supplier: 'WheelTech' },
    ],
    BOM002: [
      { name: 'Pump Housing', quantity: 1, unit: 'pcs', supplier: 'CastingWorks' },
      { name: 'Impeller', quantity: 1, unit: 'pcs', supplier: 'MetalMachining' },
      { name: 'Seal Assembly', quantity: 2, unit: 'pcs', supplier: 'SealTech' },
      { name: 'Bearing Set', quantity: 4, unit: 'pcs', supplier: 'BearingCorp' },
      { name: 'Bolts M10', quantity: 20, unit: 'pcs', supplier: 'Fasteners Ltd' },
      { name: 'Gasket Sheet', quantity: 1, unit: 'm2', supplier: 'RubberGoods' },
    ],
    BOM003: [
      { name: 'LCD Panel', quantity: 1, unit: 'pcs', supplier: 'DisplayPanel Co' },
      { name: 'LED Backlight Array', quantity: 1, unit: 'pcs', supplier: 'LEDTech' },
      { name: 'Power Supply Unit', quantity: 1, unit: 'pcs', supplier: 'PSUManuf' },
      { name: 'Control Board', quantity: 1, unit: 'pcs', supplier: 'ElectronicsMfg' },
    ],
    BOM004: [
      { name: 'Piston Rod', quantity: 1, unit: 'pcs', supplier: 'RodManuf' },
      { name: 'Cylinder Barrel', quantity: 1, unit: 'pcs', supplier: 'MetalTubing' },
      { name: 'Seal Kit', quantity: 1, unit: 'kit', supplier: 'HydroSeals' },
      { name: 'End Cap', quantity: 2, unit: 'pcs', supplier: 'MetalWorks' },
      { name: 'Port Connectors', quantity: 4, unit: 'pcs', supplier: 'HydroConnectors' },
    ],
    BOM005: [
      { name: 'Mechanical Switches', quantity: 104, unit: 'pcs', supplier: 'SwitchMfg' },
      { name: 'PCB Circuit Board', quantity: 1, unit: 'pcs', supplier: 'PCBManuf' },
      { name: 'Bluetooth Module', quantity: 1, unit: 'pcs', supplier: 'BLEChips' },
      { name: 'Battery 2600mAh', quantity: 1, unit: 'pcs', supplier: 'BatteryTech' },
      { name: 'ABS Plastic Case', quantity: 1, unit: 'pcs', supplier: 'PlasticsInc' },
    ],
    BOM006: [
      { name: 'Stainless Steel Plate 2mm', quantity: 2, unit: 'm2', supplier: 'SteelSupply' },
      { name: 'Stainless Angle 40x40', quantity: 20, unit: 'm', supplier: 'StructuralSteel' },
      { name: 'Stainless Bolts M8', quantity: 50, unit: 'pcs', supplier: 'Fasteners Ltd' },
      { name: 'Welding Electrodes', quantity: 2, unit: 'kg', supplier: 'WeldingSupply' },
    ],
    BOM007: [
      { name: 'Stator Assembly', quantity: 1, unit: 'pcs', supplier: 'MotorParts' },
      { name: 'Rotor Core', quantity: 1, unit: 'pcs', supplier: 'MotorParts' },
      { name: 'Bearing 6308', quantity: 2, unit: 'pcs', supplier: 'BearingCorp' },
      { name: 'Cooling Fan', quantity: 1, unit: 'pcs', supplier: 'FanMfg' },
      { name: 'Terminal Box', quantity: 1, unit: 'pcs', supplier: 'ElectricalEncl' },
      { name: 'Insulation Wire', quantity: 50, unit: 'm', supplier: 'WireManuf' },
    ],
  }

  for (const [bomId, comps] of Object.entries(components)) {
    const bom = await prisma.boM.findUnique({ where: { bomId } })
    if (!bom) continue

    for (const comp of comps) {
      const exists = await prisma.boMComponent.findFirst({ where: { bomId: bom.id, name: comp.name } })
      if (!exists) {
        await prisma.boMComponent.create({
          data: {
            name: comp.name,
            quantity: comp.quantity,
            unit: comp.unit,
            supplier: comp.supplier,
            bomId: bom.id,
          },
        })
      }
    }

    const compCount = await prisma.boMComponent.count({ where: { bomId: bom.id } })
    await prisma.boM.update({ where: { id: bom.id }, data: { componentsCount: compCount } })
  }
  console.log('✓ BoM components seeded (5-6 per BoM)')
}

async function seedBoMOperations() {
  const operations: Record<string, Array<{ name: string; time: number; unit: string; workCenter: string }>> = {
    BOM001: [
      { name: 'Assembly', time: 30, unit: 'min', workCenter: 'Line A' },
      { name: 'Quality Check', time: 10, unit: 'min', workCenter: 'QC' },
      { name: 'Packaging', time: 15, unit: 'min', workCenter: 'Pack' },
    ],
    BOM002: [
      { name: 'Casting Inspection', time: 20, unit: 'min', workCenter: 'Inspect' },
      { name: 'Machining', time: 120, unit: 'min', workCenter: 'Machine Shop' },
      { name: 'Assembly', time: 45, unit: 'min', workCenter: 'Assembly Line' },
      { name: 'Pressure Testing', time: 25, unit: 'min', workCenter: 'Test Lab' },
    ],
    BOM003: [
      { name: 'Panel Assembly', time: 15, unit: 'min', workCenter: 'Assembly' },
      { name: 'Testing', time: 30, unit: 'min', workCenter: 'Test Station' },
      { name: 'Calibration', time: 20, unit: 'min', workCenter: 'Cal Lab' },
    ],
    BOM004: [
      { name: 'Rod Polishing', time: 40, unit: 'min', workCenter: 'Finishing' },
      { name: 'Seal Installation', time: 25, unit: 'min', workCenter: 'Assembly' },
      { name: 'Pressure Test', time: 30, unit: 'min', workCenter: 'Test' },
    ],
    BOM005: [
      { name: 'PCB Assembly', time: 35, unit: 'min', workCenter: 'Electronics' },
      { name: 'Key Installation', time: 45, unit: 'min', workCenter: 'Assembly' },
      { name: 'Firmware Flash', time: 10, unit: 'min', workCenter: 'Programming' },
      { name: 'Testing', time: 20, unit: 'min', workCenter: 'QA' },
    ],
    BOM006: [
      { name: 'Cutting', time: 60, unit: 'min', workCenter: 'Cutting' },
      { name: 'Welding', time: 90, unit: 'min', workCenter: 'Welding' },
      { name: 'Grinding', time: 45, unit: 'min', workCenter: 'Finishing' },
      { name: 'Surface Treatment', time: 30, unit: 'min', workCenter: 'Coating' },
    ],
    BOM007: [
      { name: 'Stator Winding', time: 75, unit: 'min', workCenter: 'Winding' },
      { name: 'Bearing Installation', time: 20, unit: 'min', workCenter: 'Assembly' },
      { name: 'Motor Test', time: 45, unit: 'min', workCenter: 'Dynamometer' },
      { name: 'Final Assembly', time: 30, unit: 'min', workCenter: 'Assembly' },
    ],
  }

  for (const [bomId, ops] of Object.entries(operations)) {
    const bom = await prisma.boM.findUnique({ where: { bomId } })
    if (!bom) continue

    for (const op of ops) {
      const exists = await prisma.boMOperation.findFirst({ where: { bomId: bom.id, name: op.name } })
      if (!exists) {
        await prisma.boMOperation.create({
          data: {
            name: op.name,
            time: op.time,
            unit: op.unit,
            workCenter: op.workCenter,
            bomId: bom.id,
          },
        })
      }
    }
  }
  console.log('✓ BoM operations seeded (3-4 per BoM)')
}

async function seedECOs() {
  const ecos = [
    {
      ecoId: '2025-001',
      productId: 'P001',
      title: 'Armrest Strength Improvement',
      type: 'BoM',
      stage: 'Implementation',
      status: 'Approved',
      createdBy: 'sarah@example.com',
      description: 'Increase armrest thickness by 2mm and change material to reinforced polymer',
    },
    {
      ecoId: '2025-002',
      productId: 'P002',
      title: 'Seal Material Upgrade',
      type: 'BoM',
      stage: 'Implementation',
      status: 'Approved',
      createdBy: 'emma@example.com',
      description: 'Replace rubber seals with ceramic composite for better durability',
    },
    {
      ecoId: '2025-003',
      productId: 'P003',
      title: 'HDR Support Addition',
      type: 'Product',
      stage: 'Completed',
      status: 'Approved',
      createdBy: 'sarah@example.com',
      description: 'Add HDR10+ and HDR400 support to the display',
    },
    {
      ecoId: '2025-004',
      productId: 'P004',
      title: 'Pressure Rating Increase',
      type: 'Product',
      stage: 'Approval',
      status: 'Pending Approval',
      createdBy: 'emma@example.com',
      description: 'Increase working pressure from 200 to 210 bar',
    },
    {
      ecoId: '2025-005',
      productId: 'P005',
      title: 'Macro Recording Feature',
      type: 'Product',
      stage: 'Draft',
      status: 'Draft',
      createdBy: 'sarah@example.com',
      description: 'Add macro recording and playback functionality',
    },
    {
      ecoId: '2025-006',
      productId: 'P006',
      title: 'Stainless Steel Grade Change',
      type: 'BoM',
      stage: 'Approval',
      status: 'Pending Approval',
      createdBy: 'emma@example.com',
      description: 'Upgrade from 304 to 316L stainless steel for better corrosion resistance',
    },
    {
      ecoId: '2025-007',
      productId: 'P007',
      title: 'Cooling System Enhancement',
      type: 'BoM',
      stage: 'Implementation',
      status: 'Approved',
      createdBy: 'sarah@example.com',
      description: 'Redesign cooling fan ducts for improved air circulation',
    },
  ]

  for (const eco of ecos) {
    const product = await prisma.product.findUnique({ where: { productId: eco.productId } })
    if (!product) continue

    const exists = await prisma.eCO.findUnique({ where: { ecoId: eco.ecoId } })
    if (!exists) {
      await prisma.eCO.create({
        data: {
          ecoId: eco.ecoId,
          title: eco.title,
          type: eco.type,
          stage: eco.stage,
          status: eco.status,
          effectiveDate: new Date(),
          createdBy: eco.createdBy,
          description: eco.description,
          productId: product.id,
        },
      })
    }
  }
  console.log('✓ ECOs seeded (7 ECOs)')
}

async function seedECOChanges() {
  const changes: Record<string, Array<{ component: string | null; field: string; oldValue: string; newValue: string; highlight: string }>> = {
    '2025-001': [
      { component: 'Armrest Pair', field: 'Material', oldValue: 'ABS', newValue: 'Reinforced Polymer', highlight: 'changed' },
      { component: 'Armrest Pair', field: 'Thickness', oldValue: '4mm', newValue: '6mm', highlight: 'increased' },
    ],
    '2025-002': [
      { component: 'Seal Assembly', field: 'Material', oldValue: 'Rubber', newValue: 'Ceramic Composite', highlight: 'changed' },
      { component: 'Seal Assembly', field: 'Cost', oldValue: '$50', newValue: '$75', highlight: 'increased' },
    ],
    '2025-003': [
      { component: null, field: 'HDR Support', oldValue: 'HDR10', newValue: 'HDR10+ / HDR400', highlight: 'increased' },
      { component: null, field: 'Brightness', oldValue: '300 nits', newValue: '400 nits', highlight: 'increased' },
    ],
    '2025-004': [
      { component: 'Piston Rod', field: 'Pressure Rating', oldValue: '200 bar', newValue: '210 bar', highlight: 'increased' },
      { component: 'Seal Kit', field: 'Material', oldValue: 'Standard', newValue: 'High-Pressure Grade', highlight: 'changed' },
    ],
    '2025-005': [
      { component: null, field: 'Features', oldValue: 'Standard Typing', newValue: 'Macro Recording', highlight: 'increased' },
      { component: null, field: 'Memory', oldValue: '1MB', newValue: '4MB', highlight: 'increased' },
    ],
    '2025-006': [
      { component: 'Stainless Steel Plate', field: 'Grade', oldValue: '304', newValue: '316L', highlight: 'changed' },
      { component: 'Stainless Angle', field: 'Grade', oldValue: '304', newValue: '316L', highlight: 'changed' },
    ],
    '2025-007': [
      { component: 'Cooling Fan', field: 'Design', oldValue: 'Radial', newValue: 'Axial Enhanced', highlight: 'changed' },
      { component: 'Cooling Fan', field: 'Airflow', oldValue: '120 CFM', newValue: '150 CFM', highlight: 'increased' },
    ],
  }

  for (const [ecoId, changeList] of Object.entries(changes)) {
    const eco = await prisma.eCO.findUnique({ where: { ecoId } })
    if (!eco) continue

    for (const ch of changeList) {
      const exists = await prisma.eCOChange.findFirst({
        where: { ecoId: eco.id, field: ch.field, component: ch.component ?? undefined },
      })
      if (!exists) {
        await prisma.eCOChange.create({
          data: { ecoId: eco.id, component: ch.component, field: ch.field, oldValue: ch.oldValue, newValue: ch.newValue, highlight: ch.highlight },
        })
      }
    }
  }
  console.log('✓ ECO changes seeded (2 per ECO)')
}

async function seedECOApprovals() {
  const ecoApprovals: Record<string, Array<{ role: string; name: string; status: string }>> = {
    '2025-001': [
      { role: 'Engineer', name: 'Sarah Engineer', status: 'Approved' },
      { role: 'Approver', name: 'Michael Approver', status: 'Approved' },
    ],
    '2025-002': [
      { role: 'Engineer', name: 'Emma Engineer', status: 'Approved' },
      { role: 'Approver', name: 'Lisa Approver', status: 'Approved' },
    ],
    '2025-003': [
      { role: 'Engineer', name: 'Sarah Engineer', status: 'Approved' },
      { role: 'Approver', name: 'Michael Approver', status: 'Approved' },
      { role: 'Operations', name: 'John Operations', status: 'Approved' },
    ],
    '2025-004': [
      { role: 'Engineer', name: 'Emma Engineer', status: 'Approved' },
      { role: 'Approver', name: 'Michael Approver', status: 'Pending' },
    ],
    '2025-005': [
      { role: 'Engineer', name: 'Sarah Engineer', status: 'Pending' },
      { role: 'Approver', name: 'Lisa Approver', status: 'Pending' },
    ],
    '2025-006': [
      { role: 'Engineer', name: 'Emma Engineer', status: 'Approved' },
      { role: 'Approver', name: 'Michael Approver', status: 'Pending' },
      { role: 'Operations', name: 'John Operations', status: 'Pending' },
    ],
    '2025-007': [
      { role: 'Engineer', name: 'Sarah Engineer', status: 'Approved' },
      { role: 'Approver', name: 'Lisa Approver', status: 'Approved' },
      { role: 'Operations', name: 'John Operations', status: 'Approved' },
    ],
  }

  for (const [ecoId, approvalsList] of Object.entries(ecoApprovals)) {
    const eco = await prisma.eCO.findUnique({ where: { ecoId } })
    if (!eco) continue

    for (const ap of approvalsList) {
      const exists = await prisma.eCOApproval.findFirst({ where: { ecoId: eco.id, role: ap.role } })
      if (!exists) {
        const date = ap.status === 'Approved' ? new Date() : null
        await prisma.eCOApproval.create({
          data: { ecoId: eco.id, role: ap.role, name: ap.name, status: ap.status, date, comment: `${ap.status} by ${ap.name}` },
        })
      }
    }
  }
  console.log('✓ ECO approvals seeded (2-3 per ECO)')
}

async function seedECOAuditLogs() {
  const auditLogs: Record<string, Array<{ user: string; action: string }>> = {
    '2025-001': [
      { user: 'sarah@example.com', action: 'Created ECO' },
      { user: 'michael@example.com', action: 'Approved ECO' },
      { user: 'john@example.com', action: 'Marked for Implementation' },
    ],
    '2025-002': [
      { user: 'emma@example.com', action: 'Created ECO' },
      { user: 'lisa@example.com', action: 'Approved ECO' },
    ],
    '2025-003': [
      { user: 'sarah@example.com', action: 'Created ECO' },
      { user: 'michael@example.com', action: 'Approved ECO' },
      { user: 'john@example.com', action: 'Marked as Completed' },
    ],
    '2025-004': [
      { user: 'emma@example.com', action: 'Created ECO' },
      { user: 'michael@example.com', action: 'Requested changes' },
    ],
    '2025-005': [
      { user: 'sarah@example.com', action: 'Created ECO - Draft' },
    ],
    '2025-006': [
      { user: 'emma@example.com', action: 'Created ECO' },
      { user: 'michael@example.com', action: 'Under Review' },
    ],
    '2025-007': [
      { user: 'sarah@example.com', action: 'Created ECO' },
      { user: 'lisa@example.com', action: 'Approved ECO' },
      { user: 'john@example.com', action: 'Marked for Implementation' },
    ],
  }

  for (const [ecoId, logsList] of Object.entries(auditLogs)) {
    const eco = await prisma.eCO.findUnique({ where: { ecoId } })
    if (!eco) continue

    for (const log of logsList) {
      await prisma.eCOAuditLog.create({
        data: { ecoId: eco.id, user: log.user, action: log.action },
      })
    }
  }
  console.log('✓ ECO audit logs seeded (2-3 per ECO)')
}

async function seedUserActivities() {
  const activities: Array<{ email: string; action: string; type: string }> = [
    { email: 'admin@example.com', action: 'Viewed dashboard', type: 'View' },
    { email: 'sarah@example.com', action: 'Created product P001', type: 'Create' },
    { email: 'michael@example.com', action: 'Approved ECO 2025-001', type: 'Approve' },
    { email: 'john@example.com', action: 'Viewed BoM BOM001', type: 'View' },
    { email: 'emma@example.com', action: 'Edited product P002', type: 'Edit' },
    { email: 'david@example.com', action: 'Viewed all products', type: 'View' },
    { email: 'lisa@example.com', action: 'Approved ECO 2025-002', type: 'Approve' },
    { email: 'sarah@example.com', action: 'Created ECO 2025-001', type: 'Create' },
    { email: 'emma@example.com', action: 'Created ECO 2025-002', type: 'Create' },
    { email: 'michael@example.com', action: 'Rejected ECO 2025-005', type: 'Approve' },
    { email: 'john@example.com', action: 'Implemented ECO 2025-001', type: 'Edit' },
    { email: 'admin@example.com', action: 'Generated reports', type: 'View' },
    { email: 'lisa@example.com', action: 'Approved ECO 2025-007', type: 'Approve' },
    { email: 'sarah@example.com', action: 'Viewed product versions', type: 'View' },
  ]

  for (const act of activities) {
    const user = await prisma.user.findUnique({ where: { email: act.email } })
    if (!user) continue

    await prisma.userActivity.create({
      data: { userId: user.id, action: act.action, type: act.type },
    })
  }
  console.log('✓ User activities seeded (14 activities)')
}

async function seedNotifications() {
  const notifications: Array<{ email: string; type: string; message: string }> = [
    { email: 'admin@example.com', type: 'System', message: 'Database backup completed successfully' },
    { email: 'michael@example.com', type: 'ECO Approval', message: 'New ECO 2025-004 awaits your approval' },
    { email: 'sarah@example.com', type: 'ECO Update', message: 'ECO 2025-001 approved and moved to implementation' },
    { email: 'john@example.com', type: 'Task', message: 'Implement ECO 2025-007 on Line A' },
    { email: 'emma@example.com', type: 'Product Update', message: 'Product P005 version v1.3 released' },
    { email: 'lisa@example.com', type: 'ECO Approval', message: 'ECO 2025-006 requires your review' },
    { email: 'admin@example.com', type: 'Alert', message: 'User account david@example.com created' },
    { email: 'sarah@example.com', type: 'Status', message: 'Your ECO submissions: 3 approved, 1 pending' },
    { email: 'michael@example.com', type: 'Status', message: 'Approvals pending: 2 ECOs require review' },
    { email: 'john@example.com', type: 'Implementation', message: 'ECO 2025-003 marked as completed' },
  ]

  for (const notif of notifications) {
    const user = await prisma.user.findUnique({ where: { email: notif.email } })
    if (!user) continue

    await prisma.notification.create({
      data: { userId: user.id, type: notif.type, message: notif.message, isUnread: true },
    })
  }
  console.log('✓ Notifications seeded (10 notifications)')
}

async function seedSystemSettings() {
  const settings = [
    { key: 'companyName', value: 'CodingKarma Inc.' },
    { key: 'currency', value: 'USD' },
    { key: 'timeZone', value: 'UTC' },
    { key: 'maxApprovalLevels', value: '3' },
    { key: 'ecoPrefix', value: 'ECO-' },
  ]
  for (const s of settings) {
    const exists = await prisma.systemSetting.findUnique({ where: { key: s.key } })
    if (!exists) {
      await prisma.systemSetting.create({ data: s })
    }
  }
  console.log('✓ System settings seeded')
}

export async function main() {
  console.log('🌱 Starting comprehensive database seeding...\n')

  try {
    await seedRoles()
    await seedUsers()
    await seedProducts()
    await seedProductVersions()
    await seedBoMs()
    await seedBoMComponents()
    await seedBoMOperations()
    await seedECOs()
    await seedECOChanges()
    await seedECOApprovals()
    await seedECOAuditLogs()
    await seedUserActivities()
    await seedNotifications()
    await seedSystemSettings()

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log('  ✓ 4 Roles')
    console.log('  ✓ 7 Users')
    console.log('  ✓ 7 Products with 3-4 versions each (28 versions total)')
    console.log('  ✓ 7 BoMs')
    console.log('  ✓ 38 BoM Components')
    console.log('  ✓ 24 BoM Operations')
    console.log('  ✓ 7 ECOs')
    console.log('  ✓ 14 ECO Changes')
    console.log('  ✓ 16 ECO Approvals')
    console.log('  ✓ 21 ECO Audit Logs')
    console.log('  ✓ 14 User Activities')
    console.log('  ✓ 10 Notifications')
    console.log('  ✓ 5 System Settings')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
