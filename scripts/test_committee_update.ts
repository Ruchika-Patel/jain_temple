import { connectDB } from "@/lib/mongodb";
import Temple from "@/models/Temple";
import fs from "fs";
import path from "path";

// Manual .env loading
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  envConfig.split("\n").forEach((line) => {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts
        .slice(1)
        .join("=")
        .trim()
        .replace(/^["']|["']$/g, "");
      process.env[key] = value;
    }
  });
}

async function testUpdate() {
  try {
    await connectDB();
    console.log("Connected to DB");

    // 1. Find a temple to test with
    const temple = await Temple.findOne({});
    if (!temple) {
      console.error("No temples found to test with.");
      process.exit(1);
    }
    console.log(`Testing with temple: ${temple.name}`);

    // 2. Define dummy committee data
    const testCommittee = [
      {
        name: "Test Member 1",
        designation: "Member",
        phone: "1234567890",
        email: "test1@example.com",
      },
      {
        name: "Test Member 2",
        designation: "Secretary",
        phone: "0987654321",
        email: "test2@example.com",
      },
    ];

    // 3. Perform the update (replicating the API logic)
    console.log("Attempting update...");
    const updated = await Temple.findOneAndUpdate(
      { name: temple.name },
      { $set: { committee: testCommittee } },
      { new: true, runValidators: true },
    );

    if (updated) {
      console.log("Update SUCCESS!");
      console.log("New Committee Length:", updated.committee.length);
      console.log("First Member:", updated.committee[0]);
    } else {
      console.log("Update FAILED (Temple not found?)");
    }
  } catch (e) {
    console.error("Test Error:", e);
  }
  process.exit(0);
}

testUpdate();
