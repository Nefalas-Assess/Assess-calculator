import migration030 from './migration/0.3.0'
import migration110 from './migration/1.1.0'
import migration121 from './migration/1.2.1'

interface MigrationFunction {
  (data: any): any
}

interface Migration {
  version: string
  migrate: MigrationFunction
}

// Define migrations in order from oldest to newest
const migrations: Migration[] = [
  // Migration from version 0.2.2 to 0.3.0
  {
    version: '0.3.0',
    migrate: migration030
  },
  {
    version: '1.1.0',
    migrate: migration110
  },
  {
    version: '1.2.1',
    migrate: migration121
  }
  // Add more migrations here as your app evolves
]

/**
 * Compare two semver version strings
 * Returns: -1 if v1 < v2, 0 if v1 = v2, 1 if v1 > v2
 */
const compareVersions = (v1: string, v2: string): number => {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0

    if (part1 < part2) return -1
    if (part1 > part2) return 1
  }

  return 0
}

/**
 * Migrate data from an older version to the current version
 * @param data The data object to migrate
 * @param currentVersion The current version of the application
 * @returns The migrated data object
 */
export const migrateData = (data: any, currentVersion: string): any => {
  // If no version in data, assume it's from before versioning was implemented
  const dataVersion = data.version || '1.0.0'

  console.log(`Migrating data from version ${dataVersion} to ${currentVersion}`)

  // If data is already at current version or newer, no migration needed
  if (compareVersions(dataVersion, currentVersion) >= 0) {
    console.log('No migration needed')
    return data
  }

  let migratedData = { ...data }

  // Apply all migrations that are newer than the data version
  // and older than or equal to the current version
  for (const migration of migrations) {
    if (
      compareVersions(dataVersion, migration.version) < 0 &&
      compareVersions(migration.version, currentVersion) <= 0
    ) {
      console.log(`Applying migration to version ${migration.version}`)
      try {
        migratedData = migration.migrate(migratedData)
      } catch (error) {
        console.error(`Error applying migration to version ${migration.version}:`, error)
        throw new Error(`Failed to migrate data to version ${migration.version}`)
      }
    }
  }

  // Update the version to the current version
  migratedData.version = currentVersion

  console.log('Migration completed successfully')
  return migratedData
}

/**
 * Ensure data has the current version before saving
 * @param data The data object to prepare for saving
 * @param currentVersion The current version of the application
 * @returns The data object with updated version
 */
export const prepareDataForSave = (data: any, currentVersion: string): any => {
  return {
    ...data,
    version: currentVersion
  }
}

/**
 * Check if a version string is valid (semver format)
 * @param version The version string to validate
 * @returns True if valid, false otherwise
 */
export const isValidVersion = (version: string): boolean => {
  const semverRegex = /^\d+\.\d+\.\d+$/
  return semverRegex.test(version)
}
