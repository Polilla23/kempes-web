#!/usr/bin/env node
/**
 * Script de baseline para alinear migraciones Prisma con DB actual
 * 
 * Uso:
 *   node scripts/baseline-migrations.js
 * 
 * Este script marca todas las migraciones existentes como aplicadas
 * sin ejecutarlas, útil cuando la DB ya tiene el schema actualizado
 * pero el historial de _prisma_migrations no coincide.
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function main() {
  const prisma = new PrismaClient()

  try {
    console.log('🔍 Verificando estado de migraciones...\n')

    // Obtener migraciones del filesystem
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations')
    const migrationFolders = fs
      .readdirSync(migrationsDir)
      .filter((name) => name !== 'migration_lock.toml')
      .sort()

    console.log(`📂 Encontradas ${migrationFolders.length} carpetas de migración\n`)

    // Verificar tabla _prisma_migrations
    const appliedMigrations = await prisma.$queryRaw`
      SELECT migration_name, finished_at 
      FROM _prisma_migrations 
      ORDER BY migration_name
    `

    console.log(`✅ Aplicadas en DB: ${appliedMigrations.length}\n`)

    // Encontrar migraciones pendientes
    const appliedNames = new Set(appliedMigrations.map((m) => m.migration_name))
    const pending = migrationFolders.filter((name) => !appliedNames.has(name))

    if (pending.length === 0) {
      console.log('✨ Todas las migraciones ya están aplicadas. No hay nada que baselinar.')
      return
    }

    console.log(`⚠️  Migraciones pendientes (${pending.length}):\n`)
    pending.forEach((name) => console.log(`  - ${name}`))
    console.log()

    // Confirmar con el usuario
    console.log('🎯 Este script marcará estas migraciones como aplicadas SIN ejecutarlas.')
    console.log('⚠️  Solo usa esto si tu DB YA tiene estos cambios aplicados manualmente.\n')
    console.log('Para continuar, ejecuta:')
    console.log('  npx prisma migrate resolve --applied [nombre-migracion]\n')
    console.log('O para marcar todas automáticamente (¡PELIGRO!), descomenta el código abajo.\n')

    // DESCOMENTAR SOLO SI ESTÁS SEGURO:
    // for (const migration of pending) {
    //   await prisma.$executeRaw`
    //     INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
    //     VALUES (
    //       gen_random_uuid(),
    //       '',
    //       NOW(),
    //       ${migration},
    //       NULL,
    //       NULL,
    //       NOW(),
    //       1
    //     )
    //   `
    //   console.log(`✓ Marcada como aplicada: ${migration}`)
    // }
    // console.log('\n✨ Baseline completado')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main()
