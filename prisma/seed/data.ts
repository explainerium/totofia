// Sample catalog for development. Every text exists in both languages.

type Bi = { bn: string; en: string };

export const sizes = [
  { code: "0-3m", label: { bn: "০–৩ মাস", en: "0–3 Months" } },
  { code: "3-6m", label: { bn: "৩–৬ মাস", en: "3–6 Months" } },
  { code: "6-12m", label: { bn: "৬–১২ মাস", en: "6–12 Months" } },
  { code: "12-18m", label: { bn: "১২–১৮ মাস", en: "12–18 Months" } },
  { code: "18-24m", label: { bn: "১৮–২৪ মাস", en: "18–24 Months" } },
  { code: "2-3y", label: { bn: "২–৩ বছর", en: "2–3 Years" } },
  { code: "one-size", label: { bn: "ফ্রি সাইজ", en: "One Size" } },
] as const;

export const colors = [
  { code: "sage", hex: "#9CAF88", label: { bn: "সেজ গ্রিন", en: "Sage" } },
  { code: "oat", hex: "#E3D5BF", label: { bn: "ওট", en: "Oat" } },
  { code: "terracotta", hex: "#B5653F", label: { bn: "টেরাকোটা", en: "Terracotta" } },
  { code: "cream", hex: "#F5EFE3", label: { bn: "ক্রিম", en: "Cream" } },
  { code: "seafoam", hex: "#A8D5C2", label: { bn: "সি-ফোম", en: "Seafoam" } },
  { code: "lemon", hex: "#F3E3A1", label: { bn: "লেমন প্রিন্ট", en: "Lemon Print" } },
  { code: "pastel", hex: "#E9C9B5", label: { bn: "প্যাস্টেল মিক্স", en: "Pastel Mix" } },
] as const;

type SizeCode = (typeof sizes)[number]["code"];
type ColorCode = (typeof colors)[number]["code"];

export const categories: { slug: string; image: string; name: Bi; description: Bi }[] = [
  {
    slug: "bodysuits-rompers",
    image: "ribbed-bodysuit-sage",
    name: { bn: "বডিস্যুট ও রম্পার", en: "Bodysuits & Rompers" },
    description: {
      bn: "প্রতিদিনের আরামের জন্য নরম অর্গানিক কটনের বডিস্যুট ও রম্পার।",
      en: "Soft organic cotton bodysuits and rompers for everyday comfort.",
    },
  },
  {
    slug: "sleepwear",
    image: "bamboo-sleepsuit-seafoam",
    name: { bn: "স্লিপওয়্যার ও পায়জামা", en: "Sleepwear & Pajamas" },
    description: {
      bn: "শান্ত ঘুমের জন্য হালকা ও নিঃশ্বাসযোগ্য স্লিপস্যুট।",
      en: "Light, breathable sleepsuits for calm nights.",
    },
  },
  {
    slug: "sets",
    image: "waffle-dungaree-set",
    name: { bn: "সেট ও কম্বো", en: "Sets & Combos" },
    description: {
      bn: "মিলিয়ে পরার জন্য তৈরি টু-পিস সেট।",
      en: "Ready-matched two-piece sets.",
    },
  },
  {
    slug: "knitwear",
    image: "knit-wrap-cardigan",
    name: { bn: "নিটওয়্যার ও সোয়েটার", en: "Knitwear & Sweaters" },
    description: {
      bn: "শীতের দিনে উষ্ণ রাখার নরম নিটওয়্যার।",
      en: "Soft knits to keep little ones warm.",
    },
  },
  {
    slug: "organic-essentials",
    image: "everyday-tee-4-pack",
    name: { bn: "অর্গানিক এসেনশিয়ালস", en: "Organic Essentials" },
    description: {
      bn: "জিওটিএস সার্টিফাইড অর্গানিক কটনের প্রয়োজনীয় পোশাক।",
      en: "GOTS-certified organic cotton basics.",
    },
  },
  {
    slug: "swaddles-blankets",
    image: "muslin-swaddle",
    name: { bn: "কাঁথা ও কম্বল", en: "Swaddles & Blankets" },
    description: {
      bn: "মসলিন কাঁথা আর নরম কম্বল।",
      en: "Muslin swaddles and soft blankets.",
    },
  },
];

type ProductText = {
  name: string;
  shortDescription: string;
  description: string;
  materialCare: string;
};

export const products: {
  slug: string;
  sku: string;
  categories: string[];
  images: string[];
  age?: [number, number];
  badges?: ("NEW" | "ORGANIC" | "BESTSELLER")[];
  featured?: boolean;
  color: ColorCode;
  price: number;
  salePrice?: number;
  /** [size, stock] */
  variants: [SizeCode, number][];
  text: { bn: ProductText; en: ProductText };
}[] = [
  {
    slug: "organic-ribbed-button-bodysuit",
    sku: "RBB",
    categories: ["bodysuits-rompers", "organic-essentials"],
    images: ["ribbed-bodysuit-sage"],
    age: [0, 12],
    badges: ["ORGANIC", "NEW"],
    featured: true,
    color: "sage",
    price: 1450,
    salePrice: 1250,
    variants: [
      ["0-3m", 12],
      ["3-6m", 8],
      ["6-12m", 0],
    ],
    text: {
      bn: {
        name: "অর্গানিক রিবড বাটন বডিস্যুট",
        shortDescription: "নারকেলের খোলের বোতাম দেওয়া নরম রিবড অর্গানিক কটন বডিস্যুট।",
        description: "<p>শিশুর কোমল ত্বকের কথা ভেবে তৈরি। সামনে বোতাম থাকায় পরানো ও খোলা সহজ।</p>",
        materialCare: "১০০% জিওটিএস অর্গানিক কটন। ঠান্ডা পানিতে হালকা করে ধুয়ে নিন।",
      },
      en: {
        name: "Organic Ribbed Button Bodysuit",
        shortDescription: "Soft ribbed organic cotton bodysuit with coconut-shell buttons.",
        description:
          "<p>Made with delicate skin in mind. Front buttons make dressing and changing easy.</p>",
        materialCare: "100% GOTS organic cotton. Gentle cold wash.",
      },
    },
  },
  {
    slug: "bamboo-zip-sleepsuit",
    sku: "BZS",
    categories: ["sleepwear"],
    images: ["bamboo-sleepsuit-seafoam"],
    age: [0, 18],
    badges: ["BESTSELLER"],
    featured: true,
    color: "seafoam",
    price: 1650,
    variants: [
      ["0-3m", 10],
      ["3-6m", 10],
      ["6-12m", 6],
      ["12-18m", 4],
    ],
    text: {
      bn: {
        name: "বাঁশ তন্তুর জিপার স্লিপস্যুট",
        shortDescription: "দুই দিকের জিপার আর ভাঁজ করা মিটেন কাফসহ নরম স্লিপস্যুট।",
        description:
          "<p>রাতে ডায়াপার বদলানো সহজ করতে দুই দিকের জিপার। বাঁশ তন্তুর কাপড় শরীরের তাপমাত্রা ঠিক রাখে।</p>",
        materialCare: "৯৫% বাঁশ ভিসকোস, ৫% স্প্যানডেক্স। উল্টো করে ঠান্ডা পানিতে ধুয়ে নিন।",
      },
      en: {
        name: "Bamboo Zip Sleepsuit",
        shortDescription: "Soft sleepsuit with a two-way zip and fold-over mitten cuffs.",
        description:
          "<p>The two-way zip makes night-time changes easy. Bamboo fabric helps regulate body temperature.</p>",
        materialCare: "95% bamboo viscose, 5% spandex. Wash inside out, cold.",
      },
    },
  },
  {
    slug: "waffle-knit-dungaree-set",
    sku: "WDS",
    categories: ["sets"],
    images: ["waffle-dungaree-set"],
    age: [6, 36],
    badges: ["NEW"],
    featured: true,
    color: "terracotta",
    price: 1850,
    salePrice: 1650,
    variants: [
      ["6-12m", 5],
      ["12-18m", 5],
      ["18-24m", 3],
      ["2-3y", 2],
    ],
    text: {
      bn: {
        name: "ওয়াফল নিট ডাঙ্গারি সেট",
        shortDescription: "অর্গানিক কটন টি-শার্টসহ টেরাকোটা ওয়াফল নিট ডাঙ্গারি।",
        description: "<p>হামাগুড়ি আর খেলাধুলার জন্য আরামদায়ক। কাঁধে কাঠের বোতাম।</p>",
        materialCare: "১০০% কটন। একই রঙের কাপড়ের সাথে ধুয়ে নিন।",
      },
      en: {
        name: "Waffle Knit Dungaree Set",
        shortDescription: "Terracotta waffle-knit dungarees with an organic cotton tee.",
        description: "<p>Comfortable for crawling and play. Wooden buttons at the shoulders.</p>",
        materialCare: "100% cotton. Wash with similar colours.",
      },
    },
  },
  {
    slug: "muslin-sun-romper",
    sku: "MSR",
    categories: ["bodysuits-rompers"],
    images: ["muslin-sun-romper"],
    age: [3, 18],
    featured: true,
    color: "lemon",
    price: 1350,
    variants: [
      ["3-6m", 7],
      ["6-12m", 7],
      ["12-18m", 5],
    ],
    text: {
      bn: {
        name: "মসলিন সান রম্পার",
        shortDescription: "গরমের দিনের জন্য লেবু প্রিন্টের হালকা মসলিন রম্পার।",
        description: "<p>দুই স্তরের নরম মসলিন, বাতাস চলাচল করে। নিচে স্ন্যাপ বোতাম।</p>",
        materialCare: "১০০% অর্গানিক কটন মসলিন। হালকা করে ধুয়ে ছায়ায় শুকান।",
      },
      en: {
        name: "Muslin Sun Romper",
        shortDescription: "Light lemon-print muslin romper for warm days.",
        description: "<p>Two layers of soft, breathable muslin. Snap buttons at the bottom.</p>",
        materialCare: "100% organic cotton muslin. Gentle wash, dry in shade.",
      },
    },
  },
  {
    slug: "organic-bodysuit-gift-pack",
    sku: "BGP",
    categories: ["bodysuits-rompers", "organic-essentials"],
    images: ["bodysuit-gift-pack"],
    age: [0, 12],
    badges: ["ORGANIC", "BESTSELLER"],
    featured: true,
    color: "pastel",
    price: 2250,
    salePrice: 1990,
    variants: [
      ["0-3m", 6],
      ["3-6m", 6],
      ["6-12m", 6],
    ],
    text: {
      bn: {
        name: "অর্গানিক বডিস্যুট গিফট প্যাক (৩টি)",
        shortDescription: "উপহার দেওয়ার জন্য সাজানো তিনটি অর্গানিক কটন বডিস্যুট।",
        description: "<p>সেজ, ওট আর টেরাকোটা — তিন রঙের তিনটি বডিস্যুট, ফিতা দিয়ে বাঁধা।</p>",
        materialCare: "১০০% জিওটিএস অর্গানিক কটন। ঠান্ডা পানিতে ধুয়ে নিন।",
      },
      en: {
        name: "Organic Bodysuit Gift Pack (3 pcs)",
        shortDescription: "Three organic cotton bodysuits, wrapped and ready to gift.",
        description: "<p>Sage, oat and terracotta — three bodysuits tied with a ribbon.</p>",
        materialCare: "100% GOTS organic cotton. Cold wash.",
      },
    },
  },
  {
    slug: "everyday-cotton-tee-4-pack",
    sku: "ET4",
    categories: ["organic-essentials"],
    images: ["everyday-tee-4-pack"],
    age: [6, 36],
    badges: ["ORGANIC"],
    color: "pastel",
    price: 1950,
    variants: [
      ["6-12m", 8],
      ["12-18m", 8],
      ["18-24m", 8],
      ["2-3y", 8],
    ],
    text: {
      bn: {
        name: "এভরিডে কটন টি (৪টি)",
        shortDescription: "কাঁধে বোতাম দেওয়া চারটি প্যাস্টেল রঙের কটন টি-শার্ট।",
        description: "<p>কাঁধের বোতামের কারণে মাথা দিয়ে পরানো সহজ।</p>",
        materialCare: "১০০% অর্গানিক কটন। মেশিনে ধোয়া যাবে।",
      },
      en: {
        name: "Everyday Cotton Tee (4 pcs)",
        shortDescription: "Four pastel cotton tees with shoulder buttons.",
        description: "<p>Shoulder buttons make them easy to pull over the head.</p>",
        materialCare: "100% organic cotton. Machine washable.",
      },
    },
  },
  {
    slug: "knit-wrap-cardigan",
    sku: "KWC",
    categories: ["knitwear"],
    images: ["knit-wrap-cardigan"],
    age: [0, 24],
    featured: true,
    color: "oat",
    price: 1750,
    variants: [
      ["0-3m", 4],
      ["3-6m", 4],
      ["6-12m", 4],
      ["12-18m", 3],
      ["18-24m", 0],
    ],
    text: {
      bn: {
        name: "নিট র‍্যাপ কার্ডিগান",
        shortDescription: "শীতের সকালের জন্য নরম ওট রঙের নিট কার্ডিগান।",
        description: "<p>র‍্যাপ স্টাইলের কারণে পরানো সহজ, ঘাড়ে চাপ পড়ে না।</p>",
        materialCare: "৮০% কটন, ২০% উল। হাতে ধুয়ে সমান করে শুকান।",
      },
      en: {
        name: "Knit Wrap Cardigan",
        shortDescription: "Soft oat-coloured knit cardigan for cool mornings.",
        description: "<p>The wrap style makes it easy to put on without pulling over the head.</p>",
        materialCare: "80% cotton, 20% wool. Hand wash, dry flat.",
      },
    },
  },
  {
    slug: "muslin-swaddle-wrap",
    sku: "MSW",
    categories: ["swaddles-blankets"],
    images: ["muslin-swaddle", "muslin-swaddle-folded"],
    age: [0, 12],
    badges: ["ORGANIC"],
    featured: true,
    color: "cream",
    price: 1150,
    variants: [["one-size", 20]],
    text: {
      bn: {
        name: "মসলিন সোয়াডল কাঁথা",
        shortDescription: "পাতার প্রিন্টের বড় মাপের নরম মসলিন কাঁথা।",
        description:
          "<p>জড়িয়ে রাখা, বুকের দুধ খাওয়ানোর সময় ঢেকে রাখা বা হালকা কম্বল — সব কাজে লাগে। ১২০ × ১২০ সেমি।</p>",
        materialCare: "১০০% অর্গানিক কটন মসলিন। যত ধোবেন তত নরম হবে।",
      },
      en: {
        name: "Muslin Swaddle Wrap",
        shortDescription: "Large, soft muslin swaddle with a leaf print.",
        description:
          "<p>Swaddle, nursing cover or light blanket — it does it all. 120 × 120 cm.</p>",
        materialCare: "100% organic cotton muslin. Gets softer with every wash.",
      },
    },
  },
  {
    slug: "organic-essentials-set",
    sku: "OES",
    categories: ["sets", "organic-essentials"],
    images: ["organic-essentials-set"],
    age: [0, 12],
    badges: ["ORGANIC", "NEW"],
    color: "sage",
    price: 2450,
    variants: [
      ["0-3m", 3],
      ["3-6m", 3],
      ["6-12m", 3],
    ],
    text: {
      bn: {
        name: "অর্গানিক এসেনশিয়ালস সেট",
        shortDescription: "বডিস্যুট, ব্লুমার আর টি-শার্ট — নবজাতকের প্রথম সেট।",
        description: "<p>নবজাতকের প্রথম কয়েক মাসের দরকারি পোশাক এক সেটে।</p>",
        materialCare: "১০০% জিওটিএস অর্গানিক কটন। ঠান্ডা পানিতে ধুয়ে নিন।",
      },
      en: {
        name: "Organic Essentials Set",
        shortDescription: "Bodysuit, bloomers and tee — a first set for newborns.",
        description: "<p>The everyday pieces for the first months, in one set.</p>",
        materialCare: "100% GOTS organic cotton. Cold wash.",
      },
    },
  },
  {
    slug: "cotton-knit-blanket",
    sku: "CKB",
    categories: ["swaddles-blankets", "knitwear"],
    images: ["cotton-knit-blanket"],
    color: "oat",
    price: 2150,
    variants: [["one-size", 0]],
    text: {
      bn: {
        name: "কটন নিট কম্বল",
        shortDescription: "খাট বা স্ট্রলারের জন্য নরম কটন নিট কম্বল।",
        description: "<p>হালকা কিন্তু উষ্ণ। ৯০ × ১১০ সেমি।</p>",
        materialCare: "১০০% কটন। হাতে ধুয়ে সমান করে শুকান।",
      },
      en: {
        name: "Cotton Knit Blanket",
        shortDescription: "Soft cotton knit blanket for the cot or stroller.",
        description: "<p>Light but warm. 90 × 110 cm.</p>",
        materialCare: "100% cotton. Hand wash, dry flat.",
      },
    },
  },
];

export const shippingZones = [
  {
    code: "inside-dhaka",
    name: { bn: "ঢাকা সিটির ভেতরে", en: "Inside Dhaka" },
    fee: 70,
    freeAboveSubtotal: 2000,
    minDays: 1,
    maxDays: 2,
    districts: ["dhaka"],
    isDefault: false,
    isActive: true,
    sortOrder: 0,
  },
  {
    code: "dhaka-suburbs",
    name: { bn: "ঢাকার আশপাশে", en: "Dhaka suburbs" },
    fee: 100,
    freeAboveSubtotal: null,
    minDays: 2,
    maxDays: 3,
    districts: ["gazipur", "narayanganj"],
    isDefault: false,
    isActive: true,
    sortOrder: 1,
  },
  {
    code: "outside-dhaka",
    name: { bn: "ঢাকার বাইরে", en: "Outside Dhaka" },
    fee: 130,
    freeAboveSubtotal: null,
    minDays: 3,
    maxDays: 5,
    districts: [],
    isDefault: true,
    isActive: true,
    sortOrder: 2,
  },
];

export const coupons = [
  {
    code: "WELCOME10",
    type: "PERCENT",
    value: 10,
    minOrder: 1000,
    maxDiscount: 300,
    perPhoneLimit: 1,
  },
  { code: "FREESHIP", type: "FREE_SHIPPING", minOrder: 1500 },
];
