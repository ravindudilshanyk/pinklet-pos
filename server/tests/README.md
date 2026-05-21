# Server Integration Tests

This directory contains deterministic integration tests for transaction rollback behavior.

## Included Tests

- `billingRollback.ts`: verifies a manual Prisma transaction rollback when an error is thrown.
- `billingServiceRollback.ts`: verifies `billingService.completeBill` rolls back bill creation and stock changes when a forced failure occurs after stock mutation.
- `wasteRollback.ts`: verifies `wasteController.create` rolls back waste log creation and stock changes when a forced failure occurs after stock mutation.

## Test Hooks

These environment variables are test-only hooks used by integration tests to force controlled failures:

- `BILLING_TEST_FAIL_AFTER_STOCK=1`
  - Location: `src/services/billing.service.ts`
  - Behavior: throws `TEST_FAIL_AFTER_STOCK` after item stock decrement, before the transaction completes.

- `WASTE_TEST_FAIL_AFTER_STOCK=1`
  - Location: `src/controllers/waste.controller.ts`
  - Behavior: throws `TEST_FAIL_AFTER_WASTE_STOCK` after item stock decrement, before the transaction completes.

Both hooks are set and cleared inside test scripts. They should not be enabled in production.

## Run Tests

From `server`:

```powershell
pnpm test:integration:tx
pnpm test:integration:billing-service
pnpm test:integration:waste
pnpm test:integration
```

## Expected Outcome

Each rollback test should report:

- forced failure occurred at expected point
- no persisted records from the failed transaction
- stock quantity remains unchanged
