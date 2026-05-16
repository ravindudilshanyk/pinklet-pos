/*
  Warnings:

  - Added the required column `billNumber` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `buyingPrice` to the `BillLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "birthday" DATETIME;
ALTER TABLE "Customer" ADD COLUMN "notes" TEXT;
ALTER TABLE "Customer" ADD COLUMN "whatsappNumber" TEXT;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN "note" TEXT;

-- CreateTable
CREATE TABLE "LoyaltyTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "billId" TEXT,
    "note" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoyaltyTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HeldBill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billNumber" TEXT NOT NULL,
    "cashierId" TEXT NOT NULL,
    "customerId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'quick_sale',
    "status" TEXT NOT NULL DEFAULT 'completed',
    "paymentMethod" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "loyaltyCoinsUsed" INTEGER NOT NULL DEFAULT 0,
    "loyaltyCoinsEarned" INTEGER NOT NULL DEFAULT 0,
    "total" REAL NOT NULL,
    "amountReceived" REAL NOT NULL DEFAULT 0,
    "change" REAL NOT NULL DEFAULT 0,
    "note" TEXT,
    "orderDate" DATETIME,
    "deliveryDate" DATETIME,
    "advancePayment" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bill_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Bill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Bill" ("cashierId", "createdAt", "customerId", "discountAmount", "id", "note", "paymentMethod", "status", "subtotal", "tax", "total") SELECT "cashierId", "createdAt", "customerId", "discountAmount", "id", "note", "paymentMethod", "status", "subtotal", "tax", "total" FROM "Bill";
DROP TABLE "Bill";
ALTER TABLE "new_Bill" RENAME TO "Bill";
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");
CREATE TABLE "new_BillLine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "buyingPrice" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "discountType" TEXT,
    "discountValue" REAL,
    "lineTotal" REAL NOT NULL,
    "profit" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "BillLine_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BillLine_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BillLine" ("billId", "discountAmount", "id", "itemId", "lineTotal", "quantity", "unitPrice") SELECT "billId", "discountAmount", "id", "itemId", "lineTotal", "quantity", "unitPrice" FROM "BillLine";
DROP TABLE "BillLine";
ALTER TABLE "new_BillLine" RENAME TO "BillLine";
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "barcode" TEXT,
    "categoryId" TEXT,
    "buyingPrice" REAL NOT NULL,
    "sellingPrice" REAL NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "lowStockAlert" INTEGER NOT NULL DEFAULT 10,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("barcode", "buyingPrice", "categoryId", "createdAt", "id", "imageUrl", "isActive", "name", "sellingPrice", "stock") SELECT "barcode", "buyingPrice", "categoryId", "createdAt", "id", "imageUrl", "isActive", "name", "sellingPrice", "stock" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_barcode_key" ON "Item"("barcode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
