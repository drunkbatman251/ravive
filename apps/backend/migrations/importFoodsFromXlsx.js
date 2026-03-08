import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';
import { pool } from '../src/config/db.js';

const inputPath = process.argv[2] || process.env.INDB_XLSX_PATH || '/Users/ravisingh/Downloads/INDB.xlsx';

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function categoryFromName(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('tea') || lower.includes('coffee') || lower.includes('drink') || lower.includes('juice')) {
    return 'Beverages';
  }
  if (lower.includes('samosa') || lower.includes('kachori') || lower.includes('chaat') || lower.includes('puri') || lower.includes('jalebi')) {
    return 'Street Food';
  }
  if (lower.includes('dosa') || lower.includes('idli') || lower.includes('poha') || lower.includes('upma')) {
    return 'Indian Breakfast';
  }
  return 'Indian Foods';
}

function normalizeRow(row) {
  const name = String(row.food_name || '').trim();
  if (!name) return null;

  const calories = num(row.unit_serving_energy_kcal) || num(row.energy_kcal);
  const protein = num(row.unit_serving_protein_g) || num(row.protein_g);
  const carbs = num(row.unit_serving_carb_g) || num(row.carb_g);
  const fat = num(row.unit_serving_fat_g) || num(row.fat_g);
  const fiber = num(row.unit_serving_fibre_g) || num(row.fibre_g);

  const vitamins = [
    num(row.unit_serving_vitc_mg) || num(row.vitc_mg) ? `VitC:${num(row.unit_serving_vitc_mg) || num(row.vitc_mg)}mg` : '',
    num(row.unit_serving_vitb1_mg) || num(row.vitb1_mg) ? `B1:${num(row.unit_serving_vitb1_mg) || num(row.vitb1_mg)}mg` : '',
    num(row.unit_serving_vitb2_mg) || num(row.vitb2_mg) ? `B2:${num(row.unit_serving_vitb2_mg) || num(row.vitb2_mg)}mg` : '',
    num(row.unit_serving_vitb6_mg) || num(row.vitb6_mg) ? `B6:${num(row.unit_serving_vitb6_mg) || num(row.vitb6_mg)}mg` : '',
    num(row.unit_serving_folate_ug) || num(row.folate_ug) ? `Folate:${num(row.unit_serving_folate_ug) || num(row.folate_ug)}ug` : ''
  ].filter(Boolean).join(', ');

  const minerals = [
    num(row.unit_serving_calcium_mg) || num(row.calcium_mg) ? `Calcium:${num(row.unit_serving_calcium_mg) || num(row.calcium_mg)}mg` : '',
    num(row.unit_serving_iron_mg) || num(row.iron_mg) ? `Iron:${num(row.unit_serving_iron_mg) || num(row.iron_mg)}mg` : '',
    num(row.unit_serving_potassium_mg) || num(row.potassium_mg) ? `Potassium:${num(row.unit_serving_potassium_mg) || num(row.potassium_mg)}mg` : '',
    num(row.unit_serving_magnesium_mg) || num(row.magnesium_mg) ? `Magnesium:${num(row.unit_serving_magnesium_mg) || num(row.magnesium_mg)}mg` : '',
    num(row.unit_serving_zinc_mg) || num(row.zinc_mg) ? `Zinc:${num(row.unit_serving_zinc_mg) || num(row.zinc_mg)}mg` : ''
  ].filter(Boolean).join(', ');

  return {
    name,
    category: categoryFromName(name),
    calories: Math.max(0, Math.round(calories || 0)),
    protein: Number(protein.toFixed(2)),
    carbs: Number(carbs.toFixed(2)),
    fat: Number(fat.toFixed(2)),
    fiber: Number(fiber.toFixed(2)),
    vitamins,
    minerals
  };
}

async function run() {
  if (!fs.existsSync(inputPath)) {
    console.error(`XLSX file not found: ${inputPath}`);
    process.exit(1);
  }

  const workbook = XLSX.readFile(inputPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  let imported = 0;

  for (const row of rows) {
    const item = normalizeRow(row);
    if (!item || !item.name || item.calories <= 0) continue;

    await pool.query(
      `INSERT INTO food_items (name, category, calories, protein, carbs, fat, fiber, vitamins, minerals)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (name)
       DO UPDATE SET
         category = EXCLUDED.category,
         calories = EXCLUDED.calories,
         protein = EXCLUDED.protein,
         carbs = EXCLUDED.carbs,
         fat = EXCLUDED.fat,
         fiber = EXCLUDED.fiber,
         vitamins = EXCLUDED.vitamins,
         minerals = EXCLUDED.minerals`,
      [
        item.name,
        item.category,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
        item.fiber,
        item.vitamins,
        item.minerals
      ]
    );

    imported += 1;
  }

  console.log(`Imported/updated ${imported} foods from ${path.basename(inputPath)}.`);
}

run()
  .catch((error) => {
    console.error('Import failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
