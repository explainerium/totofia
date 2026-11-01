// Starter CMS pages (sample copy — edit in Admin → Pages before launch).

type PageSeed = {
  slug: string;
  bn: { title: string; body: string };
  en: { title: string; body: string };
};

export const pages: PageSeed[] = [
  {
    slug: "about",
    bn: {
      title: "আমাদের সম্পর্কে",
      body: "<p>টোটোফিয়া নবজাতক ও ছোট শিশুদের জন্য নিরাপদ, আরামদায়ক ও অর্গানিক পোশাক নিয়ে কাজ করে। প্রতিটি পণ্য আমরা শিশুর কোমল ত্বকের কথা ভেবে বাছাই করি।</p><h2>আমাদের প্রতিশ্রুতি</h2><ul><li>নরম ও নিঃশ্বাসযোগ্য কাপড়</li><li>ক্ষতিকর রং ও রাসায়নিক মুক্ত</li><li>সারা বাংলাদেশে দ্রুত ডেলিভারি</li></ul>",
    },
    en: {
      title: "About us",
      body: "<p>Totofia brings safe, comfortable and organic clothing for newborns and toddlers. We choose every piece with delicate skin in mind.</p><h2>Our promise</h2><ul><li>Soft, breathable fabrics</li><li>Free from harmful dyes and chemicals</li><li>Fast delivery across Bangladesh</li></ul>",
    },
  },
  {
    slug: "shipping-delivery",
    bn: {
      title: "ডেলিভারি তথ্য",
      body: "<p>ঢাকা সিটির ভেতরে সাধারণত ১–২ দিনে এবং ঢাকার বাইরে ৩–৫ দিনে ডেলিভারি দেওয়া হয়। চেকআউটে জেলা বাছাই করলে ডেলিভারি চার্জ দেখানো হয়।</p><p>ঢাকা সিটিতে ২,০০০ টাকার বেশি অর্ডারে ডেলিভারি ফ্রি।</p>",
    },
    en: {
      title: "Delivery information",
      body: "<p>Orders usually arrive in 1–2 days inside Dhaka city and 3–5 days outside Dhaka. The delivery charge is shown at checkout once you pick your district.</p><p>Delivery is free inside Dhaka city on orders over ৳2,000.</p>",
    },
  },
  {
    slug: "return-policy",
    bn: {
      title: "রিটার্ন ও এক্সচেঞ্জ নীতি",
      body: "<p>পণ্য হাতে পাওয়ার ৭ দিনের মধ্যে অব্যবহৃত অবস্থায় (ট্যাগসহ) রিটার্ন বা সাইজ পরিবর্তন করা যাবে। আমাদের হেল্পলাইনে যোগাযোগ করুন, আমরা পরবর্তী ধাপ জানিয়ে দেব।</p><p>স্বাস্থ্যগত কারণে ব্যবহৃত বা ধোয়া পণ্য ফেরত নেওয়া হয় না।</p>",
    },
    en: {
      title: "Returns & exchanges",
      body: "<p>Unused items with their tags can be returned or exchanged for another size within 7 days of delivery. Call our helpline and we will guide you through the next steps.</p><p>For hygiene reasons, worn or washed items cannot be returned.</p>",
    },
  },
  {
    slug: "privacy",
    bn: {
      title: "গোপনীয়তা নীতি",
      body: "<p>অর্ডার ডেলিভারি ও যোগাযোগের জন্য আমরা আপনার নাম, ফোন নম্বর, ইমেইল ও ঠিকানা সংরক্ষণ করি। এই তথ্য কুরিয়ার ছাড়া অন্য কারো সাথে শেয়ার করা হয় না।</p>",
    },
    en: {
      title: "Privacy policy",
      body: "<p>We store your name, phone number, email and address to deliver your orders and contact you. We do not share this information with anyone except our delivery partners.</p>",
    },
  },
  {
    slug: "terms",
    bn: {
      title: "শর্তাবলী",
      body: "<p>টোটোফিয়াতে অর্ডার করার মাধ্যমে আপনি আমাদের মূল্য, ডেলিভারি ও রিটার্ন নীতিতে সম্মত হচ্ছেন। স্টক ও মূল্য পরিবর্তন হতে পারে; অর্ডার নিশ্চিত করার আগে আমরা ফোনে যোগাযোগ করি।</p>",
    },
    en: {
      title: "Terms of service",
      body: "<p>By ordering from Totofia you agree to our pricing, delivery and return policies. Stock and prices may change; we call to confirm every order before it is shipped.</p>",
    },
  },
  {
    slug: "faq",
    bn: {
      title: "সাধারণ জিজ্ঞাসা",
      body: "<h3>কীভাবে পেমেন্ট করব?</h3><p>বর্তমানে ক্যাশ অন ডেলিভারি সুবিধা আছে — পণ্য হাতে পেয়ে টাকা দিন।</p><h3>অ্যাকাউন্ট ছাড়া অর্ডার করা যাবে?</h3><p>হ্যাঁ, শুধু নাম, ফোন নম্বর ও ঠিকানা দিলেই হবে।</p><h3>অর্ডার কোথায় আছে কীভাবে জানব?</h3><p>“অর্ডার ট্র্যাক করুন” পেজে অর্ডার নম্বর ও ফোন নম্বর দিন।</p>",
    },
    en: {
      title: "FAQ",
      body: "<h3>How do I pay?</h3><p>Cash on delivery is available — pay when the parcel arrives.</p><h3>Can I order without an account?</h3><p>Yes, you only need your name, phone number and address.</p><h3>How do I know where my order is?</h3><p>Enter your order number and phone number on the “Track order” page.</p>",
    },
  },
  {
    slug: "size-guide",
    bn: {
      title: "সাইজ গাইড",
      body: "<table><thead><tr><th>সাইজ</th><th>ওজন</th><th>উচ্চতা</th></tr></thead><tbody><tr><td>০–৩ মাস</td><td>৩–৬ কেজি</td><td>৫০–৬২ সেমি</td></tr><tr><td>৩–৬ মাস</td><td>৬–৮ কেজি</td><td>৬২–৬৮ সেমি</td></tr><tr><td>৬–১২ মাস</td><td>৮–১০ কেজি</td><td>৬৮–৮০ সেমি</td></tr><tr><td>১২–১৮ মাস</td><td>১০–১১ কেজি</td><td>৮০–৮৬ সেমি</td></tr><tr><td>১৮–২৪ মাস</td><td>১১–১২ কেজি</td><td>৮৬–৯২ সেমি</td></tr><tr><td>২–৩ বছর</td><td>১২–১৪ কেজি</td><td>৯২–৯৮ সেমি</td></tr></tbody></table><p>দুই সাইজের মাঝামাঝি হলে বড় সাইজটি নিন।</p>",
    },
    en: {
      title: "Size guide",
      body: "<table><thead><tr><th>Size</th><th>Weight</th><th>Height</th></tr></thead><tbody><tr><td>0–3 Months</td><td>3–6 kg</td><td>50–62 cm</td></tr><tr><td>3–6 Months</td><td>6–8 kg</td><td>62–68 cm</td></tr><tr><td>6–12 Months</td><td>8–10 kg</td><td>68–80 cm</td></tr><tr><td>12–18 Months</td><td>10–11 kg</td><td>80–86 cm</td></tr><tr><td>18–24 Months</td><td>11–12 kg</td><td>86–92 cm</td></tr><tr><td>2–3 Years</td><td>12–14 kg</td><td>92–98 cm</td></tr></tbody></table><p>Between two sizes? Choose the larger one.</p>",
    },
  },
];
