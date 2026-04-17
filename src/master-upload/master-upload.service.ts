import {
  BadRequestException,
  Inject,
  Injectable,
} from '@nestjs/common';
import * as XLSX from 'xlsx';

export interface SheetResult {
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; error: string }>;
}

export interface UploadResult {
  categories: SheetResult;
  stages: SheetResult;
  defects: SheetResult;
  parts: SheetResult;
}

@Injectable()
export class MasterUploadService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex) {}

  async processUpload(buffer: Buffer): Promise<UploadResult> {
    // Parse workbook from memory buffer
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException('Invalid or corrupted Excel file. Please use a valid .xlsx file.');
    }

    const result: UploadResult = {
      categories: { inserted: 0, skipped: 0, errors: [] },
      stages:     { inserted: 0, skipped: 0, errors: [] },
      defects:    { inserted: 0, skipped: 0, errors: [] },
      parts:      { inserted: 0, skipped: 0, errors: [] },
    };

    // All 4 sheets are processed in a single transaction
    await this.knex.transaction(async (trx) => {
      // ─── 1. CATEGORIES ───────────────────────────────────────────────
      result.categories = await this.processSimpleSheet(
        trx,
        workbook,
        'Categories',
        'categories',
      );

      // ─── 2. STAGES ───────────────────────────────────────────────────
      result.stages = await this.processSimpleSheet(
        trx,
        workbook,
        'Stages',
        'stages',
      );

      // ─── 3. DEFECTS ──────────────────────────────────────────────────
      result.defects = await this.processSimpleSheet(
        trx,
        workbook,
        'Defects',
        'defects',
      );

      // ─── 4. PARTS ─────────────────────────────────────────────────────
      // Parts are processed last since they can reference categories
      result.parts = await this.processPartsSheet(trx, workbook);
    });

    // Audit log — one entry summarising the whole upload
    await this.knex('audit_logs').insert({
      user_id: null, // set by controller if needed
      action: 'BULK_MASTER_UPLOAD',
      entity_name: 'master_data',
      metadata: JSON.stringify({
        categories: { inserted: result.categories.inserted, skipped: result.categories.skipped, errors: result.categories.errors.length },
        stages:     { inserted: result.stages.inserted,     skipped: result.stages.skipped,     errors: result.stages.errors.length },
        defects:    { inserted: result.defects.inserted,    skipped: result.defects.skipped,    errors: result.defects.errors.length },
        parts:      { inserted: result.parts.inserted,      skipped: result.parts.skipped,      errors: result.parts.errors.length },
      }),
    });

    return result;
  }

  // ─── Generic handler for name-only sheets (categories, stages, defects) ───
  private async processSimpleSheet(
    trx: any,
    workbook: XLSX.WorkBook,
    sheetName: string,
    tableName: string,
  ): Promise<SheetResult> {
    const result: SheetResult = { inserted: 0, skipped: 0, errors: [] };

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      // Sheet is optional — if absent just return empty result
      return result;
    }

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2; // +2 because row 1 is the header
      const rawName = rows[i]['name'] ?? rows[i]['Name'] ?? '';
      const name = String(rawName).trim();

      if (!name) {
        result.errors.push({ row: rowNum, error: 'Name is empty — row skipped.' });
        continue;
      }

      try {
        // ON CONFLICT (name) DO NOTHING — idempotent, safe to re-upload
        const insertedRows = await trx(tableName)
          .insert({ name })
          .onConflict('name')
          .ignore()
          .returning('id');

        if (insertedRows.length > 0 && insertedRows[0]) {
          result.inserted++;
        } else {
          result.skipped++; // row already existed
        }
      } catch (err: any) {
        result.errors.push({ row: rowNum, error: err?.message ?? 'Unknown DB error' });
      }
    }

    return result;
  }

  // ─── Parts handler — resolves category_name → category_id ───────────────
  private async processPartsSheet(
    trx: any,
    workbook: XLSX.WorkBook,
  ): Promise<SheetResult> {
    const result: SheetResult = { inserted: 0, skipped: 0, errors: [] };

    const sheet = workbook.Sheets['Parts'];
    if (!sheet) return result;

    const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    // Build an in-memory map of category name → id from the DB
    // (includes freshly inserted ones from the same transaction)
    const categoryRows = await trx('categories').select('id', 'name');
    const categoryMap = new Map<string, number>(
      categoryRows.map((c: any) => [c.name.toLowerCase().trim(), c.id]),
    );

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      const rawName = rows[i]['name'] ?? rows[i]['Name'] ?? '';
      const rawCategory = rows[i]['category_name'] ?? rows[i]['Category Name'] ?? rows[i]['Category'] ?? '';

      const name = String(rawName).trim();
      const categoryName = String(rawCategory).trim();

      if (!name) {
        result.errors.push({ row: rowNum, error: 'Part name is empty — row skipped.' });
        continue;
      }

      let category_id: number | null = null;

      if (categoryName) {
        const resolvedId = categoryMap.get(categoryName.toLowerCase());
        if (resolvedId === undefined) {
          result.errors.push({
            row: rowNum,
            error: `Category "${categoryName}" not found in database. Part skipped.`,
          });
          continue;
        }
        category_id = resolvedId;
      }

      try {
        const payload: any = { name };
        if (category_id !== null) payload.category_id = category_id;

        const insertedRows = await trx('parts')
          .insert(payload)
          .onConflict('name')
          .ignore()
          .returning('id');

        if (insertedRows.length > 0 && insertedRows[0]) {
          result.inserted++;
        } else {
          result.skipped++;
        }
      } catch (err: any) {
        result.errors.push({ row: rowNum, error: err?.message ?? 'Unknown DB error' });
      }
    }

    return result;
  }
}
