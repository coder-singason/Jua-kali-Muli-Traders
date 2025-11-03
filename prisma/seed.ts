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
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create Categories
  console.log("📁 Creating categories...");
  const mensCategory = await prisma.category.create({
    data: {
      name: "Men's Shoes",
      slug: "mens-shoes",
    },
  });

  const womensCategory = await prisma.category.create({
    data: {
      name: "Women's Shoes",
      slug: "womens-shoes",
    },
  });

  const kidsCategory = await prisma.category.create({
    data: {
      name: "Kids' Shoes",
      slug: "kids-shoes",
    },
  });

  const sportsCategory = await prisma.category.create({
    data: {
      name: "Sports & Athletic",
      slug: "sports-athletic",
    },
  });

  const casualCategory = await prisma.category.create({
    data: {
      name: "Casual",
      slug: "casual",
    },
  });

  // Create Products
  console.log("👟 Creating products...");

  // Men's Products
  const product1 = await prisma.product.create({
    data: {
      name: "Classic Leather Sneakers",
      description: "Premium leather sneakers with comfortable cushioning. Perfect for everyday wear. Made with high-quality materials for durability and style.",
      price: 85.99,
      categoryId: mensCategory.id,
      brand: "KicksZone",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
      ],
      stock: 50,
      sku: "MNS-001",
      featured: true,
      sizes: {
        create: [
          { size: "7", stock: 5 },
          { size: "8", stock: 8 },
          { size: "9", stock: 10 },
          { size: "10", stock: 12 },
          { size: "11", stock: 10 },
          { size: "12", stock: 5 },
        ],
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Running Pro Athletics",
      description: "High-performance running shoes with advanced cushioning technology. Ideal for runners and athletes.",
      price: 120.00,
      categoryId: sportsCategory.id,
      brand: "KicksZone Pro",
      images: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      ],
      stock: 30,
      sku: "SPT-001",
      featured: true,
      sizes: {
        create: [
          { size: "7", stock: 3 },
          { size: "8", stock: 5 },
          { size: "9", stock: 8 },
          { size: "10", stock: 7 },
          { size: "11", stock: 5 },
          { size: "12", stock: 2 },
        ],
      },
    },
  });

  // Women's Products
  const product3 = await prisma.product.create({
    data: {
      name: "Elegant High Heels",
      description: "Stylish high heels perfect for formal occasions. Comfortable design with elegant finish.",
      price: 65.50,
      categoryId: womensCategory.id,
      brand: "KicksZone",
      images: [
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      ],
      stock: 40,
      sku: "WMS-001",
      featured: true,
      sizes: {
        create: [
          { size: "5", stock: 4 },
          { size: "6", stock: 6 },
          { size: "7", stock: 8 },
          { size: "8", stock: 10 },
          { size: "9", stock: 8 },
          { size: "10", stock: 4 },
        ],
      },
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: "Comfort Walking Shoes",
      description: "Ultra-comfortable walking shoes designed for all-day wear. Great for casual outings and daily activities.",
      price: 75.00,
      categoryId: casualCategory.id,
      brand: "KicksZone",
      images: [
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800",
      ],
      stock: 45,
      sku: "CSL-001",
      featured: false,
      sizes: {
        create: [
          { size: "6", stock: 5 },
          { size: "7", stock: 7 },
          { size: "8", stock: 10 },
          { size: "9", stock: 12 },
          { size: "10", stock: 8 },
          { size: "11", stock: 3 },
        ],
      },
    },
  });

  // Kids Products
  const product5 = await prisma.product.create({
    data: {
      name: "Kids Running Shoes",
      description: "Durable and comfortable running shoes for kids. Bright colors and fun designs.",
      price: 45.99,
      categoryId: kidsCategory.id,
      brand: "KicksZone Kids",
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      ],
      stock: 60,
      sku: "KDS-001",
      featured: true,
      sizes: {
        create: [
          { size: "3", stock: 8 },
          { size: "4", stock: 10 },
          { size: "5", stock: 12 },
          { size: "6", stock: 15 },
          { size: "7", stock: 10 },
          { size: "8", stock: 5 },
        ],
      },
    },
  });

  // More Men's Products
  const product6 = await prisma.product.create({
    data: {
      name: "Formal Dress Shoes",
      description: "Classic formal dress shoes for business and special occasions. Premium leather construction.",
      price: 95.00,
      categoryId: mensCategory.id,
      brand: "KicksZone",
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
        "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
      ],
      stock: 35,
      sku: "MNS-002",
      featured: false,
      sizes: {
        create: [
          { size: "7", stock: 4 },
          { size: "8", stock: 6 },
          { size: "9", stock: 8 },
          { size: "10", stock: 9 },
          { size: "11", stock: 6 },
          { size: "12", stock: 2 },
        ],
      },
    },
  });

  const product7 = await prisma.product.create({
    data: {
      name: "Basketball High-Tops",
      description: "Performance basketball shoes with ankle support. Designed for court performance.",
      price: 110.00,
      categoryId: sportsCategory.id,
      brand: "KicksZone Pro",
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      ],
      stock: 25,
      sku: "SPT-002",
      featured: false,
      sizes: {
        create: [
          { size: "8", stock: 3 },
          { size: "9", stock: 5 },
          { size: "10", stock: 7 },
          { size: "11", stock: 6 },
          { size: "12", stock: 4 },
        ],
      },
    },
  });

  // More Women's Products
  const product8 = await prisma.product.create({
    data: {
      name: "Casual Flats",
      description: "Comfortable and stylish flats perfect for everyday wear. Versatile design matches any outfit.",
      price: 55.00,
      categoryId: womensCategory.id,
      brand: "KicksZone",
      images: [
        "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800",
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
      ],
      stock: 50,
      sku: "WMS-002",
      featured: false,
      sizes: {
        create: [
          { size: "5", stock: 5 },
          { size: "6", stock: 7 },
          { size: "7", stock: 10 },
          { size: "8", stock: 12 },
          { size: "9", stock: 10 },
          { size: "10", stock: 6 },
        ],
      },
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Created:`);
  console.log(`   - 5 Categories`);
  console.log(`   - 8 Products`);
  console.log(`   - Multiple size variants`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

