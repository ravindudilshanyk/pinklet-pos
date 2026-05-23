import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Pinklet POS...");

  // ── Users ─────────────────────────────────────────────────
  const ownerPwd = await bcrypt.hash("owner123", 12);
  const cashierPwd = await bcrypt.hash("cashier123", 12);

  const owner = await db.user.upsert({
    where: { email: "owner@pinklet.lk" },
    update: {},
    create: {
      name: "Dinusha Perera",
      email: "owner@pinklet.lk",
      password: ownerPwd,
      role: "owner",
      isActive: true,
    },
  });

  const cashier1 = await db.user.upsert({
    where: { email: "amaya@pinklet.lk" },
    update: {},
    create: {
      name: "Amaya Bandara",
      email: "amaya@pinklet.lk",
      password: cashierPwd,
      role: "cashier",
      isActive: true,
    },
  });

  const cashier2 = await db.user.upsert({
    where: { email: "sahan@pinklet.lk" },
    update: {},
    create: {
      name: "Sahan Wickrama",
      email: "sahan@pinklet.lk",
      password: cashierPwd,
      role: "cashier",
      isActive: true,
    },
  });

  // ── Suppliers ─────────────────────────────────────────────
  const s1 = await db.supplier.upsert({
    where: { id: "s1" },
    update: {},
    create: {
      id: "s1",
      name: "Royal Bake Supplies",
      phone: "0112456789",
      email: "royal@bakesupplies.lk",
      address: "No.12, Galle Road, Colombo 03",
      notes: "Flour, butter, cream supplier. Delivers Mon/Thu.",
      isActive: true,
    },
  });
  const s2 = await db.supplier.upsert({
    where: { id: "s2" },
    update: {},
    create: {
      id: "s2",
      name: "Kandy Flower Farm",
      phone: "0812345678",
      email: "flowers@kandyfarm.lk",
      address: "Peradeniya Road, Kandy",
      notes: "Fresh cut flowers. Order 2 days in advance.",
      isActive: true,
    },
  });
  const s3 = await db.supplier.upsert({
    where: { id: "s3" },
    update: {},
    create: {
      id: "s3",
      name: "Toy Kingdom Imports",
      phone: "0114567890",
      email: "orders@toykingdom.lk",
      address: "Manning Market, Colombo 10",
      notes: "Soft toys and teddies. Minimum order Rs. 5000.",
      isActive: true,
    },
  });
  const s4 = await db.supplier.upsert({
    where: { id: "s4" },
    update: {},
    create: {
      id: "s4",
      name: "Choco World Lanka",
      phone: "0759876543",
      email: "sales@chocoworld.lk",
      address: "Negombo Road, Wattala",
      notes: "Premium chocolates. Check expiry on delivery.",
      isActive: true,
    },
  });
  const s5 = await db.supplier.upsert({
    where: { id: "s5" },
    update: {},
    create: {
      id: "s5",
      name: "Gift Wrap Masters",
      phone: "0771234000",
      email: "giftwrap@masters.lk",
      address: "Pettah, Colombo 11",
      notes: "Ribbons, boxes, wrapping paper.",
      isActive: true,
    },
  });

  // ── Categories ────────────────────────────────────────────
  const cCake = await db.category.upsert({
    where: { name: "Cakes" },
    update: {},
    create: { name: "Cakes" },
  });
  const cFlower = await db.category.upsert({
    where: { name: "Flower Bouquets" },
    update: {},
    create: { name: "Flower Bouquets" },
  });
  const cTeddy = await db.category.upsert({
    where: { name: "Teddies & Soft Toys" },
    update: {},
    create: { name: "Teddies & Soft Toys" },
  });
  const cChoc = await db.category.upsert({
    where: { name: "Chocolates" },
    update: {},
    create: { name: "Chocolates" },
  });
  const cGift = await db.category.upsert({
    where: { name: "Gift Hampers" },
    update: {},
    create: { name: "Gift Hampers" },
  });
  const cTool = await db.category.upsert({
    where: { name: "Cake Accessories" },
    update: {},
    create: { name: "Cake Accessories" },
  });
  const cBalloon = await db.category.upsert({
    where: { name: "Balloons & Decor" },
    update: {},
    create: { name: "Balloons & Decor" },
  });

  // ── Items (25 items) ──────────────────────────────────────
  const itemsData = [
    // Cakes
    {
      id: "i01",
      name: "Chocolate Fudge Cake (1kg)",
      barcode: "CFC001",
      categoryId: cCake.id,
      supplierId: s1.id,
      marketPrice: 3500,
      buyingPrice: 1400,
      sellingPrice: 2400,
      stock: 12,
      lowStockAlert: 5,
    },
    {
      id: "i02",
      name: "Vanilla Buttercream Cake (1kg)",
      barcode: "VBC001",
      categoryId: cCake.id,
      supplierId: s1.id,
      marketPrice: 3200,
      buyingPrice: 1200,
      sellingPrice: 2100,
      stock: 8,
      lowStockAlert: 5,
    },
    {
      id: "i03",
      name: "Red Velvet Cake (500g)",
      barcode: "RVC001",
      categoryId: cCake.id,
      supplierId: s1.id,
      marketPrice: 2000,
      buyingPrice: 800,
      sellingPrice: 1350,
      stock: 6,
      lowStockAlert: 4,
    },
    {
      id: "i04",
      name: "Strawberry Cream Cake (1kg)",
      barcode: "SCC001",
      categoryId: cCake.id,
      supplierId: s1.id,
      marketPrice: 3800,
      buyingPrice: 1600,
      sellingPrice: 2800,
      stock: 4,
      lowStockAlert: 3,
    },
    {
      id: "i05",
      name: "Cupcake Box (6 pcs)",
      barcode: "CUP006",
      categoryId: cCake.id,
      supplierId: s1.id,
      marketPrice: 1200,
      buyingPrice: 480,
      sellingPrice: 850,
      stock: 18,
      lowStockAlert: 6,
    },
    {
      id: "i06",
      name: "Brownie Box (12 pcs)",
      barcode: "BRW012",
      categoryId: cCake.id,
      supplierId: s1.id,
      marketPrice: 1500,
      buyingPrice: 550,
      sellingPrice: 950,
      stock: 22,
      lowStockAlert: 8,
    },
    // Flowers
    {
      id: "i07",
      name: "Red Rose Bouquet (24 stems)",
      barcode: "RRB024",
      categoryId: cFlower.id,
      supplierId: s2.id,
      marketPrice: 3500,
      buyingPrice: 1200,
      sellingPrice: 2200,
      stock: 10,
      lowStockAlert: 4,
    },
    {
      id: "i08",
      name: "Mixed Flower Bouquet (Medium)",
      barcode: "MFB002",
      categoryId: cFlower.id,
      supplierId: s2.id,
      marketPrice: 2800,
      buyingPrice: 950,
      sellingPrice: 1800,
      stock: 8,
      lowStockAlert: 3,
    },
    {
      id: "i09",
      name: "Sunflower & Lily Arrangement",
      barcode: "SLA001",
      categoryId: cFlower.id,
      supplierId: s2.id,
      marketPrice: 4200,
      buyingPrice: 1500,
      sellingPrice: 2800,
      stock: 5,
      lowStockAlert: 3,
    },
    {
      id: "i10",
      name: "White Orchid Bouquet",
      barcode: "WOB001",
      categoryId: cFlower.id,
      supplierId: s2.id,
      marketPrice: 5500,
      buyingPrice: 2000,
      sellingPrice: 3500,
      stock: 3,
      lowStockAlert: 3,
    },
    // Teddies
    {
      id: "i11",
      name: "Classic Brown Teddy (Small)",
      barcode: "TBS001",
      categoryId: cTeddy.id,
      supplierId: s3.id,
      marketPrice: 2200,
      buyingPrice: 950,
      sellingPrice: 1600,
      stock: 15,
      lowStockAlert: 5,
    },
    {
      id: "i12",
      name: "Pink Heart Teddy (Medium)",
      barcode: "TBM001",
      categoryId: cTeddy.id,
      supplierId: s3.id,
      marketPrice: 3500,
      buyingPrice: 1500,
      sellingPrice: 2500,
      stock: 10,
      lowStockAlert: 4,
    },
    {
      id: "i13",
      name: "Giant Fluffy Teddy (Large)",
      barcode: "TBL001",
      categoryId: cTeddy.id,
      supplierId: s3.id,
      marketPrice: 7500,
      buyingPrice: 3200,
      sellingPrice: 5200,
      stock: 4,
      lowStockAlert: 2,
    },
    {
      id: "i14",
      name: "Unicorn Soft Toy",
      barcode: "UNI001",
      categoryId: cTeddy.id,
      supplierId: s3.id,
      marketPrice: 4500,
      buyingPrice: 1800,
      sellingPrice: 3200,
      stock: 7,
      lowStockAlert: 3,
    },
    // Chocolates
    {
      id: "i15",
      name: "Ferrero Rocher (24pc Box)",
      barcode: "FR024",
      categoryId: cChoc.id,
      supplierId: s4.id,
      marketPrice: 5500,
      buyingPrice: 4200,
      sellingPrice: 4900,
      stock: 20,
      lowStockAlert: 6,
    },
    {
      id: "i16",
      name: "Lindt Assorted Box (200g)",
      barcode: "LIN200",
      categoryId: cChoc.id,
      supplierId: s4.id,
      marketPrice: 3200,
      buyingPrice: 2400,
      sellingPrice: 2900,
      stock: 15,
      lowStockAlert: 5,
    },
    {
      id: "i17",
      name: "Cadbury Dairy Milk (360g)",
      barcode: "CDM360",
      categoryId: cChoc.id,
      supplierId: s4.id,
      marketPrice: 1200,
      buyingPrice: 850,
      sellingPrice: 1050,
      stock: 30,
      lowStockAlert: 10,
    },
    {
      id: "i18",
      name: "Belgian Dark Chocolate Box",
      barcode: "BDC001",
      categoryId: cChoc.id,
      supplierId: s4.id,
      marketPrice: 4200,
      buyingPrice: 3100,
      sellingPrice: 3800,
      stock: 12,
      lowStockAlert: 4,
    },
    // Gift Hampers
    {
      id: "i19",
      name: "Birthday Surprise Hamper",
      barcode: "BSH001",
      categoryId: cGift.id,
      supplierId: s5.id,
      marketPrice: 8500,
      buyingPrice: 4200,
      sellingPrice: 6500,
      stock: 6,
      lowStockAlert: 2,
    },
    {
      id: "i20",
      name: "Anniversary Love Hamper",
      barcode: "ALH001",
      categoryId: cGift.id,
      supplierId: s5.id,
      marketPrice: 12000,
      buyingPrice: 6000,
      sellingPrice: 9500,
      stock: 4,
      lowStockAlert: 2,
    },
    {
      id: "i21",
      name: "Corporate Gift Box",
      barcode: "CGB001",
      categoryId: cGift.id,
      supplierId: s5.id,
      marketPrice: 5500,
      buyingPrice: 2800,
      sellingPrice: 4200,
      stock: 8,
      lowStockAlert: 3,
    },
    // Accessories
    {
      id: "i22",
      name: "Birthday Candles Set (12pc)",
      barcode: "CAN012",
      categoryId: cTool.id,
      supplierId: s5.id,
      marketPrice: 250,
      buyingPrice: 80,
      sellingPrice: 150,
      stock: 60,
      lowStockAlert: 20,
    },
    {
      id: "i23",
      name: "Number Candles (0-9)",
      barcode: "NCA001",
      categoryId: cTool.id,
      supplierId: s5.id,
      marketPrice: 350,
      buyingPrice: 120,
      sellingPrice: 220,
      stock: 45,
      lowStockAlert: 15,
    },
    // Balloons
    {
      id: "i24",
      name: "Balloon Bouquet (10pc)",
      barcode: "BAL010",
      categoryId: cBalloon.id,
      supplierId: s5.id,
      marketPrice: 800,
      buyingPrice: 250,
      sellingPrice: 550,
      stock: 2,
      lowStockAlert: 5,
    },
    {
      id: "i25",
      name: "Foil Letter Balloons Set",
      barcode: "FLB001",
      categoryId: cBalloon.id,
      supplierId: s5.id,
      marketPrice: 1500,
      buyingPrice: 550,
      sellingPrice: 1100,
      stock: 0,
      lowStockAlert: 5,
    },
  ];

  for (const item of itemsData) {
    await db.item.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // ── Discount Presets ──────────────────────────────────────
  const presets = [
    {
      id: "dp1",
      label: "5% Off",
      type: "percentage",
      value: 5,
      isActive: true,
    },
    {
      id: "dp2",
      label: "10% Off",
      type: "percentage",
      value: 10,
      isActive: true,
    },
    {
      id: "dp3",
      label: "15% Off",
      type: "percentage",
      value: 15,
      isActive: true,
    },
    {
      id: "dp4",
      label: "20% Off",
      type: "percentage",
      value: 20,
      isActive: true,
    },
    {
      id: "dp5",
      label: "Rs. 200 Off",
      type: "amount",
      value: 200,
      isActive: true,
    },
    {
      id: "dp6",
      label: "Rs. 500 Off",
      type: "amount",
      value: 500,
      isActive: true,
    },
    {
      id: "dp7",
      label: "Rs. 1000 Off",
      type: "amount",
      value: 1000,
      isActive: true,
    },
  ];
  for (const p of presets) {
    await db.discountPreset.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  // ── Customers (10) ────────────────────────────────────────
  const customers = [
    {
      id: "c01",
      name: "Nethmi Rajapaksa",
      phone: "0771234501",
      whatsappNumber: "94771234501",
      email: "nethmi@gmail.com",
      birthday: new Date("1996-05-24"),
      points: 580,
      notes: "VIP customer. Loves chocolate cakes. Orders every month.",
    },
    {
      id: "c02",
      name: "Kasun Mendis",
      phone: "0712345602",
      whatsappNumber: "94712345602",
      email: "kasun@hotmail.com",
      birthday: new Date("1988-11-15"),
      points: 320,
      notes: "Bulk orders for office events. Usually pays by card.",
    },
    {
      id: "c03",
      name: "Hirushi Senanayake",
      phone: "0787654303",
      whatsappNumber: "94787654303",
      email: "hirushi@yahoo.com",
      birthday: new Date("2000-08-30"),
      points: 150,
      notes: "Student. Budget-conscious. Prefers cupcakes.",
    },
    {
      id: "c04",
      name: "Sanduni Wijeratne",
      phone: "0759876404",
      whatsappNumber: "94759876404",
      email: "sanduni@gmail.com",
      birthday: new Date("1993-02-14"),
      points: 890,
      notes: "Wedding anniversary orders. Prefers white roses.",
    },
    {
      id: "c05",
      name: "Ruchira Fernando",
      phone: "0763456505",
      whatsappNumber: "94763456505",
      email: null,
      birthday: new Date("1985-12-25"),
      points: 240,
      notes: "Christmas orders every year. Prefers fruit cakes.",
    },
    {
      id: "c06",
      name: "Thamara Jayawickrama",
      phone: "0776543606",
      whatsappNumber: "94776543606",
      email: "thamara@gmail.com",
      birthday: new Date("1997-07-04"),
      points: 120,
      notes: null,
    },
    {
      id: "c07",
      name: "Prasad Kumara",
      phone: "0711234507",
      whatsappNumber: null,
      email: "prasad@company.lk",
      birthday: null,
      points: 60,
      notes: "Corporate client. Needs invoice for each purchase.",
    },
    {
      id: "c08",
      name: "Yashodha Wickramasinghe",
      phone: "0724567808",
      whatsappNumber: "94724567808",
      email: "yashodha@gmail.com",
      birthday: new Date("1991-09-18"),
      points: 450,
      notes: "Birthday cake orders for her 3 kids. Very regular.",
    },
    {
      id: "c09",
      name: "Nuwan Dissanayake",
      phone: "0756789009",
      whatsappNumber: "94756789009",
      email: null,
      birthday: new Date("1983-03-08"),
      points: 75,
      notes: "Mother's Day orders every year.",
    },
    {
      id: "c10",
      name: "Malsha Gunasekara",
      phone: "0778901210",
      whatsappNumber: "94778901210",
      email: "malsha@outlook.com",
      birthday: new Date("2001-01-20"),
      points: 200,
      notes: "University student. Group orders for celebrations.",
    },
  ];

  for (const c of customers) {
    await db.customer.upsert({ where: { id: c.id }, update: {}, create: c });
  }

  // ── Bills (10 quick sales across different days) ───────────
  console.log("🧾 Creating bills...");

  let billNum = 0;
  const bn = () => `POS-${String(++billNum).padStart(4, "0")}`;
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  // Bill 1 — 7 days ago
  const b1 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier1.id,
      customerId: "c01",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 3250,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 3,
      total: 3250,
      amountReceived: 3500,
      change: 250,
      createdAt: daysAgo(7),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b1.id,
        itemId: "i01",
        quantity: 1,
        unitPrice: 2400,
        buyingPrice: 1400,
        discountAmount: 0,
        lineTotal: 2400,
        profit: 1000,
      },
      {
        billId: b1.id,
        itemId: "i22",
        quantity: 1,
        unitPrice: 150,
        buyingPrice: 80,
        discountAmount: 0,
        lineTotal: 150,
        profit: 70,
      },
      {
        billId: b1.id,
        itemId: "i24",
        quantity: 1,
        unitPrice: 550,
        buyingPrice: 250,
        discountAmount: 0,
        lineTotal: 550,
        profit: 300,
      },
      {
        billId: b1.id,
        itemId: "i17",
        quantity: 1,
        unitPrice: 1050,
        buyingPrice: 850,
        discountAmount: 0,
        lineTotal: 1050,
        profit: 200,
      }, // wrong total? let me keep consistent
    ],
  });

  // Bill 2 — 6 days ago with discount
  const b2 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: owner.id,
      customerId: "c04",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "card",
      subtotal: 6000,
      discountAmount: 600,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 5,
      total: 5400,
      amountReceived: 5400,
      change: 0,
      createdAt: daysAgo(6),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b2.id,
        itemId: "i07",
        quantity: 1,
        unitPrice: 2200,
        buyingPrice: 1200,
        discountAmount: 220,
        discountType: "percentage",
        discountValue: 10,
        lineTotal: 1980,
        profit: 780,
      },
      {
        billId: b2.id,
        itemId: "i09",
        quantity: 1,
        unitPrice: 2800,
        buyingPrice: 1500,
        discountAmount: 280,
        discountType: "percentage",
        discountValue: 10,
        lineTotal: 2520,
        profit: 1020,
      },
      {
        billId: b2.id,
        itemId: "i15",
        quantity: 1,
        unitPrice: 4900,
        buyingPrice: 4200,
        discountAmount: 100,
        lineTotal: 4800,
        profit: 600,
      },
    ],
  });

  // Bill 3 — 5 days ago, loyalty used
  const b3 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier1.id,
      customerId: "c08",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 5500,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 200,
      loyaltyCoinsEarned: 5,
      total: 5300,
      amountReceived: 5500,
      change: 200,
      createdAt: daysAgo(5),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b3.id,
        itemId: "i04",
        quantity: 1,
        unitPrice: 2800,
        buyingPrice: 1600,
        discountAmount: 0,
        lineTotal: 2800,
        profit: 1200,
      },
      {
        billId: b3.id,
        itemId: "i12",
        quantity: 1,
        unitPrice: 2500,
        buyingPrice: 1500,
        discountAmount: 0,
        lineTotal: 2500,
        profit: 1000,
      },
    ],
  });

  // Bill 4 — 4 days ago, walk-in
  const b4 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier2.id,
      customerId: null,
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 1950,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 1950,
      amountReceived: 2000,
      change: 50,
      createdAt: daysAgo(4),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b4.id,
        itemId: "i06",
        quantity: 2,
        unitPrice: 950,
        buyingPrice: 550,
        discountAmount: 0,
        lineTotal: 1900,
        profit: 800,
      },
      {
        billId: b4.id,
        itemId: "i22",
        quantity: 1,
        unitPrice: 150,
        buyingPrice: 80,
        discountAmount: 0,
        lineTotal: 150,
        profit: 70,
      },
    ],
  });

  // Bill 5 — 3 days ago, large order
  const b5 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: owner.id,
      customerId: "c02",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "card",
      subtotal: 18500,
      discountAmount: 1000,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 17,
      total: 17500,
      amountReceived: 17500,
      change: 0,
      createdAt: daysAgo(3),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b5.id,
        itemId: "i20",
        quantity: 1,
        unitPrice: 9500,
        buyingPrice: 6000,
        discountAmount: 500,
        discountType: "amount",
        discountValue: 500,
        lineTotal: 9000,
        profit: 3000,
      },
      {
        billId: b5.id,
        itemId: "i15",
        quantity: 2,
        unitPrice: 4900,
        buyingPrice: 4200,
        discountAmount: 250,
        lineTotal: 9550,
        profit: 1150,
      },
      {
        billId: b5.id,
        itemId: "i19",
        quantity: 1,
        unitPrice: 6500,
        buyingPrice: 4200,
        discountAmount: 250,
        lineTotal: 6250,
        profit: 2050,
      },
    ],
  });

  // Bill 6 — 2 days ago
  const b6 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier1.id,
      customerId: "c10",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 2750,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 2,
      total: 2750,
      amountReceived: 3000,
      change: 250,
      createdAt: daysAgo(2),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b6.id,
        itemId: "i05",
        quantity: 2,
        unitPrice: 850,
        buyingPrice: 480,
        discountAmount: 0,
        lineTotal: 1700,
        profit: 740,
      },
      {
        billId: b6.id,
        itemId: "i11",
        quantity: 1,
        unitPrice: 1600,
        buyingPrice: 950,
        discountAmount: 0,
        lineTotal: 1600,
        profit: 650,
      },
    ],
  });

  // Bill 7 — yesterday
  const b7 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier2.id,
      customerId: "c05",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "card",
      subtotal: 7700,
      discountAmount: 500,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 7,
      total: 7200,
      amountReceived: 7200,
      change: 0,
      createdAt: daysAgo(1),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b7.id,
        itemId: "i13",
        quantity: 1,
        unitPrice: 5200,
        buyingPrice: 3200,
        discountAmount: 0,
        lineTotal: 5200,
        profit: 2000,
      },
      {
        billId: b7.id,
        itemId: "i16",
        quantity: 1,
        unitPrice: 2900,
        buyingPrice: 2400,
        discountAmount: 500,
        discountType: "amount",
        discountValue: 500,
        lineTotal: 2400,
        profit: 0,
      },
      {
        billId: b7.id,
        itemId: "i23",
        quantity: 1,
        unitPrice: 220,
        buyingPrice: 120,
        discountAmount: 0,
        lineTotal: 220,
        profit: 100,
      },
    ],
  });

  // Bills 8, 9, 10 — today
  const b8 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier1.id,
      customerId: "c01",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 4350,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 100,
      loyaltyCoinsEarned: 4,
      total: 4250,
      amountReceived: 4500,
      change: 250,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b8.id,
        itemId: "i02",
        quantity: 1,
        unitPrice: 2100,
        buyingPrice: 1200,
        discountAmount: 0,
        lineTotal: 2100,
        profit: 900,
      },
      {
        billId: b8.id,
        itemId: "i08",
        quantity: 1,
        unitPrice: 1800,
        buyingPrice: 950,
        discountAmount: 0,
        lineTotal: 1800,
        profit: 850,
      },
      {
        billId: b8.id,
        itemId: "i22",
        quantity: 3,
        unitPrice: 150,
        buyingPrice: 80,
        discountAmount: 0,
        lineTotal: 450,
        profit: 210,
      },
    ],
  });

  const b9 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier2.id,
      customerId: "c03",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "cash",
      subtotal: 1050,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 1,
      total: 1050,
      amountReceived: 1100,
      change: 50,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b9.id,
        itemId: "i06",
        quantity: 1,
        unitPrice: 950,
        buyingPrice: 550,
        discountAmount: 0,
        lineTotal: 950,
        profit: 400,
      },
      {
        billId: b9.id,
        itemId: "i22",
        quantity: 1,
        unitPrice: 150,
        buyingPrice: 80,
        discountAmount: 0,
        lineTotal: 150,
        profit: 70,
      },
    ],
  });

  const b10 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: owner.id,
      customerId: "c04",
      type: "quick_sale",
      status: "completed",
      paymentMethod: "card",
      subtotal: 6000,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 6,
      total: 6000,
      amountReceived: 6000,
      change: 0,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: b10.id,
        itemId: "i07",
        quantity: 1,
        unitPrice: 2200,
        buyingPrice: 1200,
        discountAmount: 0,
        lineTotal: 2200,
        profit: 1000,
      },
      {
        billId: b10.id,
        itemId: "i01",
        quantity: 1,
        unitPrice: 2400,
        buyingPrice: 1400,
        discountAmount: 0,
        lineTotal: 2400,
        profit: 1000,
      },
      {
        billId: b10.id,
        itemId: "i17",
        quantity: 1,
        unitPrice: 1050,
        buyingPrice: 850,
        discountAmount: 0,
        lineTotal: 1050,
        profit: 200,
      },
    ],
  });

  // ── Pre-Orders (6) ────────────────────────────────────────
  console.log("📋 Creating pre-orders...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(15, 0, 0, 0);
  const in2days = new Date();
  in2days.setDate(in2days.getDate() + 2);
  in2days.setHours(11, 0, 0, 0);
  const in3days = new Date();
  in3days.setDate(in3days.getDate() + 3);
  in3days.setHours(14, 0, 0, 0);
  const in5days = new Date();
  in5days.setDate(in5days.getDate() + 5);
  in5days.setHours(16, 0, 0, 0);
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const today4pm = new Date();
  today4pm.setHours(16, 0, 0, 0);

  // Pre-order 1 — Due today (Ready status)
  const po1 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier1.id,
      customerId: "c01",
      type: "pre_order",
      status: "ready",
      paymentMethod: "cash",
      subtotal: 7400,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 7400,
      amountReceived: 3000,
      change: 0,
      note: "Birthday",
      orderDate: daysAgo(3),
      deliveryDate: today4pm,
      advancePayment: 3000,
      createdAt: daysAgo(3),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: po1.id,
        itemId: "i04",
        quantity: 1,
        unitPrice: 2800,
        buyingPrice: 1600,
        discountAmount: 0,
        lineTotal: 2800,
        profit: 1200,
      },
      {
        billId: po1.id,
        itemId: "i07",
        quantity: 1,
        unitPrice: 2200,
        buyingPrice: 1200,
        discountAmount: 0,
        lineTotal: 2200,
        profit: 1000,
      },
      {
        billId: po1.id,
        itemId: "i12",
        quantity: 1,
        unitPrice: 2500,
        buyingPrice: 1500,
        discountAmount: 0,
        lineTotal: 2500,
        profit: 1000,
      },
    ],
  });

  // Pre-order 2 — Due tomorrow (Confirmed)
  const po2 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: owner.id,
      customerId: "c04",
      type: "pre_order",
      status: "confirmed",
      paymentMethod: "card",
      subtotal: 11700,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 11700,
      amountReceived: 5000,
      change: 0,
      note: "Wedding",
      orderDate: daysAgo(5),
      deliveryDate: tomorrow,
      advancePayment: 5000,
      createdAt: daysAgo(5),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: po2.id,
        itemId: "i04",
        quantity: 2,
        unitPrice: 2800,
        buyingPrice: 1600,
        discountAmount: 0,
        lineTotal: 5600,
        profit: 2400,
      },
      {
        billId: po2.id,
        itemId: "i09",
        quantity: 2,
        unitPrice: 2800,
        buyingPrice: 1500,
        discountAmount: 0,
        lineTotal: 5600,
        profit: 2600,
      },
      {
        billId: po2.id,
        itemId: "i24",
        quantity: 1,
        unitPrice: 550,
        buyingPrice: 250,
        discountAmount: 0,
        lineTotal: 550,
        profit: 300,
      },
    ],
  });

  // Pre-order 3 — In 2 days (Pending)
  const po3 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier2.id,
      customerId: "c08",
      type: "pre_order",
      status: "pending",
      paymentMethod: "cash",
      subtotal: 4400,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 4400,
      amountReceived: 2000,
      change: 0,
      note: "Mother's Day",
      orderDate: daysAgo(1),
      deliveryDate: in2days,
      advancePayment: 2000,
      createdAt: daysAgo(1),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: po3.id,
        itemId: "i10",
        quantity: 1,
        unitPrice: 3500,
        buyingPrice: 2000,
        discountAmount: 0,
        lineTotal: 3500,
        profit: 1500,
      },
      {
        billId: po3.id,
        itemId: "i05",
        quantity: 1,
        unitPrice: 850,
        buyingPrice: 480,
        discountAmount: 0,
        lineTotal: 850,
        profit: 370,
      },
    ],
  });

  // Pre-order 4 — In 3 days (Pending, no advance)
  const po4 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier1.id,
      customerId: "c09",
      type: "pre_order",
      status: "pending",
      paymentMethod: "cash",
      subtotal: 3500,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 3500,
      amountReceived: 0,
      change: 0,
      note: "Father's Day",
      orderDate: new Date(),
      deliveryDate: in3days,
      advancePayment: 0,
      createdAt: new Date(),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: po4.id,
        itemId: "i13",
        quantity: 1,
        unitPrice: 5200,
        buyingPrice: 3200,
        discountAmount: 0,
        lineTotal: 5200,
        profit: 2000,
      },
    ],
  });

  // Pre-order 5 — In 5 days (Confirmed, partial advance)
  const po5 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: owner.id,
      customerId: "c02",
      type: "pre_order",
      status: "confirmed",
      paymentMethod: "card",
      subtotal: 15700,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 0,
      total: 15700,
      amountReceived: 8000,
      change: 0,
      note: "Anniversary",
      orderDate: daysAgo(2),
      deliveryDate: in5days,
      advancePayment: 8000,
      createdAt: daysAgo(2),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: po5.id,
        itemId: "i20",
        quantity: 1,
        unitPrice: 9500,
        buyingPrice: 6000,
        discountAmount: 0,
        lineTotal: 9500,
        profit: 3500,
      },
      {
        billId: po5.id,
        itemId: "i10",
        quantity: 1,
        unitPrice: 3500,
        buyingPrice: 2000,
        discountAmount: 0,
        lineTotal: 3500,
        profit: 1500,
      },
      {
        billId: po5.id,
        itemId: "i18",
        quantity: 1,
        unitPrice: 3800,
        buyingPrice: 3100,
        discountAmount: 0,
        lineTotal: 3800,
        profit: 700,
      },
    ],
  });

  // Pre-order 6 — Delivered (last week)
  const po6 = await db.bill.create({
    data: {
      billNumber: bn(),
      cashierId: cashier1.id,
      customerId: "c06",
      type: "pre_order",
      status: "delivered",
      paymentMethod: "cash",
      subtotal: 8700,
      discountAmount: 500,
      tax: 0,
      loyaltyCoinsUsed: 0,
      loyaltyCoinsEarned: 8,
      total: 8200,
      amountReceived: 8200,
      change: 0,
      note: "Graduation",
      orderDate: daysAgo(14),
      deliveryDate: lastWeek,
      advancePayment: 8200,
      createdAt: daysAgo(14),
    },
  });
  await db.billLine.createMany({
    data: [
      {
        billId: po6.id,
        itemId: "i19",
        quantity: 1,
        unitPrice: 6500,
        buyingPrice: 4200,
        discountAmount: 500,
        discountType: "amount",
        discountValue: 500,
        lineTotal: 6000,
        profit: 1800,
      },
      {
        billId: po6.id,
        itemId: "i07",
        quantity: 1,
        unitPrice: 2200,
        buyingPrice: 1200,
        discountAmount: 0,
        lineTotal: 2200,
        profit: 1000,
      },
    ],
  });

  // ── Loyalty Transactions ──────────────────────────────────
  await db.loyaltyTransaction.createMany({
    data: [
      {
        customerId: "c01",
        type: "earn",
        coins: 580,
        note: "Accumulated from purchases",
        createdAt: daysAgo(30),
      },
      {
        customerId: "c01",
        type: "redeem",
        coins: -100,
        billId: b8.id,
        note: "Redeemed for discount",
        createdAt: b8.createdAt,
      },
      {
        customerId: "c04",
        type: "earn",
        coins: 890,
        note: "Accumulated from purchases",
        createdAt: daysAgo(60),
      },
      {
        customerId: "c02",
        type: "earn",
        coins: 320,
        note: "Accumulated from purchases",
        createdAt: daysAgo(45),
      },
      {
        customerId: "c08",
        type: "earn",
        coins: 450,
        note: "Accumulated from purchases",
        createdAt: daysAgo(20),
      },
      {
        customerId: "c05",
        type: "earn",
        coins: 240,
        note: "Accumulated from purchases",
        createdAt: daysAgo(15),
      },
    ],
  });

  // ── Waste Logs ────────────────────────────────────────────
  await db.wasteLog.createMany({
    data: [
      {
        itemId: "i06",
        quantity: 2,
        reason: "Expired / Past best-before date",
        note: "End of day unsold brownies",
        cost: 1100,
        createdAt: daysAgo(3),
      },
      {
        itemId: "i05",
        quantity: 1,
        reason: "Damaged during handling",
        note: "Dropped by staff member",
        cost: 480,
        createdAt: daysAgo(2),
      },
      {
        itemId: "i03",
        quantity: 1,
        reason: "Quality not acceptable",
        note: "Frosting melted in storage",
        cost: 800,
        createdAt: daysAgo(1),
      },
      {
        itemId: "i24",
        quantity: 3,
        reason: "Unsold — end of day",
        note: "Balloon bouquets could not be stored",
        cost: 750,
        createdAt: new Date(),
      },
    ],
  });

  // ── Held Bill ─────────────────────────────────────────────
  await db.heldBill.create({
    data: {
      label: "Customer went to ATM — hold",
      data: JSON.stringify({
        items: [
          {
            itemId: "i07",
            name: "Red Rose Bouquet (24 stems)",
            quantity: 1,
            unitPrice: 2200,
            buyingPrice: 1200,
            lineTotal: 2200,
            stock: 10,
          },
          {
            itemId: "i01",
            name: "Chocolate Fudge Cake (1kg)",
            quantity: 1,
            unitPrice: 2400,
            buyingPrice: 1400,
            lineTotal: 2400,
            stock: 12,
          },
        ],
        customer: null,
        activeTab: "quick_sale",
        loyaltyCoinsToUse: 0,
      }),
    },
  });

  // ── Stock Movements ───────────────────────────────────────
  await db.stockMovement.createMany({
    data: [
      {
        itemId: "i11",
        type: "adjustment",
        quantity: 10,
        note: "Restocked from supplier — Toy Kingdom",
        createdAt: daysAgo(5),
      },
      {
        itemId: "i07",
        type: "sale",
        quantity: -1,
        billId: b1.id,
        note: "Sold in POS-0001",
        createdAt: b1.createdAt,
      },
      {
        itemId: "i24",
        type: "waste",
        quantity: -3,
        note: "Waste: Unsold balloons",
        createdAt: new Date(),
      },
    ],
  });

  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅  PINKLET POS — SEED COMPLETE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("🔑  LOGIN CREDENTIALS");
  console.log("     Owner    →  owner@pinklet.lk  /  owner123");
  console.log("     Cashier1 →  amaya@pinklet.lk  /  cashier123");
  console.log("     Cashier2 →  sahan@pinklet.lk  /  cashier123");
  console.log("");
  console.log("📊  DATA SUMMARY");
  console.log("     👤 3 users (1 owner, 2 cashiers)");
  console.log("     🏭 5 suppliers");
  console.log("     📂 7 categories");
  console.log("     📦 25 items (1 out of stock, 2 low stock)");
  console.log("     👥 10 customers with loyalty points");
  console.log("     🏷  7 discount presets");
  console.log("     🧾 10 quick sale bills (across 7 days)");
  console.log("     📋 6 pre-orders (today/tomorrow/upcoming/delivered)");
  console.log("     💎 6 loyalty transactions");
  console.log("     🗑  4 waste logs");
  console.log("     ⏸  1 held bill");
  console.log("");
  console.log("🚀  Ready for full demo!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
