import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Priya Boutique CRM v2...");

  // Clear in FK order
  await prisma.leadCatalog.deleteMany();
  await prisma.leadFollowup.deleteMany();
  await prisma.leadHistory.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.loyaltyTransaction.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.alteration.deleteMany();
  await prisma.supportMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.return.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.udhaar.deleteMany();
  await prisma.measurement.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.returnAnalytic.deleteMany();
  await prisma.product.deleteMany();
  await prisma.marketingCampaign.deleteMany();
  await prisma.quickReply.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.deliveryAddress.deleteMany();
  await prisma.customer.deleteMany();

  // ── CUSTOMERS ──────────────────────────────────────────────
  const anjali = await prisma.customer.create({ data: {
    name: "Anjali Sharma", phone: "9876543210", email: "anjali@gmail.com",
    city: "Nathdwara", birthday: "1995-11-27", size: "M", sizeTop: "M",
    sizeBottom: "30", fitPreference: "Slim", favoriteColors: "Red, Pink",
    pasand: "Kurti, Lehenga", totalKharida: 55000, totalOrders: 5,
    lastVisit: new Date().toISOString(), isVip: true, loyaltyPoints: 550,
  }});
  const sunita = await prisma.customer.create({ data: {
    name: "Sunita Devi", phone: "9876543211", city: "Nathdwara",
    birthday: "1988-03-15", size: "L", sizeTop: "L", sizeBottom: "34",
    fitPreference: "Regular", pasand: "Saree", totalKharida: 72000, totalOrders: 8,
    lastVisit: new Date(Date.now() - 10 * 86400000).toISOString(), isVip: true, loyaltyPoints: 720,
  }});
  const ramesh = await prisma.customer.create({ data: {
    name: "Ramesh Kumar", phone: "9876543212", city: "Udaipur",
    size: "L", pasand: "Suit", totalKharida: 8000, totalOrders: 4, returnCount: 3,
    lastVisit: new Date(Date.now() - 120 * 86400000).toISOString(),
    isInactive: true, isHighRisk: true, rtoRate: 0.75,
  }});
  const meera = await prisma.customer.create({ data: {
    name: "Meera Joshi", phone: "9876543213", city: "Nathdwara",
    birthday: "1992-07-20", size: "S", sizeTop: "S", fitPreference: "Slim",
    pasand: "Gown", totalKharida: 32000, totalOrders: 3,
    lastVisit: new Date(Date.now() - 5 * 86400000).toISOString(), loyaltyPoints: 320,
  }});
  const kavita = await prisma.customer.create({ data: {
    name: "Kavita Agarwal", phone: "9876543214", city: "Rajsamand",
    size: "XL", pasand: "Kurti", totalKharida: 12000, totalOrders: 2,
    lastVisit: new Date(Date.now() - 30 * 86400000).toISOString(), loyaltyPoints: 120,
  }});
  const priya = await prisma.customer.create({ data: {
    name: "Priya Patel", phone: "9876543215", city: "Nathdwara",
    birthday: "1990-01-10", size: "M", fitPreference: "Oversized",
    pasand: "Lehenga, Gown", totalKharida: 95000, totalOrders: 10,
    lastVisit: new Date(Date.now() - 2 * 86400000).toISOString(), isVip: true, loyaltyPoints: 950,
  }});
  console.log("✅ 6 Customers seeded");

  // ── DELIVERY ADDRESSES ─────────────────────────────────────
  await prisma.deliveryAddress.create({ data: {
    customerId: anjali.id, label: "Home", isDefault: true,
    address: "123, Shrinathji Nagar", pincode: "313301", city: "Nathdwara", state: "Rajasthan",
  }});
  await prisma.deliveryAddress.create({ data: {
    customerId: sunita.id, label: "Home", isDefault: true,
    address: "456, Main Bazaar", pincode: "313301", city: "Nathdwara", state: "Rajasthan",
  }});
  console.log("✅ Delivery addresses seeded");

  // ── STAFF ──────────────────────────────────────────────────
  const raju = await prisma.staff.create({ data: {
    name: "Raju", phone: "9988776655", role: "STAFF",
    targetMonthly: 100000, commissionPercent: 2,
  }});
  const pooja = await prisma.staff.create({ data: {
    name: "Pooja", phone: "9988776656", role: "STAFF",
    targetMonthly: 80000, commissionPercent: 2,
  }});
  console.log("✅ 2 Staff seeded");

  // ── PRODUCTS ───────────────────────────────────────────────
  const redKurti = await prisma.product.create({ data: {
    name: "Red Kurti", category: "Kurti", price: 1200, mrp: 1500,
    photoUrl: "/products/red-kurti.svg",
    sku: "KUR-RED-001", barcode: "8901234567890", tags: "Slim, Casual, Summer",
    stocks: { create: [
      { size: "S", quantity: 5 }, { size: "M", quantity: 1 },
      { size: "L", quantity: 3 }, { size: "XL", quantity: 4 },
    ]},
  }});
  const redLehenga = await prisma.product.create({ data: {
    name: "Red Lehenga", category: "Lehenga", price: 15000, mrp: 18000,
    photoUrl: "/products/red-lehenga.svg",
    sku: "LEH-RED-001", barcode: "8901234567891", tags: "Bridal, Festive",
    stocks: { create: [
      { size: "S", quantity: 2 }, { size: "M", quantity: 3 }, { size: "L", quantity: 1 },
    ]},
  }});
  const blueSaree = await prisma.product.create({ data: {
    name: "Blue Saree", category: "Saree", price: 3500, mrp: 4000,
    photoUrl: "/products/blue-saree.svg",
    sku: "SAR-BLU-001", barcode: "8901234567892",
    stocks: { create: [{ size: "Free", quantity: 8 }]},
  }});
  const pinkGown = await prisma.product.create({ data: {
    name: "Pink Gown", category: "Gown", price: 8500, mrp: 10000,
    photoUrl: "/products/pink-gown.svg",
    sku: "GOW-PNK-001",
    stocks: { create: [
      { size: "S", quantity: 2 }, { size: "M", quantity: 0 }, { size: "L", quantity: 4 },
    ]},
  }});
  const greenSuit = await prisma.product.create({ data: {
    name: "Green Suit", category: "Suit", price: 4200, mrp: 5000, sku: "SUI-GRN-001",
    photoUrl: "/products/green-suit.svg",
    stocks: { create: [
      { size: "M", quantity: 6 }, { size: "L", quantity: 3 }, { size: "XL", quantity: 2 },
    ]},
  }});
  const goldLehenga = await prisma.product.create({ data: {
    name: "Gold Bridal Lehenga", category: "Lehenga", price: 45000, mrp: 55000,
    photoUrl: "/products/gold-lehenga.svg",
    sku: "LEH-GLD-001", tags: "Bridal, Premium, Heavy Work",
    stocks: { create: [{ size: "S", quantity: 1 }, { size: "M", quantity: 2 }]},
  }});
  const whiteKurti = await prisma.product.create({ data: {
    name: "White Chikan Kurti", category: "Kurti", price: 2800, sku: "KUR-WHT-001",
    photoUrl: "/products/white-kurti.svg",
    stocks: { create: [
      { size: "S", quantity: 3 }, { size: "M", quantity: 5 }, { size: "L", quantity: 2 },
    ]},
  }});
  console.log("✅ 7 Products + Stock seeded");

  // ── BILLS ──────────────────────────────────────────────────
  await prisma.bill.create({ data: {
    billNo: 1025, customerId: anjali.id, staffId: raju.id,
    total: 16200, discount: 200, finalTotal: 16000, loyaltyUsed: 0,
    paymentMethod: "UPI", status: "Completed",
    items: { create: [
      { productId: redKurti.id, size: "M", qty: 1, price: 1200 },
      { productId: redLehenga.id, size: "M", qty: 1, price: 15000 },
    ]},
  }});
  await prisma.bill.create({ data: {
    billNo: 1026, customerId: sunita.id, staffId: pooja.id,
    total: 3500, discount: 0, finalTotal: 3500,
    paymentMethod: "Cash", status: "Completed",
    items: { create: [{ productId: blueSaree.id, size: "Free", qty: 1, price: 3500 }]},
  }});
  console.log("✅ 2 Bills seeded");

  // ── ONLINE ORDERS ──────────────────────────────────────────
  const order1 = await prisma.order.create({ data: {
    orderNo: "PB202411001", customerId: meera.id, channel: "Instagram",
    paymentMode: "Prepaid", paymentStatus: "Paid", codVerified: true,
    total: 8500, discount: 500, finalTotal: 8000, shippingCharge: 0,
    status: "Delivered", trackingId: "SR1234567890", courier: "Shiprocket",
    trackingStatus: "Delivered",
    items: { create: [{ productId: pinkGown.id, size: "S", qty: 1, price: 8500 }]},
  }});
  const order2 = await prisma.order.create({ data: {
    orderNo: "PB202411002", customerId: kavita.id, channel: "Website",
    paymentMode: "COD", paymentStatus: "Pending", codVerified: false,
    total: 1200, discount: 0, finalTotal: 1200, shippingCharge: 50,
    status: "Pending", isHighRisk: false,
    items: { create: [{ productId: redKurti.id, size: "XL", qty: 1, price: 1200 }]},
  }});
  const order3 = await prisma.order.create({ data: {
    orderNo: "PB202411003", customerId: priya.id, channel: "WhatsApp",
    paymentMode: "Prepaid", paymentStatus: "Paid", codVerified: true,
    total: 45000, discount: 2000, finalTotal: 43000, shippingCharge: 0,
    status: "Shipped", trackingId: "DL9876543210", courier: "Delhivery",
    trackingStatus: "In-Transit",
    items: { create: [{ productId: goldLehenga.id, size: "M", qty: 1, price: 45000 }]},
  }});
  const order4 = await prisma.order.create({ data: {
    orderNo: "PB202411004", customerId: ramesh.id, channel: "Website",
    paymentMode: "COD", paymentStatus: "Pending", codVerified: false,
    total: 4200, discount: 0, finalTotal: 4200, shippingCharge: 100,
    status: "Pending", isHighRisk: true,
    items: { create: [{ productId: greenSuit.id, size: "L", qty: 1, price: 4200 }]},
  }});
  console.log("✅ 4 Online Orders seeded");

  // ── RETURNS ────────────────────────────────────────────────
  await prisma.return.create({ data: {
    orderId: order1.id, reason: "Size thoda chhota tha", type: "Exchange",
    status: "QC Pending", exchangeSize: "M",
  }});
  console.log("✅ 1 Return seeded");

  // ── APPROVALS ─────────────────────────────────────────────
  await prisma.approval.create({ data: {
    orderId: order2.id, type: "Discount", amount: 200,
    requestedBy: raju.id, note: "Regular customer, 200 discount maang raha hai",
  }});
  await prisma.approval.create({ data: {
    type: "Refund", amount: 8000, requestedBy: pooja.id,
    note: "Order 1001 - Customer ne defective kapda receive kiya",
  }});
  console.log("✅ 2 Approvals seeded");

  // ── UDHAAR ─────────────────────────────────────────────────
  await prisma.udhaar.create({ data: {
    customerId: ramesh.id, amount: 2000,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), status: "Pending",
  }});
  await prisma.udhaar.create({ data: {
    customerId: kavita.id, amount: 5000,
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString(), status: "Pending",
  }});
  console.log("✅ 2 Udhaar seeded");

  // ── MEASUREMENTS ──────────────────────────────────────────
  await prisma.measurement.create({ data: {
    customerId: anjali.id, blouse: "36", sleeve: "14", length: "40",
    waist: "30", shoulder: "14", hip: "38",
    status: "Sil Raha Hai", deliveryDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  }});
  await prisma.measurement.create({ data: {
    customerId: sunita.id, blouse: "38", sleeve: "15", length: "42",
    waist: "32", shoulder: "15", hip: "40",
    status: "Ready Hai", deliveryDate: new Date().toISOString(),
  }});
  console.log("✅ 2 Measurements seeded");

  // ── ALTERATIONS ───────────────────────────────────────────
  await prisma.alteration.create({ data: {
    customerId: priya.id, description: "Lehenga waist 2 inch chhota karna",
    status: "In-Progress", dueDate: new Date(Date.now() + 5 * 86400000).toISOString(), charges: 300,
  }});
  console.log("✅ 1 Alteration seeded");

  // ── WISHLISTS ─────────────────────────────────────────────
  await prisma.wishlist.create({ data: { customerId: anjali.id, productId: goldLehenga.id, size: "M" }});
  await prisma.wishlist.create({ data: { customerId: meera.id, productId: whiteKurti.id, size: "S" }});
  console.log("✅ 2 Wishlist items seeded");

  // ── LOYALTY TRANSACTIONS ───────────────────────────────────
  await prisma.loyaltyTransaction.create({ data: {
    customerId: anjali.id, points: 160, reason: "Bill #1025 pe earned",
  }});
  await prisma.loyaltyTransaction.create({ data: {
    customerId: priya.id, points: 430, reason: "Order PB202411003 pe earned",
  }});
  await prisma.loyaltyTransaction.create({ data: {
    customerId: anjali.id, points: -50, reason: "Discount pe redeem kiya",
  }});
  console.log("✅ 3 Loyalty transactions seeded");

  // ── SUPPORT TICKETS ───────────────────────────────────────
  const ticket1 = await prisma.supportTicket.create({ data: {
    customerId: meera.id, channel: "WhatsApp", subject: "Size exchange chahiye",
    status: "Open", assignedTo: raju.id,
    messages: { create: [
      { sender: "customer", body: "Mujhe pink gown ka size S ki jagah M chahiye" },
      { sender: "staff", body: "Ji bilkul! Hum aapke liye exchange process kar dete hain" },
    ]},
  }});
  const ticket2 = await prisma.supportTicket.create({ data: {
    customerId: kavita.id, channel: "Instagram", subject: "Delivery kab tak?",
    status: "In-Progress",
    messages: { create: [
      { sender: "customer", body: "Mera order PB202411002 kab aayega?" },
    ]},
  }});
  console.log("✅ 2 Support Tickets seeded");

  // ── QUICK REPLIES ─────────────────────────────────────────
  await prisma.quickReply.createMany({ data: [
    { title: "Size Chart", category: "Size", body: "📏 Priya Boutique Size Chart:\nS: Bust 34\", Waist 28\"\nM: Bust 36\", Waist 30\"\nL: Bust 38\", Waist 32\"\nXL: Bust 40\", Waist 34\"" },
    { title: "Return Policy", category: "Policy", body: "🔄 7 din ke andar return/exchange ho sakta hai. Original tags aur packing zaroori hai." },
    { title: "Washing Instructions", category: "Care", body: "🧺 Cold water mein hand wash karein. Direct dhoop mein mat sukhaein." },
    { title: "Track Order", category: "Tracking", body: "🚚 Aapka order track karein: https://track.shiprocket.in\nTracking ID hume batayein." },
    { title: "Diwali Offer", category: "Offer", body: "🪔 Diwali Special! Priya Boutique pe 20% OFF sab Kurtis pe! Code: PRIYA20" },
  ]});
  console.log("✅ 5 Quick Replies seeded");

  // ── MARKETING CAMPAIGNS ───────────────────────────────────
  await prisma.marketingCampaign.createMany({ data: [
    { title: "Diwali Special - 20% Off All Kurtis", segment: "All", channel: "WhatsApp", sentToCount: 500, status: "Sent" },
    { title: "Birthday Offer - 15% Off", segment: "Birthday", channel: "WhatsApp", sentToCount: 45, status: "Sent" },
    { title: "Inactive Re-engagement", segment: "Inactive", channel: "WhatsApp", sentToCount: 120, status: "Sent" },
    { title: "VIP Special Preview", segment: "VIP", channel: "WhatsApp", sentToCount: 32, status: "Sent" },
  ]});
  console.log("✅ 4 Marketing Campaigns seeded");

  // ── RETURN ANALYTICS ──────────────────────────────────────
  await prisma.returnAnalytic.create({ data: { productId: pinkGown.id, size: "S", reason: "Size chhota tha", count: 3 }});
  await prisma.returnAnalytic.create({ data: { productId: redKurti.id, size: "M", reason: "Color different tha", count: 2 }});
  console.log("✅ Return Analytics seeded");

  // ── LEADS, HISTORIES, FOLLOWUPS, CATALOGS ─────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgoStr = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const lead1 = await prisma.lead.create({ data: {
    naam: "Priya Sharma", phone: "9829011223", email: "priya.s@gmail.com",
    source: "Instagram", query: "Bridal Red Lehenga rate aur customization",
    quote: 18500, stage: "QUOTE", temperature: "Hot", assignedTo: raju.id,
    nextFollowup: `${todayStr}T11:00`, city: "Udaipur",
    notes: "Shaadi next month hai, urgent chahiye",
    history: { create: [
      { staffId: raju.id, action: "Lead Created", note: "Instagram DM se inquiry aayi" },
      { staffId: raju.id, action: "Called", note: "Budget 18-20k bataya, Red & Gold pasand hai" },
      { staffId: raju.id, action: "Quote Sent", note: "₹18,500 ka quote WhatsApp pe bheja" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${todayStr}T11:00`, note: "Quote confirm karna hai & trial book karna" },
    ]},
    catalogsSent: { create: [
      { title: "Bridal Lehenga Collection 2026 PDF" },
    ]},
  }});

  const lead2 = await prisma.lead.create({ data: {
    naam: "Neha Rathore", phone: "9829044556",
    source: "WhatsApp", query: "Haldi ke liye Yellow Anarkali set (Size M)",
    quote: 4500, stage: "BAAT HUI", temperature: "Warm", assignedTo: pooja.id,
    nextFollowup: `${yesterdayStr}T16:00`, city: "Nathdwara",
    notes: "2 pieces chahiye family ke liye",
    history: { create: [
      { staffId: pooja.id, action: "WhatsApp", note: "WhatsApp pe photo bheji" },
      { staffId: pooja.id, action: "Called", note: "Size M aur L dono ke liye pucha" },
    ]},
    followups: { create: [
      { staffId: pooja.id, dueAt: `${yesterdayStr}T16:00`, note: "Overdue: Yellow Anarkali stock confirm karke batana hai" },
    ]},
    catalogsSent: { create: [
      { title: "Haldi & Mehendi Special Kurtis" },
    ]},
  }});

  const lead3 = await prisma.lead.create({ data: {
    naam: "Simran Kaur", phone: "9829077889",
    source: "Facebook", query: "Party wear Gown pink color",
    quote: 6800, stage: "NEW", temperature: "Hot", assignedTo: raju.id,
    nextFollowup: `${todayStr}T17:30`, city: "Rajsamand",
    history: { create: [
      { staffId: raju.id, action: "Lead Created", note: "Facebook Ad form submit kiya" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${todayStr}T17:30`, note: "Pehli call karni hai & size poochna hai" },
    ]},
  }});

  const lead4 = await prisma.lead.create({ data: {
    naam: "Aarti Mehta", phone: "9829099001",
    source: "Walk-in", query: "Designer Saree + Blouse stitching",
    quote: 12000, stage: "PAKKI", temperature: "Hot", assignedTo: pooja.id,
    city: "Nathdwara", notes: "Advance ₹5,000 de diya hai",
    history: { create: [
      { staffId: pooja.id, action: "Lead Created", note: "Store visit kiya" },
      { staffId: pooja.id, action: "Stage Changed", note: "PAKKI ho gayi! Advance received" },
    ]},
  }});

  const lead5 = await prisma.lead.create({ data: {
    naam: "Kiran Verma", phone: "9829033445",
    source: "Call", query: "Cotton Kurti bulk order (5 pcs)",
    quote: 5500, stage: "QUOTE", temperature: "Warm", assignedTo: raju.id,
    nextFollowup: `${twoDaysAgoStr}T12:00`, city: "Chittorgarh",
    history: { create: [
      { staffId: raju.id, action: "Called", note: "5 kurtis ka bulk quote diya ₹5,500" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${twoDaysAgoStr}T12:00`, note: "Overdue: Bulk discount approval ke baad call karna hai" },
    ]},
  }});

  const lead6 = await prisma.lead.create({ data: {
    naam: "Ritu Agarwal", phone: "9829055667",
    source: "Website", query: "Festive Palazzo Suit inquiry",
    quote: 3200, stage: "LOST", temperature: "Cold", assignedTo: pooja.id,
    lostReason: "Budget issue - sasta option chahiye tha", city: "Udaipur",
    history: { create: [
      { staffId: pooja.id, action: "Called", note: "Customer ko ₹2000 ke andar chahiye tha" },
      { staffId: pooja.id, action: "Stage Changed", note: "LOST marked - budget mismatch" },
    ]},
  }});

  const lead7 = await prisma.lead.create({ data: {
    naam: "Divya Solanki", phone: "9829088776",
    source: "Instagram", query: "Custom Bridal Trousseau (3 outfits)",
    quote: 42000, stage: "PAKKI", temperature: "Hot", assignedTo: raju.id,
    nextFollowup: `${tomorrowStr}T15:00`, city: "Nathdwara",
    history: { create: [
      { staffId: raju.id, action: "Lead Created", note: "Instagram reel se DM aaya" },
      { staffId: raju.id, action: "Quote Sent", note: "3 outfits combo quote ₹42,000" },
      { staffId: raju.id, action: "Stage Changed", note: "PAKKI! Measurement booked" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${tomorrowStr}T15:00`, note: "Measurement session ke liye reminder" },
    ]},
    catalogsSent: { create: [
      { title: "Royal Bridal Trousseau Lookbook" },
    ]},
  }});

  console.log("✅ 7 Leads, Histories, Follow-ups & Catalogs seeded", [lead1.id, lead2.id, lead3.id, lead4.id, lead5.id, lead6.id, lead7.id].length);

  console.log("\n🎉 Full seed complete! npm run dev karo aur kholo http://localhost:4873");
}

main().then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error("❌ Seed failed:", e); await prisma.$disconnect(); process.exit(1); });
