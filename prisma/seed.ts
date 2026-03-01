import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const IMAGE_SOURCE_DIRECTORY = path.join(process.cwd(), "assets");
const IMAGE_PUBLIC_DIRECTORY = path.join(process.cwd(), "public", "images", "products");
const IMAGE_WEB_PATH = "/images/products";
const SUPPORTED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const ADMIN_NAME = "admin";
const ADMIN_EMAIL = "admin@juakalimulitraders.com";
const ADMIN_PASSWORD = "admin_juakalimulitraders";

type CategorySlug = "furniture" | "metalwork" | "home-decor" | "construction-utility";

type SeedProduct = {
  name: string;
  description: string;
  price: number;
  categorySlug: CategorySlug;
  brand: string;
  stock: number;
  sku: string;
  featured?: boolean;
  condition?: string;
  specifications?: Record<string, string>;
  deliveryTime?: string;
  warranty?: string;
  sizes: Array<{ size: string; stock: number }>;
};

const categories: Array<{ name: string; slug: CategorySlug }> = [
  { name: "Furniture", slug: "furniture" },
  { name: "Metalwork & Grills", slug: "metalwork" },
  { name: "Home Decor", slug: "home-decor" },
  { name: "Construction & Utility", slug: "construction-utility" },
];

const products: SeedProduct[] = [
  {
    name: "Rustic Pallet Sofa Set",
    description:
      "Handcrafted L-shaped sofa made from treated reclaimed pine pallets. Includes high-density foam cushions with removable, washable canvas covers. Perfect for outdoor lounges or rustic living rooms.",
    price: 35000,
    categorySlug: "furniture",
    brand: "Juakali Woodworks",
    stock: 5,
    sku: "FURN-001",
    featured: true,
    condition: "New",
    specifications: { material: "Pine Wood", cushions: "High Density Foam", capacity: "5 Seater" },
    deliveryTime: "3-5 Days",
    warranty: "1 Year",
    sizes: [{ size: "Standard L-Shape", stock: 5 }],
  },
  {
    name: "Industrial Pipe Coffee Table",
    description:
      "Modern industrial design featuring black galvanized steel pipes and a solid mahogany top with a matte varnish finish.",
    price: 12500,
    categorySlug: "furniture",
    brand: "Urban Metal",
    stock: 8,
    sku: "FURN-002",
    condition: "New",
    specifications: { dimensions: "100cm x 60cm", height: "45cm", wood: "Mahogany" },
    deliveryTime: "2-4 Days",
    warranty: "2 Years",
    sizes: [{ size: "Standard", stock: 8 }],
  },
  {
    name: "Convertible School Desk",
    description:
      "Heavy-duty steel frame desk that converts into a bench. Wooden top made from cypress. Ideal for home schooling or compact spaces.",
    price: 4500,
    categorySlug: "furniture",
    brand: "Elimu Works",
    stock: 20,
    sku: "FURN-003",
    condition: "New",
    deliveryTime: "1-2 Days",
    sizes: [{ size: "Standard", stock: 20 }],
  },
  {
    name: "Woven Reed Chair",
    description:
      "Traditional coastal style chair woven from natural reeds on a hardwood frame. Breathable and comfortable.",
    price: 3800,
    categorySlug: "furniture",
    brand: "Coastal Weaves",
    stock: 12,
    sku: "FURN-004",
    condition: "New",
    deliveryTime: "2-4 Days",
    sizes: [{ size: "Single", stock: 12 }],
  },
  {
    name: "Heavy Duty Steel Gate",
    description:
      "Double-swing steel gate with decorative floral scrollwork. Painted with anti-rust primer and black gloss finish. Installation available.",
    price: 45000,
    categorySlug: "metalwork",
    brand: "Nairobi Steelworks",
    stock: 2,
    sku: "METL-001",
    featured: true,
    condition: "New",
    specifications: { width: "12ft (Standard)", height: "7ft", gauge: "16 Gauge" },
    deliveryTime: "7-10 Days",
    warranty: "5 Years",
    sizes: [{ size: "12ft x 7ft", stock: 2 }],
  },
  {
    name: "Energy Saving Jiko",
    description:
      "Ceramic-lined charcoal stove that retains heat properly, using 50% less charcoal than standard jikos. Durable metal casing.",
    price: 1500,
    categorySlug: "metalwork",
    brand: "EcoJiko",
    stock: 50,
    sku: "METL-002",
    featured: true,
    condition: "New",
    deliveryTime: "1 Day",
    sizes: [
      { size: "Small", stock: 20 },
      { size: "Medium", stock: 20 },
      { size: "Large", stock: 10 },
    ],
  },
  {
    name: "Steel Window Grills",
    description:
      "Custom-made burglar proof window grills. Geometric patterns for modern security. Quote per square meter.",
    price: 3500,
    categorySlug: "metalwork",
    brand: "SecureHome",
    stock: 100,
    sku: "METL-003",
    condition: "New",
    deliveryTime: "3-5 Days",
    sizes: [{ size: "Standard (4x4)", stock: 100 }],
  },
  {
    name: "Commercial BBQ Grill",
    description:
      "Half-drum BBQ grill with stand and side table. Perfect for nyama choma businesses or large family gatherings.",
    price: 8500,
    categorySlug: "metalwork",
    brand: "Choma Master",
    stock: 10,
    sku: "METL-004",
    condition: "New",
    deliveryTime: "2 Days",
    sizes: [{ size: "Large", stock: 10 }],
  },
  {
    name: "Boda Boda Carrier Frame",
    description:
      "Reinforced steel carrier frame for motorcycle deliveries. Welded joints for extra load capacity.",
    price: 2500,
    categorySlug: "metalwork",
    brand: "Thika Welders",
    stock: 15,
    sku: "METL-005",
    condition: "New",
    sizes: [{ size: "Standard", stock: 15 }],
  },
  {
    name: "Recycled Tire Planters",
    description:
      "Vibrant, painted garden planters made from upcycled tires. Available in various colors and shapes (swan, cup, plain).",
    price: 800,
    categorySlug: "home-decor",
    brand: "Green Cycle",
    stock: 30,
    sku: "DECO-001",
    condition: "New",
    sizes: [{ size: "Medium", stock: 30 }],
  },
  {
    name: "Maasai Shuka Fleece Blanket",
    description:
      "Traditional Maasai Shuka fabric backed with warm polar fleece. Ideal for cold evenings or travel.",
    price: 2200,
    categorySlug: "home-decor",
    brand: "Safari Warmth",
    stock: 40,
    sku: "DECO-002",
    featured: true,
    condition: "New",
    sizes: [{ size: "150x200cm", stock: 40 }],
  },
  {
    name: "Beaded Wire Sculpture - Lion",
    description:
      "Intricate lion sculpture made from wire and colorful glass beads. A classic piece of Kenyan artistry.",
    price: 3500,
    categorySlug: "home-decor",
    brand: "Kazuri Beads",
    stock: 5,
    sku: "DECO-003",
    condition: "New",
    sizes: [{ size: "Standard", stock: 5 }],
  },
  {
    name: "Banana Fiber Laundry Basket",
    description:
      "Eco-friendly laundry basket woven from dried banana fibers. Comes with a fitting lid and fabric lining.",
    price: 1800,
    categorySlug: "home-decor",
    brand: "Natural Weaves",
    stock: 25,
    sku: "DECO-004",
    condition: "New",
    sizes: [{ size: "Large", stock: 25 }],
  },
  {
    name: "Custom Heavy Wheelbarrow",
    description:
      "Construction-grade wheelbarrow with reinforced tub and solid rubber tire. Built for heavy loads on rough terrain.",
    price: 5500,
    categorySlug: "construction-utility",
    brand: "Jenga Tools",
    stock: 12,
    sku: "UTIL-001",
    condition: "New",
    specifications: { capacity: "65 Liters", material: "Steel", tire: "Solid Rubber" },
    sizes: [{ size: "Standard", stock: 12 }],
  },
  {
    name: "Poultry House (Chicken Coop)",
    description:
      "Expertly assembled wooden poultry house with wire mesh ventilation and designated laying nests. Fits ~50 chickens.",
    price: 18000,
    categorySlug: "construction-utility",
    brand: "AgriStructures",
    stock: 3,
    sku: "UTIL-002",
    featured: true,
    condition: "New",
    sizes: [{ size: "50 Bird Capacity", stock: 3 }],
  },
];

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildImageIndex(): Map<string, string> {
  const imageIndex = new Map<string, string>();

  if (!fs.existsSync(IMAGE_SOURCE_DIRECTORY)) {
    return imageIndex;
  }

  fs.mkdirSync(IMAGE_PUBLIC_DIRECTORY, { recursive: true });

  for (const entry of fs.readdirSync(IMAGE_SOURCE_DIRECTORY, { withFileTypes: true })) {
    if (!entry.isFile()) continue;

    const extension = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) continue;

    const sourceFilePath = path.join(IMAGE_SOURCE_DIRECTORY, entry.name);
    const publicFilePath = path.join(IMAGE_PUBLIC_DIRECTORY, entry.name);
    fs.copyFileSync(sourceFilePath, publicFilePath);

    const filename = path.basename(entry.name, extension);
    const key = normalizeName(filename);

    if (!key || imageIndex.has(key)) continue;
    imageIndex.set(key, `${IMAGE_WEB_PATH}/${entry.name}`);
  }

  return imageIndex;
}

function getImageFields(productName: string, imageIndex: Map<string, string>, missing: Set<string>) {
  const imageUrl = imageIndex.get(normalizeName(productName));

  if (!imageUrl) {
    missing.add(productName);
    return {};
  }

  return {
    images: [imageUrl],
    productImages: {
      create: [{ url: imageUrl, viewType: "FRONT" as const, sortOrder: 0 }],
    },
  };
}

async function main() {
  console.log("🌱 Starting Juakali database seed with local images...");

  const imageIndex = buildImageIndex();
  const missingImages = new Set<string>();
  console.log(
    `🖼️ Detected ${imageIndex.size} image file(s) in ${IMAGE_SOURCE_DIRECTORY} and synced to ${IMAGE_PUBLIC_DIRECTORY}`
  );

  console.log("🧹 Cleaning existing data...");
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  // Keep existing users so admin access is not removed.
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

  console.log("👤 Seeding admin user...");
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: ADMIN_NAME,
      password: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: adminPasswordHash,
      role: "ADMIN",
    },
  });

  console.log("📁 Creating categories...");
  const categoryMap = new Map<CategorySlug, string>();
  for (const category of categories) {
    const created = await prisma.category.create({
      data: { name: category.name, slug: category.slug },
    });
    categoryMap.set(category.slug, created.id);
  }

  console.log("🛠️ Creating products...");
  for (const product of products) {
    const categoryId = categoryMap.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(`Category not found for slug: ${product.categorySlug}`);
    }

    const imageFields = getImageFields(product.name, imageIndex, missingImages);

    await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId,
        brand: product.brand,
        stock: product.stock,
        sku: product.sku,
        featured: product.featured,
        condition: product.condition,
        specifications: product.specifications,
        deliveryTime: product.deliveryTime,
        warranty: product.warranty,
        ...imageFields,
        sizes: {
          create: product.sizes,
        },
      },
    });
  }

  console.log(`✅ Seed completed successfully. Added ${products.length} products.`);
  console.log(`🔐 Admin user ready: ${ADMIN_EMAIL}`);

  if (missingImages.size > 0) {
    console.log("⚠️ Missing image files for the following products:");
    for (const name of missingImages) {
      console.log(`   - ${name}`);
    }
    console.log(
      "ℹ️ Add image files in /assets named exactly like product names (any supported extension)."
    );
  } else {
    console.log("🖼️ All products were seeded with matching image files.");
  }
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
