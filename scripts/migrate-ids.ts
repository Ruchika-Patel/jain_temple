import connectDB from "../lib/mongodb";
import Temple from "../models/Temple";

async function migrate() {
  await connectDB();
  const temples = await Temple.find().sort({ createdAt: 1 });
  for (let i = 0; i < temples.length; i++) {
    const displayId = String(i + 1).padStart(2, "0");
    await Temple.updateOne({ _id: temples[i]._id }, { $set: { displayId } });
    console.log(
      `Updated temple ${temples[i].name} with displayId ${displayId}`,
    );
  }
  process.exit(0);
}

migrate();
