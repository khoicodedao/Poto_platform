/**
 * Migration Script: Convert attitudeScore (1-10) to rating (1-5)
 * Run this BEFORE applying the schema changes
 */

import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrateStudentFeedbacks() {
    console.log("🔄 Starting migration of student_feedbacks...");

    try {
        // Step 1: Add rating column if not exists
        console.log("📝 Step 1: Adding rating column...");
        await db.execute(sql`
      ALTER TABLE student_feedbacks 
      ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
    `);

        // Step 2: Convert attitudeScore (1-10) to rating (1-5)
        // Formula: rating = ROUND(attitudeScore / 2)
        console.log("📝 Step 2: Converting attitudeScore to rating...");
        await db.execute(sql`
      UPDATE student_feedbacks 
      SET rating = GREATEST(1, LEAST(5, ROUND(CAST(attitude_score AS DECIMAL) / 2)))
      WHERE attitude_score IS NOT NULL;
    `);

        // Step 3: Set default rating for null values
        console.log("📝 Step 3: Setting default rating for null values...");
        await db.execute(sql`
      UPDATE student_feedbacks 
      SET rating = 5
      WHERE rating IS NULL;
    `);

        // Step 4: Show conversion results
        console.log("📊 Step 4: Showing conversion results...");
        const results = await db.execute(sql`
      SELECT 
        id,
        student_id,
        attitude_score as old_score,
        participation_level as old_participation,
        rating as new_rating
      FROM student_feedbacks
      ORDER BY id;
    `);

        console.log("\n📋 Conversion Results:");
        console.table(results.rows);

        console.log("\n✅ Migration completed successfully!");
        console.log("📌 Next step: Run 'npm run db:push' to apply schema changes");

    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    }
}

// Run migration
migrateStudentFeedbacks()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
