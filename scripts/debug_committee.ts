import { connectDB } from "@/lib/mongodb";
import Temple from "@/models/Temple";
import fs from "fs";
import path from "path";

// Manual .env loading
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  console.log("Loading .env.local...");
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
} else {
  console.warn(".env.local not found!");
}

async function main() {
  console.log("Connecting to DB...");
  try {
    await connectDB();
    console.log("Connected.");

    const temples = await Temple.find({});
    console.log(`Found ${temples.length} temples.`);

    temples.forEach((t) => {
      console.log(`Temple: "${t.name}" (ID: ${t._id})`);
      console.log(`Committee members: ${t.committee?.length || 0}`);
      if (t.committee && t.committee.length > 0) {
        console.log(JSON.stringify(t.committee, null, 2));
      }
      console.log("---");
    });
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

main();
