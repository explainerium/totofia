// Bangladesh divisions and districts (64). Codes are stable ids stored on orders and zones.

type Name = { bn: string; en: string };

export const DIVISIONS = {
  barishal: { bn: "বরিশাল", en: "Barishal" },
  chattogram: { bn: "চট্টগ্রাম", en: "Chattogram" },
  dhaka: { bn: "ঢাকা", en: "Dhaka" },
  khulna: { bn: "খুলনা", en: "Khulna" },
  mymensingh: { bn: "ময়মনসিংহ", en: "Mymensingh" },
  rajshahi: { bn: "রাজশাহী", en: "Rajshahi" },
  rangpur: { bn: "রংপুর", en: "Rangpur" },
  sylhet: { bn: "সিলেট", en: "Sylhet" },
} satisfies Record<string, Name>;

export type DivisionCode = keyof typeof DIVISIONS;

export const DISTRICTS: { code: string; division: DivisionCode; name: Name }[] = [
  // Barishal
  { code: "barguna", division: "barishal", name: { bn: "বরগুনা", en: "Barguna" } },
  { code: "barishal", division: "barishal", name: { bn: "বরিশাল", en: "Barishal" } },
  { code: "bhola", division: "barishal", name: { bn: "ভোলা", en: "Bhola" } },
  { code: "jhalokati", division: "barishal", name: { bn: "ঝালকাঠি", en: "Jhalokati" } },
  { code: "patuakhali", division: "barishal", name: { bn: "পটুয়াখালী", en: "Patuakhali" } },
  { code: "pirojpur", division: "barishal", name: { bn: "পিরোজপুর", en: "Pirojpur" } },
  // Chattogram
  { code: "bandarban", division: "chattogram", name: { bn: "বান্দরবান", en: "Bandarban" } },
  {
    code: "brahmanbaria",
    division: "chattogram",
    name: { bn: "ব্রাহ্মণবাড়িয়া", en: "Brahmanbaria" },
  },
  { code: "chandpur", division: "chattogram", name: { bn: "চাঁদপুর", en: "Chandpur" } },
  { code: "chattogram", division: "chattogram", name: { bn: "চট্টগ্রাম", en: "Chattogram" } },
  { code: "cumilla", division: "chattogram", name: { bn: "কুমিল্লা", en: "Cumilla" } },
  { code: "coxs-bazar", division: "chattogram", name: { bn: "কক্সবাজার", en: "Cox's Bazar" } },
  { code: "feni", division: "chattogram", name: { bn: "ফেনী", en: "Feni" } },
  { code: "khagrachhari", division: "chattogram", name: { bn: "খাগড়াছড়ি", en: "Khagrachhari" } },
  { code: "lakshmipur", division: "chattogram", name: { bn: "লক্ষ্মীপুর", en: "Lakshmipur" } },
  { code: "noakhali", division: "chattogram", name: { bn: "নোয়াখালী", en: "Noakhali" } },
  { code: "rangamati", division: "chattogram", name: { bn: "রাঙ্গামাটি", en: "Rangamati" } },
  // Dhaka
  { code: "dhaka", division: "dhaka", name: { bn: "ঢাকা", en: "Dhaka" } },
  { code: "faridpur", division: "dhaka", name: { bn: "ফরিদপুর", en: "Faridpur" } },
  { code: "gazipur", division: "dhaka", name: { bn: "গাজীপুর", en: "Gazipur" } },
  { code: "gopalganj", division: "dhaka", name: { bn: "গোপালগঞ্জ", en: "Gopalganj" } },
  { code: "kishoreganj", division: "dhaka", name: { bn: "কিশোরগঞ্জ", en: "Kishoreganj" } },
  { code: "madaripur", division: "dhaka", name: { bn: "মাদারীপুর", en: "Madaripur" } },
  { code: "manikganj", division: "dhaka", name: { bn: "মানিকগঞ্জ", en: "Manikganj" } },
  { code: "munshiganj", division: "dhaka", name: { bn: "মুন্সিগঞ্জ", en: "Munshiganj" } },
  { code: "narayanganj", division: "dhaka", name: { bn: "নারায়ণগঞ্জ", en: "Narayanganj" } },
  { code: "narsingdi", division: "dhaka", name: { bn: "নরসিংদী", en: "Narsingdi" } },
  { code: "rajbari", division: "dhaka", name: { bn: "রাজবাড়ী", en: "Rajbari" } },
  { code: "shariatpur", division: "dhaka", name: { bn: "শরীয়তপুর", en: "Shariatpur" } },
  { code: "tangail", division: "dhaka", name: { bn: "টাঙ্গাইল", en: "Tangail" } },
  // Khulna
  { code: "bagerhat", division: "khulna", name: { bn: "বাগেরহাট", en: "Bagerhat" } },
  { code: "chuadanga", division: "khulna", name: { bn: "চুয়াডাঙ্গা", en: "Chuadanga" } },
  { code: "jashore", division: "khulna", name: { bn: "যশোর", en: "Jashore" } },
  { code: "jhenaidah", division: "khulna", name: { bn: "ঝিনাইদহ", en: "Jhenaidah" } },
  { code: "khulna", division: "khulna", name: { bn: "খুলনা", en: "Khulna" } },
  { code: "kushtia", division: "khulna", name: { bn: "কুষ্টিয়া", en: "Kushtia" } },
  { code: "magura", division: "khulna", name: { bn: "মাগুরা", en: "Magura" } },
  { code: "meherpur", division: "khulna", name: { bn: "মেহেরপুর", en: "Meherpur" } },
  { code: "narail", division: "khulna", name: { bn: "নড়াইল", en: "Narail" } },
  { code: "satkhira", division: "khulna", name: { bn: "সাতক্ষীরা", en: "Satkhira" } },
  // Mymensingh
  { code: "jamalpur", division: "mymensingh", name: { bn: "জামালপুর", en: "Jamalpur" } },
  { code: "mymensingh", division: "mymensingh", name: { bn: "ময়মনসিংহ", en: "Mymensingh" } },
  { code: "netrokona", division: "mymensingh", name: { bn: "নেত্রকোণা", en: "Netrokona" } },
  { code: "sherpur", division: "mymensingh", name: { bn: "শেরপুর", en: "Sherpur" } },
  // Rajshahi
  { code: "bogura", division: "rajshahi", name: { bn: "বগুড়া", en: "Bogura" } },
  {
    code: "chapai-nawabganj",
    division: "rajshahi",
    name: { bn: "চাঁপাইনবাবগঞ্জ", en: "Chapai Nawabganj" },
  },
  { code: "joypurhat", division: "rajshahi", name: { bn: "জয়পুরহাট", en: "Joypurhat" } },
  { code: "naogaon", division: "rajshahi", name: { bn: "নওগাঁ", en: "Naogaon" } },
  { code: "natore", division: "rajshahi", name: { bn: "নাটোর", en: "Natore" } },
  { code: "pabna", division: "rajshahi", name: { bn: "পাবনা", en: "Pabna" } },
  { code: "rajshahi", division: "rajshahi", name: { bn: "রাজশাহী", en: "Rajshahi" } },
  { code: "sirajganj", division: "rajshahi", name: { bn: "সিরাজগঞ্জ", en: "Sirajganj" } },
  // Rangpur
  { code: "dinajpur", division: "rangpur", name: { bn: "দিনাজপুর", en: "Dinajpur" } },
  { code: "gaibandha", division: "rangpur", name: { bn: "গাইবান্ধা", en: "Gaibandha" } },
  { code: "kurigram", division: "rangpur", name: { bn: "কুড়িগ্রাম", en: "Kurigram" } },
  { code: "lalmonirhat", division: "rangpur", name: { bn: "লালমনিরহাট", en: "Lalmonirhat" } },
  { code: "nilphamari", division: "rangpur", name: { bn: "নীলফামারী", en: "Nilphamari" } },
  { code: "panchagarh", division: "rangpur", name: { bn: "পঞ্চগড়", en: "Panchagarh" } },
  { code: "rangpur", division: "rangpur", name: { bn: "রংপুর", en: "Rangpur" } },
  { code: "thakurgaon", division: "rangpur", name: { bn: "ঠাকুরগাঁও", en: "Thakurgaon" } },
  // Sylhet
  { code: "habiganj", division: "sylhet", name: { bn: "হবিগঞ্জ", en: "Habiganj" } },
  { code: "moulvibazar", division: "sylhet", name: { bn: "মৌলভীবাজার", en: "Moulvibazar" } },
  { code: "sunamganj", division: "sylhet", name: { bn: "সুনামগঞ্জ", en: "Sunamganj" } },
  { code: "sylhet", division: "sylhet", name: { bn: "সিলেট", en: "Sylhet" } },
];

export const DIVISION_CODES = Object.keys(DIVISIONS) as DivisionCode[];
export const DISTRICT_CODES = DISTRICTS.map((d) => d.code);

export function findDistrict(code: string) {
  return DISTRICTS.find((d) => d.code === code) ?? null;
}

export function districtsOf(division: string) {
  return DISTRICTS.filter((d) => d.division === division);
}
