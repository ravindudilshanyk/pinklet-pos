-- CreateTable
CREATE TABLE "CustomItemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "billId" TEXT,
    "name" TEXT NOT NULL,
    "cakeType" TEXT,
    "flavour" TEXT,
    "weight" TEXT,
    "message" TEXT,
    "designNotes" TEXT,
    "sellingPrice" REAL NOT NULL,
    "buyingPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "discount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
