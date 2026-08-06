const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prismaSeed = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const adminExists = await prismaSeed.user.findUnique({
    where: { email: "admin@upulstores.lk" },
  });

  if (!adminExists) {
    const hashed = await bcrypt.hash("Admin@123", 12);
    await prismaSeed.user.create({
      data: {
        name: "Upul Admin",
        email: "admin@upulstores.lk",
        password: hashed,
        role: "OWNER",
        phone: "+94771234567",
        isActive: true,
      },
    });
    console.log("✅ Admin user created");
  } else {
    console.log("⏭️ Admin user already exists");
  }

  const categories = [
    { name: "Beverages", slug: "beverages", description: "Drinks and beverages" },
    { name: "Dairy", slug: "dairy", description: "Milk and dairy products" },
    { name: "Groceries", slug: "groceries", description: "Essential groceries" },
    { name: "Household", slug: "household", description: "Household items" },
    { name: "Health", slug: "health", description: "Health and personal care" },
    { name: "Snacks", slug: "snacks", description: "Snacks and confectionery" },
    { name: "Frozen", slug: "frozen", description: "Frozen foods" },
    { name: "Bakery", slug: "bakery", description: "Bread and bakery items" },
  ];

  for (const cat of categories) {
    await prismaSeed.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log("✅ Categories seeded");

  const brands = [
    { name: "Milo", slug: "milo" },
    { name: "Anchor", slug: "anchor" },
    { name: "Sunlight", slug: "sunlight" },
    { name: "Dettol", slug: "dettol" },
    { name: "Maliban", slug: "maliban" },
    { name: "Ceylon Tea", slug: "ceylon-tea" },
    { name: "Keells", slug: "keells" },
    { name: "Prima", slug: "prima" },
  ];

  for (const brand of brands) {
    await prismaSeed.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { ...brand, isActive: true },
    });
  }
  console.log("✅ Brands seeded");

  const suppliers = [
    {
      name: "ABC Distributors",
      phone: "+94112345678",
      email: "abc@distributors.lk",
      company: "ABC Pvt Ltd",
      address: "No.45, Colombo 03",
    },
    {
      name: "Lanka Wholesale",
      phone: "+94113456789",
      email: "info@lankawholesale.lk",
      company: "Lanka Wholesale Ltd",
      address: "No.12, Kandy Road, Colombo",
    },
    {
      name: "Fresh Foods Co",
      phone: "+94114567890",
      email: "fresh@foods.lk",
      company: "Fresh Foods Company",
      address: "No.78, Galle Road",
    },
  ];

  for (const supplier of suppliers) {
    const existing = await prismaSeed.supplier.findFirst({
      where: { phone: supplier.phone },
    });

    if (!existing) {
      await prismaSeed.supplier.create({
        data: { ...supplier, isActive: true },
      });
    }
  }
  console.log("✅ Suppliers seeded");

  const customers = [
    {
      name: "Kamal Perera",
      phone: "+94771234567",
      email: "kamal@email.com",
      membershipLevel: "GOLD",
      loyaltyPoints: 1250,
    },
    {
      name: "Nimal Silva",
      phone: "+94772345678",
      email: "nimal@email.com",
      membershipLevel: "SILVER",
      loyaltyPoints: 560,
    },
    {
      name: "Sunil Fernando",
      phone: "+94773456789",
      email: "sunil@email.com",
      membershipLevel: "BRONZE",
      loyaltyPoints: 120,
    },
    {
      name: "Amali Jayawardena",
      phone: "+94774567890",
      email: "amali@email.com",
      membershipLevel: "PLATINUM",
      loyaltyPoints: 3400,
    },
    {
      name: "Ravi Kumar",
      phone: "+94775678901",
      membershipLevel: "BRONZE",
      loyaltyPoints: 80,
    },
  ];

  for (const customer of customers) {
    const existing = await prismaSeed.customer.findFirst({
      where: { phone: customer.phone },
    });

    if (!existing) {
      await prismaSeed.customer.create({
        data: { ...customer, isActive: true },
      });
    }
  }
  console.log("✅ Customers seeded");

  const settings = [
    { key: "store_name", value: "Upul Stores", description: "Store name" },
    { key: "store_phone", value: "+94771234567", description: "Store phone" },
    { key: "store_email", value: "info@upulstores.lk", description: "Store email" },
    { key: "store_address", value: "No. 123, Main Street, Colombo", description: "Store address" },
    { key: "currency", value: "LKR", description: "Currency code" },
    { key: "currency_symbol", value: "Rs.", description: "Currency symbol" },
    { key: "tax_rate", value: "0", description: "Default tax rate %" },
    { key: "receipt_footer", value: "Thank you for shopping at Upul Stores!", description: "Receipt footer" },
    { key: "low_stock_threshold", value: "10", description: "Low stock alert threshold" },
    { key: "loyalty_points_rate", value: "1", description: "Points per Rs.100" },
  ];

  for (const setting of settings) {
    await prismaSeed.settings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ Settings seeded");

  const notifications = [
    {
      title: "Low Stock Alert",
      message: "5 products are running low on stock. Please reorder soon.",
      type: "LOW_STOCK",
    },
    {
      title: "Welcome to Upul Stores POS",
      message: "Your POS system is ready to use. Start by adding products.",
      type: "SYSTEM",
    },
    {
      title: "Daily Report Ready",
      message: "Today's sales report is ready for review.",
      type: "DAILY_REPORT",
    },
  ];

  for (const notif of notifications) {
    await prismaSeed.notification.create({ data: notif });
  }
  console.log("✅ Notifications seeded");

  const beveragesCat = await prismaSeed.category.findUnique({
    where: { slug: "beverages" },
  });
  const dairyCat = await prismaSeed.category.findUnique({
    where: { slug: "dairy" },
  });
  const groceriesCat = await prismaSeed.category.findUnique({
    where: { slug: "groceries" },
  });
  const healthCat = await prismaSeed.category.findUnique({
    where: { slug: "health" },
  });
  const householdCat = await prismaSeed.category.findUnique({
    where: { slug: "household" },
  });

  const miloBrand = await prismaSeed.brand.findUnique({ where: { slug: "milo" } });
  const anchorBrand = await prismaSeed.brand.findUnique({ where: { slug: "anchor" } });
  const dettolBrand = await prismaSeed.brand.findUnique({ where: { slug: "dettol" } });
  const sunlightBrand = await prismaSeed.brand.findUnique({ where: { slug: "sunlight" } });
  const ceylonTeaBrand = await prismaSeed.brand.findUnique({ where: { slug: "ceylon-tea" } });

  const supplier = await prismaSeed.supplier.findFirst();

  const products = [
    {
      name: "Milo 400g",
      slug: "milo-400g",
      sku: "MIL-400-001",
      barcode: "4891234567890",
      categoryId: beveragesCat?.id ?? "",
      brandId: miloBrand?.id,
      supplierId: supplier?.id,
      purchasePrice: 750,
      sellingPrice: 900,
      quantity: 42,
      minimumStock: 10,
      unit: "pcs",
      status: "ACTIVE",
    },
    {
      name: "Anchor Milk 1L",
      slug: "anchor-milk-1l",
      sku: "ANC-MLK-001",
      barcode: "4891234567891",
      categoryId: dairyCat?.id ?? "",
      brandId: anchorBrand?.id,
      supplierId: supplier?.id,
      purchasePrice: 450,
      sellingPrice: 550,
      quantity: 15,
      minimumStock: 20,
      unit: "pcs",
      status: "ACTIVE",
    },
    {
      name: "Red Rice 5kg",
      slug: "red-rice-5kg",
      sku: "RIC-RED-001",
      barcode: "4891234567892",
      categoryId: groceriesCat?.id ?? "",
      supplierId: supplier?.id,
      purchasePrice: 2200,
      sellingPrice: 2500,
      quantity: 28,
      minimumStock: 15,
      unit: "bag",
      status: "ACTIVE",
    },
    {
      name: "Dettol 250ml",
      slug: "dettol-250ml",
      sku: "DET-250-001",
      barcode: "4891234567893",
      categoryId: healthCat?.id ?? "",
      brandId: dettolBrand?.id,
      supplierId: supplier?.id,
      purchasePrice: 520,
      sellingPrice: 600,
      quantity: 0,
      minimumStock: 10,
      unit: "pcs",
      status: "ACTIVE",
    },
    {
      name: "Sunlight Soap 90g",
      slug: "sunlight-soap-90g",
      sku: "SUN-SOP-001",
      barcode: "4891234567894",
      categoryId: householdCat?.id ?? "",
      brandId: sunlightBrand?.id,
      supplierId: supplier?.id,
      purchasePrice: 100,
      sellingPrice: 150,
      quantity: 6,
      minimumStock: 20,
      unit: "pcs",
      status: "ACTIVE",
    },
    {
      name: "Ceylon Tea 200g",
      slug: "ceylon-tea-200g",
      sku: "TEA-200-001",
      barcode: "4891234567895",
      categoryId: beveragesCat?.id ?? "",
      brandId: ceylonTeaBrand?.id,
      supplierId: supplier?.id,
      purchasePrice: 380,
      sellingPrice: 480,
      quantity: 4,
      minimumStock: 15,
      unit: "pcs",
      status: "ACTIVE",
    },
    {
      name: "Coconut Oil 500ml",
      slug: "coconut-oil-500ml",
      sku: "COC-OIL-001",
      barcode: "4891234567896",
      categoryId: groceriesCat?.id ?? "",
      supplierId: supplier?.id,
      purchasePrice: 600,
      sellingPrice: 750,
      quantity: 8,
      minimumStock: 10,
      unit: "pcs",
      status: "ACTIVE",
    },
    {
      name: "Sugar 1kg",
      slug: "sugar-1kg",
      sku: "SUG-1KG-001",
      barcode: "4891234567897",
      categoryId: groceriesCat?.id ?? "",
      supplierId: supplier?.id,
      purchasePrice: 200,
      sellingPrice: 250,
      quantity: 5,
      minimumStock: 20,
      unit: "pcs",
      status: "ACTIVE",
    },
  ];

  for (const product of products) {
    const existing = await prismaSeed.product.findUnique({
      where: { sku: product.sku },
    });

    if (!existing && product.categoryId) {
      await prismaSeed.product.create({ data: product });
    }
  }
  console.log("✅ Products seeded");

  const warehouseExists = await prismaSeed.warehouse.findFirst();
  if (!warehouseExists) {
    await prismaSeed.warehouse.create({
      data: {
        name: "Main Warehouse",
        location: "Colombo",
        isActive: true,
      },
    });
  }
  console.log("✅ Warehouse seeded");

  const couponExists = await prismaSeed.coupon.findUnique({
    where: { code: "WELCOME10" },
  });

  if (!couponExists) {
    await prismaSeed.coupon.create({
      data: {
        code: "WELCOME10",
        description: "Welcome discount 10%",
        discountType: "percentage",
        discountValue: 10,
        minimumAmount: 500,
        usageLimit: 100,
        isActive: true,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      },
    });
  }
  console.log("✅ Coupon seeded");

  console.log("\n🎉 Database seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Email   : admin@upulstores.lk");
  console.log("🔑 Password: Admin@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaSeed.$disconnect();
  });

export {};