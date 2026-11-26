"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import FloatingDots from "@/components/ui/FloatingDots";
import MarqueeStrip from "@/components/ui/MarqueeStrip";
import SearchInput from "@/components/ui/SearchInput";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import ToastContainer, { showToast } from "@/components/ui/Toast";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import SectionDivider from "@/components/ui/SectionDivider";
import { fireConfetti } from "@/components/ui/Confetti";
import { formatCurrency } from "@/lib/utils";
import CssIcon, { CssIconName } from "@/components/ui/CssIcon";

interface Customer {
  id: number;
  name: string;
  phone: string;
  size: string | null;
  isVip: boolean;
  totalKharida: number;
}

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  photoUrl: string | null;
  stocks: { id: number; size: string; quantity: number }[];
}

interface CartItem {
  productId: number;
  name: string;
  size: string;
  qty: number;
  price: number;
}

const paymentMethods: { label: string; icon: CssIconName; value: string }[] = [
  { label: "Cash", icon: "rupee", value: "Cash" },
  { label: "UPI", icon: "phone", value: "UPI" },
  { label: "Card", icon: "bag", value: "Card" },
  { label: "Credit", icon: "clock", value: "Udhaar" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200 } },
};

export default function ShopPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showBillSuccess, setShowBillSuccess] = useState(false);
  const [lastBillNo, setLastBillNo] = useState(0);
  const [loading, setLoading] = useState(false);

  // New customer form
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newSize, setNewSize] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Fetch data
  useEffect(() => {
    fetch("/api/customers")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCustomers(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProducts(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Search customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customers.slice(0, 8);
    return customers.filter(
      (c) =>
        c.phone.includes(customerSearch) ||
        c.name.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [customers, customerSearch]);

  // Search products
  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  // Cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const finalTotal = subtotal - discount;

  // Add to cart
  const addToCart = (product: Product, size: string) => {
    const existing = cart.find(
      (c) => c.productId === product.id && c.size === size
    );
    if (existing) {
      setCart(
        cart.map((c) =>
          c.productId === product.id && c.size === size
            ? { ...c, qty: c.qty + 1 }
            : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          size,
          qty: 1,
          price: Number(product.price),
        },
      ]);
    }
    showToast(`Added ${product.name} (${size}) to cart`);
  };

  // Update qty
  const updateQty = (index: number, delta: number) => {
    setCart(
      cart
        .map((item, i) =>
          i === index ? { ...item, qty: Math.max(0, item.qty + delta) } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  // Generate bill
  const generateBill = async () => {
    if (!selectedCustomer) {
      showToast("Please select a customer first!", "error");
      return;
    }
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          staffId: 1, // Default staff
          items: cart,
          discount,
          paymentMethod,
        }),
      });

      if (!res.ok) throw new Error("Bill nahi bana");

      const bill = await res.json();
      setLastBillNo(bill.billNo);
      setShowBillSuccess(true);
      fireConfetti();
      setCart([]);
      setDiscount(0);
      setSelectedCustomer(null);
      showToast(`Bill #${bill.billNo} Ban Gaya!`, "success");

      // Refresh customers
      fetch("/api/customers")
        .then((r) => r.json())
        .then(setCustomers);
    } catch (err) {
      showToast("Bill nahi ban paya, dobara try karo", "error");
    }
    setLoading(false);
  };

  // Create new customer
  const createCustomer = async () => {
    if (!newName || !newPhone) {
      showToast("Name aur Phone zaroori hai!", "error");
      return;
    }
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          city: newCity,
          size: newSize,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Customer nahi bana", "error");
        return;
      }
      const customer = await res.json();
      setCustomers([customer, ...customers]);
      setSelectedCustomer(customer);
      setShowNewCustomer(false);
      setNewName("");
      setNewPhone("");
      setNewCity("");
      setNewSize("");
      showToast(`${customer.name} add ho gaya!`, "success");
    } catch (err) {
      showToast("Error aa gaya!", "error");
    }
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-background relative">
      <FloatingDots />
      <MarqueeStrip />
      <Navbar />
      <ToastContainer />

      <main className="relative z-10 pt-24 pb-10 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-heading text-primary flex items-center gap-2"><CssIcon name="bag" size={24} className="text-gold" /> Point of Sale</h1>
            <p className="text-sm font-body text-text/50">Create invoices, search customers, and check live stock</p>
          </div>
          <div className="flex gap-3">
            <Button size="sm" onClick={() => setShowNewCustomer(true)}>
              <CssIcon name="user" size={14} /> New Customer
            </Button>
          </div>
        </motion.div>

        {/* 3-Column Billing Layout */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Column 1 - Customer Select */}
          <motion.div variants={item}>
            <Card hover={false} className="h-full">
              <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2"><CssIcon name="user" size={16} className="text-gold" /> Select Customer</h3>
              <SearchInput
                value={customerSearch}
                onChange={setCustomerSearch}
                placeholder="Search by phone or name..."
                className="mb-4"
              />

              {selectedCustomer ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-softPink rounded-2xl border border-gold/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-heading text-primary text-lg">
                      {selectedCustomer.name}
                    </span>
                    {selectedCustomer.isVip && <Badge variant="vip">VIP</Badge>}
                  </div>
                  <p className="text-sm font-body text-text/60 flex items-center gap-1.5"><CssIcon name="phone" size={12} /> {selectedCustomer.phone}</p>
                  {selectedCustomer.size && (
                    <p className="text-sm font-body text-text/60 flex items-center gap-1.5"><CssIcon name="scissors" size={12} /> Size: {selectedCustomer.size}</p>
                  )}
                  <p className="text-sm font-body text-text/60 flex items-center gap-1.5">
                    <CssIcon name="rupee" size={12} /> Total: {formatCurrency(Number(selectedCustomer.totalKharida))}
                  </p>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-xs text-danger mt-2 hover:underline font-body"
                  >
                    Change Customer
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <motion.div
                      key={c.id}
                      whileHover={{ x: 4 }}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch("");
                      }}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-softPink cursor-pointer transition-colors group"
                    >
                      <div>
                        <span className="font-body font-medium text-text group-hover:text-primary transition-colors">
                          {c.name}
                        </span>
                        <span className="text-xs text-text/40 ml-2">{c.phone}</span>
                      </div>
                      {c.isVip && <Badge variant="vip">VIP</Badge>}
                    </motion.div>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <p className="text-sm text-text/40 text-center py-4 font-body">
                      No customers found
                    </p>
                  )}
                </div>
              )}
            </Card>
          </motion.div>

          {/* Column 2 - Add Items */}
          <motion.div variants={item}>
            <Card hover={false} className="h-full">
              <h3 className="text-lg font-heading text-primary mb-4 flex items-center gap-2"><CssIcon name="package" size={16} className="text-gold" /> Products</h3>
              <SearchInput
                value={productSearch}
                onChange={setProductSearch}
                placeholder="Red Kurti, Lehenga..."
                className="mb-4"
              />

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.015, y: -2 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="p-3 rounded-2xl border border-[#E6E2D8] hover:border-gold/50 hover:shadow-md transition-all bg-white group"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {p.photoUrl ? (
                        <div className="w-14 h-16 rounded-xl overflow-hidden bg-softPink border border-[#E6E2D8] flex-shrink-0">
                          <img
                            src={p.photoUrl}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-16 rounded-xl bg-softPink border border-[#E6E2D8] flex items-center justify-center flex-shrink-0">
                          <CssIcon name="package" size={18} className="text-gold" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-body font-semibold text-text block truncate">{p.name}</span>
                            <span className="text-xs text-text/45 font-body">{p.category}</span>
                          </div>
                          <span className="font-heading text-primary font-bold whitespace-nowrap">
                            {formatCurrency(Number(p.price))}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Size + Stock buttons */}
                    <div className="flex flex-wrap gap-2">
                      {p.stocks.map((s) => (
                        <motion.button
                          key={s.id}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            if (s.quantity <= 0) {
                              showToast(`${p.name} ${s.size} out of stock!`, "error");
                              return;
                            }
                            addToCart(p, s.size);
                          }}
                          className={`relative px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all ${
                            s.quantity <= 2
                              ? "bg-danger/10 text-danger border border-danger/20"
                              : "bg-softPink text-primary border border-primary/10 hover:bg-primary hover:text-white"
                          }`}
                        >
                          {s.size}: {s.quantity}
                          {s.quantity <= 2 && s.quantity > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full animate-ping" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Column 3 - Bill Summary */}
          <motion.div variants={item}>
            <Card hover={false} className="h-full">
              <h3 className="text-lg font-heading text-primary mb-4">
                Bill Summary
              </h3>

              {/* Cart items */}
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {cart.map((item, idx) => (
                    <motion.div
                      key={`${item.productId}-${item.size}`}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      layout
                      className="flex items-center justify-between p-2.5 rounded-xl bg-softPink"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="font-body font-medium text-sm text-text truncate block">
                          {item.name}
                        </span>
                        <span className="text-xs text-text/40 font-body">
                          {item.size} • {formatCurrency(item.price)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => updateQty(idx, -1)}
                          className="w-6 h-6 rounded-full bg-white border border-gold/20 flex items-center justify-center text-xs"
                        >
                          <CssIcon name="minus" size={11} />
                        </motion.button>
                        <span className="font-body font-semibold text-sm w-5 text-center">
                          {item.qty}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.8 }}
                          onClick={() => updateQty(idx, 1)}
                          className="w-6 h-6 rounded-full bg-white border border-gold/20 flex items-center justify-center text-xs"
                        >
                          <CssIcon name="plus" size={11} />
                        </motion.button>
                        <span className="font-body font-semibold text-sm text-primary ml-1 w-16 text-right">
                          {formatCurrency(item.qty * item.price)}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {cart.length === 0 && (
                  <p className="text-center text-sm text-text/30 font-body py-8">
                    Cart is empty
                  </p>
                )}
              </div>

              <SectionDivider />

              {/* Discount */}
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm font-body text-text/60 whitespace-nowrap">Discount ₹</label>
                <input
                  type="number"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gold/20 bg-background font-body text-sm outline-none focus:border-gold/40"
                  placeholder="0"
                />
              </div>

              {/* Totals */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-sm font-body text-text/60">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm font-body text-success">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <motion.div
                  key={finalTotal}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="flex justify-between text-lg font-heading text-primary pt-2 border-t border-gold/20"
                >
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </motion.div>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {paymentMethods.map((pm) => {
                  return (
                    <motion.button
                      key={pm.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-body transition-all ${
                        paymentMethod === pm.value
                          ? "bg-primary text-white shadow-md"
                          : "bg-softPink text-text/60 hover:bg-primary/5"
                      }`}
                    >
                      <CssIcon name={pm.icon} size={15} />
                      {pm.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Generate Bill */}
              <Button fullWidth onClick={generateBill} disabled={loading}>
                {loading ? "Generating Invoice..." : "Generate Invoice"}
              </Button>

              {/* WhatsApp */}
              {cart.length > 0 && (
                <div className="mt-3 flex justify-center">
                  <WhatsAppButton
                    label="Send Invoice via WhatsApp"
                    onClick={() => showToast("Invoice sent via WhatsApp!", "success")}
                  />
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {/* New Customer Modal */}
      <Modal
        isOpen={showNewCustomer}
        onClose={() => setShowNewCustomer(false)}
        title="New Customer"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-body text-text/60 mb-1">Full Name *</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-background font-body outline-none focus:border-gold/40"
              placeholder="Anjali Sharma"
            />
          </div>
          <div>
            <label className="block text-sm font-body text-text/60 mb-1">Phone *</label>
            <input
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-background font-body outline-none focus:border-gold/40"
              placeholder="9876543210"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-body text-text/60 mb-1">City</label>
              <input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-background font-body outline-none focus:border-gold/40"
                placeholder="Nathdwara"
              />
            </div>
            <div>
              <label className="block text-sm font-body text-text/60 mb-1">Size</label>
              <input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gold/20 bg-background font-body outline-none focus:border-gold/40"
                placeholder="M"
              />
            </div>
          </div>
          <Button fullWidth onClick={createCustomer}>
            Add Customer
          </Button>
        </div>
      </Modal>

      {/* Bill Success Modal */}
      <Modal
        isOpen={showBillSuccess}
        onClose={() => setShowBillSuccess(false)}
        title="Invoice Generated!"
      >
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex justify-center mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center">
              <CssIcon name="check" size={32} />
            </div>
          </motion.div>
          <h3 className="text-2xl font-heading text-primary mb-2">
            Invoice #{lastBillNo}
          </h3>
          <p className="text-sm font-body text-text/60 mb-6">
            Invoice has been generated successfully!
          </p>
          <div className="flex gap-3 justify-center">
            <WhatsAppButton
              label="Send via WhatsApp"
              onClick={() => {
                showToast("Invoice sent via WhatsApp!");
                setShowBillSuccess(false);
              }}
            />
            <Button variant="secondary" onClick={() => setShowBillSuccess(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
