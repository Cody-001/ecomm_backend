const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Products = require("./models/products");
const multer = require("multer");
const User = require("./models/user");
const Admin = require("./models/admin");
require("dotenv").config();

const port = process.env.PORT || 3000;

app.use("/images", express.static(path.join(__dirname, "upload/images")));
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

    
app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("product"), (req, res) => {
  // Dynamic URL based on request host, works in both local and production
  const imageUrl = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
  res.json({ success: true, image_url: imageUrl });
});

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

// Uncomment and use if needed
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

app.post("/addproduct", async (req, res) => {
  let product = await Products.find();
  let id;
  if (product.length > 0) {
    let lastProductArray = product.slice(-1);
    let lastProduct = lastProductArray[0];
    id = lastProduct.id + 1;
  } else {
    id = 1;
  }
  const newProduct = new Products({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    subcategory: req.body.subcategory,
    new_price: req.body.new_price,
    old_price: req.body.old_price
  });
  console.log(newProduct);
  await newProduct.save();
  console.log("saved");
  res.json({ success: true, name: req.body.name });
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
  await User.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
  res.send("Added");
});

app.post("/removefromcart", fetchuser, async (req, res) => {
  console.log("Removed", req.body.itemId);
  let userData = await User.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] > 0) userData.cartData[req.body.itemId] -= 1;
  await User.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
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
