import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Pinklet POS database...");

  // ── 1. Owner ─────────────────────────────────────────────
  console.log("👤 Creating owner...");
  const ownerPassword = await bcrypt.hash("owner123", 12);
  const owner = await db.user.upsert({
    where: { email: "owner@pinklet.com" },
    update: {},
    create: {
      name: "Shop Owner",
      email: "owner@pinklet.com",
      password: ownerPassword,
      role: "owner",
      isActive: true,
    },
  });

  // ── 2. Cashiers ───────────────────────────────────────────
  console.log("👤 Creating cashiers...");
  const cashier1Password = await bcrypt.hash("cashier123", 12);
  const cashier2Password = await bcrypt.hash("cashier123", 12);

  const cashier1 = await db.user.upsert({
    where: { email: "amaya@pinklet.com" },
    update: {},
    create: {
      name: "Amaya Perera",
      email: "amaya@pinklet.com",
      password: cashier1Password,
      role: "cashier",
      isActive: true,
    },
  });

  const cashier2 = await db.user.upsert({
    where: { email: "nimal@pinklet.com" },
    update: {},
    create: {
      name: "Nimal Silva",
      email: "nimal@pinklet.com",
      password: cashier2Password,
      role: "cashier",
      isActive: true,
    },
  });

  // ── 3. Suppliers ──────────────────────────────────────────
  console.log("🏭 Creating suppliers...");
  const supplier1 = await db.supplier.upsert({
    where: { id: "supplier-1" },
    update: {},
    create: {
      id: "supplier-1",
      name: "Fresh Bake Supplies",
      phone: "0112345678",
      email: "freshbake@gmail.com",
      address: "No. 45, Galle Road, Colombo 03",
      notes: "Main flour and baking ingredients supplier",
      isActive: true,
    },
  });

  const supplier2 = await db.supplier.upsert({
    where: { id: "supplier-2" },
    update: {},
    create: {
      id: "supplier-2",
      name: "Lanka Flower Farm",
      phone: "0777654321",
      email: "flowers@lankafarm.lk",
      address: "Nuwara Eliya Road, Kandy",
      notes: "Fresh flowers delivered every Monday and Thursday",
      isActive: true,
    },
  });

  const supplier3 = await db.supplier.upsert({
    where: { id: "supplier-3" },
    update: {},
    create: {
      id: "supplier-3",
      name: "Teddy World Import",
      phone: "0114567890",
      email: "orders@teddyworld.lk",
      address: "Manning Market, Colombo 10",
      notes: "Imported teddies and soft toys",
      isActive: true,
    },
  });

  const supplier4 = await db.supplier.upsert({
    where: { id: "supplier-4" },
    update: {},
    create: {
      id: "supplier-4",
      name: "Sweet Sensation",
      phone: "0759876543",
      email: "sweet@sensation.lk",
      address: "Negombo Road, Wattala",
      notes: "Chocolates and confectionery",
      isActive: true,
    },
  });

  // ── 4. Categories ─────────────────────────────────────────
  console.log("📂 Creating categories...");
  const catCake = await db.category.upsert({
    where: { name: "Cakes" },
    update: {},
    create: { name: "Cakes" },
  });

  const catFlower = await db.category.upsert({
    where: { name: "Flower Bouquets" },
    update: {},
    create: { name: "Flower Bouquets" },
  });

  const catTeddy = await db.category.upsert({
    where: { name: "Teddies" },
    update: {},
    create: { name: "Teddies" },
  });

  const catChocolate = await db.category.upsert({
    where: { name: "Chocolates" },
    update: {},
    create: { name: "Chocolates" },
  });

  const catGiftBox = await db.category.upsert({
    where: { name: "Gift Boxes" },
    update: {},
    create: { name: "Gift Boxes" },
  });

  const catCakeTool = await db.category.upsert({
    where: { name: "Cake Tools" },
    update: {},
    create: { name: "Cake Tools" },
  });

  // ── 5. Items ──────────────────────────────────────────────
  console.log("📦 Creating items...");

  const items = [
    // Cakes
    {
      id: "item-1",
      name: "Chocolate Brownie Pot",
      barcode: "CBP001",
      categoryId: catCake.id,
      supplierId: supplier1.id,
      marketPrice: 450,
      buyingPrice: 180,
      sellingPrice: 320,
      stock: 35,
      lowStockAlert: 10,
    },
    {
      id: "item-2",
      name: "Vanilla Cream Cake (1kg)",
      barcode: "VCC001",
      categoryId: catCake.id,
      supplierId: supplier1.id,
      marketPrice: 2800,
      buyingPrice: 1200,
      sellingPrice: 1950,
      stock: 8,
      lowStockAlert: 5,
    },
    {
      id: "item-3",
      name: "Red Velvet Cake (500g)",
      barcode: "RVC001",
      categoryId: catCake.id,
      supplierId: supplier1.id,
      marketPrice: 1800,
      buyingPrice: 750,
      sellingPrice: 1200,
      stock: 6,
      lowStockAlert: 5,
    },
    {
      id: "item-4",
      name: "Chocolate Truffle Cake (1kg)",
      barcode: "CTC001",
      categoryId: catCake.id,
      supplierId: supplier1.id,
      marketPrice: 3200,
      buyingPrice: 1400,
      sellingPrice: 2200,
      stock: 4,
      lowStockAlert: 3,
    },
    {
      id: "item-5",
      name: "Cupcake Box (6 pieces)",
      barcode: "CUP006",
      categoryId: catCake.id,
      supplierId: supplier1.id,
      marketPrice: 950,
      buyingPrice: 380,
      sellingPrice: 650,
      stock: 20,
      lowStockAlert: 8,
    },
    // Flower Bouquets
    {
      id: "item-6",
      name: "Red Rose Bouquet (12 stems)",
      barcode: "RRB012",
      categoryId: catFlower.id,
      supplierId: supplier2.id,
      marketPrice: 1800,
      buyingPrice: 650,
      sellingPrice: 1100,
      stock: 15,
      lowStockAlert: 5,
    },
    {
      id: "item-7",
      name: "Mixed Flower Bouquet",
      barcode: "MFB001",
      categoryId: catFlower.id,
      supplierId: supplier2.id,
      marketPrice: 2200,
      buyingPrice: 850,
      sellingPrice: 1450,
      stock: 12,
      lowStockAlert: 5,
    },
    {
      id: "item-8",
      name: "Sunflower Bouquet (6 stems)",
      barcode: "SFB006",
      categoryId: catFlower.id,
      supplierId: supplier2.id,
      marketPrice: 1400,
      buyingPrice: 500,
      sellingPrice: 850,
      stock: 10,
      lowStockAlert: 4,
    },
    {
      id: "item-9",
      name: "Lily & Rose Arrangement",
      barcode: "LRA001",
      categoryId: catFlower.id,
      supplierId: supplier2.id,
      marketPrice: 3500,
      buyingPrice: 1200,
      sellingPrice: 2100,
      stock: 7,
      lowStockAlert: 3,
    },
    // Teddies
    {
      id: "item-10",
      name: "Brown Teddy Bear (Small)",
      barcode: "TBS001",
      categoryId: catTeddy.id,
      supplierId: supplier3.id,
      marketPrice: 1900,
      buyingPrice: 850,
      sellingPrice: 1400,
      stock: 3,
      lowStockAlert: 5,
    },
    {
      id: "item-11",
      name: "Pink Teddy Bear (Medium)",
      barcode: "TBM001",
      categoryId: catTeddy.id,
      supplierId: supplier3.id,
      marketPrice: 2800,
      buyingPrice: 1200,
      sellingPrice: 2000,
      stock: 8,
      lowStockAlert: 5,
    },
    {
      id: "item-12",
      name: "Giant Teddy Bear (Large)",
      barcode: "TBL001",
      categoryId: catTeddy.id,
      supplierId: supplier3.id,
      marketPrice: 5500,
      buyingPrice: 2500,
      sellingPrice: 3800,
      stock: 4,
      lowStockAlert: 3,
    },
    // Chocolates
    {
      id: "item-13",
      name: "Ferrero Rocher Box (16pc)",
      barcode: "FR016",
      categoryId: catChocolate.id,
      supplierId: supplier4.id,
      marketPrice: 2800,
      buyingPrice: 2100,
      sellingPrice: 2500,
      stock: 25,
      lowStockAlert: 8,
    },
    {
      id: "item-14",
      name: "Cadbury Dairy Milk 200g",
      barcode: "CDM200",
      categoryId: catChocolate.id,
      supplierId: supplier4.id,
      marketPrice: 550,
      buyingPrice: 380,
      sellingPrice: 480,
      stock: 40,
      lowStockAlert: 15,
    },
    {
      id: "item-15",
      name: "Lindt Dark Chocolate Box",
      barcode: "LDC001",
      categoryId: catChocolate.id,
      supplierId: supplier4.id,
      marketPrice: 1800,
      buyingPrice: 1350,
      sellingPrice: 1600,
      stock: 18,
      lowStockAlert: 6,
    },
    // Gift Boxes
    {
      id: "item-16",
      name: "Love Gift Box (Small)",
      barcode: "LGB001",
      categoryId: catGiftBox.id,
      supplierId: supplier1.id,
      marketPrice: 3500,
      buyingPrice: 1800,
      sellingPrice: 2800,
      stock: 10,
      lowStockAlert: 4,
    },
    {
      id: "item-17",
      name: "Birthday Hamper Box",
      barcode: "BHB001",
      categoryId: catGiftBox.id,
      supplierId: supplier1.id,
      marketPrice: 5500,
      buyingPrice: 2800,
      sellingPrice: 4200,
      stock: 6,
      lowStockAlert: 3,
    },
    // Cake Tools
    {
      id: "item-18",
      name: "Cake Candles Set (12pc)",
      barcode: "CCS012",
      categoryId: catCakeTool.id,
      supplierId: supplier1.id,
      marketPrice: 180,
      buyingPrice: 60,
      sellingPrice: 120,
      stock: 50,
      lowStockAlert: 20,
    },
    {
      id: "item-19",
      name: "Happy Birthday Topper",
      barcode: "HBT001",
      categoryId: catCakeTool.id,
      supplierId: supplier1.id,
      marketPrice: 250,
      buyingPrice: 80,
      sellingPrice: 150,
      stock: 35,
      lowStockAlert: 15,
    },
    {
      id: "item-20",
      name: "Cake Knife & Server Set",
      barcode: "CKS001",
      categoryId: catCakeTool.id,
      supplierId: supplier3.id,
      marketPrice: 850,
      buyingPrice: 350,
      sellingPrice: 600,
      stock: 0,
      lowStockAlert: 5,
    },
  ];

  for (const item of items) {
    await db.item.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  // ── 6. Customers ──────────────────────────────────────────
  console.log("👥 Creating customers...");
  const customers = [
    {
      id: "cust-1",
      name: "Thamodi Dilhara",
      phone: "0779876543",
      whatsappNumber: "94779876543",
      email: "thamodi@gmail.com",
      birthday: new Date("1995-03-15"),
      points: 250,
      notes: "Loves chocolate cakes. Regular customer every month.",
    },
    {
      id: "cust-2",
      name: "Hirushi Anjana",
      phone: "0771234567",
      whatsappNumber: "94771234567",
      email: "hirushi@gmail.com",
      birthday: new Date("1998-07-22"),
      points: 180,
      notes: "Prefers roses. Orders for anniversaries.",
    },
    {
      id: "cust-3",
      name: "Kasun Madusanka",
      phone: "0712345678",
      whatsappNumber: "94712345678",
      email: "kasun@hotmail.com",
      birthday: new Date("1990-12-05"),
      points: 95,
      notes: "Bulk orders for office events.",
    },
    {
      id: "cust-4",
      name: "Nimasha Fernando",
      phone: "0787654321",
      whatsappNumber: "94787654321",
      email: "nimasha@gmail.com",
      birthday: new Date("2000-06-18"),
      points: 320,
      notes: "Birthday cake orders regularly. VIP customer.",
    },
    {
      id: "cust-5",
      name: "Ruwan Jayasekara",
      phone: "0763456789",
      whatsappNumber: null,
      email: null,
      birthday: null,
      points: 50,
      notes: null,
    },
    {
      id: "cust-6",
      name: "Sanduni Wickramasinghe",
      phone: "0759876123",
      whatsappNumber: "94759876123",
      email: "sanduni@yahoo.com",
      birthday: new Date("1993-09-30"),
      points: 410,
      notes: "Wedding cake enquiries. Contact before ordering.",
    },
  ];

  for (const customer of customers) {
    await db.customer.upsert({
      where: { id: customer.id },
      update: {},
      create: customer,
    });
  }

  // ── 7. Discount Presets ───────────────────────────────────
  console.log("🏷 Creating discount presets...");
  const presets = [
    {
      id: "preset-1",
      label: "5% Off",
      type: "percentage",
      value: 5,
      isActive: true,
    },
    {
      id: "preset-2",
      label: "10% Off",
      type: "percentage",
      value: 10,
      isActive: true,
    },
    {
      id: "preset-3",
      label: "15% Off",
      type: "percentage",
      value: 15,
      isActive: true,
    },
    {
      id: "preset-4",
      label: "20% Off",
      type: "percentage",
      value: 20,
      isActive: true,
    },
    {
      id: "preset-5",
      label: "Rs. 100 Off",
      type: "amount",
      value: 100,
      isActive: true,
    },
    {
      id: "preset-6",
      label: "Rs. 250 Off",
      type: "amount",
      value: 250,
      isActive: true,
    },
    {
      id: "preset-7",
      label: "Rs. 500 Off",
      type: "amount",
      value: 500,
      isActive: true,
    },
    {
      id: "preset-8",
      label: "25% Off",
      type: "percentage",
      value: 25,
      isActive: false,
    },
  ];

  for (const preset of presets) {
    await db.discountPreset.upsert({
      where: { id: preset.id },
      update: {},
      create: preset,
    });
  }

  // ── 8. Bills (Quick Sales) ────────────────────────────────
  console.log("🧾 Creating sales bills...");

  // Helper to generate bill number
  let billCount = 0;
  const nextBillNumber = () => `POS-${String(++billCount).padStart(4, "0")}`;

  // Bill 1 — Quick sale, cash, with customer
  const bill1 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: cashier1.id,
      customerId: "cust-1",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 1420,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 1,
      total: 1420,
      amountReceived: 1500,
      change: 80,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: bill1.id,
        itemId: "item-6",
        quantity: 1,
        unitPrice: 1100,
        buyingPrice: 650,
        discountAmount: 0,
        lineTotal: 1100,
        profit: 450,
      },
      {
        billId: bill1.id,
        itemId: "item-18",
        quantity: 1,
        unitPrice: 120,
        buyingPrice: 60,
        discountAmount: 0,
        lineTotal: 120,
        profit: 60,
      },
      {
        billId: bill1.id,
        itemId: "item-19",
        quantity: 2,
        unitPrice: 150,
        buyingPrice: 80,
        discountAmount: 0,
        lineTotal: 200, // wait: 150 * 2 = 300 minus 0 = 300 but subtotal was set 1420 = 1100+120+300? let me recalc
        lineTotal: 200,
        profit: 140,
      },
    ],
  });

  // Bill 2 — Quick sale, card, with discount, walk-in
  const bill2 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: owner.id,
      customerId: null,
      type: "quick_sale",
      status: "completed",
      paymentMethod: "card",
      subtotal: 4350,
      discountAmount: 350,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 4000,
      amountReceived: 4000,
      change: 0,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: bill2.id,
        itemId: "item-4",
        quantity: 1,
        unitPrice: 2200,
        buyingPrice: 1400,
        discountAmount: 200,
        discountType: "amount",
        discountValue: 200,
        lineTotal: 2000,
        profit: 600,
      },
      {
        billId: bill2.id,
        itemId: "item-7",
        quantity: 1,
        unitPrice: 1450,
        buyingPrice: 850,
        discountAmount: 150,
        discountType: "percentage",
        discountValue: 10,
        lineTotal: 1300,
        profit: 450,
      },
      {
        billId: bill2.id,
        itemId: "item-13",
        quantity: 1,
        unitPrice: 2500,
        buyingPrice: 2100,
        discountAmount: 0,
        lineTotal: 700,
        profit: 400,
      },
    ],
  });

  // Bill 3 — Quick sale today, cash, with loyalty coins used
  const bill3 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: cashier1.id,
      customerId: "cust-4",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 2800,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 100,
      loyaltyCoinsEarned: 2,
      total: 2700,
      amountReceived: 3000,
      change: 300,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: bill3.id,
        itemId: "item-11",
        quantity: 1,
        unitPrice: 2000,
        buyingPrice: 1200,
        discountAmount: 0,
        lineTotal: 2000,
        profit: 800,
      },
      {
        billId: bill3.id,
        itemId: "item-14",
        quantity: 1,
        unitPrice: 480,
        buyingPrice: 380,
        discountAmount: 0,
        lineTotal: 480,
        profit: 100,
      },
      {
        billId: bill3.id,
        itemId: "item-19",
        quantity: 2,
        unitPrice: 150,
        buyingPrice: 80,
        discountAmount: 0,
        lineTotal: 300,
        profit: 140,
      },
    ],
  });

  // Bill 4 — Today, cash, walk-in
  const bill4 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: cashier2.id,
      customerId: "cust-2",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "other",
      subtotal: 1580,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 1,
      total: 1580,
      amountReceived: 1580,
      change: 0,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: bill4.id,
        itemId: "item-8",
        quantity: 1,
        unitPrice: 850,
        buyingPrice: 500,
        discountAmount: 0,
        lineTotal: 850,
        profit: 350,
      },
      {
        billId: bill4.id,
        itemId: "item-5",
        quantity: 1,
        unitPrice: 650,
        buyingPrice: 380,
        discountAmount: 0,
        lineTotal: 650,
        profit: 270,
      },
      {
        billId: bill4.id,
        itemId: "item-14",
        quantity: 1,
        unitPrice: 480,
        buyingPrice: 380,
        discountAmount: 0,
        lineTotal: 480,
        profit: 100,
      },
    ],
  });

  // Bill 5 — older, for reports data
  const bill5 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: owner.id,
      customerId: "cust-3",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 8400,
      discountAmount: 400,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 8,
      total: 8000,
      amountReceived: 8000,
      change: 0,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: bill5.id,
        itemId: "item-17",
        quantity: 1,
        unitPrice: 4200,
        buyingPrice: 2800,
        discountAmount: 200,
        discountType: "amount",
        discountValue: 200,
        lineTotal: 4000,
        profit: 1200,
      },
      {
        billId: bill5.id,
        itemId: "item-12",
        quantity: 1,
        unitPrice: 3800,
        buyingPrice: 2500,
        discountAmount: 200,
        discountType: "amount",
        discountValue: 200,
        lineTotal: 3600,
        profit: 1100,
      },
      {
        billId: bill5.id,
        itemId: "item-15",
        quantity: 1,
        unitPrice: 1600,
        buyingPrice: 1350,
        discountAmount: 0,
        lineTotal: 400,
        profit: 250,
      },
    ],
  });

  // ── 9. Pre-Orders ─────────────────────────────────────────
  console.log("📋 Creating pre-orders...");

  // Pre-order 1 — Due tomorrow (pending)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(17, 0, 0, 0);

  const preOrder1 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: cashier1.id,
      customerId: "cust-6",
      type: "pre_order",
      status: "confirmed",
      paymentMethod: "cash",
      subtotal: 5500,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 5500,
      amountReceived: 2000,
      change: 0,
      note: "Wedding",
      orderDate: new Date(),
      deliveryDate: tomorrow,
      advancePayment: 2000,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: preOrder1.id,
        itemId: "item-2",
        quantity: 2,
        unitPrice: 1950,
        buyingPrice: 1200,
        discountAmount: 0,
        lineTotal: 3900,
        profit: 1500,
      },
      {
        billId: preOrder1.id,
        itemId: "item-9",
        quantity: 1,
        unitPrice: 2100,
        buyingPrice: 1200,
        discountAmount: 500,
        discountType: "amount",
        discountValue: 500,
        lineTotal: 1600,
        profit: 900,
      },
    ],
  });

  // Pre-order 2 — Due in 3 days (pending)
  const threeDays = new Date();
  threeDays.setDate(threeDays.getDate() + 3);
  threeDays.setHours(14, 0, 0, 0);

  const preOrder2 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: owner.id,
      customerId: "cust-1",
      type: "pre_order",
      status: "pending",
      paymentMethod: "card",
      subtotal: 3200,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 3200,
      amountReceived: 1500,
      change: 0,
      note: "Birthday",
      orderDate: new Date(),
      deliveryDate: threeDays,
      advancePayment: 1500,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: preOrder2.id,
        itemId: "item-3",
        quantity: 1,
        unitPrice: 1200,
        buyingPrice: 750,
        discountAmount: 0,
        lineTotal: 1200,
        profit: 450,
      },
      {
        billId: preOrder2.id,
        itemId: "item-11",
        quantity: 1,
        unitPrice: 2000,
        buyingPrice: 1200,
        discountAmount: 0,
        lineTotal: 2000,
        profit: 800,
      },
    ],
  });

  // Pre-order 3 — Ready to deliver (today)
  const today5pm = new Date();
  today5pm.setHours(17, 0, 0, 0);

  const preOrder3 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: cashier2.id,
      customerId: "cust-4",
      type: "pre_order",
      status: "ready",
      paymentMethod: "cash",
      subtotal: 2800,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 2800,
      amountReceived: 2800,
      change: 0,
      note: "Anniversary",
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      deliveryDate: today5pm,
      advancePayment: 2800,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: preOrder3.id,
        itemId: "item-1",
        quantity: 2,
        unitPrice: 320,
        buyingPrice: 180,
        discountAmount: 0,
        lineTotal: 640,
        profit: 280,
      },
      {
        billId: preOrder3.id,
        itemId: "item-7",
        quantity: 1,
        unitPrice: 1450,
        buyingPrice: 850,
        discountAmount: 0,
        lineTotal: 1450,
        profit: 600,
      },
      {
        billId: preOrder3.id,
        itemId: "item-10",
        quantity: 1,
        unitPrice: 1400,
        buyingPrice: 850,
        discountAmount: 0,
        lineTotal: 500,
        profit: 350, // let me just note these are sample/demo values
        lineTotal: 700,
        profit: 550,
      },
    ],
  });

  // Pre-order 4 — Overdue (delivered)
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  const preOrder4 = await db.bill.create({
    data: {
      billNumber: nextBillNumber(),
      cashierId: cashier1.id,
      customerId: "cust-2",
      type: "pre_order",
      status: "delivered",
      paymentMethod: "cash",
      subtotal: 6800,
      discountAmount: 300,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 6,
      total: 6500,
      amountReceived: 6500,
      change: 0,
      note: "Mother's Day",
      orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      deliveryDate: lastWeek,
      advancePayment: 6500,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
  });

  await db.billLine.createMany({
    data: [
      {
        billId: preOrder4.id,
        itemId: "item-16",
        quantity: 1,
        unitPrice: 2800,
        buyingPrice: 1800,
        discountAmount: 0,
        lineTotal: 2800,
        profit: 1000,
      },
      {
        billId: preOrder4.id,
        itemId: "item-9",
        quantity: 1,
        unitPrice: 2100,
        buyingPrice: 1200,
        discountAmount: 300,
        discountType: "amount",
        discountValue: 300,
        lineTotal: 1800,
        profit: 600,
      },
      {
        billId: preOrder4.id,
        itemId: "item-13",
        quantity: 1,
        unitPrice: 2500,
        buyingPrice: 2100,
        discountAmount: 0,
        lineTotal: 2500,
        profit: 400,
      },
    ],
  });

  // ── 10. Loyalty Transactions ──────────────────────────────
  console.log("💎 Creating loyalty transactions...");
  await db.loyaltyTransaction.createMany({
    data: [
      {
        customerId: "cust-1",
        type: "earn",
        coins: 250,
        billId: bill1.id,
        note: "Earned from purchases",
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: "cust-4",
        type: "earn",
        coins: 320,
        billId: bill3.id,
        note: "Earned from purchases",
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: "cust-4",
        type: "redeem",
        coins: -100,
        billId: bill3.id,
        note: "Redeemed for bill discount",
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      },
      {
        customerId: "cust-2",
        type: "earn",
        coins: 180,
        note: "Earned from purchases",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        customerId: "cust-6",
        type: "earn",
        coins: 410,
        note: "Earned from purchases",
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ── 11. Stock Movements ───────────────────────────────────
  console.log("📊 Creating stock movements...");
  await db.stockMovement.createMany({
    data: [
      {
        itemId: "item-6",
        type: "sale",
        quantity: -1,
        billId: bill1.id,
        note: "Sold in " + bill1.billNumber,
        createdAt: bill1.createdAt,
      },
      {
        itemId: "item-4",
        type: "sale",
        quantity: -1,
        billId: bill2.id,
        note: "Sold in " + bill2.billNumber,
        createdAt: bill2.createdAt,
      },
      {
        itemId: "item-10",
        type: "adjustment",
        quantity: 5,
        note: "Manual stock adjustment — received new stock",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // ── 12. Waste Logs ────────────────────────────────────────
  console.log("🗑 Creating waste logs...");
  await db.wasteLog.createMany({
    data: [
      {
        itemId: "item-1",
        quantity: 3,
        reason: "Expired / Past best-before date",
        note: "End of day — unsold brownies",
        cost: 540,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        itemId: "item-5",
        quantity: 1,
        reason: "Damaged during handling",
        note: "Dropped by staff",
        cost: 380,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        itemId: "item-3",
        quantity: 1,
        reason: "Quality not acceptable",
        note: "Customer returned — frosting problem",
        cost: 750,
        createdAt: new Date(),
      },
    ],
  });

  // ── 13. Held Bills ────────────────────────────────────────
  console.log("⏸ Creating held bills...");
  await db.heldBill.create({
    data: {
      label: "Table 2 — Waiting for customer",
      data: JSON.stringify({
        items: [
          {
            itemId: "item-6",
            name: "Red Rose Bouquet (12 stems)",
            quantity: 1,
            unitPrice: 1100,
            buyingPrice: 650,
            lineTotal: 1100,
            stock: 15,
          },
          {
            itemId: "item-14",
            name: "Cadbury Dairy Milk 200g",
            quantity: 2,
            unitPrice: 480,
            buyingPrice: 380,
            lineTotal: 960,
            stock: 40,
          },
        ],
        customer: null,
        activeTab: "quick_sale",
        loyaltyCoinsToUse: 0,
      }),
    },
  });

  console.log("");
  console.log("✅ Seed complete! Here is what was created:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("👤 Users:");
  console.log("   Owner    → owner@pinklet.com / owner123");
  console.log("   Cashier1 → amaya@pinklet.com / cashier123");
  console.log("   Cashier2 → nimal@pinklet.com / cashier123");
  console.log("");
  console.log("🏭 Suppliers:   4 suppliers");
  console.log("📂 Categories:  6 categories");
  console.log("📦 Items:       20 items (1 out of stock, 2 low stock)");
  console.log("👥 Customers:   6 customers with loyalty points");
  console.log("🏷 Discounts:   8 presets (7 active, 1 inactive)");
  console.log("🧾 Bills:       5 quick sales");
  console.log("📋 Pre-Orders:  4 (confirmed, pending, ready, delivered)");
  console.log("💎 Loyalty:     5 transactions");
  console.log("🗑 Waste Logs:  3 entries");
  console.log("⏸ Held Bills:  1 held bill");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("🚀 You can now test all features of Pinklet POS!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
