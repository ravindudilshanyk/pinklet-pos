import "dotenv/config";
import { db } from "../src/utils/db";
import { billingService } from "../src/services/billing.service";

async function main() {
  console.log("Starting billingService rollback integration test...");

  const unique = Date.now();
  const cashier = await db.user.create({
    data: {
      name: "Billing Service Tester",
      email: `billing-service+${unique}@example.com`,
      password: "test-password",
      role: "cashier",
    },
  });

  const item = await db.item.create({
    data: {
      name: `Rollback Service Item ${unique}`,
      buyingPrice: 25,
      sellingPrice: 40,
      stock: 10,
      lowStockAlert: 2,
    },
  });

  const customer = await db.customer.create({
    data: {
      name: `Rollback Customer ${unique}`,
      phone: `070${String(unique).slice(-7)}`,
      points: 0,
    },
  });

  try {
    process.env.BILLING_TEST_FAIL_AFTER_STOCK = "1";

    await billingService.completeBill({
      cashierId: cashier.id,
      customerId: customer.id,
      type: "quick_sale",
      paymentMethod: "cash",
      items: [
        {
          itemId: item.id,
          quantity: 2,
          unitPrice: 40,
          buyingPrice: 25,
          discountAmount: 0,
          lineTotal: 80,
        },
      ],
      subtotal: 80,
      discountAmount: 0,
      tax: 0,
      loyaltyCoinsUsed: 0,
      total: 80,
      amountReceived: 80,
      change: 0,
      note: "rollback test",
    });

    console.error("Expected billingService.completeBill to fail, but it succeeded");
    process.exit(1);
  } catch (error: any) {
    console.log("Service threw as expected:", error?.message ?? error);
  } finally {
    delete process.env.BILLING_TEST_FAIL_AFTER_STOCK;
  }

  const itemAfter = await db.item.findUnique({ where: { id: item.id } });
  if (!itemAfter) {
    console.error("Item missing after test setup");
    process.exit(1);
  }

  if (itemAfter.stock !== 10) {
    console.error(`Rollback failed: expected stock 10, found ${itemAfter.stock}`);
    process.exit(1);
  }

  const billForCashier = await db.bill.findFirst({
    where: {
      cashierId: cashier.id,
      note: "rollback test",
    },
  });

  if (billForCashier) {
    console.error("Rollback failed: bill persisted unexpectedly");
    await db.bill.delete({ where: { id: billForCashier.id } }).catch(() => {});
    process.exit(1);
  }

  console.log("Rollback successful: no bill persisted and stock unchanged");

  await db.customer.delete({ where: { id: customer.id } }).catch(() => {});
  await db.item.delete({ where: { id: item.id } }).catch(() => {});
  await db.user.delete({ where: { id: cashier.id } }).catch(() => {});

  process.exit(0);
}

main().catch(async (err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
