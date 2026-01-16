const mongoose = require("mongoose");
const Admin = require("./models/admin");  // Adjust path to your admin model

async function createAdmin() {
  try {
    await mongoose.connect(
      "mongodb+srv://bethel:bethelbethel@cluster0.cfvdmuj.mongodb.net/ecomm"
    );
    console.log("Connected to DB");

    const email = "bethel.me123@gmail.com";
    const password = "123456";  // Plain text password (not secure)

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists. No new admin created.");
    } else {
      const newAdmin = new Admin({ email, password });
      await newAdmin.save();
      console.log("Admin created successfully!");
    }

    await mongoose.disconnect();
    console.log("Disconnected from DB");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
     try {
     await newAdmin.save();
   } catch (err) {
     if (err.code === 11000) {
       console.log("Admin already exists, skipping creation.");
     } else {
       console.error("Error creating admin:", err);
     }
   }

}

createAdmin();