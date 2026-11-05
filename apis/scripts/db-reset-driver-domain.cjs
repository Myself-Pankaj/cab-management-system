const { Client } = require('pg');
const {
  loadEnvFile,
  getPgClientConfig,
} = require('./load-env.cjs');

async function resetDriverDomainMigrations() {
  loadEnvFile();
  const client = new Client(getPgClientConfig());
  await client.connect();

  try {
    await client.query(`
      DROP TABLE IF EXISTS ride_cancellations CASCADE;
      DROP TABLE IF EXISTS ride_status_history CASCADE;
      DROP TABLE IF EXISTS payments CASCADE;
      DROP TABLE IF EXISTS rides CASCADE;
      DROP TABLE IF EXISTS ride_requests CASCADE;
      DROP TABLE IF EXISTS vehicle_documents CASCADE;
      DROP TABLE IF EXISTS images CASCADE;
      DROP TABLE IF EXISTS vehicle_images CASCADE;
      DROP TABLE IF EXISTS vehicles CASCADE;
      DROP TABLE IF EXISTS driver_vehicles CASCADE;
      DROP TABLE IF EXISTS driver_bank_accounts CASCADE;
      DROP TABLE IF EXISTS driver_bank_details CASCADE;
      DROP TABLE IF EXISTS driver_documents CASCADE;
      DROP TABLE IF EXISTS driver_verifications CASCADE;
      DROP TABLE IF EXISTS driver_wallets CASCADE;
      DROP TYPE IF EXISTS image_owner_type CASCADE;
      DROP TYPE IF EXISTS vehicle_image_type CASCADE;
      DROP TYPE IF EXISTS vehicle_document_type CASCADE;
      DROP TYPE IF EXISTS ride_request_status CASCADE;
      DROP TYPE IF EXISTS assignment_type CASCADE;
      DROP TYPE IF EXISTS payment_option CASCADE;
      DROP TYPE IF EXISTS trip_type CASCADE;
      DROP TYPE IF EXISTS payment_type CASCADE;
      DROP TYPE IF EXISTS payment_status CASCADE;
      DROP TYPE IF EXISTS ride_status CASCADE;
      DROP TYPE IF EXISTS driver_document_type CASCADE;
      DROP TYPE IF EXISTS review_status CASCADE;
    `);

    await client.query(`
      DELETE FROM schema_migrations
      WHERE name IN (
        '006_driver_documents.sql',
        '007_driver_bank_details.sql',
        '007_driver_bank_accounts.sql',
        '008_driver_wallets.sql',
        '009_driver_vehicles.sql',
        '009_vehicles.sql',
        '010_vehicle_images.sql',
        '010_images.sql',
        '011_vehicle_documents.sql',
        '012_driver_verifications.sql',
        '013_ride_requests.sql',
        '014_rides.sql',
        '015_payments.sql',
        '016_ride_status_history.sql',
        '017_ride_cancellations.sql'
      )
    `);

    console.log('Driver domain schema reset complete');
  } finally {
    await client.end();
  }
}

resetDriverDomainMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});
