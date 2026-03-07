import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// CSV file path
const CSV_PATH = path.join(process.cwd(), 'data', 'boardgames.csv')

// Helper functions for type conversion
function parseIntOrNull(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

function parseFloatOrNull(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

function parseBooleanFromString(value: string): boolean {
  return value === '1' || value.toLowerCase() === 'true'
}

interface CSVRow {
  id: string
  name: string
  yearpublished: string
  rank: string
  bayesaverage: string
  average: string
  usersrated: string
  is_expansion: string
  abstracts_rank: string
  cgs_rank: string
  childrensgames_rank: string
  familygames_rank: string
  partygames_rank: string
  strategygames_rank: string
  thematic_rank: string
  wargames_rank: string
}

function mapCSVRowToGame(row: CSVRow) {
  const bggId = parseIntOrNull(row.id)
  const name = row.name?.trim()

  // Skip if required fields are missing
  if (!bggId || !name) {
    return null
  }

  return {
    bggId,
    name,
    yearPublished: parseIntOrNull(row.yearpublished),
    rank: parseIntOrNull(row.rank),
    bayesAverage: parseFloatOrNull(row.bayesaverage),
    average: parseFloatOrNull(row.average),
    usersRated: parseIntOrNull(row.usersrated),
    isExpansion: parseBooleanFromString(row.is_expansion),
    abstractsRank: parseIntOrNull(row.abstracts_rank),
    cgsRank: parseIntOrNull(row.cgs_rank),
    childrensGamesRank: parseIntOrNull(row.childrensgames_rank),
    familyGamesRank: parseIntOrNull(row.familygames_rank),
    partyGamesRank: parseIntOrNull(row.partygames_rank),
    strategyGamesRank: parseIntOrNull(row.strategygames_rank),
    thematicRank: parseIntOrNull(row.thematic_rank),
    warGamesRank: parseIntOrNull(row.wargames_rank)
  }
}

async function importBoardgames() {
  console.log('Starting board game import...')
  console.log(`Reading from: ${CSV_PATH}`)

  if (!fs.existsSync(CSV_PATH)) {
    console.error(`CSV file not found: ${CSV_PATH}`)
    console.error('Please place your CSV file at data/boardgames.csv')
    process.exit(1)
  }

  const rows: ReturnType<typeof mapCSVRowToGame>[] = []
  let totalRows = 0
  let skippedRows = 0

  // Read and parse CSV
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        totalRows++
        const mapped = mapCSVRowToGame(row)
        
        if (mapped) {
          rows.push(mapped)
        } else {
          skippedRows++
        }

        if (totalRows % 1000 === 0) {
          console.log(`Parsed ${totalRows} rows...`)
        }
      })
      .on('end', () => {
        console.log(`\nFinished parsing CSV`)
        console.log(`Total rows: ${totalRows}`)
        console.log(`Valid rows: ${rows.length}`)
        console.log(`Skipped rows: ${skippedRows}`)
        resolve()
      })
      .on('error', reject)
  })

  // Insert into database
  console.log('\nInserting into database...')
  
  let inserted = 0
  let updated = 0
  let errors = 0

  for (let i = 0; i < rows.length; i++) {
    const gameData = rows[i]
    if (!gameData) continue

    try {
      await prisma.game.upsert({
        where: { bggId: gameData.bggId },
        update: gameData,
        create: gameData
      })

      // Check if it was insert or update (simplified - count as inserted for new)
      inserted++

      if ((inserted + updated) % 1000 === 0) {
        console.log(`Processed ${inserted + updated} / ${rows.length} games...`)
      }
    } catch (error) {
      errors++
      if (errors <= 5) {
        console.error(`Error inserting game ${gameData.bggId} (${gameData.name}):`, error)
      }
    }
  }

  console.log('\n--- Import Complete ---')
  console.log(`Successfully processed: ${inserted}`)
  console.log(`Errors: ${errors}`)

  await prisma.$disconnect()
  await pool.end()
}

importBoardgames().catch(async (e) => {
  console.error('Import failed:', e)
  await prisma.$disconnect()
  await pool.end()
  process.exit(1)
})
