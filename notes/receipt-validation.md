# Receipt Data Layer Validation

These steps confirm that the `receipts` table, photo storage, and helpers created in `src/functions/receiptService.ts` behave as expected before any additional UI work is layered in.

## 1. Supabase credentials

- Double-check `app.config.js`/`app.json` have `expo.extra.supabaseUrl` and `expo.extra.supabaseKey` defined.
- Run `npx expo config --json` (or the app) to ensure the values are being injected.

## 2. Insert a sample receipt via the helper

1. Open a node REPL inside the workspace (`node`) or create a small test file that imports `receiptService`.
2. Call `receiptService.createReceipt` with either `subtotal` or `totalAmount`. Example:
   ```ts
   await receiptService.createReceipt({
     id: "test-receipt-1",
     receiptDate: new Date().toISOString(),
     category: "Fuel",
     vendor: "BP",
     description: "Test autofill",
     totalAmount: 110,
   });
   ```
3. Confirm Supabase writes `subtotal`, `gst`, and `total_amount` as expected (GST = total/11).
4. Run the same helper with a `subtotal` value to verify the alternate path.

## 3. Query receipts

- Use `receiptService.queryReceipts({ search: "BP" })` to confirm `vendor`, `description`, and `category` are searchable via the DSL.
- Try `category` filters (e.g., `category: "Fuel"`) and date bounds (`startDate`, `endDate`) to ensure SQL constraints match expectations.
- Confirm `minAmount`/`maxAmount` filters work by setting them to bounding values.

## 4. Uploading photos

1. Use `receiptService.createReceipt` to ensure a receipt row exists and note its `id`.
2. Call `receiptService.uploadReceiptPhoto` with the `receiptId` and some local file URI (camera roll or fixture image).
3. Inspect Supabase storage (`trips_photos` bucket, `receipts/` folder) to see the file path, signed URL, and that the `receipt_image_url` column updates.
4. Call `receiptService.getReceiptById` afterward to verify the `receipt_image_url` field is populated.

## 5. Additional sanity checks

- Run `npm run lint` to ensure TypeScript/Expo config stays clean.
- Consider adding unit tests (jest/expo) if the project grows; for now, manual validation via `node`/REPL is sufficient.

Document any hiccups here before proceeding with the UI layer, so the next developer can pick up where you left off.
