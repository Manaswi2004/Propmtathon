// A Curated, Embedded Dataset for Offline Recommendations (<5KB)
const foodDB = [
    { id: 1, name: "Oatmeal with Berries", cal: 300, p: 10, c: 54, f: 5, prepMins: 3, isEmergencyReady: true, tags: ["morning", "breakfast", "energy", "tired", "carbs"] },
    { id: 2, name: "Avocado Toast", cal: 250, p: 6, c: 20, f: 15, prepMins: 2, isEmergencyReady: true, tags: ["morning", "breakfast", "light", "veg"] },
    { id: 3, name: "Grilled Chicken Salad", cal: 350, p: 35, c: 15, f: 12, prepMins: 7, isEmergencyReady: false, tags: ["afternoon", "lunch", "protein", "filling", "non-veg"] },
    { id: 4, name: "Cucumber Watermelon Bowl", cal: 120, p: 2, c: 28, f: 1, prepMins: 2, isEmergencyReady: true, tags: ["hot", "weather", "hydrating", "summer", "refreshing", "afternoon", "light", "veg"] },
    { id: 5, name: "Baked Salmon & Asparagus", cal: 400, p: 38, c: 8, f: 22, prepMins: 20, isEmergencyReady: false, tags: ["night", "dinner", "protein", "filling", "non-veg"] },
    { id: 6, name: "Greek Yogurt with Honey", cal: 150, p: 12, c: 18, f: 3, prepMins: 1, isEmergencyReady: true, tags: ["snack", "light", "sweet", "craving", "night", "veg"] },
    { id: 7, name: "Almonds & Walnuts", cal: 200, p: 7, c: 6, f: 18, prepMins: 1, isEmergencyReady: true, tags: ["snack", "energy", "brain", "afternoon", "vegan"] },
    { id: 8, name: "Warm Ginger Tea", cal: 10, p: 0, c: 2, f: 0, prepMins: 2, isEmergencyReady: true, tags: ["night", "digestible", "sick", "cold", "calm", "vegan"] },
    { id: 9, name: "Lentil Soup", cal: 250, p: 18, c: 40, f: 3, prepMins: 5, isEmergencyReady: false, tags: ["night", "dinner", "comfort", "winter", "veg", "vegan", "digestible"] },
    { id: 10, name: "Quinoa Veggie Bowl", cal: 320, p: 14, c: 50, f: 8, prepMins: 8, isEmergencyReady: false, tags: ["lunch", "afternoon", "veg", "vegan", "filling", "tired"] },
    { id: 11, name: "Rice & Beans", cal: 350, p: 15, c: 65, f: 2, prepMins: 5, isEmergencyReady: false, tags: ["lunch", "dinner", "energy", "vegan"] }
];

// Quick healthy-swaps dictionary
const healthySwaps = {
    "chips": 7,  // Maps to Almonds & Walnuts
    "candy": 6,  // Maps to Greek Yogurt
    "soda": 8,   // Maps to Ginger Tea or Water
    "burger": 3  // Maps to Chicken Salad
};
