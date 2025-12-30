export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  priceCents: number;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
  };
  createdAt: string; // ISO string
  status: OrderStatus;
  items: OrderItem[];
  shippingAddress: string;
  tags: string[];
  notes?: string;
}

export const orderStatuses = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
] as const satisfies OrderStatus[];

export const orders: Order[] = [
  {
    id: "ord_1043",
    customer: { name: "Acme Corp (Operations)", email: "ops@acme.com" },
    createdAt: "2024-08-27T10:20:00Z",
    status: "Processing",
    items: [
      {
        id: "it_1",
        name: "Stainless Steel Water Bottle",
        quantity: 3,
        priceCents: 2400,
      },
      { id: "it_2", name: "Bamboo Notebook", quantity: 5, priceCents: 1299 },
      { id: "it_3", name: "Gift Wrap", quantity: 2, priceCents: 299 },
    ],
    shippingAddress: "123 Market St, San Francisco, CA 94103",
    tags: ["wholesale", "priority"],
    notes: "Customer requested eco-friendly packaging.",
  },
  {
    id: "ord_1044",
    customer: { name: "Brightside Studio", email: "hello@brightside.studio" },
    createdAt: "2024-08-28T14:42:00Z",
    status: "Shipped",
    items: [
      {
        id: "it_1",
        name: "Ceramic Mug (Matte Black)",
        quantity: 12,
        priceCents: 1599,
      },
      { id: "it_2", name: "Enamel Pin — Moon", quantity: 24, priceCents: 499 },
    ],
    shippingAddress: "80 Orchard Rd, New York, NY 10002",
    tags: ["studio", "bulk"],
  },
  {
    id: "ord_1045",
    customer: { name: "Lina Park", email: "lina.park@example.com" },
    createdAt: "2024-08-30T09:05:00Z",
    status: "Delivered",
    items: [
      {
        id: "it_1",
        name: "Cotton T-Shirt — Unisex (M)",
        quantity: 2,
        priceCents: 2200,
      },
      { id: "it_2", name: "Canvas Tote Bag", quantity: 1, priceCents: 1800 },
    ],
    shippingAddress: "221B Baker St, London NW1 6XE, UK",
    tags: ["gift", "international"],
    notes: "Include a handwritten note.",
  },
  {
    id: "ord_1046",
    customer: { name: "Nova Garden Co.", email: "orders@novagarden.co" },
    createdAt: "2024-09-02T16:18:00Z",
    status: "Pending",
    items: [
      {
        id: "it_1",
        name: "Terracotta Planter (L)",
        quantity: 6,
        priceCents: 3200,
      },
      {
        id: "it_2",
        name: "Organic Potting Soil (5 lb)",
        quantity: 6,
        priceCents: 1399,
      },
      { id: "it_3", name: "Watering Can", quantity: 3, priceCents: 2499 },
    ],
    shippingAddress: "455 Garden Ave, Portland, OR 97205",
    tags: ["new-customer"],
  },
  {
    id: "ord_1047",
    customer: { name: "Aurora Films", email: "team@aurorafilms.tv" },
    createdAt: "2024-09-03T11:03:00Z",
    status: "Shipped",
    items: [
      {
        id: "it_1",
        name: "Hoodie — Charcoal (L)",
        quantity: 10,
        priceCents: 4899,
      },
      {
        id: "it_2",
        name: "Sticker Pack — Cosmic",
        quantity: 50,
        priceCents: 199,
      },
    ],
    shippingAddress: "12 Vine St, Los Angeles, CA 90028",
    tags: ["sponsor", "event"],
  },
  {
    id: "ord_1048",
    customer: { name: "Samir Patel", email: "samir.patel@example.com" },
    createdAt: "2024-09-04T08:25:00Z",
    status: "Cancelled",
    items: [
      {
        id: "it_1",
        name: "Desk Mat — Felt (Gray)",
        quantity: 1,
        priceCents: 3299,
      },
      { id: "it_2", name: "Cable Organizer", quantity: 2, priceCents: 799 },
    ],
    shippingAddress: "9 King St, Toronto, ON M5H 1J9, Canada",
    tags: ["cancelled"],
    notes: "Duplicate order placed by mistake.",
  },
  {
    id: "ord_1049",
    customer: { name: "Greenhill School", email: "procurement@greenhill.edu" },
    createdAt: "2024-09-05T12:12:00Z",
    status: "Processing",
    items: [
      {
        id: "it_1",
        name: "Notebook — Grid A5",
        quantity: 120,
        priceCents: 899,
      },
      {
        id: "it_2",
        name: "Gel Pen — 0.5mm Black",
        quantity: 200,
        priceCents: 199,
      },
    ],
    shippingAddress: "700 Campus Dr, Austin, TX 73301",
    tags: ["education", "bulk", "net-30"],
  },
  {
    id: "ord_1050",
    customer: { name: "Blossom Bakery", email: "hello@blossombakery.com" },
    createdAt: "2024-09-06T15:45:00Z",
    status: "Delivered",
    items: [
      {
        id: "it_1",
        name: "Apron — Canvas (Navy)",
        quantity: 8,
        priceCents: 2599,
      },
      {
        id: "it_2",
        name: "Oven Mitt — Heat Resistant",
        quantity: 8,
        priceCents: 1499,
      },
      {
        id: "it_3",
        name: "Tea Towel — Set of 3",
        quantity: 6,
        priceCents: 1899,
      },
    ],
    shippingAddress: "500 Baker Ln, Seattle, WA 98101",
    tags: ["hospitality"],
    notes: "Urgent restock before weekend rush.",
  },
];
