import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Juakali database seed with Local Assets...");

  // 1. Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  // Don't delete users to preserve admin access
  // await prisma.user.deleteMany(); 

  await prisma.productSize.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.recentlyViewed.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productDetail.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 2. Create Categories
  console.log("📁 Creating categories...");

  const furniture = await prisma.category.create({
    data: { name: "Furniture", slug: "furniture" },
  });

  const metalwork = await prisma.category.create({
    data: { name: "Metalwork & Grills", slug: "metalwork" },
  });

  const decor = await prisma.category.create({
    data: { name: "Home Decor", slug: "home-decor" },
  });

  const utility = await prisma.category.create({
    data: { name: "Construction & Utility", slug: "construction-utility" },
  });

  console.log("🛠️ Creating products...");

  // Helper to standard image path
  const getImg = (name: string) => `/images/products/${name}`;

  // --- FURNITURE ---
  await prisma.product.create({
    data: {
      name: "Rustic Pallet Sofa Set",
      description: "Handcrafted L-shaped sofa made from treated reclaimed pine pallets. Includes high-density foam cushions with removable, washable canvas covers. Perfect for outdoor lounges or rustic living rooms.",
      price: 35000,
      categoryId: furniture.id,
      brand: "Juakali Woodworks",
      images: [getImg("Rustic Pallet Sofa Set.jpg")],
      // Add productImages relation
      productImages: {
        create: [{ url: getImg("Rustic Pallet Sofa Set.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 5,
      sku: "FURN-001",
      featured: true,
      condition: "New",
      specifications: { material: "Pine Wood", cushions: "High Density Foam", capacity: "5 Seater" },
      deliveryTime: "3-5 Days",
      warranty: "1 Year",
      sizes: { create: [{ size: "Standard L-Shape", stock: 5 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Industrial Pipe Coffee Table",
      description: "Modern industrial design featuring black galvanized steel pipes and a solid mahogany top with a matte varnish finish.",
      price: 12500,
      categoryId: furniture.id,
      brand: "Urban Metal",
      // Proxy: using pallet sofa image as it's the closest 'rustic furniture' asset
      images: [getImg("Rustic Pallet Sofa Set.jpg")],
      productImages: {
        create: [{ url: getImg("Rustic Pallet Sofa Set.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 8,
      sku: "FURN-002",
      featured: false,
      condition: "New",
      specifications: { dimensions: "100cm x 60cm", height: "45cm", wood: "Mahogany" },
      deliveryTime: "2-4 Days",
      warranty: "2 Years",
      sizes: { create: [{ size: "Standard", stock: 8 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Convertible School Desk",
      description: "Heavy-duty steel frame desk that converts into a bench. Wooden top made from cypress. Ideal for home schooling or compact spaces.",
      price: 4500,
      categoryId: furniture.id,
      brand: "Elimu Works",
      // Proxy: using pallet image set
      images: [getImg("Rustic Pallet Sofa Set.jpg")],
      productImages: {
        create: [{ url: getImg("Rustic Pallet Sofa Set.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 20,
      sku: "FURN-003",
      condition: "New",
      deliveryTime: "1-2 Days",
      sizes: { create: [{ size: "Standard", stock: 20 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Woven Reed Chair",
      description: "Traditional coastal style chair woven from natural reeds on a hardwood frame. Breathable and comfortable.",
      price: 3800,
      categoryId: furniture.id,
      brand: "Coastal Weaves",
      // Proxy: using banana fiber basket for 'woven' texture
      images: [getImg("Banana Fiber Laundry Basket.jpg")],
      productImages: {
        create: [{ url: getImg("Banana Fiber Laundry Basket.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 12,
      sku: "FURN-004",
      condition: "New",
      deliveryTime: "2-4 Days",
      sizes: { create: [{ size: "Single", stock: 12 }] }
    },
  });

  // --- METALWORK ---
  await prisma.product.create({
    data: {
      name: "Heavy Duty Steel Gate",
      description: "Double-swing steel gate with decorative floral scrollwork. Painted with anti-rust primer and black gloss finish. Installation available.",
      price: 45000,
      categoryId: metalwork.id,
      brand: "Nairobi Steelworks",
      // Proxy: using window grills for 'steel work'
      images: [getImg("Steel Window Grills.jpg")],
      productImages: {
        create: [{ url: getImg("Steel Window Grills.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 2,
      sku: "METL-001",
      featured: true,
      condition: "New",
      specifications: { width: "12ft (Standard)", height: "7ft", gauge: "16 Gauge" },
      deliveryTime: "7-10 Days",
      warranty: "5 Years",
      sizes: { create: [{ size: "12ft x 7ft", stock: 2 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Energy Saving Jiko",
      description: "Ceramic-lined charcoal stove that retains heat properly, using 50% less charcoal than standard jikos. Durable metal casing.",
      price: 1500,
      categoryId: metalwork.id,
      brand: "EcoJiko",
      // Proxy: using BBQ grill for cooking appliance
      images: [getImg("Commercial BBQ Grill.jpg")],
      productImages: {
        create: [{ url: getImg("Commercial BBQ Grill.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 50,
      sku: "METL-002",
      featured: true,
      condition: "New",
      deliveryTime: "1 Day",
      sizes: { create: [{ size: "Small", stock: 20 }, { size: "Medium", stock: 20 }, { size: "Large", stock: 10 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Steel Window Grills",
      description: "Custom-made burglar proof window grills. Geometric patterns for modern security. Quote per square meter.",
      price: 3500,
      categoryId: metalwork.id,
      brand: "SecureHome",
      images: [getImg("Steel Window Grills.jpg")],
      productImages: {
        create: [{ url: getImg("Steel Window Grills.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 100,
      sku: "METL-003",
      condition: "New",
      deliveryTime: "3-5 Days",
      sizes: { create: [{ size: "Standard (4x4)", stock: 100 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Commercial BBQ Grill",
      description: "Half-drum BBQ grill with stand and side table. Perfect for nyama choma businesses or large family gatherings.",
      price: 8500,
      categoryId: metalwork.id,
      brand: "Choma Master",
      images: [getImg("Commercial BBQ Grill.jpg")],
      productImages: {
        create: [{ url: getImg("Commercial BBQ Grill.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 10,
      sku: "METL-004",
      condition: "New",
      deliveryTime: "2 Days",
      sizes: { create: [{ size: "Large", stock: 10 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Boda Boda Carrier Frame",
      description: "Reinforced steel carrier frame for motorcycle deliveries. Welded joints for extra load capacity.",
      price: 2500,
      categoryId: metalwork.id,
      brand: "Thika Welders",
      images: [getImg("Boda Boda Carrier Frame.jpg")],
      productImages: {
        create: [{ url: getImg("Boda Boda Carrier Frame.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 15,
      sku: "METL-005",
      condition: "New",
      sizes: { create: [{ size: "Standard", stock: 15 }] }
    },
  });

  // --- HOME DECOR ---
  await prisma.product.create({
    data: {
      name: "Recycled Tire Planters",
      description: "Vibrant, painted garden planters made from upcycled tires. Available in various colors and shapes (swan, cup, plain).",
      price: 800,
      categoryId: decor.id,
      brand: "Green Cycle",
      images: [getImg("Recycled Tire Planters.jpg")],
      productImages: {
        create: [{ url: getImg("Recycled Tire Planters.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 30,
      sku: "DECO-001",
      condition: "New",
      sizes: { create: [{ size: "Medium", stock: 30 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Maasai Shuka Fleece Blanket",
      description: "Traditional Maasai Shuka fabric backed with warm polar fleece. Ideal for cold evenings or travel.",
      price: 2200,
      categoryId: decor.id,
      brand: "Safari Warmth",
      images: [getImg("Maasai Shuka Fleece Blanket.jpg")],
      productImages: {
        create: [{ url: getImg("Maasai Shuka Fleece Blanket.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 40,
      sku: "DECO-002",
      featured: true,
      condition: "New",
      sizes: { create: [{ size: "150x200cm", stock: 40 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Beaded Wire Sculpture - Lion",
      description: "Intricate lion sculpture made from wire and colorful glass beads. A classic piece of Kenyan artistry.",
      price: 3500,
      categoryId: decor.id,
      brand: "Kazuri Beads",
      images: [getImg("Beaded Wire Sculpture - Lion.jpg")],
      productImages: {
        create: [{ url: getImg("Beaded Wire Sculpture - Lion.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 5,
      sku: "DECO-003",
      condition: "New",
      sizes: { create: [{ size: "Standard", stock: 5 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Banana Fiber Laundry Basket",
      description: "Eco-friendly laundry basket woven from dried banana fibers. Comes with a fitting lid and fabric lining.",
      price: 1800,
      categoryId: decor.id,
      brand: "Natural Weaves",
      images: [getImg("Banana Fiber Laundry Basket.jpg")],
      productImages: {
        create: [{ url: getImg("Banana Fiber Laundry Basket.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 25,
      sku: "DECO-004",
      condition: "New",
      sizes: { create: [{ size: "Large", stock: 25 }] }
    },
  });

  // --- UTILITY ---
  await prisma.product.create({
    data: {
      name: "Custom Heavy Wheelbarrow",
      description: "Construction-grade wheelbarrow with reinforced tub and solid rubber tire. Built for heavy loads on rough terrain.",
      price: 5500,
      categoryId: utility.id,
      brand: "Jenga Tools",
      images: [getImg("Custom Heavy Wheelbarrow.jpg")],
      productImages: {
        create: [{ url: getImg("Custom Heavy Wheelbarrow.jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 12,
      sku: "UTIL-001",
      condition: "New",
      specifications: { capacity: "65 Liters", material: "Steel", tire: "Solid Rubber" },
      sizes: { create: [{ size: "Standard", stock: 12 }] }
    },
  });

  await prisma.product.create({
    data: {
      name: "Poultry House (Chicken Coop)",
      description: "Expertly assembled wooden poultry house with wire mesh ventilation and designated laying nests. Fits ~50 chickens.",
      price: 18000,
      categoryId: utility.id,
      brand: "AgriStructures",
      images: [getImg("Poultry House (Chicken Coop).jpg")],
      productImages: {
        create: [{ url: getImg("Poultry House (Chicken Coop).jpg"), viewType: "FRONT", sortOrder: 0 }]
      },
      stock: 3,
      sku: "UTIL-002",
      featured: true,
      condition: "New",
      sizes: { create: [{ size: "50 Bird Capacity", stock: 3 }] }
    },
  });

  console.log("✅ Seed completed successfully with Local Assets!");
  console.log("📊 Added 15 Juakali products linked to /public/images/products files");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
