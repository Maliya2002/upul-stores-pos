import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prismaSeed = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── 1. Admin User ──────────────────────────────────────────
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
    console.log("⏭️  Admin already exists");
  }

  // ── 2. Extra Staff Users ───────────────────────────────────
  const staffUsers = [
    { name: "Kasun Manager", email: "kasun@upulstores.lk", role: "MANAGER" as const, phone: "+94772222222" },
    { name: "Nimal Cashier", email: "nimal@upulstores.lk", role: "CASHIER" as const, phone: "+94773333333" },
    { name: "Saman Stock", email: "saman@upulstores.lk", role: "INVENTORY_STAFF" as const, phone: "+94774444444" },
  ];

  for (const staff of staffUsers) {
    const exists = await prismaSeed.user.findUnique({ where: { email: staff.email } });
    if (!exists) {
      const hashed = await bcrypt.hash("Staff@123", 12);
      await prismaSeed.user.create({
        data: { ...staff, password: hashed, isActive: true },
      });
    }
  }
  console.log("✅ Staff users seeded");

  // ── 3. Categories ──────────────────────────────────────────
  const categories = [
    { name: "Beverages", slug: "beverages", description: "Drinks and beverages" },
    { name: "Dairy", slug: "dairy", description: "Milk and dairy products" },
    { name: "Groceries", slug: "groceries", description: "Essential groceries" },
    { name: "Household", slug: "household", description: "Household items" },
    { name: "Health", slug: "health", description: "Health and personal care" },
    { name: "Snacks", slug: "snacks", description: "Snacks and confectionery" },
    { name: "Frozen", slug: "frozen", description: "Frozen foods" },
    { name: "Bakery", slug: "bakery", description: "Bread and bakery items" },
    { name: "Spices", slug: "spices", description: "Spices and condiments" },
    { name: "Stationery", slug: "stationery", description: "Office and school supplies" },
  ];

  for (const cat of categories) {
    await prismaSeed.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { ...cat, isActive: true },
    });
  }
  console.log("✅ Categories seeded");

  // ── 4. Brands ──────────────────────────────────────────────
  const brands = [
    { name: "Milo", slug: "milo" },
    { name: "Anchor", slug: "anchor" },
    { name: "Sunlight", slug: "sunlight" },
    { name: "Dettol", slug: "dettol" },
    { name: "Maliban", slug: "maliban" },
    { name: "Ceylon Tea", slug: "ceylon-tea" },
    { name: "Keells", slug: "keells" },
    { name: "Prima", slug: "prima" },
    { name: "Raigam", slug: "raigam" },
    { name: "Elephant House", slug: "elephant-house" },
  ];

  for (const brand of brands) {
    await prismaSeed.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { ...brand, isActive: true },
    });
  }
  console.log("✅ Brands seeded");

  // ── 5. Suppliers ───────────────────────────────────────────
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
    {
      name: "Southern Traders",
      phone: "+94115678901",
      email: "info@southerntraders.lk",
      company: "Southern Traders Ltd",
      address: "Matara Road, Kamburupitiya",
    },
  ];

  for (const supplier of suppliers) {
    const existing = await prismaSeed.supplier.findFirst({
      where: { phone: supplier.phone },
    });
    if (!existing) {
      await prismaSeed.supplier.create({ data: { ...supplier, isActive: true } });
    }
  }
  console.log("✅ Suppliers seeded");

  // ── 6. Customers ───────────────────────────────────────────
  const customers = [
    { name: "Kamal Perera", phone: "+94771111111", email: "kamal@email.com", membershipLevel: "GOLD" as const, loyaltyPoints: 1250 },
    { name: "Nimal Silva", phone: "+94772222222", email: "nimal@email.com", membershipLevel: "SILVER" as const, loyaltyPoints: 560 },
    { name: "Sunil Fernando", phone: "+94773333333", email: "sunil@email.com", membershipLevel: "BRONZE" as const, loyaltyPoints: 120 },
    { name: "Amali Jayawardena", phone: "+94774444444", email: "amali@email.com", membershipLevel: "PLATINUM" as const, loyaltyPoints: 3400 },
    { name: "Ravi Kumar", phone: "+94775555555", membershipLevel: "BRONZE" as const, loyaltyPoints: 80 },
    { name: "Dilini Perera", phone: "+94776666666", email: "dilini@email.com", membershipLevel: "SILVER" as const, loyaltyPoints: 890 },
    { name: "Chamara Bandara", phone: "+94777777777", membershipLevel: "GOLD" as const, loyaltyPoints: 2100 },
    { name: "Sanduni De Silva", phone: "+94778888888", email: "sanduni@email.com", membershipLevel: "BRONZE" as const, loyaltyPoints: 200 },
  ];
for (const customer of customers) {
  const existing = await prismaSeed.customer.findFirst({
    where: {
      OR: [
        customer.phone ? { phone: customer.phone } : undefined,
        customer.email ? { email: customer.email } : undefined,
      ].filter(Boolean) as Array<
        | { phone: string }
        | { email: string }
      >,
    },
  });

  if (existing) {
    await prismaSeed.customer.update({
      where: { id: existing.id },
      data: {
        name: customer.name,
        phone: customer.phone ?? null,
        email: customer.email ?? null,
        membershipLevel: customer.membershipLevel,
        loyaltyPoints: customer.loyaltyPoints,
        isActive: true,
      },
    });
  } else {
    await prismaSeed.customer.create({
      data: {
        ...customer,
        isActive: true,
      },
    });
  }
}
console.log("✅ Customers seeded");

  // ── 7. Settings ────────────────────────────────────────────
  const settings = [
    { key: "store_name", value: "Upul Stores", description: "Store name" },
    { key: "store_phone", value: "+94771234567", description: "Store phone" },
    { key: "store_email", value: "info@upulstores.lk", description: "Store email" },
    { key: "store_address", value: "Boraluketiya Junction, Kamburupitiya, Matara", description: "Store address" },
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

  // ── 8. Notifications ───────────────────────────────────────
  await prismaSeed.notification.deleteMany();

  const notifications = [
    { title: "Low Stock Alert", message: "5 products are running low on stock.", type: "LOW_STOCK" as const },
    { title: "Welcome to Upul Stores POS", message: "Your POS system is ready.", type: "SYSTEM" as const },
    { title: "Daily Report Ready", message: "Today's sales report is ready.", type: "DAILY_REPORT" as const },
    { title: "Expiry Alert", message: "3 products expiring this week.", type: "EXPIRY_ALERT" as const },
  ];

  for (const notif of notifications) {
    await prismaSeed.notification.create({ data: notif });
  }
  console.log("✅ Notifications seeded");

  // ── 9. Products ────────────────────────────────────────────
  const beveragesCat = await prismaSeed.category.findUnique({ where: { slug: "beverages" } });
  const dairyCat = await prismaSeed.category.findUnique({ where: { slug: "dairy" } });
  const groceriesCat = await prismaSeed.category.findUnique({ where: { slug: "groceries" } });
  const healthCat = await prismaSeed.category.findUnique({ where: { slug: "health" } });
  const householdCat = await prismaSeed.category.findUnique({ where: { slug: "household" } });
  const snacksCat = await prismaSeed.category.findUnique({ where: { slug: "snacks" } });

  const miloBrand = await prismaSeed.brand.findUnique({ where: { slug: "milo" } });
  const anchorBrand = await prismaSeed.brand.findUnique({ where: { slug: "anchor" } });
  const dettolBrand = await prismaSeed.brand.findUnique({ where: { slug: "dettol" } });
  const sunlightBrand = await prismaSeed.brand.findUnique({ where: { slug: "sunlight" } });
  const ceylonTeaBrand = await prismaSeed.brand.findUnique({ where: { slug: "ceylon-tea" } });
  const malibanBrand = await prismaSeed.brand.findUnique({ where: { slug: "maliban" } });

  const supplier = await prismaSeed.supplier.findFirst();

  const products = [
    { name: "Milo 400g", slug: "milo-400g", sku: "MIL-400-001", barcode: "4891234567890", categoryId: beveragesCat?.id ?? "", brandId: miloBrand?.id, supplierId: supplier?.id, purchasePrice: 750, sellingPrice: 900, quantity: 42, minimumStock: 10, unit: "pcs", status: "ACTIVE" as const },
    { name: "Anchor Milk 1L", slug: "anchor-milk-1l", sku: "ANC-MLK-001", barcode: "4891234567891", categoryId: dairyCat?.id ?? "", brandId: anchorBrand?.id, supplierId: supplier?.id, purchasePrice: 450, sellingPrice: 550, quantity: 15, minimumStock: 20, unit: "pcs", status: "ACTIVE" as const },
    { name: "Red Rice 5kg", slug: "red-rice-5kg", sku: "RIC-RED-001", barcode: "4891234567892", categoryId: groceriesCat?.id ?? "", supplierId: supplier?.id, purchasePrice: 2200, sellingPrice: 2500, quantity: 28, minimumStock: 15, unit: "bag", status: "ACTIVE" as const },
    { name: "Dettol 250ml", slug: "dettol-250ml", sku: "DET-250-001", barcode: "4891234567893", categoryId: healthCat?.id ?? "", brandId: dettolBrand?.id, supplierId: supplier?.id, purchasePrice: 520, sellingPrice: 600, quantity: 0, minimumStock: 10, unit: "pcs", status: "ACTIVE" as const },
    { name: "Sunlight Soap 90g", slug: "sunlight-soap-90g", sku: "SUN-SOP-001", barcode: "4891234567894", categoryId: householdCat?.id ?? "", brandId: sunlightBrand?.id, supplierId: supplier?.id, purchasePrice: 100, sellingPrice: 150, quantity: 6, minimumStock: 20, unit: "pcs", status: "ACTIVE" as const },
    { name: "Ceylon Tea 200g", slug: "ceylon-tea-200g", sku: "TEA-200-001", barcode: "4891234567895", categoryId: beveragesCat?.id ?? "", brandId: ceylonTeaBrand?.id, supplierId: supplier?.id, purchasePrice: 380, sellingPrice: 480, quantity: 4, minimumStock: 15, unit: "pcs", status: "ACTIVE" as const },
    { name: "Coconut Oil 500ml", slug: "coconut-oil-500ml", sku: "COC-OIL-001", barcode: "4891234567896", categoryId: groceriesCat?.id ?? "", supplierId: supplier?.id, purchasePrice: 600, sellingPrice: 750, quantity: 8, minimumStock: 10, unit: "pcs", status: "ACTIVE" as const },
    { name: "Sugar 1kg", slug: "sugar-1kg", sku: "SUG-1KG-001", barcode: "4891234567897", categoryId: groceriesCat?.id ?? "", supplierId: supplier?.id, purchasePrice: 200, sellingPrice: 250, quantity: 5, minimumStock: 20, unit: "pcs", status: "ACTIVE" as const },
    { name: "Maliban Cream Cracker", slug: "maliban-cream-cracker", sku: "MAL-CRK-001", barcode: "4891234567898", categoryId: snacksCat?.id ?? "", brandId: malibanBrand?.id, supplierId: supplier?.id, purchasePrice: 180, sellingPrice: 220, quantity: 35, minimumStock: 15, unit: "pcs", status: "ACTIVE" as const },
    { name: "Wheat Flour 1kg", slug: "wheat-flour-1kg", sku: "FLR-WHT-001", barcode: "4891234567899", categoryId: groceriesCat?.id ?? "", supplierId: supplier?.id, purchasePrice: 160, sellingPrice: 200, quantity: 2, minimumStock: 30, unit: "pcs", status: "ACTIVE" as const },
    { name: "Dhal 500g", slug: "dhal-500g", sku: "DHL-500-001", barcode: "4891234567900", categoryId: groceriesCat?.id ?? "", supplierId: supplier?.id, purchasePrice: 280, sellingPrice: 350, quantity: 22, minimumStock: 10, unit: "pcs", status: "ACTIVE" as const },
    { name: "Toothpaste 120g", slug: "toothpaste-120g", sku: "TPT-120-001", barcode: "4891234567901", categoryId: healthCat?.id ?? "", supplierId: supplier?.id, purchasePrice: 180, sellingPrice: 250, quantity: 30, minimumStock: 10, unit: "pcs", status: "ACTIVE" as const },
  ];

  for (const product of products) {
    const existing = await prismaSeed.product.findUnique({ where: { sku: product.sku } });
    if (!existing && product.categoryId) {
      await prismaSeed.product.create({ data: product });
    }
  }
  console.log("✅ Products seeded");

  // ── 10. Warehouse ──────────────────────────────────────────
  const warehouseExists = await prismaSeed.warehouse.findFirst();
  if (!warehouseExists) {
    await prismaSeed.warehouse.create({
      data: { name: "Main Warehouse", location: "Kamburupitiya", isActive: true },
    });
  }
  console.log("✅ Warehouse seeded");

  // ── 11. Coupons ────────────────────────────────────────────
  const coupons = [
    { code: "WELCOME10", description: "Welcome 10% off", discountType: "percentage", discountValue: 10, minimumAmount: 500, usageLimit: 100 },
    { code: "SAVE500", description: "Rs.500 off on Rs.5000+", discountType: "fixed", discountValue: 500, minimumAmount: 5000, usageLimit: 50 },
    { code: "LOYALTY20", description: "Loyalty 20% off", discountType: "percentage", discountValue: 20, minimumAmount: 1000, usageLimit: 200 },
  ];

  for (const coupon of coupons) {
    const exists = await prismaSeed.coupon.findUnique({ where: { code: coupon.code } });
    if (!exists) {
      await prismaSeed.coupon.create({
        data: {
          ...coupon,
          isActive: true,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
        },
      });
    }
  }
  console.log("✅ Coupons seeded");

  // ── 12. Expenses (Sample) ─────────────────────────────────
  const expenses = [
    { title: "Electricity Bill - June", amount: 15000, category: "ELECTRICITY" as const },
    { title: "Internet - June", amount: 3500, category: "INTERNET" as const },
    { title: "Shop Rent - June", amount: 45000, category: "RENT" as const },
    { title: "Transport Cost", amount: 5000, category: "TRANSPORT" as const },
  ];

  for (const expense of expenses) {
    await prismaSeed.expense.create({ data: expense });
  }
  console.log("✅ Sample expenses seeded");

  // ── Done ───────────────────────────────────────────────────
  console.log("\n🎉 Database seeding complete!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Admin    : admin@upulstores.lk / Admin@123");
  console.log("📧 Manager  : kasun@upulstores.lk / Staff@123");
  console.log("📧 Cashier  : nimal@upulstores.lk / Staff@123");
  console.log("📧 Stock    : saman@upulstores.lk / Staff@123");
  console.log("🏪 Address  : Boraluketiya Junction, Kamburupitiya, Matara");
  console.log("🎟️  Coupons  : WELCOME10, SAVE500, LOYALTY20");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaSeed.$disconnect();
  });