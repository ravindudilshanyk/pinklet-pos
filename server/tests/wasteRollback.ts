import "dotenv/config";
import { wasteController } from "../src/controllers/waste.controller";
import { db } from "../src/utils/db";

type MockRes = {
  statusCode: number;
  body: any;
  status: (code: number) => MockRes;
  json: (payload: any) => MockRes;
};

function createMockRes(): MockRes {
  return {
    statusCode: 200,
    body: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
  };
}

async function main() {
  console.log("Starting waste rollback integration test...");

  const unique = Date.now();
  const item = await db.item.create({
    data: {
      name: `Waste Rollback Item ${unique}`,
      buyingPrice: 12,
      sellingPrice: 20,
      stock: 8,
      lowStockAlert: 2,
    },
  });

  const req = {
    body: {
      itemId: item.id,
      quantity: 3,
      reason: "test rollback",
      note: `rollback-note-${unique}`,
    },
  } as any;

  const res = createMockRes() as any;

  process.env.WASTE_TEST_FAIL_AFTER_STOCK = "1";

  try {
    await wasteController.create(req, res);
  } finally {
    delete process.env.WASTE_TEST_FAIL_AFTER_STOCK;
  }

  if (res.statusCode !== 500 || res.body?.success !== false) {
    console.error("Expected controller to return 500 error for forced test failure");
    process.exit(1);
  }

  const itemAfter = await db.item.findUnique({ where: { id: item.id } });
  if (!itemAfter) {
    console.error("Item disappeared unexpectedly");
    process.exit(1);
  }

  if (itemAfter.stock !== 8) {
    console.error(`Rollback failed: expected stock 8, found ${itemAfter.stock}`);
    process.exit(1);
  }

  const waste = await db.wasteLog.findFirst({
    where: {
      itemId: item.id,
      note: `rollback-note-${unique}`,
    },
  });

  if (waste) {
    console.error("Rollback failed: waste log persisted unexpectedly");
    await db.wasteLog.delete({ where: { id: waste.id } }).catch(() => {});
    process.exit(1);
  }

  console.log("Rollback successful: waste log not persisted and stock unchanged");

  await db.item.delete({ where: { id: item.id } }).catch(() => {});
  process.exit(0);
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
