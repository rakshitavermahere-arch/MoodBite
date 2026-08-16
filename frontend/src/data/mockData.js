// MoodBite mock data — realistic Indian food + tiffin catalog.
export const IMG = {
  biryani: "https://images.unsplash.com/photo-1697155406055-2db32d47ca07",
  thali: "https://images.unsplash.com/photo-1542367592-8849eb950fd8",
  riceVeg: "https://images.unsplash.com/photo-1588644525273-f37b60d78512",
  thaliHands: "https://images.pexels.com/photos/8818667/pexels-photo-8818667.jpeg",
  cuisines: "https://images.unsplash.com/photo-1559561724-732dbca7be1e",
  thaliColor: "https://images.pexels.com/photos/36885725/pexels-photo-36885725.jpeg",
  bowls: "https://images.unsplash.com/photo-1624340208719-7a7f24443d99",
  cafe1: "https://images.unsplash.com/photo-1511081692775-05d0f180a065",
  cafe2: "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
  tiffin1: "https://images.pexels.com/photos/5971976/pexels-photo-5971976.jpeg",
  tiffin2: "https://images.pexels.com/photos/12737912/pexels-photo-12737912.jpeg",
  tiffinEco: "https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
  group: "https://images.pexels.com/photos/6805151/pexels-photo-6805151.jpeg",
  studying: "https://images.pexels.com/photos/7128776/pexels-photo-7128776.jpeg",
  rainy: "https://images.pexels.com/photos/7516547/pexels-photo-7516547.jpeg",
  pizza: "https://images.unsplash.com/photo-1606066889831-35faf6fa6ff6",
};

export const MOODS = [
  { id: "comfort", label: "Comfort", icon: "Heart", query: "I want something warm and comforting", color: "from-rose-400 to-pink-500", img: IMG.thali },
  { id: "happy", label: "Happy", icon: "Smile", query: "I'm feeling great, something fun and tasty", color: "from-amber-400 to-orange-500", img: IMG.pizza },
  { id: "stressed", label: "Stressed", icon: "CloudRain", query: "I'm stressed and need something soothing under 250", color: "from-violet-400 to-indigo-500", img: IMG.bowls },
  { id: "studying", label: "Studying", icon: "BookOpen", query: "I'm studying and need something filling but light", color: "from-sky-400 to-blue-500", img: IMG.studying },
  { id: "rainy", label: "Rainy Day", icon: "Umbrella", query: "It's raining, I want cosy monsoon food", color: "from-teal-400 to-emerald-500", img: IMG.rainy },
  { id: "celebration", label: "Celebration", icon: "PartyPopper", query: "We're celebrating, suggest something special", color: "from-fuchsia-500 to-primary", img: IMG.biryani },
];

const foodImgs = [IMG.thali, IMG.biryani, IMG.riceVeg, IMG.bowls, IMG.cuisines, IMG.pizza, IMG.thaliColor];

export const FOODS = [
  { id: "f1", name: "Creamy Paneer Pasta", restaurant: "Campus Comfort Co.", restaurantId: "r1", price: 189, rating: 4.5, veg: true, tags: ["Comfort", "Italian"], timing: "30-35 min", desc: "Penne in a rich white sauce with paneer & herbs.", cat: "Mains" },
  { id: "f2", name: "Masala Maggi Bowl", restaurant: "Midnight Munchies", restaurantId: "r2", price: 79, rating: 4.3, veg: true, tags: ["Budget", "Quick"], timing: "20 min", desc: "Loaded desi masala Maggi with veggies & cheese.", cat: "Snacks" },
  { id: "f3", name: "Butter Chicken + Rice", restaurant: "Dilli Tadka", restaurantId: "r3", price: 229, rating: 4.7, veg: false, tags: ["Comfort", "North Indian"], timing: "35-40 min", desc: "Silky butter chicken with steamed basmati.", cat: "Mains" },
  { id: "f4", name: "Veg Hakka Noodles", restaurant: "Wok & Roll", restaurantId: "r4", price: 129, rating: 4.2, veg: true, tags: ["Chinese", "Spicy"], timing: "25-30 min", desc: "Wok-tossed noodles with crunchy veggies.", cat: "Mains" },
  { id: "f5", name: "Cheese Burst Pizza", restaurant: "Slice of Joy", restaurantId: "r5", price: 199, rating: 4.4, veg: true, tags: ["Celebration", "Cheesy"], timing: "30 min", desc: "Molten cheese-filled crust, 7 inch.", cat: "Mains" },
  { id: "f6", name: "Chicken Biryani", restaurant: "Nawabi Handi", restaurantId: "r6", price: 199, rating: 4.6, veg: false, tags: ["Spicy", "Celebration"], timing: "40 min", desc: "Dum-cooked biryani with raita & salan.", cat: "Mains" },
  { id: "f7", name: "Rajma Chawal", restaurant: "Ghar Ka Khana", restaurantId: "r7", price: 119, rating: 4.5, veg: true, tags: ["Home-style", "Comfort"], timing: "30 min", desc: "Slow-cooked rajma with jeera rice.", cat: "Mains" },
  { id: "f8", name: "Cold Coffee", restaurant: "Campus Comfort Co.", restaurantId: "r1", price: 90, rating: 4.3, veg: true, tags: ["Beverage", "Studying"], timing: "15 min", desc: "Thick blended cold coffee with ice cream.", cat: "Beverages" },
  { id: "f9", name: "Veg Momos (8 pcs)", restaurant: "Wok & Roll", restaurantId: "r4", price: 99, rating: 4.4, veg: true, tags: ["Budget", "Snack"], timing: "20 min", desc: "Steamed veg momos with spicy chutney.", cat: "Snacks" },
  { id: "f10", name: "Paneer Roll", restaurant: "Roll Republic", restaurantId: "r8", price: 129, rating: 4.3, veg: true, tags: ["Quick", "Filling"], timing: "20 min", desc: "Tandoori paneer wrapped in a soft paratha.", cat: "Rolls" },
  { id: "f11", name: "Chicken Burger", restaurant: "Slice of Joy", restaurantId: "r5", price: 149, rating: 4.2, veg: false, tags: ["Quick", "Filling"], timing: "25 min", desc: "Crispy chicken patty, lettuce & mayo.", cat: "Mains" },
  { id: "f12", name: "Masala Dosa", restaurant: "South Story", restaurantId: "r9", price: 109, rating: 4.6, veg: true, tags: ["South Indian", "Breakfast"], timing: "25 min", desc: "Crispy dosa with potato masala & chutneys.", cat: "Breakfast" },
  { id: "f13", name: "Hot Tomato Soup", restaurant: "Ghar Ka Khana", restaurantId: "r7", price: 89, rating: 4.1, veg: true, tags: ["Rainy Day", "Light"], timing: "20 min", desc: "Comforting tomato soup with croutons.", cat: "Starters" },
  { id: "f14", name: "Chole Bhature", restaurant: "Dilli Tadka", restaurantId: "r3", price: 139, rating: 4.5, veg: true, tags: ["North Indian", "Filling"], timing: "30 min", desc: "Fluffy bhature with spicy chole.", cat: "Mains" },
  { id: "f15", name: "Chicken Fried Rice", restaurant: "Wok & Roll", restaurantId: "r4", price: 159, rating: 4.3, veg: false, tags: ["Chinese", "Filling"], timing: "30 min", desc: "Egg & chicken fried rice, wok-smoked.", cat: "Mains" },
  { id: "f16", name: "Gulab Jamun (2 pcs)", restaurant: "Sweet Corner", restaurantId: "r10", price: 59, rating: 4.4, veg: true, tags: ["Dessert", "Celebration"], timing: "15 min", desc: "Warm gulab jamun in cardamom syrup.", cat: "Desserts" },
  { id: "f17", name: "Veg Thali", restaurant: "Ghar Ka Khana", restaurantId: "r7", price: 149, rating: 4.6, veg: true, tags: ["Home-style", "Healthy"], timing: "30 min", desc: "Dal, sabzi, 3 roti, rice, salad & sweet.", cat: "Mains" },
  { id: "f18", name: "Grilled Sandwich", restaurant: "Campus Comfort Co.", restaurantId: "r1", price: 99, rating: 4.2, veg: true, tags: ["Quick", "Studying"], timing: "20 min", desc: "Triple-layer grilled veg sandwich.", cat: "Snacks" },
  { id: "f19", name: "Schezwan Momos", restaurant: "Wok & Roll", restaurantId: "r4", price: 119, rating: 4.5, veg: true, tags: ["Spicy", "Snack"], timing: "20 min", desc: "Fried momos tossed in schezwan sauce.", cat: "Snacks" },
  { id: "f20", name: "Paneer Tikka Bowl", restaurant: "Dilli Tadka", restaurantId: "r3", price: 179, rating: 4.5, veg: true, tags: ["Healthy", "Filling"], timing: "30 min", desc: "Grilled paneer tikka over herbed rice.", cat: "Mains" },
].map((f, i) => ({ ...f, img: f.img || foodImgs[i % foodImgs.length] }));

export const RESTAURANTS = [
  { id: "r1", name: "Campus Comfort Co.", cuisine: "Cafe · Continental", rating: 4.5, priceRange: "₹₹", deliveryTime: "25-30 min", distance: "0.8 km", tags: ["Student favourite", "Cafe"], eco: true, img: IMG.cafe1, desc: "Cosy campus cafe serving comfort bowls, pastas and killer cold coffee." },
  { id: "r2", name: "Midnight Munchies", cuisine: "Snacks · Fast Food", rating: 4.3, priceRange: "₹", deliveryTime: "20-25 min", distance: "1.2 km", tags: ["Budget", "Late night"], eco: false, img: IMG.bowls, desc: "Open till 2am. Maggi, rolls and midnight cravings sorted." },
  { id: "r3", name: "Dilli Tadka", cuisine: "North Indian", rating: 4.6, priceRange: "₹₹", deliveryTime: "35-40 min", distance: "2.1 km", tags: ["Popular", "North Indian"], eco: true, img: IMG.thaliColor, desc: "Rich North Indian curries, tandoor and street classics." },
  { id: "r4", name: "Wok & Roll", cuisine: "Chinese · Momos", rating: 4.3, priceRange: "₹", deliveryTime: "25-30 min", distance: "1.0 km", tags: ["Budget", "Spicy"], eco: false, img: IMG.cuisines, desc: "Indo-Chinese wok classics and steamy momos." },
  { id: "r5", name: "Slice of Joy", cuisine: "Pizza · Burgers", rating: 4.4, priceRange: "₹₹", deliveryTime: "30 min", distance: "1.6 km", tags: ["Popular", "Cheesy"], eco: true, img: IMG.pizza, desc: "Wood-fired pizzas and juicy burgers for celebrations." },
  { id: "r6", name: "Nawabi Handi", cuisine: "Biryani · Mughlai", rating: 4.6, priceRange: "₹₹", deliveryTime: "40 min", distance: "2.8 km", tags: ["Popular", "Biryani"], eco: false, img: IMG.biryani, desc: "Slow dum biryanis and royal Mughlai gravies." },
  { id: "r7", name: "Ghar Ka Khana", cuisine: "Home-style Thali", rating: 4.7, priceRange: "₹", deliveryTime: "30 min", distance: "0.9 km", tags: ["Home-style", "Healthy"], eco: true, img: IMG.thali, desc: "Simple, wholesome home-style thalis just like home." },
  { id: "r8", name: "Roll Republic", cuisine: "Rolls · Wraps", rating: 4.3, priceRange: "₹", deliveryTime: "20 min", distance: "0.7 km", tags: ["Budget", "Quick"], eco: false, img: IMG.riceVeg, desc: "Kathi rolls and wraps rolled fresh to order." },
  { id: "r9", name: "South Story", cuisine: "South Indian", rating: 4.6, priceRange: "₹", deliveryTime: "25 min", distance: "1.4 km", tags: ["Healthy", "Breakfast"], eco: true, img: IMG.cafe2, desc: "Crispy dosas, fluffy idlis and filter coffee." },
  { id: "r10", name: "Sweet Corner", cuisine: "Desserts · Sweets", rating: 4.4, priceRange: "₹", deliveryTime: "15 min", distance: "0.5 km", tags: ["Dessert"], eco: false, img: IMG.thaliHands, desc: "Traditional Indian mithai and warm desserts." },
];

const weeklyMenu = {
  Monday: { Breakfast: "Poha + Tea", Lunch: "Dal + Rice + Roti + Aloo Sabzi", Dinner: "Paneer + Roti + Salad" },
  Tuesday: { Breakfast: "Upma + Coffee", Lunch: "Rajma + Rice + Roti + Salad", Dinner: "Mix Veg + Roti + Curd" },
  Wednesday: { Breakfast: "Paratha + Curd", Lunch: "Chole + Rice + Roti", Dinner: "Bhindi + Dal + Roti" },
  Thursday: { Breakfast: "Idli + Sambar", Lunch: "Kadhi + Rice + Roti", Dinner: "Aloo Gobi + Roti + Salad" },
  Friday: { Breakfast: "Sandwich + Tea", Lunch: "Dal Makhani + Rice + Roti", Dinner: "Paneer Bhurji + Roti" },
  Saturday: { Breakfast: "Aloo Puri", Lunch: "Veg Pulao + Raita", Dinner: "Special Thali" },
  Sunday: { Breakfast: "Chole Bhature", Lunch: "Rajma Rice + Sweet", Dinner: "Dal + Roti + Sabzi" },
};

export const TIFFIN = [
  { id: "t1", name: "HomeTaste Kitchen", meals: "Lunch + Dinner", monthly: 2500, rating: 4.6, veg: true, area: "Koramangala", flexibility: "High", tags: ["Home-style", "Veg"], img: IMG.tiffinEco, timing: "Lunch 12:30 · Dinner 8:00", policy: "Skip up to 6 meals/month, converted to pause credits.", desc: "Wholesome home-cooked lunch & dinner delivered fresh daily.",
    plans: [
      { id: "t1p1", name: "7-Day Plan", meals: "Lunch + Dinner", price: 700, per: "week", discount: 5 },
      { id: "t1p2", name: "Monthly Plan", meals: "Lunch + Dinner", price: 2500, per: "month", discount: 10 },
      { id: "t1p3", name: "3-Month Plan", meals: "Lunch + Dinner", price: 6750, per: "3 months", discount: 15 },
    ], menu: weeklyMenu },
  { id: "t2", name: "Maa's Kitchen", meals: "Lunch only", monthly: 2200, rating: 4.4, veg: true, area: "HSR Layout", flexibility: "Medium", tags: ["Home-style", "Budget"], img: IMG.tiffin2, timing: "Lunch 1:00", policy: "Monday–Saturday. Sundays off, no refund for skips.", desc: "Simple ghar-ka-khana lunch, easy on the pocket.",
    plans: [
      { id: "t2p1", name: "5-Day Weekday", meals: "Lunch", price: 500, per: "week", discount: 0 },
      { id: "t2p2", name: "Monthly Lunch", meals: "Lunch", price: 2200, per: "month", discount: 10 },
    ], menu: weeklyMenu },
  { id: "t3", name: "Daily Dabba", meals: "Breakfast + Lunch + Dinner", monthly: 2800, rating: 4.7, veg: false, area: "BTM Layout", flexibility: "Low", tags: ["Full-day", "Veg + Non-veg"], img: IMG.tiffin1, timing: "B 8:30 · L 1:00 · D 8:30", policy: "7 days/week. No skipping — fully committed plan.", desc: "All three meals, every day. Never think about food again.",
    plans: [
      { id: "t3p1", name: "7-Day 3 Meals", meals: "B + L + D", price: 750, per: "week", discount: 5 },
      { id: "t3p2", name: "Monthly 3 Meals", meals: "B + L + D", price: 2800, per: "month", discount: 12 },
      { id: "t3p3", name: "6-Month Plan", meals: "B + L + D", price: 13440, per: "6 months", discount: 20 },
    ], menu: weeklyMenu },
  { id: "t4", name: "Annapurna Meals", meals: "Dinner only", monthly: 1800, rating: 4.3, veg: true, area: "Indiranagar", flexibility: "Medium", tags: ["Budget", "Veg"], img: IMG.riceVeg, timing: "Dinner 8:00", policy: "Weekend dinners can be skipped, but no refund.", desc: "Light, home-style dinners after a long day.",
    plans: [
      { id: "t4p1", name: "Weekday Dinner", meals: "Dinner", price: 420, per: "week", discount: 0 },
      { id: "t4p2", name: "Monthly Dinner", meals: "Dinner", price: 1800, per: "month", discount: 8 },
    ], menu: weeklyMenu },
  { id: "t5", name: "FitTiffin", meals: "Lunch + Dinner", monthly: 3200, rating: 4.5, veg: true, area: "Whitefield", flexibility: "High", tags: ["Healthy", "High-protein"], img: IMG.bowls, timing: "Lunch 12:00 · Dinner 7:30", policy: "Skip anytime with 12h notice, credits carry forward.", desc: "Macro-counted, high-protein meals for the gym crowd.",
    plans: [
      { id: "t5p1", name: "7-Day Fit", meals: "Lunch + Dinner", price: 850, per: "week", discount: 5 },
      { id: "t5p2", name: "Monthly Fit", meals: "Lunch + Dinner", price: 3200, per: "month", discount: 10 },
    ], menu: weeklyMenu },
  { id: "t6", name: "Ghar Ka Swaad", meals: "Breakfast only", monthly: 1200, rating: 4.2, veg: true, area: "Marathahalli", flexibility: "Medium", tags: ["Budget", "Breakfast"], img: IMG.thali, timing: "Breakfast 8:00", policy: "Monday–Friday only. Weekends off.", desc: "Fresh desi breakfast delivered before your first class.",
    plans: [
      { id: "t6p1", name: "Weekday Breakfast", meals: "Breakfast", price: 300, per: "week", discount: 0 },
      { id: "t6p2", name: "Monthly Breakfast", meals: "Breakfast", price: 1200, per: "month", discount: 8 },
    ], menu: weeklyMenu },
];

export const FRIENDS = [
  { id: "u1", name: "You (Host)", avatar: "Y", color: "bg-primary" },
  { id: "u2", name: "Ananya", avatar: "A", color: "bg-sky-500" },
  { id: "u3", name: "Priya", avatar: "P", color: "bg-emerald-500" },
  { id: "u4", name: "Rohan", avatar: "R", color: "bg-amber-500" },
];


export const CAUSES = [
  { id: "c1", title: "Food Security", desc: "Fund meals for families in need.", icon: "Utensils", raised: 68 },
  { id: "c2", title: "Tree Planting", desc: "Plant a sapling for every 10 orders.", icon: "TreePine", raised: 42 },
  { id: "c3", title: "Waste Reduction", desc: "Support compostable packaging drives.", icon: "Recycle", raised: 55 },
  { id: "c4", title: "Community Kitchens", desc: "Back student-run community kitchens.", icon: "HeartHandshake", raised: 31 },
];

export const rupee = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
