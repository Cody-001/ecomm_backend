const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Products = require("./models/products");
const User = require("./models/user");
const Admin = require("./models/admin");
const expfileupld = require("express-fileupload");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const cloudinary = require("./cloudinary");

const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


app.use(
  expfileupld({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

  app.use(express.json());
app.use(cors());

app.get("/", (req,res)=>{
  res.send("Backend is running") 
})


const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Please authenticate using a valid token" });
  } else {
    try {
      const data = jwt.verify(token, process.env.JWT_KEY);
      req.user = data.user;
      next();
    } catch (error) {
      res.status(401).send({ error: "Please authenticate using a valid token" });
    }
  }
};


// const fetchAdmin = async (req, res, next) => {
//   const token = req.header("auth-token");
//   if (!token) {
//     return res.status(401).json({ error: "Access denied, token missing" });
//   }
//   try {
//     const data = jwt.verify(token, process.env.JWT_KEY);
//     req.adminId = data.admin.id;
//     next();
//   } catch (error) {
//     res.status(401).json({ error: "Invalid token" });
//   }
// };
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
); 

app.post("/addproduct", async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILES:", req.files);

    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const imageFile = req.files.image;
    console.log("imageFile:", imageFile);

    const uploadResult = await cloudinary.uploader.upload(
      imageFile.tempFilePath,
      { folder: "products", resource_type: "auto" }
    );
    console.log("Cloudinary result:", uploadResult);
    
    const products = await Products.find().sort({ id: 1 });
    const id = products.length > 0
      ? products[products.length - 1].id + 1
      : 1;

    const newProduct = new Products({
      id,
      name: req.body.name,
      image: uploadResult.secure_url,
      category: req.body.category,
      subcategory: req.body.subcategory,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await newProduct.save();
    res.json({ success: true, product: newProduct });

  } catch (error) {
    console.error("Add product error:", error);
    res.status(500).json({ error: "Server error" });
  }
});




app.post("/removeproduct", async (req, res) => {
  await Products.findOneAndDelete({ id: req.body.id });
  console.log("removed");
  res.json({ success: true, name: req.body.name });
});

app.get("/allproducts", async (req, res) => {
  let product = await Products.find({});
  console.log("all product fetched");
  res.send(product);
});

app.post("/signup", async (req, res) => {
  let existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ success: false, error: "Existing user" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) cart[i] = 0;
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await newUser.save();
  const token = jwt.sign({ user: { id: newUser._id } }, process.env.JWT_KEY);
  res.json({ success: true, token });
});

app.post("/login", async (req, res) => {
  let checkUser = await User.findOne({ email: req.body.email });
  if (!checkUser) {
    return res.json({ success: false, error: "Wrong email" });
  }
  const passCompare = req.body.password === checkUser.password;
  if (!passCompare) {
    return res.json({ success: false, error: "Wrong password" });
  }
  const token = jwt.sign({ user: { id: checkUser._id } }, process.env.JWT_KEY);
  res.json({ success: true, token });
});

app.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;
  let admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(400).json({ success: false, error: "Wrong email" });
  }
  if (admin.password !== password) {
    return res.status(400).json({ success: false, error: "Wrong password" });
  }
  const token = jwt.sign({ admin: { id: admin._id } }, process.env.JWT_KEY, { expiresIn: "1h" });
  res.json({ success: true, token });
});

app.post("/addtocart", fetchuser, async (req, res) => {
  console.log("Added", req.body.itemId);
  let userData = await User.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await User.findByIdAndUpdate({_id:req.user.id}, { cartData: userData.cartData });
  res.send("Added");
});

app.post("/removefromcart", fetchuser, async (req, res) => {
  console.log("Removed", req.body.itemId);
  let userData = await User.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1;
  await User.findByIdAndUpdate({_id:req.user.id}, { cartData: userData.cartData });
  res.send("Removed");
});

app.post("/getcart", fetchuser, async (req, res) => {
  console.log("getcart");
  let userData = await User.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server is running on port ${port}`);
  } else {
    console.log("Error:", error);
  }
});

