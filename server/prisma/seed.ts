import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create owner
  const hashedPassword = await bcrypt.hash("123456", 12);
  await db.user.upsert({
    where: { email: "owner@pinklet.com" },
    update: {},
    create: {
      name: "Shop Owner",
      email: "owner@pinklet.com",
      password: hashedPassword,
      role: "owner",
    },
  });

  // Create categories
  const categories = [
    "Cake",
    "Cake Tool",
    "Teddies",
    "Flower Bouquet",
    "Perfume & Cream",
    "Purse & Belt",
    "Hand Bag",
    "Others",
  ];

  for (const name of categories) {
    await db.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const cakeCategory = await db.category.findFirst({ where: { name: "Cake" } });
  const teddyCategory = await db.category.findFirst({
    where: { name: "Teddies" },
  });
  const flowerCategory = await db.category.findFirst({
    where: { name: "Flower Bouquet" },
  });

  // Create items
  const items = [
    {
      name: "Chocolate Brownie Pot",
      barcode: "CBP001",
      categoryId: cakeCategory!.id,
      buyingPrice: 220,
      sellingPrice: 300,
      stock: 50,
      lowStockAlert: 10,
    },
    {
      name: "Vanilla Cream Cake",
      barcode: "VCC001",
      categoryId: cakeCategory!.id,
      buyingPrice: 350,
      sellingPrice: 500,
      stock: 8,
      lowStockAlert: 10,
    },
    {
      name: "Teddy Bear Large",
      barcode: "TBL001",
      categoryId: teddyCategory!.id,
      buyingPrice: 1800,
      sellingPrice: 2800,
      stock: 15,
      lowStockAlert: 5,
    },
    {
      name: "Teddy Bear Small",
      barcode: "TBS001",
      categoryId: teddyCategory!.id,
      buyingPrice: 900,
      sellingPrice: 1500,
      stock: 3,
      lowStockAlert: 5,
    },
    {
      name: "Rose Bouquet",
      barcode: "RB001",
      categoryId: flowerCategory!.id,
      buyingPrice: 400,
      sellingPrice: 750,
      stock: 20,
      lowStockAlert: 5,
    },
    {
      name: "Mixed Flower Bouquet",
      barcode: "MFB001",
      categoryId: flowerCategory!.id,
      buyingPrice: 600,
      sellingPrice: 1100,
      stock: 12,
      lowStockAlert: 5,
    },
  ];

  for (const item of items) {
    await db.item.upsert({
      where: { barcode: item.barcode },
      update: {},
      create: item,
    });
  }

  // Create test customers
  await db.customer.upsert({
    where: { phone: "0771234567" },
    update: {},
    create: {
      name: "Hirushi Anjana",
      phone: "0771234567",
      whatsappNumber: "94771234567",
      email: "hirushi@example.com",
      points: 45,
    },
  });

  await db.customer.upsert({
    where: { phone: "0779876543" },
    update: {},
    create: {
      name: "Thamodi Dilhara",
      phone: "0779876543",
      whatsappNumber: "94779876543",
      points: 12,
    },
  });

  // Create discount presets
  const presets = [
    { label: "5% Off", type: "percentage", value: 5 },
    { label: "10% Off", type: "percentage", value: 10 },
    { label: "15% Off", type: "percentage", value: 15 },
    { label: "20% Off", type: "percentage", value: 20 },
    { label: "Rs. 50 Off", type: "amount", value: 50 },
    { label: "Rs. 100 Off", type: "amount", value: 100 },
    { label: "Rs. 200 Off", type: "amount", value: 200 },
  ];

  for (const preset of presets) {
    await db.discountPreset.create({ data: preset });
  }

  console.log("✓ Database seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
