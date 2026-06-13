import { PrismaClient, Category } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const retailers = [
  { name: "Amazon", slug: "amazon", website: "https://amazon.com", logo: "/logos/amazon.svg" },
  { name: "Newegg", slug: "newegg", website: "https://newegg.com", logo: "/logos/newegg.svg" },
  { name: "Best Buy", slug: "bestbuy", website: "https://bestbuy.com", logo: "/logos/bestbuy.svg" },
  { name: "B&H Photo", slug: "bhphoto", website: "https://bhphotovideo.com", logo: "/logos/bh.svg" },
  { name: "Micro Center", slug: "microcenter", website: "https://microcenter.com", logo: "/logos/mc.svg" },
  { name: "Walmart", slug: "walmart", website: "https://walmart.com", logo: "/logos/walmart.svg" },
];

const products = [
  // CPUs
  {
    name: "AMD Ryzen 9 9950X",
    slug: "amd-ryzen-9-9950x",
    brand: "AMD",
    model: "Ryzen 9 9950X",
    category: Category.CPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Ryzen+9+9950X",
    description: "AMD's flagship consumer CPU with 16 cores and 32 threads for extreme performance.",
    specs: { cores: 16, threads: 32, baseClock: "4.3 GHz", boostClock: "5.7 GHz", tdp: "170W", socket: "AM5", cache: "80MB" },
    basePrice: 649.99,
  },
  {
    name: "AMD Ryzen 7 9700X",
    slug: "amd-ryzen-7-9700x",
    brand: "AMD",
    model: "Ryzen 7 9700X",
    category: Category.CPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Ryzen+7+9700X",
    description: "8-core, 16-thread processor with Zen 5 architecture for excellent gaming and productivity.",
    specs: { cores: 8, threads: 16, baseClock: "3.8 GHz", boostClock: "5.5 GHz", tdp: "65W", socket: "AM5", cache: "40MB" },
    basePrice: 359.99,
  },
  {
    name: "Intel Core Ultra 9 285K",
    slug: "intel-core-ultra-9-285k",
    brand: "Intel",
    model: "Core Ultra 9 285K",
    category: Category.CPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Core+Ultra+9+285K",
    description: "Intel's Arrow Lake flagship with 24 cores and Intel Arc integrated graphics.",
    specs: { cores: 24, threads: 24, baseClock: "3.7 GHz", boostClock: "5.7 GHz", tdp: "125W", socket: "LGA1851", cache: "36MB" },
    basePrice: 589.99,
  },
  {
    name: "Intel Core i5-14600K",
    slug: "intel-core-i5-14600k",
    brand: "Intel",
    model: "Core i5-14600K",
    category: Category.CPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=i5-14600K",
    description: "Best-in-class gaming CPU with 14 cores offering incredible price-to-performance.",
    specs: { cores: 14, threads: 20, baseClock: "3.5 GHz", boostClock: "5.3 GHz", tdp: "125W", socket: "LGA1700", cache: "24MB" },
    basePrice: 279.99,
  },

  // GPUs
  {
    name: "NVIDIA GeForce RTX 5090",
    slug: "nvidia-rtx-5090",
    brand: "NVIDIA",
    model: "RTX 5090",
    category: Category.GPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=RTX+5090",
    description: "NVIDIA's most powerful consumer GPU with Blackwell architecture and 32GB GDDR7.",
    specs: { vram: "32GB GDDR7", cudaCores: 21760, boostClock: "2.41 GHz", tdp: "575W", busInterface: "PCIe 5.0 x16" },
    basePrice: 1999.99,
  },
  {
    name: "NVIDIA GeForce RTX 5080",
    slug: "nvidia-rtx-5080",
    brand: "NVIDIA",
    model: "RTX 5080",
    category: Category.GPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=RTX+5080",
    description: "High-end Blackwell GPU with 16GB GDDR7 for 4K gaming and AI workloads.",
    specs: { vram: "16GB GDDR7", cudaCores: 10752, boostClock: "2.62 GHz", tdp: "360W", busInterface: "PCIe 5.0 x16" },
    basePrice: 999.99,
  },
  {
    name: "AMD Radeon RX 9070 XT",
    slug: "amd-rx-9070-xt",
    brand: "AMD",
    model: "Radeon RX 9070 XT",
    category: Category.GPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=RX+9070+XT",
    description: "RDNA 4 architecture GPU offering competitive 4K performance at a compelling price.",
    specs: { vram: "16GB GDDR6", streamProcessors: 4096, boostClock: "2.97 GHz", tdp: "304W", busInterface: "PCIe 5.0 x16" },
    basePrice: 549.99,
  },
  {
    name: "NVIDIA GeForce RTX 4070 Super",
    slug: "nvidia-rtx-4070-super",
    brand: "NVIDIA",
    model: "RTX 4070 Super",
    category: Category.GPU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=RTX+4070+Super",
    description: "Ada Lovelace architecture for excellent 1440p gaming performance.",
    specs: { vram: "12GB GDDR6X", cudaCores: 7168, boostClock: "2.48 GHz", tdp: "220W", busInterface: "PCIe 4.0 x16" },
    basePrice: 599.99,
  },

  // Motherboards
  {
    name: "ASUS ROG Crosshair X870E Hero",
    slug: "asus-rog-crosshair-x870e-hero",
    brand: "ASUS",
    model: "ROG Crosshair X870E Hero",
    category: Category.MOTHERBOARD,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=ROG+Crosshair",
    description: "Premium AM5 motherboard with X870E chipset for ultimate Ryzen 9000 performance.",
    specs: { socket: "AM5", chipset: "X870E", formFactor: "ATX", memorySlots: 4, maxMemory: "256GB", m2Slots: 5 },
    basePrice: 499.99,
  },
  {
    name: "MSI MAG B650 Tomahawk WiFi",
    slug: "msi-mag-b650-tomahawk-wifi",
    brand: "MSI",
    model: "MAG B650 Tomahawk WiFi",
    category: Category.MOTHERBOARD,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=B650+Tomahawk",
    description: "Feature-packed B650 board with WiFi 6E for Ryzen 7000/9000 CPUs.",
    specs: { socket: "AM5", chipset: "B650", formFactor: "ATX", memorySlots: 4, maxMemory: "128GB", m2Slots: 3 },
    basePrice: 199.99,
  },

  // RAM
  {
    name: "G.SKILL Trident Z5 RGB 32GB DDR5-6400",
    slug: "gskill-trident-z5-rgb-32gb-ddr5-6400",
    brand: "G.SKILL",
    model: "Trident Z5 RGB",
    category: Category.RAM,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Trident+Z5",
    description: "High-performance DDR5 kit with RGB lighting for enthusiast builds.",
    specs: { capacity: "32GB", type: "DDR5", speed: "6400 MT/s", latency: "CL32", kit: "2x16GB", voltage: "1.35V" },
    basePrice: 119.99,
  },
  {
    name: "Corsair Vengeance 64GB DDR5-5600",
    slug: "corsair-vengeance-64gb-ddr5-5600",
    brand: "Corsair",
    model: "Vengeance DDR5",
    category: Category.RAM,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Corsair+Vengeance",
    description: "High-capacity DDR5 memory for content creators and multitaskers.",
    specs: { capacity: "64GB", type: "DDR5", speed: "5600 MT/s", latency: "CL40", kit: "2x32GB", voltage: "1.25V" },
    basePrice: 149.99,
  },

  // SSDs
  {
    name: "Samsung 990 Pro 2TB NVMe",
    slug: "samsung-990-pro-2tb",
    brand: "Samsung",
    model: "990 Pro",
    category: Category.SSD,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=990+Pro+2TB",
    description: "Samsung's flagship NVMe SSD with exceptional sequential and random performance.",
    specs: { capacity: "2TB", interface: "PCIe 4.0 x4", formFactor: "M.2 2280", readSpeed: "7450 MB/s", writeSpeed: "6900 MB/s", nandType: "V-NAND TLC" },
    basePrice: 149.99,
  },
  {
    name: "WD Black SN850X 4TB NVMe",
    slug: "wd-black-sn850x-4tb",
    brand: "Western Digital",
    model: "Black SN850X",
    category: Category.SSD,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=SN850X+4TB",
    description: "High-capacity PCIe Gen4 NVMe for gamers and professionals.",
    specs: { capacity: "4TB", interface: "PCIe 4.0 x4", formFactor: "M.2 2280", readSpeed: "7300 MB/s", writeSpeed: "6600 MB/s", nandType: "TLC" },
    basePrice: 279.99,
  },

  // HDDs
  {
    name: "Seagate Barracuda 4TB HDD",
    slug: "seagate-barracuda-4tb",
    brand: "Seagate",
    model: "Barracuda",
    category: Category.HDD,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Barracuda+4TB",
    description: "Reliable 3.5-inch desktop hard drive for bulk storage needs.",
    specs: { capacity: "4TB", rpm: 5400, interface: "SATA 6Gb/s", cache: "256MB", formFactor: "3.5-inch" },
    basePrice: 79.99,
  },

  // PSUs
  {
    name: "Corsair RM1000x 1000W 80+ Gold",
    slug: "corsair-rm1000x-1000w",
    brand: "Corsair",
    model: "RM1000x",
    category: Category.PSU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=RM1000x",
    description: "Fully modular 1000W PSU with 80+ Gold efficiency and zero RPM fan mode.",
    specs: { wattage: "1000W", efficiency: "80+ Gold", modular: "Fully Modular", fanSize: "135mm", warranty: "10 years" },
    basePrice: 189.99,
  },
  {
    name: "be quiet! Straight Power 12 850W",
    slug: "be-quiet-straight-power-12-850w",
    brand: "be quiet!",
    model: "Straight Power 12",
    category: Category.PSU,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Straight+Power+12",
    description: "Premium 850W PSU with 80+ Platinum efficiency and ultra-silent operation.",
    specs: { wattage: "850W", efficiency: "80+ Platinum", modular: "Fully Modular", fanSize: "135mm", warranty: "10 years" },
    basePrice: 149.99,
  },

  // Cases
  {
    name: "Fractal Design North XL",
    slug: "fractal-design-north-xl",
    brand: "Fractal Design",
    model: "North XL",
    category: Category.CASE,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=North+XL",
    description: "Elegant full-tower case with walnut wood front panel and excellent airflow.",
    specs: { formFactor: "Full Tower", maxGPULength: "491mm", maxCoolerHeight: "188mm", driveBays: "6", includedFans: 3 },
    basePrice: 189.99,
  },
  {
    name: "Lian Li PC-O11 Dynamic EVO",
    slug: "lian-li-o11-dynamic-evo",
    brand: "Lian Li",
    model: "PC-O11 Dynamic EVO",
    category: Category.CASE,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=O11+Dynamic+EVO",
    description: "Dual chamber mid-tower case for maximum cooling flexibility and aesthetics.",
    specs: { formFactor: "Mid Tower", maxGPULength: "420mm", maxCoolerHeight: "167mm", driveBays: "8", includedFans: 0 },
    basePrice: 149.99,
  },

  // CPU Coolers
  {
    name: "Noctua NH-D15 G2",
    slug: "noctua-nh-d15-g2",
    brand: "Noctua",
    model: "NH-D15 G2",
    category: Category.COOLER,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=NH-D15+G2",
    description: "The gold standard dual-tower air cooler with updated design and exceptional performance.",
    specs: { type: "Air", height: "168mm", fans: "2x 140mm", tdp: "300W+", sockets: "LGA1700/AM5/AM4" },
    basePrice: 119.99,
  },
  {
    name: "ARCTIC Liquid Freezer III 360",
    slug: "arctic-liquid-freezer-iii-360",
    brand: "ARCTIC",
    model: "Liquid Freezer III 360",
    category: Category.COOLER,
    image: "https://placehold.co/400x400/1e1e28/60a5fa?text=Freezer+III+360",
    description: "High-performance 360mm AIO with included VRM fan and competitive pricing.",
    specs: { type: "AIO Liquid", radiatorSize: "360mm", fans: "3x 120mm", tdp: "300W+", sockets: "LGA1700/AM5/AM4" },
    basePrice: 99.99,
  },
];

function generatePriceHistory(basePrice: number, days: number): { price: number; date: Date }[] {
  const history: { price: number; date: Date }[] = [];
  let currentPrice = basePrice * (0.9 + Math.random() * 0.2);

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.5) * 0.04 * currentPrice;
    currentPrice = Math.max(basePrice * 0.6, Math.min(basePrice * 1.4, currentPrice + change));
    history.push({ price: parseFloat(currentPrice.toFixed(2)), date });
  }
  return history;
}

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.fetchLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.price.deleteMany();
  await prisma.product.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.user.deleteMany();

  const createdRetailers = await Promise.all(
    retailers.map((r) => prisma.retailer.create({ data: r }))
  );
  console.log(`✅ Created ${createdRetailers.length} retailers`);

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@pcpricetracker.com",
      password: await bcrypt.hash("admin123", 12),
      role: "ADMIN",
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email}`);

  const testUser = await prisma.user.create({
    data: {
      name: "Test User",
      email: "user@pcpricetracker.com",
      password: await bcrypt.hash("user123", 12),
      role: "USER",
    },
  });
  console.log(`✅ Created test user: ${testUser.email}`);

  for (const product of products) {
    const { basePrice, ...productData } = product;

    const createdProduct = await prisma.product.create({ data: productData });

    for (const retailer of createdRetailers) {
      const variance = (Math.random() * 0.15 - 0.02);
      const retailerPrice = parseFloat((basePrice * (1 + variance)).toFixed(2));
      const inStock = Math.random() > 0.15;

      const slug = productData.slug;
      const urlMap: Record<string, string> = {
        amazon: `https://amazon.com/s?k=${encodeURIComponent(productData.name)}`,
        newegg: `https://newegg.com/p/pl?d=${encodeURIComponent(productData.name)}`,
        bestbuy: `https://bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(productData.name)}`,
        bhphoto: `https://bhphotovideo.com/c/search?q=${encodeURIComponent(productData.name)}`,
        microcenter: `https://microcenter.com/search/search_results.aspx?Ntx=mode+matchallpartial&Ntk=all&N=4294967288&myStore=false&query=${encodeURIComponent(productData.name)}`,
        walmart: `https://walmart.com/search?q=${encodeURIComponent(productData.name)}`,
      };

      await prisma.price.create({
        data: {
          productId: createdProduct.id,
          retailerId: retailer.id,
          price: retailerPrice,
          originalPrice: Math.random() > 0.7 ? parseFloat((retailerPrice * 1.1).toFixed(2)) : null,
          url: urlMap[retailer.slug] || `https://${retailer.website}`,
          inStock,
        },
      });

      const history = generatePriceHistory(retailerPrice, 90);
      await prisma.priceHistory.createMany({
        data: history.map((h) => ({
          productId: createdProduct.id,
          retailerId: retailer.id,
          price: h.price,
          inStock,
          recordedAt: h.date,
        })),
      });
    }

    if (Math.random() > 0.5) {
      await prisma.favorite.create({
        data: { userId: testUser.id, productId: createdProduct.id },
      });
    }
  }

  console.log(`✅ Created ${products.length} products with prices and history`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
