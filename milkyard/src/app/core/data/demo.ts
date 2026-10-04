import { Address, AppNotification, Order, OrderItem, OrderStatus, PaymentMethod, Product, Review, TrafficDay, User, DeliveryZone } from '../models';

/*
 * Deterministic demo data so the admin analytics have something realistic to
 * show. Dates are generated relative to "today" so the dashboard always looks live.
 * Replace with API calls once the backend exists.
 */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ['Ananya', 'Sourav', 'Priyanka', 'Arijit', 'Riya', 'Debasish', 'Moumita', 'Rahul', 'Sneha', 'Abhishek', 'Payel', 'Subhajit', 'Tanushree', 'Kaushik', 'Ishita', 'Sayan', 'Rupa', 'Aniket', 'Sharmistha', 'Indranil', 'Poulami', 'Sandip', 'Madhurima', 'Rohan', 'Aditi', 'Soumya', 'Trisha', 'Amit', 'Nandini', 'Pritam'];
const LAST = ['Banerjee', 'Chatterjee', 'Mukherjee', 'Ghosh', 'Bose', 'Das', 'Sen', 'Roy', 'Dutta', 'Saha', 'Sarkar', 'Gupta', 'Agarwal', 'Paul', 'Mitra'];
const STREETS = ['Lake Road', 'Rashbehari Avenue', 'Southern Avenue', 'Jessore Road', 'Gariahat Road', 'Park Street', 'Sarat Bose Road', 'B.T. Road', 'Prince Anwar Shah Road', 'Hindustan Park', 'Salt Lake Sector V', 'Action Area I', 'Ballygunge Place', 'Bidhan Sarani', 'Elgin Road'];
const PINS = ['700019', '700029', '700026', '700068', '700045', '700016', '700020', '700091', '700064', '700156', '700004', '700006', '700028', '700032', '700053', '700084', '700010', '700017', '700107', '700075'];

export function zoneFor(pin: string, zones: DeliveryZone[]): DeliveryZone | undefined {
  const n = +pin;
  return zones.find((z) =>
    z.pincodes.some((p) => {
      const [a, b] = p.split('-').map((x) => +x.trim());
      return b ? n >= a && n <= b : n === a;
    }),
  );
}

export function buildDemo(products: Product[], zones: DeliveryZone[]) {
  const r = rng(20261004);
  const pick = <T>(a: T[]) => a[Math.floor(r() * a.length)];
  const now = Date.now();
  const DAY = 864e5;

  // ---- customers
  const users: User[] = [];
  for (let i = 0; i < 64; i++) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    const phone = `9${String(Math.floor(r() * 1e9)).padStart(9, '0')}`;
    const pin = pick(PINS);
    const addr: Address = {
      id: `a${i}`,
      label: r() > 0.3 ? 'Home' : 'Office',
      name,
      phone,
      line1: `${Math.floor(r() * 200) + 1}, ${pick(STREETS)}`,
      line2: '',
      landmark: r() > 0.5 ? 'Near the park' : '',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: pin,
      isDefault: true,
    };
    users.push({
      id: `u${i}`,
      phone,
      name,
      email: `${name.split(' ')[0].toLowerCase()}.${name.split(' ')[1].toLowerCase()}${i}@example.com`,
      altPhone: '',
      role: 'customer',
      createdAt: new Date(now - Math.floor(r() * 200 + 2) * DAY).toISOString(),
      addresses: [addr],
      wishlist: [],
    });
  }

  // weight popular products more heavily
  const weights = products.map((p) => p.sold + 50);
  const totalW = weights.reduce((a, b) => a + b, 0);
  const weightedProduct = () => {
    let x = r() * totalW;
    for (let i = 0; i < products.length; i++) {
      x -= weights[i];
      if (x <= 0) return products[i];
    }
    return products[0];
  };

  // ---- orders across the past ~180 days, growing over time
  const orders: Order[] = [];
  let seq = 10240;
  for (let d = 180; d >= 0; d--) {
    const growth = 1 + (180 - d) / 120;
    const weekend = [0, 6].includes(new Date(now - d * DAY).getDay()) ? 1.35 : 1;
    const count = Math.max(0, Math.round((1.4 + r() * 2.6) * growth * weekend) - (d === 0 ? 2 : 0));
    for (let k = 0; k < count; k++) {
      // returning customers: a subset orders frequently
      const u = r() < 0.45 ? users[Math.floor(r() * 14)] : pick(users);
      const created = new Date(now - d * DAY - Math.floor(r() * 10 * 36e5) - (d === 0 ? 0 : 0));
      if (created.getTime() > now) created.setTime(now - Math.floor(r() * 3 * 36e5));
      const lines = 1 + Math.floor(r() * 3);
      const items: OrderItem[] = [];
      for (let l = 0; l < lines; l++) {
        const p = weightedProduct();
        const variant = pick(p.variants);
        if (items.some((it) => it.variantId === variant.id)) continue;
        items.push({
          productId: p.id,
          variantId: variant.id,
          name: p.name,
          variantLabel: variant.label,
          image: p.images[0],
          price: variant.price,
          mrp: variant.mrp,
          qty: r() > 0.8 ? 2 : 1,
          costPrice: variant.costPrice,
          packagingCost: variant.packagingCost,
        });
      }
      const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
      const address = u.addresses[0];
      const zone = zoneFor(address.pincode, zones) ?? zones[0];
      const deliveryCharge = subtotal >= zone.freeAbove ? 0 : zone.charge;
      const discount = r() < 0.18 ? Math.min(150, Math.round(subtotal * 0.1)) : 0;
      let status: OrderStatus = 'Delivered';
      if (d === 0) status = pick<OrderStatus>(['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Confirmed']);
      else if (d === 1) status = pick<OrderStatus>(['Out for Delivery', 'Delivered', 'Delivered', 'Preparing']);
      else if (r() < 0.04) status = 'Cancelled';
      else if (r() < 0.015) status = 'Refunded';
      const method = pick<PaymentMethod>(['UPI', 'UPI', 'UPI', 'Card', 'NetBanking', 'Wallet']);
      const paymentStatus = status === 'Cancelled' ? (r() > 0.5 ? 'Refunded' : 'Failed') : status === 'Refunded' ? 'Refunded' : status === 'Pending' && r() > 0.6 ? 'Pending' : 'Paid';
      const timeline: Order['timeline'] = [{ status: 'Pending', at: created.toISOString() }];
      const flow: OrderStatus[] = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
      if (!['Pending', 'Cancelled', 'Failed', 'Refunded'].includes(status)) {
        for (const s of flow) {
          timeline.push({ status: s, at: new Date(created.getTime() + (flow.indexOf(s) + 1) * 3.5 * 36e5).toISOString() });
          if (s === status) break;
        }
      } else if (status !== 'Pending') {
        timeline.push({ status, at: new Date(created.getTime() + 2 * 36e5).toISOString() });
      }
      orders.push({
        id: `MY${seq++}`,
        userId: u.id,
        customerName: u.name,
        phone: u.phone,
        email: u.email,
        createdAt: created.toISOString(),
        items,
        address,
        subtotal,
        discount,
        couponCode: discount ? 'WELCOME10' : undefined,
        deliveryCharge,
        deliveryCost: zone.riderCost,
        total: subtotal - discount + deliveryCharge,
        paymentStatus,
        paymentMethod: method,
        paymentRef: paymentStatus === 'Paid' ? `pay_${Math.floor(r() * 1e14).toString(36)}` : undefined,
        status,
        zoneName: zone.name,
        timeline,
      });
    }
  }
  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // ---- traffic
  const traffic: TrafficDay[] = [];
  for (let d = 180; d >= 0; d--) {
    const date = new Date(now - d * DAY).toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === date).length;
    const sessions = Math.round(dayOrders * (32 + r() * 18) + 40 + r() * 30);
    traffic.push({
      date,
      sessions,
      visitors: Math.round(sessions * (0.72 + r() * 0.1)),
      pageViews: Math.round(sessions * (3.1 + r() * 1.2)),
      productViews: Math.round(sessions * (1.5 + r() * 0.6)),
      addToCart: Math.round(sessions * (0.08 + r() * 0.04)),
      checkouts: Math.round(sessions * (0.04 + r() * 0.015)),
    });
  }

  // ---- reviews
  const REVIEW_TEXT: [number, string, string][] = [
    [5, 'Smells exactly like home-made ghee', 'The aroma when you open the jar is unreal. My mother approved — that says everything.'],
    [5, 'Grainy and golden', 'Lovely danedar texture and it does not leave that waxy feel. Will reorder.'],
    [4, 'Very good, slightly pricey', 'Quality is clearly better than the supermarket brands. Delivery was on time in Salt Lake.'],
    [5, 'Kheer tasted like Sunday at Dida’s', 'Thick, not overly sweet, and you can actually taste the saffron. Arrived cold.'],
    [5, 'Laddus vanished in a day', 'Soft, crumbly and you can taste the ghee. Ordering the 1 kg pack next time.'],
    [5, 'Perfect for bhog', 'Makkhan was fresh and soft. Used it for Janmashtami bhog. Packaging was neat and clean.'],
    [4, 'Fresh and well packed', 'Everything came sealed and chilled. Would love a smaller kheer size for one person.'],
    [5, 'Best mishti doi outside a sweet shop', 'Thick, caramel-y, the clay bhaar makes all the difference.'],
    [5, 'Gifted to my in-laws', 'The yellow box looks premium and everything inside was delicious. Great Bijoya gift.'],
    [3, 'Good but delivery took a day', 'Product was good. Delivery to Behala was next day, which is fine but I hoped for same day.'],
    [5, 'Clean, honest product', 'You can tell it is made in small batches. Love that there is a phone number to call.'],
    [4, 'Nuts were crunchy and big', 'Cashews were large and fresh. Pouch is resealable which helps.'],
  ];
  const reviews: Review[] = [];
  let rid = 1;
  for (const p of products) {
    const n = 2 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const [rating, title, body] = pick(REVIEW_TEXT);
      const u = pick(users);
      reviews.push({
        id: `r${rid++}`,
        productId: p.id,
        userId: u.id,
        userName: `${u.name.split(' ')[0]} ${u.name.split(' ')[1][0]}.`,
        rating,
        title,
        body,
        createdAt: new Date(now - Math.floor(r() * 90 + 1) * DAY).toISOString(),
        verified: r() > 0.1,
        status: rid % 9 === 0 ? 'pending' : 'approved',
      });
    }
  }

  const notifications: AppNotification[] = [
    { id: 'n1', audience: 'admin', channel: 'in-app', type: 'order', title: `New order ${orders[0]?.id}`, body: `${orders[0]?.customerName} placed an order of ₹${orders[0]?.total}`, at: orders[0]?.createdAt, read: false, link: `/admin/orders/${orders[0]?.id}` },
    { id: 'n2', audience: 'admin', channel: 'in-app', type: 'stock', title: 'Low stock: Ghee Besan Laddu 1 kg', body: 'Only 3 units left.', at: new Date(now - 3 * 36e5).toISOString(), read: false, link: '/admin/inventory' },
    { id: 'n3', audience: 'admin', channel: 'in-app', type: 'payment', title: 'Payment failed', body: 'A UPI payment of ₹649 failed and was not captured.', at: new Date(now - 7 * 36e5).toISOString(), read: true, link: '/admin/orders' },
  ];

  return { users, orders, traffic, reviews, notifications };
}
