// migrate-employee.js
const { MongoClient } = require("mongodb");
const { Client } = require("pg");

// MongoDB setup
const mongoUri = "mongodb://localhost:27017";
const mongoClient = new MongoClient(mongoUri);

// PostgreSQL setup
const pgClient = new Client({
  user: "ish",
  host: "localhost",
  database: "userdb",
  password: "www", // <-- update accordingly
  port: 5432,
});

async function migrateEmployee() {
  try {
    await mongoClient.connect();
    console.log("✅ Connected to MongoDB");

    await pgClient.connect();
    console.log("✅ Connected to PostgreSQL");

    const mongoDb = mongoClient.db("testDB");
    const employeeCollection = mongoDb.collection("employee");

    const employees = await employeeCollection.find().toArray();
    console.log(`📦 Found ${employees.length} employees to migrate`);

    for (let emp of employees) {
      const { name, age, salary } = emp;

      await pgClient.query(
        "INSERT INTO employee (name, age, salary) VALUES ($1, $2, $3)",
        [name, age, salary]
      );
      console.log(`➡️ Migrated employee: ${name}`);
    }

    console.log("✅ Employee migration completed");

  } catch (err) {
    console.error("❌ Error during migration:", err);
  } finally {
    await mongoClient.close();
    await pgClient.end();
  }
}

migrateEmployee();
