const mongoose = require("mongoose");
const Admin = require("./models/admin");  // Adjust path to your admin model
require("dotenv").config();

async function deleteAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const email = "admin@example.com";
    const result = await Admin.deleteMany({ email });
    console.log(`Deleted ${result.deletedCount} admin(s) with email ${email}`);

    await mongoose.disconnect();
    console.log("MongoDB disconnected");
    process.exit(0);
  } catch (err) {
    console.error("Error deleting admin:", err);
    process.exit(1);
  }
}

deleteAdmin();