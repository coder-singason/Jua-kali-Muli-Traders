import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Cleaning existing data...");
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productSize.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productDetail.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create Categories for Electronics & Juakali Appliances
  console.log("📁 Creating categories...");

  const smartphonesCategory = await prisma.category.create({
    data: {
      name: "Smartphones & Tablets",
      slug: "smartphones-tablets",
    },
  });

  const laptopsCategory = await prisma.category.create({
    data: {
      name: "Laptops & Computers",
      slug: "laptops-computers",
    },
  });

  const appliancesCategory = await prisma.category.create({
    data: {
      name: "Home Appliances",
      slug: "home-appliances",
    },
  });

  const juakaliCategory = await prisma.category.create({
    data: {
      name: "Juakali Tools & Equipment",
      slug: "juakali-tools",
    },
  });

  const audioCategory = await prisma.category.create({
    data: {
      name: "Audio & Entertainment",
      slug: "audio-entertainment",
    },
  });

  // Create Electronics & Appliances Products
  console.log("📱 Creating products...");

  // Smartphones
  const product1 = await prisma.product.create({
    data: {
      name: "Samsung Galaxy A54 5G",
      description: "6.4-inch Super AMOLED display, 50MP triple camera, 5000mAh battery. Perfect for photography and daily use.",
      price: 45000,
      categoryId: smartphonesCategory.id,
      brand: "Samsung",
      images: [
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800",
      ],
      stock: 25,
      sku: "SMRT-001",
      featured: true,
      condition: "New",
      modelNumber: "SM-A546E",
      specifications: {
        display: "6.4-inch Super AMOLED, 1080 x 2340 pixels",
        processor: "Exynos 1380",
        ram: "8GB",
        camera: "50MP + 12MP + 5MP Triple Camera",
        battery: "5000mAh",
        os: "Android 13",
      },
      technicalDetails: {
        dimensions: "158.2 x 76.7 x 8.2 mm",
        weight: "202 grams",
      },
      warranty: "1 Year",
      quality: "Premium",
      deliveryTime: "1-3 Days",
      shippingFee: 500,
      sizes: {
        create: [
          { size: "128GB", stock: 10 },
          { size: "256GB", stock: 15 },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "HP Pavilion 15 Laptop",
      description: "15.6-inch FHD display, Intel Core i5, 8GB RAM, 512GB SSD. Ideal for work, study, and entertainment.",
      price: 75000,
      categoryId: laptopsCategory.id,
      brand: "HP",
      images: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
      ],
      stock: 15,
      sku: "LPTP-001",
      featured: true,
      condition: "New",
      modelNumber: "15-eg2xxx",
      specifications: {
        display: "15.6-inch FHD (1920 x 1080)",
        processor: "Intel Core i5-1235U",
        ram: "8GB DDR4",
        storage: "512GB PCIe NVMe SSD",
        graphics: "Intel Iris Xe Graphics",
        os: "Windows 11 Home",
      },
      technicalDetails: {
        weight: "1.75 kg",
        batteryLife: "Up to 7 hours",
        ports: "2x USB 3.2, 1x HDMI, 1x USB-C, Audio jack",
      },
      warranty: "1 Year",
      quality: "Premium",
      deliveryTime: "2-4 Days",
      shippingFee: 800,
      sizes: {
        create: [
          { size: "8GB RAM / 512GB SSD", stock: 15 },
        ],
      },
    },
  });

  // Home Appliances
  const product3 = await prisma.product.create({
    data: {
      name: "Samsung 8kg Front Load Washing Machine",
      description: "Energy-efficient washing machine with multiple wash programs, quick wash, and digital inverter technology.",
      price: 55000,
      categoryId: appliancesCategory.id,
      brand: "Samsung",
      images: [
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800",
      ],
      stock: 10,
      sku: "APPL-001",
      featured: true,
      condition: "New",
      modelNumber: "WW80T504DAW",
      specifications: {
        capacity: "8 kg",
        spinSpeed: "1400 RPM",
        programs: "15 wash programs",
        energyRating: "A++",
      },
      technicalDetails: {
        voltage: "220-240V",
        frequency: "50Hz",
        powerConsumption: "2100W",
        dimensions: "600 x 550 x 850 mm",
        weight: "65 kg",
      },
      warranty: "2 Years",
      quality: "Premium",
      deliveryTime: "3-5 Days",
      shippingFee: 1500,
      sizes: {
        create: [
          { size: "Standard", stock: 10 },
        ],
      },
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: "Ramtons 2-Door Refrigerator 138L",
      description: "Compact and energy-efficient refrigerator perfect for small families. Features separate freezer compartment.",
      price: 28000,
      categoryId: appliancesCategory.id,
      brand: "Ramtons",
      images: [
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
      ],
      stock: 12,
      sku: "APPL-002",
      featured: false,
      condition: "New",
      modelNumber: "RF/225",
      specifications: {
        capacity: "138 Liters (100L Fridge + 38L Freezer)",
        defrost: "Manual",
        energyRating: "A+",
        shelves: "3 glass shelves",
      },
      technicalDetails: {
        voltage: "220-240V",
        frequency: "50Hz",
        powerConsumption: "90W",
        dimensions: "480 x 520 x 1220 mm",
        weight: "35 kg",
      },
      warranty: "1 Year",
      quality: "Standard",
      deliveryTime: "2-4 Days",
      shippingFee: 1000,
      sizes: {
        create: [
          { size: "Standard", stock: 12 },
        ],
      },
    },
  });

  // Juakali Tools & Equipment
  const product5 = await prisma.product.create({
    data: {
      name: "Bosch Angle Grinder 900W",
      description: "Powerful 900W angle grinder ideal for cutting, grinding, and polishing metal and masonry. Essential for juakali work.",
      price: 12500,
      categoryId: juakaliCategory.id,
      brand: "Bosch",
      images: [
        "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800",
      ],
      stock: 20,
      sku: "JKTL-001",
      featured: true,
      condition: "New",
      modelNumber: "GWS 900-125",
      specifications: {
        power: "900W",
        discDiameter: "125mm (5 inch)",
        noLoadSpeed: "11000 RPM",
        spindleThread: "M14",
      },
      technicalDetails: {
        voltage: "220-240V",
        frequency: "50-60Hz",
        powerConsumption: "900W",
        weight: "2.0 kg",
        cableLength: "2.5m",
      },
      warranty: "6 Months",
      quality: "Premium",
      deliveryTime: "1-2 Days",
      shippingFee: 300,
      sizes: {
        create: [
          { size: "Standard", stock: 20 },
        ],
      },
    },
  });

  const product6 = await prisma.product.create({
    data: {
      name: "Makita Cordless Drill Driver 18V",
      description: "Compact and lightweight cordless drill with variable speed control. Includes 2 batteries and charger.",
      price: 18000,
      categoryId: juakaliCategory.id,
      brand: "Makita",
      images: [
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
      ],
      stock: 15,
      sku: "JKTL-002",
      featured: false,
      condition: "New",
      modelNumber: "DDF483Z",
      specifications: {
        voltage: "18V",
        chuckCapacity: "13mm",
        maxTorque: "36 Nm",
        noLoadSpeed: "0-500 / 0-1900 RPM",
        batteryIncluded: "2x 18V 2.0Ah Li-ion",
      },
      technicalDetails: {
        weight: "1.7 kg (with battery)",
        dimensions: "186 x 78 x 254 mm",
      },
      warranty: "1 Year",
      quality: "Premium",
      deliveryTime: "1-3 Days",
      shippingFee: 400,
      sizes: {
        create: [
          { size: "Standard", stock: 15 },
        ],
      },
    },
  });

  // Audio & Entertainment
  const product7 = await prisma.product.create({
    data: {
      name: "JBL Flip 6 Bluetooth Speaker",
      description: "Portable Bluetooth speaker with powerful sound, IP67 waterproof rating, and 12-hour battery life.",
      price: 15000,
      categoryId: audioCategory.id,
      brand: "JBL",
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800",
      ],
      stock: 30,
      sku: "AUDI-001",
      featured: true,
      condition: "New",
      modelNumber: "FLIP6",
      specifications: {
        bluetooth: "Bluetooth 5.1",
        batteryLife: "12 hours",
        waterproof: "IP67",
        speakerPower: "30W RMS",
      },
      technicalDetails: {
        weight: "550 grams",
        dimensions: "178 x 72 x 68 mm",
        chargingTime: "2.5 hours",
        inputVoltage: "5V / 3A (USB-C)",
      },
      warranty: "1 Year",
      quality: "Premium",
      deliveryTime: "1-2 Days",
      shippingFee: 200,
      sizes: {
        create: [
          { size: "Standard", stock: 30 },
        ],
      },
    },
  });

  const product8 = await prisma.product.create({
    data: {
      name: "TCL 43-inch Smart Android TV",
      description: "Full HD Smart TV with Android OS, built-in Chromecast, HDR support, and access to Google Play Store.",
      price: 32000,
      categoryId: audioCategory.id,
      brand: "TCL",
      images: [
        "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800",
      ],
      stock: 18,
      sku: "AUDI-002",
      featured: true,
      condition: "New",
      modelNumber: "43S6500FS",
      specifications: {
        screenSize: "43 inches",
        resolution: "1920 x 1080 (Full HD)",
        smartOS: "Android TV 11",
        hdr: "HDR10",
        connectivity: "3x HDMI, 2x USB, WiFi, Ethernet",
      },
      technicalDetails: {
        voltage: "220-240V",
        frequency: "50-60Hz",
        powerConsumption: "80W",
        dimensions: "970 x 630 x 180 mm (with stand)",
        weight: "7.5 kg",
      },
      warranty: "1 Year",
      quality: "Standard",
      deliveryTime: "2-3 Days",
      shippingFee: 1200,
      sizes: {
        create: [
          { size: "43-inch", stock: 18 },
        ],
      },
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Created:`);
  console.log(`   - 5 Categories (Electronics & Juakali)`);
  console.log(`   - 8 Products (Smartphones, Laptops, Appliances, Tools, Audio)`);
  console.log(`   - Multiple variants for storage/capacity options`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
