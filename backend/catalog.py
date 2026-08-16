"""Authoritative MoodBite catalog used by discovery, AI, reviews, groups, and checkout."""

IMG = {
    "biryani": "https://images.unsplash.com/photo-1697155406055-2db32d47ca07",
    "thali": "https://images.unsplash.com/photo-1542367592-8849eb950fd8",
    "riceVeg": "https://images.unsplash.com/photo-1588644525273-f37b60d78512",
    "thaliHands": "https://images.pexels.com/photos/8818667/pexels-photo-8818667.jpeg",
    "cuisines": "https://images.unsplash.com/photo-1559561724-732dbca7be1e",
    "thaliColor": "https://images.pexels.com/photos/36885725/pexels-photo-36885725.jpeg",
    "bowls": "https://images.unsplash.com/photo-1624340208719-7a7f24443d99",
    "cafe1": "https://images.unsplash.com/photo-1511081692775-05d0f180a065",
    "cafe2": "https://images.unsplash.com/photo-1521017432531-fbd92d768814",
    "tiffin1": "https://images.pexels.com/photos/5971976/pexels-photo-5971976.jpeg",
    "tiffin2": "https://images.pexels.com/photos/12737912/pexels-photo-12737912.jpeg",
    "tiffinEco": "https://images.unsplash.com/photo-1543352632-5a4b24e4d2a6?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
    "group": "https://images.pexels.com/photos/6805151/pexels-photo-6805151.jpeg",
    "studying": "https://images.pexels.com/photos/7128776/pexels-photo-7128776.jpeg",
    "rainy": "https://images.pexels.com/photos/7516547/pexels-photo-7516547.jpeg",
    "pizza": "https://images.unsplash.com/photo-1606066889831-35faf6fa6ff6",
}

MOODS = [
    {"id": "comfort", "label": "Comfort", "icon": "Heart", "query": "I want something warm and comforting", "color": "from-rose-400 to-pink-500", "img": IMG["thali"]},
    {"id": "happy", "label": "Happy", "icon": "Smile", "query": "I'm feeling great, something fun and tasty", "color": "from-amber-400 to-orange-500", "img": IMG["pizza"]},
    {"id": "stressed", "label": "Stressed", "icon": "CloudRain", "query": "I'm stressed and need something soothing under 250", "color": "from-violet-400 to-indigo-500", "img": IMG["bowls"]},
    {"id": "studying", "label": "Studying", "icon": "BookOpen", "query": "I'm studying and need something filling but light", "color": "from-sky-400 to-blue-500", "img": IMG["studying"]},
    {"id": "rainy", "label": "Rainy Day", "icon": "Umbrella", "query": "It's raining, I want cosy monsoon food", "color": "from-teal-400 to-emerald-500", "img": IMG["rainy"]},
    {"id": "celebration", "label": "Celebration", "icon": "PartyPopper", "query": "We're celebrating, suggest something special", "color": "from-fuchsia-500 to-primary", "img": IMG["biryani"]},
]

FOODS = [
    {"id": "f1", "name": "Creamy Paneer Pasta", "restaurant": "Campus Comfort Co.", "restaurantId": "r1", "price": 189, "rating": 4.5, "veg": True, "tags": ["Comfort", "Italian"], "timing": "30-35 min", "desc": "Penne in a rich white sauce with paneer and herbs.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/a3fa541fbe6a1da45ce8fe90ce006089861d1bfc4fd21964fef46440bab63a85.jpeg"},
    {"id": "f2", "name": "Masala Maggi Bowl", "restaurant": "Midnight Munchies", "restaurantId": "r2", "price": 79, "rating": 4.3, "veg": True, "tags": ["Budget", "Quick"], "timing": "20 min", "desc": "Loaded desi masala Maggi with vegetables and cheese.", "cat": "Snacks", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/c1384328b29b062fd303eba4d5bf0584892fb2e2a218906777279beee6ebb2d4.jpeg"},
    {"id": "f3", "name": "Butter Chicken + Rice", "restaurant": "Dilli Tadka", "restaurantId": "r3", "price": 229, "rating": 4.7, "veg": False, "tags": ["Comfort", "North Indian"], "timing": "35-40 min", "desc": "Silky butter chicken with steamed basmati rice.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/2aab91b73aeb8e036df018c78b6a88ce4d96325db3088b9f89c6bd94733287fe.jpeg"},
    {"id": "f4", "name": "Veg Hakka Noodles", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 129, "rating": 4.2, "veg": True, "tags": ["Chinese", "Spicy"], "timing": "25-30 min", "desc": "Wok-tossed noodles with crunchy vegetables.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/0d778372c8e4fe26048bc8acbb96c1a04b28561d874c1458062ff79a29febc3a.jpeg"},
    {"id": "f5", "name": "Cheese Burst Pizza", "restaurant": "Slice of Joy", "restaurantId": "r5", "price": 199, "rating": 4.4, "veg": True, "tags": ["Celebration", "Cheesy"], "timing": "30 min", "desc": "Molten cheese-filled crust pizza, seven inches.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/6127a8325f09538a5b44f74972c727cdc3a1442575ee8fa58fa1aee6f52e06ba.jpeg"},
    {"id": "f6", "name": "Chicken Biryani", "restaurant": "Nawabi Handi", "restaurantId": "r6", "price": 199, "rating": 4.6, "veg": False, "tags": ["Spicy", "Celebration"], "timing": "40 min", "desc": "Dum-cooked chicken biryani with raita and salan.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/506059860621cea9af71cb122a5ffbff324da4fd1c9b47cc6fa1067ea3074e7b.jpeg"},
    {"id": "f7", "name": "Rajma Chawal", "restaurant": "Ghar Ka Khana", "restaurantId": "r7", "price": 119, "rating": 4.5, "veg": True, "tags": ["Home-style", "Comfort"], "timing": "30 min", "desc": "Slow-cooked rajma with jeera rice.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/c6da93aae7539b3de4c6fb4d33564905edb8d51ae83d2e895e5c8051481c71af.jpeg"},
    {"id": "f8", "name": "Cold Coffee", "restaurant": "Campus Comfort Co.", "restaurantId": "r1", "price": 90, "rating": 4.3, "veg": True, "tags": ["Beverage", "Studying"], "timing": "15 min", "desc": "Thick blended cold coffee with ice cream.", "cat": "Beverages", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/42f0f557a4997438b8052d60a318bb519737919880d4dabc33cb57f09f9cd6d1.jpeg"},
    {"id": "f9", "name": "Veg Momos (8 pcs)", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 99, "rating": 4.4, "veg": True, "tags": ["Budget", "Snack"], "timing": "20 min", "desc": "Steamed vegetable momos with spicy chutney.", "cat": "Snacks", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/a6178f76ad81f1b9136e576549033f73dfb748021acfb7590c26b18d8c772055.jpeg"},
    {"id": "f10", "name": "Paneer Roll", "restaurant": "Roll Republic", "restaurantId": "r8", "price": 129, "rating": 4.3, "veg": True, "tags": ["Quick", "Filling"], "timing": "20 min", "desc": "Tandoori paneer wrapped in a soft paratha.", "cat": "Rolls", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/d7b4b53295aa260518c2b9f7cc7a7f55d017894609fe5fa72d35ada6a86b7a0d.jpeg"},
    {"id": "f11", "name": "Chicken Burger", "restaurant": "Slice of Joy", "restaurantId": "r5", "price": 149, "rating": 4.2, "veg": False, "tags": ["Quick", "Filling"], "timing": "25 min", "desc": "Crispy chicken patty with lettuce and mayo.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/640a19590b3a98e608ea9b2d8ea678a137ad3d55ce8490ca3d1758995a6c1a37.jpeg"},
    {"id": "f12", "name": "Masala Dosa", "restaurant": "South Story", "restaurantId": "r9", "price": 109, "rating": 4.6, "veg": True, "tags": ["South Indian", "Breakfast"], "timing": "25 min", "desc": "Crispy dosa with potato masala and chutneys.", "cat": "Breakfast", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/2ede0489247983c7dd88f9d3e7cc9f5f87effbb78f8cbad553df02af09bc7c41.jpeg"},
    {"id": "f13", "name": "Hot Tomato Soup", "restaurant": "Ghar Ka Khana", "restaurantId": "r7", "price": 89, "rating": 4.1, "veg": True, "tags": ["Rainy Day", "Light"], "timing": "20 min", "desc": "Comforting tomato soup with croutons.", "cat": "Starters", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/92d34aeed04e687192721e488f0446525b3b042506326ae097c56d6ba04f560b.jpeg"},
    {"id": "f14", "name": "Chole Bhature", "restaurant": "Dilli Tadka", "restaurantId": "r3", "price": 139, "rating": 4.5, "veg": True, "tags": ["North Indian", "Filling"], "timing": "30 min", "desc": "Fluffy bhature with spicy chole.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/5ce6d5bdecd5843b0bd52cc6b9d044d45b833b38f17b3e4e0b4239f4e045eb33.jpeg"},
    {"id": "f15", "name": "Chicken Fried Rice", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 159, "rating": 4.3, "veg": False, "tags": ["Chinese", "Filling"], "timing": "30 min", "desc": "Egg and chicken fried rice with a wok-smoked finish.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/4c1b1fa8d0b4ddc1b0fe0d4408d6bade336b21a7289f6e98ea66ec9f4dea7cdc.jpeg"},
    {"id": "f16", "name": "Gulab Jamun (2 pcs)", "restaurant": "Sweet Corner", "restaurantId": "r10", "price": 59, "rating": 4.4, "veg": True, "tags": ["Dessert", "Celebration"], "timing": "15 min", "desc": "Warm gulab jamun in cardamom syrup.", "cat": "Desserts", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/103bfdb894d5e42faa3e5cb0627a6bf3705bfc6b7e542f694047e935aac8fff6.jpeg"},
    {"id": "f17", "name": "Veg Thali", "restaurant": "Ghar Ka Khana", "restaurantId": "r7", "price": 149, "rating": 4.6, "veg": True, "tags": ["Home-style", "Healthy"], "timing": "30 min", "desc": "Dal, sabzi, three roti, rice, salad and sweet.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/c3c46756524e67c0f2691eafeba885d690c35bb07f3a91a8a9f87671661a27b7.jpeg"},
    {"id": "f18", "name": "Grilled Sandwich", "restaurant": "Campus Comfort Co.", "restaurantId": "r1", "price": 99, "rating": 4.2, "veg": True, "tags": ["Quick", "Studying"], "timing": "20 min", "desc": "Triple-layer grilled vegetable sandwich.", "cat": "Snacks", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/87e35c04850e8998f18f12d2740e1d6db2c29b16968de53a01a7edad0db92786.jpeg"},
    {"id": "f19", "name": "Schezwan Momos", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 119, "rating": 4.5, "veg": True, "tags": ["Spicy", "Snack"], "timing": "20 min", "desc": "Fried momos tossed in Schezwan sauce.", "cat": "Snacks", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/970233014e778a33e223b2a51b90044f57e23c853e2a695ddccf91ec3355f831.jpeg"},
    {"id": "f20", "name": "Paneer Tikka Bowl", "restaurant": "Dilli Tadka", "restaurantId": "r3", "price": 179, "rating": 4.5, "veg": True, "tags": ["Healthy", "Filling"], "timing": "30 min", "desc": "Grilled paneer tikka over herbed rice.", "cat": "Mains", "img": "https://static.prod-images.emergentagent.com/jobs/79a59647-71cc-4fde-b076-08baa6e7fd46/images/eee197377ce5869ebd7888e1158bbeb513f10a8a7fa267a00c6d24ff19bbfb2d.jpeg"},
]

RESTAURANTS = [
    {"id": "r1", "name": "Campus Comfort Co.", "cuisine": "Cafe · Continental", "rating": 4.5, "priceRange": "₹₹", "deliveryTime": "25-30 min", "distance": "0.8 km", "tags": ["Student favourite", "Cafe"], "eco": True, "img": IMG["cafe1"], "desc": "Cosy campus cafe serving comfort bowls, pastas and cold coffee."},
    {"id": "r2", "name": "Midnight Munchies", "cuisine": "Snacks · Fast Food", "rating": 4.3, "priceRange": "₹", "deliveryTime": "20-25 min", "distance": "1.2 km", "tags": ["Budget", "Late night"], "eco": False, "img": IMG["bowls"], "desc": "Open till 2am for Maggi, rolls and midnight cravings."},
    {"id": "r3", "name": "Dilli Tadka", "cuisine": "North Indian", "rating": 4.6, "priceRange": "₹₹", "deliveryTime": "35-40 min", "distance": "2.1 km", "tags": ["Popular", "North Indian"], "eco": True, "img": IMG["thaliColor"], "desc": "Rich North Indian curries, tandoor and street classics."},
    {"id": "r4", "name": "Wok & Roll", "cuisine": "Chinese · Momos", "rating": 4.3, "priceRange": "₹", "deliveryTime": "25-30 min", "distance": "1.0 km", "tags": ["Budget", "Spicy"], "eco": False, "img": IMG["cuisines"], "desc": "Indo-Chinese wok classics and steamed momos."},
    {"id": "r5", "name": "Slice of Joy", "cuisine": "Pizza · Burgers", "rating": 4.4, "priceRange": "₹₹", "deliveryTime": "30 min", "distance": "1.6 km", "tags": ["Popular", "Cheesy"], "eco": True, "img": IMG["pizza"], "desc": "Wood-fired pizzas and burgers for celebrations."},
    {"id": "r6", "name": "Nawabi Handi", "cuisine": "Biryani · Mughlai", "rating": 4.6, "priceRange": "₹₹", "deliveryTime": "40 min", "distance": "2.8 km", "tags": ["Popular", "Biryani"], "eco": False, "img": IMG["biryani"], "desc": "Slow dum biryanis and Mughlai gravies."},
    {"id": "r7", "name": "Ghar Ka Khana", "cuisine": "Home-style Thali", "rating": 4.7, "priceRange": "₹", "deliveryTime": "30 min", "distance": "0.9 km", "tags": ["Home-style", "Healthy"], "eco": True, "img": IMG["thali"], "desc": "Simple, wholesome home-style thalis."},
    {"id": "r8", "name": "Roll Republic", "cuisine": "Rolls · Wraps", "rating": 4.3, "priceRange": "₹", "deliveryTime": "20 min", "distance": "0.7 km", "tags": ["Budget", "Quick"], "eco": False, "img": IMG["riceVeg"], "desc": "Kathi rolls and wraps rolled fresh to order."},
    {"id": "r9", "name": "South Story", "cuisine": "South Indian", "rating": 4.6, "priceRange": "₹", "deliveryTime": "25 min", "distance": "1.4 km", "tags": ["Healthy", "Breakfast"], "eco": True, "img": IMG["cafe2"], "desc": "Crispy dosas, fluffy idlis and filter coffee."},
    {"id": "r10", "name": "Sweet Corner", "cuisine": "Desserts · Sweets", "rating": 4.4, "priceRange": "₹", "deliveryTime": "15 min", "distance": "0.5 km", "tags": ["Dessert"], "eco": False, "img": IMG["thaliHands"], "desc": "Traditional Indian mithai and warm desserts."},
]

WEEKLY_MENU = {
    "Monday": {"Breakfast": "Poha + Tea", "Lunch": "Dal + Rice + Roti + Aloo Sabzi", "Dinner": "Paneer + Roti + Salad"},
    "Tuesday": {"Breakfast": "Upma + Coffee", "Lunch": "Rajma + Rice + Roti + Salad", "Dinner": "Mix Veg + Roti + Curd"},
    "Wednesday": {"Breakfast": "Paratha + Curd", "Lunch": "Chole + Rice + Roti", "Dinner": "Bhindi + Dal + Roti"},
    "Thursday": {"Breakfast": "Idli + Sambar", "Lunch": "Kadhi + Rice + Roti", "Dinner": "Aloo Gobi + Roti + Salad"},
    "Friday": {"Breakfast": "Sandwich + Tea", "Lunch": "Dal Makhani + Rice + Roti", "Dinner": "Paneer Bhurji + Roti"},
    "Saturday": {"Breakfast": "Aloo Puri", "Lunch": "Veg Pulao + Raita", "Dinner": "Special Thali"},
    "Sunday": {"Breakfast": "Chole Bhature", "Lunch": "Rajma Rice + Sweet", "Dinner": "Dal + Roti + Sabzi"},
}

TIFFIN = [
    {"id": "t1", "name": "HomeTaste Kitchen", "meals": "Lunch + Dinner", "monthly": 2500, "rating": 4.6, "veg": True, "area": "Koramangala", "flexibility": "High", "tags": ["Home-style", "Veg"], "img": IMG["tiffinEco"], "timing": "Lunch 12:30 · Dinner 8:00", "policy": "Skip up to 6 meals/month, converted to pause credits.", "desc": "Wholesome home-cooked lunch and dinner delivered fresh daily.", "plans": [{"id": "t1p1", "name": "7-Day Plan", "meals": "Lunch + Dinner", "price": 700, "per": "week", "discount": 5}, {"id": "t1p2", "name": "Monthly Plan", "meals": "Lunch + Dinner", "price": 2500, "per": "month", "discount": 10}, {"id": "t1p3", "name": "3-Month Plan", "meals": "Lunch + Dinner", "price": 6750, "per": "3 months", "discount": 15}], "menu": WEEKLY_MENU},
    {"id": "t2", "name": "Maa's Kitchen", "meals": "Lunch only", "monthly": 2200, "rating": 4.4, "veg": True, "area": "HSR Layout", "flexibility": "Medium", "tags": ["Home-style", "Budget"], "img": IMG["tiffin2"], "timing": "Lunch 1:00", "policy": "Monday-Saturday. Sundays off, no refund for skips.", "desc": "Simple home-style lunch that is easy on the pocket.", "plans": [{"id": "t2p1", "name": "5-Day Weekday", "meals": "Lunch", "price": 500, "per": "week", "discount": 0}, {"id": "t2p2", "name": "Monthly Lunch", "meals": "Lunch", "price": 2200, "per": "month", "discount": 10}], "menu": WEEKLY_MENU},
    {"id": "t3", "name": "Daily Dabba", "meals": "Breakfast + Lunch + Dinner", "monthly": 2800, "rating": 4.7, "veg": False, "area": "BTM Layout", "flexibility": "Low", "tags": ["Full-day", "Veg + Non-veg"], "img": IMG["tiffin1"], "timing": "B 8:30 · L 1:00 · D 8:30", "policy": "7 days/week. No skipping on this committed plan.", "desc": "All three meals, every day.", "plans": [{"id": "t3p1", "name": "7-Day 3 Meals", "meals": "B + L + D", "price": 750, "per": "week", "discount": 5}, {"id": "t3p2", "name": "Monthly 3 Meals", "meals": "B + L + D", "price": 2800, "per": "month", "discount": 12}, {"id": "t3p3", "name": "6-Month Plan", "meals": "B + L + D", "price": 13440, "per": "6 months", "discount": 20}], "menu": WEEKLY_MENU},
    {"id": "t4", "name": "Annapurna Meals", "meals": "Dinner only", "monthly": 1800, "rating": 4.3, "veg": True, "area": "Indiranagar", "flexibility": "Medium", "tags": ["Budget", "Veg"], "img": IMG["riceVeg"], "timing": "Dinner 8:00", "policy": "Weekend dinners can be skipped without a refund.", "desc": "Light, home-style dinners after a long day.", "plans": [{"id": "t4p1", "name": "Weekday Dinner", "meals": "Dinner", "price": 420, "per": "week", "discount": 0}, {"id": "t4p2", "name": "Monthly Dinner", "meals": "Dinner", "price": 1800, "per": "month", "discount": 8}], "menu": WEEKLY_MENU},
    {"id": "t5", "name": "FitTiffin", "meals": "Lunch + Dinner", "monthly": 3200, "rating": 4.5, "veg": True, "area": "Whitefield", "flexibility": "High", "tags": ["Healthy", "High-protein"], "img": IMG["bowls"], "timing": "Lunch 12:00 · Dinner 7:30", "policy": "Skip anytime with 12-hour notice; credits carry forward.", "desc": "Macro-counted, high-protein meals for active students.", "plans": [{"id": "t5p1", "name": "7-Day Fit", "meals": "Lunch + Dinner", "price": 850, "per": "week", "discount": 5}, {"id": "t5p2", "name": "Monthly Fit", "meals": "Lunch + Dinner", "price": 3200, "per": "month", "discount": 10}], "menu": WEEKLY_MENU},
    {"id": "t6", "name": "Ghar Ka Swaad", "meals": "Breakfast only", "monthly": 1200, "rating": 4.2, "veg": True, "area": "Marathahalli", "flexibility": "Medium", "tags": ["Budget", "Breakfast"], "img": IMG["thali"], "timing": "Breakfast 8:00", "policy": "Monday-Friday only. Weekends off.", "desc": "Fresh desi breakfast delivered before the first class.", "plans": [{"id": "t6p1", "name": "Weekday Breakfast", "meals": "Breakfast", "price": 300, "per": "week", "discount": 0}, {"id": "t6p2", "name": "Monthly Breakfast", "meals": "Breakfast", "price": 1200, "per": "month", "discount": 8}], "menu": WEEKLY_MENU},
]


def catalog_text():
    lines = ["FOOD ITEMS:"]
    for food in FOODS:
        diet = "veg" if food["veg"] else "non-veg"
        lines.append(f"{food['id']}: {food['name']} @ {food['restaurant']} | Rs.{food['price']} | {food['rating']}star | {diet} | {', '.join(food['tags'])} | {food['timing']}")
    lines.append("\nTIFFIN PLANS:")
    for provider in TIFFIN:
        diet = "veg" if provider["veg"] else "veg+nonveg"
        lines.append(f"{provider['id']}: {provider['name']} | {provider['meals']} | Rs.{provider['monthly']}/month | {provider['rating']}star | {diet} | {provider['area']} | flexibility {provider['flexibility']}")
    return "\n".join(lines)

FOOD_BY_ID = {item["id"]: item for item in FOODS}
TIFFIN_BY_ID = {item["id"]: item for item in TIFFIN}
RESTAURANT_BY_ID = {item["id"]: item for item in RESTAURANTS}
