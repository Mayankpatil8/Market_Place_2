// Run: node seed.js
// This creates demo users and sample products

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/marketplace';

mongoose.connect(MONGO_URI).then(() => console.log('Connected to MongoDB')).catch(err => { console.error(err); process.exit(1); });

const UserSchema = new mongoose.Schema({ name:String, email:String, password:String, role:String, company:String, phone:String, isActive:{type:Boolean,default:true}, supplierInfo:{rating:Number,totalDeals:Number,verified:Boolean,businessType:String}, searchHistory:[], viewedProducts:[], preferences:[] }, {timestamps:true});
const ProductSchema = new mongoose.Schema({ name:String, description:String, category:String, price:Number, stock:Number, unit:{type:String,default:'piece'}, minOrderQty:{type:Number,default:1}, supplier:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, tags:[String], isActive:{type:Boolean,default:true}, rating:{type:Number,default:0}, reviewCount:{type:Number,default:0}, totalSold:{type:Number,default:0}, views:{type:Number,default:0}, isRestricted:{type:Boolean,default:false} }, {timestamps:true});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);

async function seed() {
  await User.deleteMany({});
  await Product.deleteMany({});

  const hash = (p) => bcrypt.hashSync(p, 12);

  // Create users
  const admin = await User.create({ name:'Admin User', email:'admin@demo.com', password:hash('demo1234'), role:'admin', company:'IndustrialHub' });
  
  const supplier1 = await User.create({ name:'Rajesh Kumar', email:'supplier@demo.com', password:hash('demo1234'), role:'supplier', company:'Kumar Motors Pvt Ltd', phone:'+91 98765 43210', supplierInfo:{ rating:4.5, totalDeals:34, verified:true, businessType:'Motor Manufacturer' } });
  
  const supplier2 = await User.create({ name:'Priya Shah', email:'supplier2@demo.com', password:hash('demo1234'), role:'supplier', company:'TechSemi Components', phone:'+91 87654 32109', supplierInfo:{ rating:4.8, totalDeals:62, verified:true, businessType:'Semiconductor Distributor' } });
  
  const customer = await User.create({ name:'Amit Verma', email:'customer@demo.com', password:hash('demo1234'), role:'customer', company:'TechStartup India', phone:'+91 76543 21098' });

  // Create products
  const products = [
    { name:'3-Phase Induction Motor 5HP', description:'Heavy-duty 3-phase induction motor suitable for industrial conveyors, pumps, and compressors. IE3 energy efficiency class.', category:'motors', price:12500, stock:45, unit:'unit', supplier:supplier1._id, tags:['motor','3-phase','5HP','IE3'], rating:4.5, totalSold:28 },
    { name:'Servo Motor 1kW with Encoder', description:'High-precision servo motor with built-in encoder for CNC machines and robotic applications.', category:'motors', price:8900, stock:30, unit:'unit', supplier:supplier1._id, tags:['servo','CNC','encoder'], rating:4.7, totalSold:15 },
    { name:'STM32 Microcontroller F4 Series', description:'ARM Cortex-M4 based microcontroller with FPU. Ideal for industrial control systems.', category:'semiconductors', price:450, stock:500, unit:'piece', supplier:supplier2._id, tags:['STM32','ARM','microcontroller'], rating:4.9, totalSold:320 },
    { name:'MOSFET Power Module 600V/50A', description:'High-voltage MOSFET module for power electronics, inverters and motor drives.', category:'semiconductors', price:1200, stock:200, unit:'piece', supplier:supplier2._id, tags:['MOSFET','power','600V'], rating:4.6, totalSold:180 },
    { name:'Military Grade Capacitor 105°C', description:'High-temperature rated capacitor designed for defence and aerospace applications. MIL-SPEC certified.', category:'defence', price:850, stock:150, unit:'piece', supplier:supplier2._id, tags:['capacitor','defence','MIL-SPEC'], rating:4.8, totalSold:45, isRestricted:true },
    { name:'Industrial PLC Controller Siemens-Compatible', description:'Industrial programmable logic controller compatible with Siemens S7 protocol. Supports Modbus, Profibus.', category:'electronics', price:25000, stock:20, unit:'unit', supplier:supplier1._id, tags:['PLC','Siemens','industrial'], rating:4.4, totalSold:8 },
    { name:'High-Precision Bearing SKF-Grade', description:'Deep groove ball bearing for high-speed industrial applications. 6205-2RS RS1 bearing.', category:'mechanical', price:320, stock:1000, unit:'piece', supplier:supplier1._id, tags:['bearing','SKF','precision'], rating:4.7, totalSold:650 },
    { name:'AC Drive VFD 7.5kW', description:'Variable frequency drive for AC motor speed control. Built-in EMI filter, Modbus RTU communication.', category:'motors', price:18500, stock:25, unit:'unit', supplier:supplier1._id, tags:['VFD','drive','7.5kW','AC'], rating:4.6, totalSold:12 },
  ];

  await Product.insertMany(products);

  console.log('✅ Seed complete!');
  console.log('\n📋 Demo Accounts:');
  console.log('  Admin:    admin@demo.com    / demo1234');
  console.log('  Supplier: supplier@demo.com / demo1234');
  console.log('  Customer: customer@demo.com / demo1234');
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });
