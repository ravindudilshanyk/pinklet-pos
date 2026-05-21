import 'dotenv/config';
import { db } from '../src/utils/db';

async function main() {
  console.log('Starting billing rollback integration test...');

  // Create test cashier and item
  const cashier = await db.user.create({
    data: { name: 'Test Cashier', email: `test+${Date.now()}@example.com`, password: 'test', role: 'cashier' },
  });

  const item = await db.item.create({
    data: {
      name: 'Rollback Item',
      buyingPrice: 5,
      sellingPrice: 10,
      stock: 10,
    },
  });

  const billNumber = `POS-ROLL-${Date.now()}`;

  try {
    await db.$transaction(async (tx) => {
      await tx.bill.create({
        data: {
          billNumber,
          cashierId: cashier.id,
          paymentMethod: 'cash',
          subtotal: 10,
          discountAmount: 0,
          tax: 0,
          loyaltyCoinsUsed: 0,
          loyaltyCoinsEarned: 0,
          total: 10,
          amountReceived: 10,
          change: 0,
          lines: {
            create: [
              {
                itemId: item.id,
                quantity: 1,
                unitPrice: 10,
                buyingPrice: 5,
                discountAmount: 0,
                lineTotal: 10,
                profit: 5,
              },
            ],
          },
        },
      });

      // Force an error to cause the transaction to rollback
      throw new Error('force rollback');
    });

    console.error('Transaction did not throw as expected');
    process.exit(1);
  } catch (err: any) {
    console.log('Transaction threw as expected:', err.message);
  }

  // Ensure the bill was not persisted
  const found = await db.bill.findUnique({ where: { billNumber } });
  if (found) {
    console.error('Rollback failed: bill still exists');
    // Cleanup
    await db.bill.delete({ where: { id: found.id } }).catch(() => {});
    await db.item.delete({ where: { id: item.id } }).catch(() => {});
    await db.user.delete({ where: { id: cashier.id } }).catch(() => {});
    process.exit(1);
  }

  console.log('Rollback successful: bill was not persisted');

  // Cleanup
  await db.item.delete({ where: { id: item.id } }).catch(() => {});
  await db.user.delete({ where: { id: cashier.id } }).catch(() => {});

  process.exit(0);
}

main().catch((e) => {
  console.error('Test failed with error:', e);
  process.exit(1);
});
