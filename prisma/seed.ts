import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Flo India CRM...");

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
  const ananya = await prisma.customer.create({ data: {
    name: "Ananya Deshmukh", phone: "9820112233", email: "ananya@gmail.com",
    city: "Mumbai", birthday: "1994-11-27", size: "Queen", sizeTop: "Queen 6in",
    fitPreference: "Medium-Firm", favoriteColors: "Ivory, Sage",
    pasand: "Flo Ergo, Adjustable Pillow", totalKharida: 54000, totalOrders: 4,
    lastVisit: new Date().toISOString(), isVip: true, loyaltyPoints: 540,
  }});
  const vikram = await prisma.customer.create({ data: {
    name: "Vikram Malhotra", phone: "9811223344", city: "Delhi",
    birthday: "1986-03-15", size: "King", sizeTop: "King 8in",
    fitPreference: "Firm Orthopedic", pasand: "Flo Ortho", totalKharida: 76000, totalOrders: 6,
    lastVisit: new Date(Date.now() - 8 * 86400000).toISOString(), isVip: true, loyaltyPoints: 760,
  }});
  const rohan = await prisma.customer.create({ data: {
    name: "Rohan Nair", phone: "9845098765", city: "Bengaluru",
    size: "Queen", pasand: "Flo Wave", totalKharida: 9500, totalOrders: 3, returnCount: 2,
    lastVisit: new Date(Date.now() - 115 * 86400000).toISOString(),
    isInactive: true, isHighRisk: true, rtoRate: 0.67,
  }});
  const sneha = await prisma.customer.create({ data: {
    name: "Sneha Kulkarni", phone: "9822334455", city: "Pune",
    birthday: "1992-07-20", size: "King", fitPreference: "Bouncy Latex",
    pasand: "Flo Anti-Gravity", totalKharida: 32000, totalOrders: 2,
    lastVisit: new Date(Date.now() - 4 * 86400000).toISOString(), loyaltyPoints: 320,
  }});
  const karthik = await prisma.customer.create({ data: {
    name: "Karthik Reddy", phone: "9849012345", city: "Hyderabad",
    size: "Single", pasand: "Flo Ortho", totalKharida: 14500, totalOrders: 2,
    lastVisit: new Date(Date.now() - 25 * 86400000).toISOString(), loyaltyPoints: 145,
  }});
  const meera = await prisma.customer.create({ data: {
    name: "Meera Shah", phone: "9825067890", city: "Ahmedabad",
    birthday: "1989-01-10", size: "King", fitPreference: "Plush Pocket Spring",
    pasand: "Flo Float, Protector", totalKharida: 92000, totalOrders: 7,
    lastVisit: new Date(Date.now() - 2 * 86400000).toISOString(), isVip: true, loyaltyPoints: 920,
  }});

  // ── DELIVERY ADDRESSES ─────────────────────────────────────
  await prisma.deliveryAddress.create({ data: {
    customerId: ananya.id, label: "Home", isDefault: true,
    address: "402, Sea Breeze Towers, Bandra West", pincode: "400050", city: "Mumbai", state: "Maharashtra",
  }});
  await prisma.deliveryAddress.create({ data: {
    customerId: vikram.id, label: "Home", isDefault: true,
    address: "B-24, Greater Kailash Part 1", pincode: "110048", city: "Delhi", state: "Delhi",
  }});

  // ── STAFF ──────────────────────────────────────────────────
  const defaultPasswordHash = bcrypt.hashSync(process.env.DEMO_PASSWORD || "Priya@2026#CRM", 10);

  await prisma.staff.create({ data: {
    name: "Arjun (Owner)", email: "owner@floindia.com", phone: "9820000001",
    passwordHash: defaultPasswordHash, role: "OWNER",
    targetMonthly: 500000, commissionPercent: 0,
  }});
  const raju = await prisma.staff.create({ data: {
    name: "Raju", email: "sales@floindia.com", phone: "9988776655",
    passwordHash: defaultPasswordHash, role: "STAFF",
    targetMonthly: 150000, commissionPercent: 2,
  }});
  const pooja = await prisma.staff.create({ data: {
    name: "Pooja", email: "pooja@floindia.com", phone: "9988776656",
    passwordHash: defaultPasswordHash, role: "STAFF",
    targetMonthly: 120000, commissionPercent: 2,
  }});

  // ── FLO INDIA PRODUCTS ─────────────────────────────────────
  const floOrtho = await prisma.product.create({ data: {
    name: "Flo Ortho Mattress", category: "Orthopedic", price: 8499, mrp: 13299,
    photoUrl: "/products/flo-ortho.svg",
    sku: "FLO-ORT-001", barcode: "8904567890001", tags: "Pain Release, Reversible, Firm 8/10",
    stocks: { create: [
      { size: "Single", quantity: 14 }, { size: "Queen", quantity: 9 }, { size: "King", quantity: 2 },
    ]},
  }});
  const floErgo = await prisma.product.create({ data: {
    name: "Flo Ergo Mattress", category: "Memory Foam", price: 7999, mrp: 12499,
    photoUrl: "/products/flo-ergo.svg",
    sku: "FLO-ERG-001", barcode: "8904567890002", tags: "Aloe Vera Cover, Zero Partner Disturbance",
    stocks: { create: [
      { size: "Single", quantity: 10 }, { size: "Queen", quantity: 12 }, { size: "King", quantity: 6 },
    ]},
  }});
  const floAntiGravity = await prisma.product.create({ data: {
    name: "Flo Anti-Gravity Mattress", category: "Natural Latex", price: 11499, mrp: 17999,
    photoUrl: "/products/flo-antigravity.svg",
    sku: "FLO-AGV-001", barcode: "8904567890003", tags: "100% Natural Latex, Pin-Core Breathable",
    stocks: { create: [
      { size: "Queen", quantity: 5 }, { size: "King", quantity: 1 },
    ]},
  }});
  const floFloat = await prisma.product.create({ data: {
    name: "Flo Float Mattress", category: "Pocket Spring", price: 13999, mrp: 21899,
    photoUrl: "/products/flo-float.svg",
    sku: "FLO-FLT-001", barcode: "8904567890004", tags: "Luxury Hotel Feel, Pocket Spring",
    stocks: { create: [
      { size: "Queen", quantity: 4 }, { size: "King", quantity: 5 },
    ]},
  }});
  const floWave = await prisma.product.create({ data: {
    name: "Flo Wave Mattress", category: "Everyday Foam", price: 5499, mrp: 8599,
    photoUrl: "/products/flo-wave.svg",
    sku: "FLO-WAV-001", barcode: "8904567890005", tags: "Value Comfort, Mattress-in-a-Box",
    stocks: { create: [
      { size: "Single", quantity: 18 }, { size: "Queen", quantity: 8 },
    ]},
  }});
  const floPillow = await prisma.product.create({ data: {
    name: "Flo Adjustable Pillow", category: "Sleep Accessories", price: 1499, mrp: 2299,
    photoUrl: "/products/flo-pillow.svg",
    sku: "FLO-PIL-001", barcode: "8904567890006", tags: "Custom Loft, Memory Foam",
    stocks: { create: [
      { size: "Standard", quantity: 25 },
    ]},
  }});
  const floProtector = await prisma.product.create({ data: {
    name: "Flo Waterproof Protector", category: "Sleep Accessories", price: 1299, mrp: 1999,
    photoUrl: "/products/flo-protector.svg",
    sku: "FLO-PRO-001", barcode: "8904567890007", tags: "100% Waterproof, Cotton Terry",
    stocks: { create: [
      { size: "Queen", quantity: 15 }, { size: "King", quantity: 10 },
    ]},
  }});

  // ── BILLS ──────────────────────────────────────────────────
  await prisma.bill.create({ data: {
    billNo: 2041, customerId: ananya.id, staffId: raju.id,
    total: 19498, discount: 1000, finalTotal: 18498, paymentMethod: "UPI", status: "Paid",
    items: { create: [
      { productId: floErgo.id, size: "Queen", qty: 2, price: 7999 },
      { productId: floPillow.id, size: "Standard", qty: 2, price: 1499 },
    ]},
  }});
  await prisma.bill.create({ data: {
    billNo: 2042, customerId: vikram.id, staffId: pooja.id,
    total: 27998, discount: 0, finalTotal: 27998, paymentMethod: "Card", status: "Paid",
    items: { create: [{ productId: floFloat.id, size: "King", qty: 2, price: 13999 }] },
  }});

  // ── OMNICHANNEL ORDERS ─────────────────────────────────────
  const order1 = await prisma.order.create({ data: {
    orderNo: "FLO20261101", customerId: sneha.id, channel: "Website",
    status: "Delivered", paymentMode: "Prepaid", paymentStatus: "Paid",
    total: 11499, finalTotal: 11499, courier: "Delhivery",
    trackingId: "DLV-FLO-88912", trackingStatus: "Delivered", codVerified: true,
    items: { create: [{ productId: floAntiGravity.id, size: "King", qty: 1, price: 11499 }] },
  }});
  await prisma.order.create({ data: {
    orderNo: "FLO20261102", customerId: karthik.id, channel: "Instagram",
    status: "Shipped", paymentMode: "Prepaid", paymentStatus: "Paid",
    total: 8499, finalTotal: 8499, courier: "BlueDart",
    trackingId: "BD-FLO-44109", trackingStatus: "In-Transit", codVerified: true,
    items: { create: [{ productId: floOrtho.id, size: "Single", qty: 1, price: 8499 }] },
  }});
  await prisma.order.create({ data: {
    orderNo: "FLO20261103", customerId: meera.id, channel: "Website",
    status: "Confirmed", paymentMode: "Prepaid", paymentStatus: "Paid",
    total: 15298, finalTotal: 15298, courier: "Shiprocket",
    trackingStatus: "Ready to Dispatch", codVerified: true,
    items: { create: [
      { productId: floFloat.id, size: "King", qty: 1, price: 13999 },
      { productId: floProtector.id, size: "King", qty: 1, price: 1299 },
    ]},
  }});
  await prisma.order.create({ data: {
    orderNo: "FLO20261104", customerId: rohan.id, channel: "WhatsApp",
    status: "Pending", paymentMode: "COD", paymentStatus: "Pending",
    total: 5499, finalTotal: 5499, isHighRisk: true, codVerified: false,
    items: { create: [{ productId: floWave.id, size: "Queen", qty: 1, price: 5499 }] },
  }});

  // ── RETURNS & QC ───────────────────────────────────────────
  await prisma.return.create({ data: {
    orderId: order1.id, type: "Exchange", reason: "100-Night Trial: Switching from King to Queen size",
    status: "QC Pending", refundAmount: 0,
  }});

  // ── APPROVALS ──────────────────────────────────────────────
  await prisma.approval.create({ data: {
    type: "Discount", amount: 1500, requestedBy: raju.id, note: "Bulk 3-mattress family order extra ₹1,500 discount request",
  }});
  await prisma.approval.create({ data: {
    type: "Refund", amount: 11499, requestedBy: pooja.id,
    note: "Order FLO20261101 - 100-Night Trial full refund request",
  }});

  // ── UDHAAR / CREDIT ────────────────────────────────────────
  await prisma.udhaar.create({ data: {
    customerId: rohan.id, amount: 2500,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), status: "Pending",
  }});
  await prisma.udhaar.create({ data: {
    customerId: karthik.id, amount: 4000,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(), status: "Pending",
  }});

  // ── CUSTOM MATTRESS SIZING ─────────────────────────────────
  await prisma.measurement.create({ data: {
    customerId: ananya.id, blouse: "72x60", sleeve: "8 in", length: "72",
    waist: "60", shoulder: "Aloe Cover", hip: "Firmness 7/10",
    status: "In Production", deliveryDate: new Date(Date.now() + 4 * 86400000).toISOString(),
  }});
  await prisma.measurement.create({ data: {
    customerId: vikram.id, blouse: "78x72", sleeve: "6 in", length: "78",
    waist: "72", shoulder: "Ortho Base", hip: "Firmness 9/10",
    status: "Ready for Dispatch", deliveryDate: new Date().toISOString(),
  }});

  // ── WISHLISTS ──────────────────────────────────────────────
  await prisma.wishlist.create({ data: { customerId: ananya.id, productId: floAntiGravity.id, size: "King" }});
  await prisma.wishlist.create({ data: { customerId: sneha.id, productId: floPillow.id, size: "Standard" }});

  // ── LOYALTY TRANSACTIONS ───────────────────────────────────
  await prisma.loyaltyTransaction.create({ data: {
    customerId: ananya.id, points: 185, reason: "Earned on Invoice #2041",
  }});
  await prisma.loyaltyTransaction.create({ data: {
    customerId: meera.id, points: 450, reason: "Earned on Order FLO20261103",
  }});

  // ── SUPPORT TICKETS ────────────────────────────────────────
  await prisma.supportTicket.create({ data: {
    customerId: sneha.id, channel: "WhatsApp", subject: "100-Night Trial Size Exchange",
    status: "Open", assignedTo: raju.id,
    messages: { create: [
      { sender: "customer", body: "Hi, I want to exchange my King Flo Anti-Gravity for a Queen size under the 100-night trial." },
      { sender: "staff", body: "Sure Sneha! We have initiated your trial exchange pickup and will dispatch the Queen size right away." },
    ]},
  }});
  await prisma.supportTicket.create({ data: {
    customerId: karthik.id, channel: "Instagram", subject: "Delivery ETA for FLO20261102",
    status: "In-Progress",
    messages: { create: [
      { sender: "customer", body: "When will my Flo Ortho Single mattress reach Hyderabad?" },
    ]},
  }});

  // ── QUICK REPLIES ──────────────────────────────────────────
  await prisma.quickReply.createMany({ data: [
    { title: "Size Guide", category: "Size", body: "Flo India Mattress Sizes:\nSingle: 72x36 in\nDiwan: 72x48 in\nQueen: 72x60 in\nKing: 78x72 in\nCustom sizes also crafted to order!" },
    { title: "100-Night Trial", category: "Policy", body: "Sleep on your Flo mattress for 100 nights risk-free. Not satisfied? We pick it up and issue a 100% refund." },
    { title: "10-Year Warranty", category: "Warranty", body: "Every Flo Mattress comes with a comprehensive 10-Year Manufacturer Warranty covering sagging and foam defects." },
    { title: "Track Order", category: "Tracking", body: "Track your Mattress-in-a-Box shipment at https://floindia.com/track using your Order ID." },
    { title: "Sleep Bundle Offer", category: "Offer", body: "Save 36% + get 2 Free Flo Pillows on King & Queen Mattress orders at floindia.com!" },
  ]});

  // ── MARKETING CAMPAIGNS ────────────────────────────────────
  await prisma.marketingCampaign.createMany({ data: [
    { title: "World Sleep Day - Flat 36% Off Mattresses", segment: "All", channel: "WhatsApp", sentToCount: 1250, status: "Sent" },
    { title: "100-Night Trial Check-In & Pillow Upsell", segment: "VIP", channel: "WhatsApp", sentToCount: 180, status: "Sent" },
    { title: "Birthday Sleep Upgrade Coupon", segment: "Birthday", channel: "WhatsApp", sentToCount: 65, status: "Sent" },
    { title: "Cart Recovery - Flo Ortho & Ergo", segment: "Inactive", channel: "WhatsApp", sentToCount: 210, status: "Sent" },
  ]});

  // ── RETURN ANALYTICS ───────────────────────────────────────
  await prisma.returnAnalytic.create({ data: { productId: floAntiGravity.id, size: "King", reason: "Bed frame size mismatch", count: 3 }});
  await prisma.returnAnalytic.create({ data: { productId: floErgo.id, size: "Queen", reason: "Switched to firmer Flo Ortho", count: 2 }});

  // ── LEADS, HISTORIES, FOLLOWUPS, CATALOGS ──────────────────
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgoStr = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  await prisma.lead.create({ data: {
    naam: "Aditi Deshpande", phone: "9820445566", email: "aditi.d@gmail.com",
    source: "Website", query: "Flo Ortho King 8-inch for parents' back pain",
    quote: 14999, stage: "QUOTE", temperature: "Hot", assignedTo: raju.id,
    nextFollowup: `${todayStr}T11:00`, city: "Mumbai",
    notes: "Needs delivery by weekend; asked about 100-night trial",
    history: { create: [
      { staffId: raju.id, action: "Lead Created", note: "Website inquiry via floindia.com" },
      { staffId: raju.id, action: "Called", note: "Recommended Flo Ortho 8-inch King for lumbar support" },
      { staffId: raju.id, action: "Quote Sent", note: "Shared ₹14,999 quote with 2 free pillows on WhatsApp" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${todayStr}T11:00`, note: "Confirm EMI option & close order" },
    ]},
    catalogsSent: { create: [{ title: "Flo Ortho Orthopedic Guide PDF" }] },
  }});

  await prisma.lead.create({ data: {
    naam: "Siddharth Joshi", phone: "9811778899",
    source: "WhatsApp", query: "Flo Ergo vs Anti-Gravity Queen size comparison",
    quote: 11499, stage: "BAAT HUI", temperature: "Warm", assignedTo: pooja.id,
    nextFollowup: `${yesterdayStr}T16:00`, city: "Delhi",
    notes: "Comparing natural latex vs memory foam",
    history: { create: [
      { staffId: pooja.id, action: "WhatsApp", note: "Sent firmness & cooling comparison chart" },
      { staffId: pooja.id, action: "Called", note: "Explained 100% natural pin-core latex benefits" },
    ]},
    followups: { create: [
      { staffId: pooja.id, dueAt: `${yesterdayStr}T16:00`, note: "Follow up on Queen Anti-Gravity decision" },
    ]},
    catalogsSent: { create: [{ title: "Flo Mattress Comparison Brochure" }] },
  }});

  await prisma.lead.create({ data: {
    naam: "Nikhil Kapoor", phone: "9845112233",
    source: "Instagram", query: "Flo Float Pocket Spring Queen + Waterproof Protector",
    quote: 15298, stage: "NEW", temperature: "Hot", assignedTo: raju.id,
    nextFollowup: `${todayStr}T17:30`, city: "Bengaluru",
    history: { create: [
      { staffId: raju.id, action: "Lead Created", note: "Instagram Ad lead form submitted" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${todayStr}T17:30`, note: "Introductory call & room dimension check" },
    ]},
  }});

  await prisma.lead.create({ data: {
    naam: "Boutique Stay Udaipur", phone: "9829099001",
    source: "Call", query: "Bulk B2B Order: 12x Flo Float Queen Mattresses",
    quote: 155000, stage: "PAKKI", temperature: "Hot", assignedTo: pooja.id,
    city: "Udaipur", notes: "50% advance received; dispatch scheduled",
    history: { create: [
      { staffId: pooja.id, action: "Lead Created", note: "Inbound B2B hospitality call" },
      { staffId: pooja.id, action: "Stage Changed", note: "Won! Bulk invoice confirmed" },
    ]},
  }});

  await prisma.lead.create({ data: {
    naam: "Pranav Kulkarni", phone: "9822998877",
    source: "Facebook", query: "Custom Size 72x66 Flo Ortho Mattress",
    quote: 12499, stage: "QUOTE", temperature: "Warm", assignedTo: raju.id,
    nextFollowup: `${twoDaysAgoStr}T12:00`, city: "Pune",
    history: { create: [
      { staffId: raju.id, action: "Called", note: "Quoted ₹12,499 for custom 72x66 dimension" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${twoDaysAgoStr}T12:00`, note: "Confirm exact bed frame inner measurement" },
    ]},
  }});

  await prisma.lead.create({ data: {
    naam: "Ritu Sharma", phone: "9849055667",
    source: "Website", query: "Flo Wave Single Mattress for guest room",
    quote: 5499, stage: "LOST", temperature: "Cold", assignedTo: pooja.id,
    lostReason: "Purchased locally due to same-day requirement", city: "Hyderabad",
    history: { create: [
      { staffId: pooja.id, action: "Called", note: "Needed same-day delivery within 3 hours" },
      { staffId: pooja.id, action: "Stage Changed", note: "Marked Lost — urgent local timeline" },
    ]},
  }});

  await prisma.lead.create({ data: {
    naam: "Karanveer Singh", phone: "9825088776",
    source: "Walk-in", query: "Flo Anti-Gravity King + 4 Adjustable Pillows",
    quote: 29495, stage: "PAKKI", temperature: "Hot", assignedTo: raju.id,
    nextFollowup: `${tomorrowStr}T15:00`, city: "Ahmedabad",
    history: { create: [
      { staffId: raju.id, action: "Lead Created", note: "Visited Experience Center" },
      { staffId: raju.id, action: "Quote Sent", note: "Combo quote ₹29,495" },
      { staffId: raju.id, action: "Stage Changed", note: "Won! Payment completed" },
    ]},
    followups: { create: [
      { staffId: raju.id, dueAt: `${tomorrowStr}T15:00`, note: "Share Delhivery tracking link" },
    ]},
    catalogsSent: { create: [{ title: "Flo Sleep Studio Lookbook" }] },
  }});

  console.log("Flo India CRM seed complete!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error("Seed failed:", e); await prisma.$disconnect(); process.exit(1); });
