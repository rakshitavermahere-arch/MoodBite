"""Mock food + tiffin catalog used by the AI concierge to ground recommendations."""

FOODS = [
    {"id": "f1", "name": "Creamy Paneer Pasta", "restaurant": "Campus Comfort Co.", "restaurantId": "r1", "price": 189, "rating": 4.5, "veg": True, "tags": ["Comfort", "Filling", "Italian"], "timing": "30-35 min"},
    {"id": "f2", "name": "Masala Maggi Bowl", "restaurant": "Midnight Munchies", "restaurantId": "r2", "price": 79, "rating": 4.3, "veg": True, "tags": ["Budget", "Quick", "Comfort", "Studying"], "timing": "20 min"},
    {"id": "f3", "name": "Butter Chicken + Rice", "restaurant": "Dilli Tadka", "restaurantId": "r3", "price": 229, "rating": 4.7, "veg": False, "tags": ["Comfort", "North Indian", "Filling"], "timing": "35-40 min"},
    {"id": "f4", "name": "Veg Hakka Noodles", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 129, "rating": 4.2, "veg": True, "tags": ["Chinese", "Budget", "Spicy"], "timing": "25-30 min"},
    {"id": "f5", "name": "Cheese Burst Pizza", "restaurant": "Slice of Joy", "restaurantId": "r5", "price": 199, "rating": 4.4, "veg": True, "tags": ["Celebration", "Cheesy", "Italian"], "timing": "30 min"},
    {"id": "f6", "name": "Chicken Biryani", "restaurant": "Nawabi Handi", "restaurantId": "r6", "price": 199, "rating": 4.6, "veg": False, "tags": ["Spicy", "Filling", "Celebration"], "timing": "40 min"},
    {"id": "f7", "name": "Rajma Chawal", "restaurant": "Ghar Ka Khana", "restaurantId": "r7", "price": 119, "rating": 4.5, "veg": True, "tags": ["Home-style", "Comfort", "Budget", "Healthy"], "timing": "30 min"},
    {"id": "f8", "name": "Cold Coffee", "restaurant": "Campus Comfort Co.", "restaurantId": "r1", "price": 90, "rating": 4.3, "veg": True, "tags": ["Beverage", "Studying", "Happy"], "timing": "15 min"},
    {"id": "f9", "name": "Veg Momos (8 pcs)", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 99, "rating": 4.4, "veg": True, "tags": ["Budget", "Snack", "Rainy Day"], "timing": "20 min"},
    {"id": "f10", "name": "Paneer Roll", "restaurant": "Roll Republic", "restaurantId": "r8", "price": 129, "rating": 4.3, "veg": True, "tags": ["Quick", "Budget", "Filling"], "timing": "20 min"},
    {"id": "f11", "name": "Chicken Burger", "restaurant": "Slice of Joy", "restaurantId": "r5", "price": 149, "rating": 4.2, "veg": False, "tags": ["Quick", "Filling"], "timing": "25 min"},
    {"id": "f12", "name": "Masala Dosa", "restaurant": "South Story", "restaurantId": "r9", "price": 109, "rating": 4.6, "veg": True, "tags": ["South Indian", "Breakfast", "Budget", "Healthy"], "timing": "25 min"},
    {"id": "f13", "name": "Hot Tomato Soup", "restaurant": "Ghar Ka Khana", "restaurantId": "r7", "price": 89, "rating": 4.1, "veg": True, "tags": ["Rainy Day", "Comfort", "Light", "Healthy"], "timing": "20 min"},
    {"id": "f14", "name": "Chole Bhature", "restaurant": "Dilli Tadka", "restaurantId": "r3", "price": 139, "rating": 4.5, "veg": True, "tags": ["North Indian", "Filling", "Happy"], "timing": "30 min"},
    {"id": "f15", "name": "Chicken Fried Rice", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 159, "rating": 4.3, "veg": False, "tags": ["Chinese", "Filling", "Spicy"], "timing": "30 min"},
    {"id": "f16", "name": "Gulab Jamun (2 pcs)", "restaurant": "Sweet Corner", "restaurantId": "r10", "price": 59, "rating": 4.4, "veg": True, "tags": ["Dessert", "Celebration", "Happy"], "timing": "15 min"},
    {"id": "f17", "name": "Veg Thali", "restaurant": "Ghar Ka Khana", "restaurantId": "r7", "price": 149, "rating": 4.6, "veg": True, "tags": ["Home-style", "Filling", "Healthy", "Comfort"], "timing": "30 min"},
    {"id": "f18", "name": "Grilled Sandwich", "restaurant": "Campus Comfort Co.", "restaurantId": "r1", "price": 99, "rating": 4.2, "veg": True, "tags": ["Quick", "Light", "Studying", "Budget"], "timing": "20 min"},
    {"id": "f19", "name": "Spicy Schezwan Momos", "restaurant": "Wok & Roll", "restaurantId": "r4", "price": 119, "rating": 4.5, "veg": True, "tags": ["Spicy", "Snack", "Budget"], "timing": "20 min"},
    {"id": "f20", "name": "Paneer Tikka Bowl", "restaurant": "Dilli Tadka", "restaurantId": "r3", "price": 179, "rating": 4.5, "veg": True, "tags": ["Healthy", "Filling", "North Indian"], "timing": "30 min"},
]

TIFFIN = [
    {"id": "t1", "name": "HomeTaste Kitchen", "meals": "Lunch + Dinner", "monthly": 2500, "rating": 4.6, "veg": True, "area": "Koramangala", "flexibility": "High", "tags": ["Home-style", "Veg"]},
    {"id": "t2", "name": "Maa's Kitchen", "meals": "Lunch only", "monthly": 2200, "rating": 4.4, "veg": True, "area": "HSR Layout", "flexibility": "Medium", "tags": ["Home-style", "Veg", "Budget"]},
    {"id": "t3", "name": "Daily Dabba", "meals": "Breakfast + Lunch + Dinner", "monthly": 2800, "rating": 4.7, "veg": False, "area": "BTM Layout", "flexibility": "Low", "tags": ["Full-day", "Veg + Non-veg"]},
    {"id": "t4", "name": "Annapurna Meals", "meals": "Dinner only", "monthly": 1800, "rating": 4.3, "veg": True, "area": "Indiranagar", "flexibility": "Medium", "tags": ["Budget", "Veg"]},
    {"id": "t5", "name": "FitTiffin", "meals": "Lunch + Dinner", "monthly": 3200, "rating": 4.5, "veg": True, "area": "Whitefield", "flexibility": "High", "tags": ["Healthy", "High-protein"]},
    {"id": "t6", "name": "Ghar Ka Swaad", "meals": "Breakfast only", "monthly": 1200, "rating": 4.2, "veg": True, "area": "Marathahalli", "flexibility": "Medium", "tags": ["Budget", "Breakfast"]},
]


def catalog_text():
    lines = ["FOOD ITEMS:"]
    for f in FOODS:
        diet = "veg" if f["veg"] else "non-veg"
        lines.append(f"{f['id']}: {f['name']} @ {f['restaurant']} | Rs.{f['price']} | {f['rating']}star | {diet} | {', '.join(f['tags'])} | {f['timing']}")
    lines.append("\nTIFFIN PLANS:")
    for t in TIFFIN:
        diet = "veg" if t["veg"] else "veg+nonveg"
        lines.append(f"{t['id']}: {t['name']} | {t['meals']} | Rs.{t['monthly']}/month | {t['rating']}star | {diet} | {t['area']} | flexibility {t['flexibility']}")
    return "\n".join(lines)


FOOD_BY_ID = {f["id"]: f for f in FOODS}
TIFFIN_BY_ID = {t["id"]: t for t in TIFFIN}
