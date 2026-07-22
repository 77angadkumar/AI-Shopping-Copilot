const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to generate a MongoDB ObjectID lookalike
function generateObjectId() {
  const timestamp = Math.floor(new Date().getTime() / 1000).toString(16).padStart(8, "0");
  const machine = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  const pid = Math.floor(Math.random() * 65535).toString(16).padStart(4, "0");
  const increment = Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
  return (timestamp + machine + pid + increment).substring(0, 24);
}

// Helper to get random item from array
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random sub-array
const randomSample = (arr, num) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};

// Helper for random number in range
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to format float to 1 decimal place
const randomFloat = (min, max) => Math.round((Math.random() * (max - min) + min) * 10) / 10;

// Data sets for generator
const BRANDS = {
  laptops: ["Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Apple"],
  smartphones: ["Apple", "Samsung", "OnePlus", "Xiaomi", "Google"],
  tablets: ["Apple", "Samsung", "Lenovo", "Xiaomi"],
  smartwatches: ["Apple", "Samsung", "Garmin", "Fitbit", "Noise", "boAt", "Amazfit"],
  headphones: ["Sony", "Bose", "Sennheiser", "JBL", "boAt"],
  earbuds: ["Sony", "JBL", "Bose", "Apple", "boAt", "OnePlus"],
  monitors: ["LG", "Samsung", "Dell", "BenQ", "ASUS", "Acer"],
  keyboards: ["Logitech", "Razer", "Corsair", "Keychron", "Redragon"],
  mice: ["Logitech", "Razer", "Corsair", "SteelSeries", "Redragon"],
  gaming_accessories: ["Razer", "Logitech", "Corsair", "ASUS ROG", "HyperX", "SteelSeries"],
  cameras: ["Sony", "Canon", "Nikon", "Fujifilm", "Panasonic"]
};

const UNSPLASH_IMAGES = {
  laptops: ["1496181130204-7552cc14ac1a", "1603302576837-37561b2e2302", "1588872657578-7efd1f1555ed", "1593642632823-8f785ba67e45", "1486312338219-ce68d2c6f44d"],
  smartphones: ["1511707171634-5f897ff02aa9", "1598327105666-5b89351aff97", "1580910051074-3eb694886505", "1565849906660-af608a0d5071", "1512941937669-90a1b58e7e9c"],
  tablets: ["1544244015-0df4b3ffc6b0", "1589739900243-4b52cd9b104e", "1561154464-82e9adf32764", "1527698266440-12104e498b76"],
  smartwatches: ["1508685096489-7aacd43bd3b1", "1523275335684-37898b6baf30", "1579586337278-3befd40fd17a", "1434494878577-86c23bcb06b9"],
  headphones: ["1505740420928-5e560c06d30e", "1546435770-a3e426bf472b", "1484704849700-f032a568e944", "1618384887929-16ec33fab9ef"],
  earbuds: ["1590658268037-6bf12165a8df", "1608156639585-b3a032ef9689", "1588449668365-d15e397f6787", "1572569511254-18f66d4ae3bb"],
  monitors: ["1527443224154-c4a3942d3acf", "1585776245991-cf89dd7fc73a", "1547082299-de196ea013d6", "1551645121-d1034da75057"],
  keyboards: ["1587829741301-dc798b83add3", "1618384887929-16ec33fab9ef", "1595225476474-87563907a212", "1614088685112-0a55517237a0"],
  mice: ["1615663245857-ac93bb7c39e7", "1625842268584-8f3290447036", "1605773527852-c543735f41c8", "1617050318658-ec2b281f6d90"],
  gaming_accessories: ["1600861195091-690c92f1d2cc", "1542751371-adc38448a05e", "1538481199705-c710c4e965fc", "1593305841608-85e8242407eb"],
  cameras: ["1516035069371-29a1b244cc32", "1616440347437-b1c73416efc2", "1500643752441-4dcf4006b50f", "1607604276583-eef5d076aa5f", "1502920917128-1aa500764cbd"]
};

const CATEGORY_MAP = {
  laptops: "Laptops",
  smartphones: "Smartphones",
  tablets: "Tablets",
  smartwatches: "Smartwatches",
  headphones: "Headphones",
  earbuds: "Earbuds",
  monitors: "Monitors",
  keyboards: "Keyboards",
  mice: "Mice",
  gaming_accessories: "Gaming Accessories",
  cameras: "Cameras"
};

const MODEL_ADJECTIVES = ["Pro", "Ultra", "Elite", "Max", "Air", "Prime", "Gaming", "Slim", "Classic", "Plus", "Edition", "Studio", "Strix", "TUF", "IdeaPad", "Inspiron", "ZenBook", "Galaxy", "Pixel", "XPS"];
const AUDIENCES = ["Students", "Gamers", "Professionals", "Office Workers", "Audiophiles", "Fitness Enthusiasts", "Casual Users", "Developers", "Creators"];

// Specs matrices templates
const PROCESSORS_LAPTOP = ["Intel Core i3-1215U", "Intel Core i5-1340P", "Intel Core i7-13700H", "Intel Core i9-13900H", "AMD Ryzen 5 7520U", "AMD Ryzen 7 7735HS", "AMD Ryzen 9 7940HS", "Apple M2 Chip", "Apple M3 Chip", "Apple M3 Pro Chip"];
const PROCESSORS_PHONE = ["Snapdragon 8 Gen 3", "Snapdragon 8 Gen 2", "Snapdragon 7s Gen 2", "Apple A17 Pro", "Apple A16 Bionic", "Dimensity 9300", "Google Tensor G3", "Exynos 2400"];

const GPU_LAPTOP = ["NVIDIA RTX 4090 16GB", "NVIDIA RTX 4080 12GB", "NVIDIA RTX 4070 8GB", "NVIDIA RTX 4060 8GB", "NVIDIA RTX 3050 4GB", "AMD Radeon 780M", "Intel Iris Xe Graphics", "Apple 10-Core GPU", "Apple 14-Core GPU"];

const REVIEW_USERS = ["Aarav Sharma", "Aditya Patel", "Ananya Iyer", "Arjun Nair", "Devendra Singh", "Ishaan Roy", "Kavita Rao", "Meera Krishnan", "Neha Gupta", "Pranav Joshi", "Rahul Verma", "Riya Sen", "Siddharth Das", "Tanvi Bhatia", "Vikram Malhotra", "Yash Wardhan", "Amit Trivedi", "Sneha Patil", "Rohan Mehta", "Divya Choudhary"];

const POSITIVE_REVIEWS = [
  { title: "Absolutely fantastic!", text: "Exceeded all my expectations. Build quality is top-notch, and it works flawlessly out of the box." },
  { title: "Great value for money", text: "Given the price tag, this is a steal. Offers almost all features of high-end models without breaking the bank." },
  { title: "Super fast and reliable", text: "Blazing fast speeds, solid battery backup, and premium looks. Highly recommended for daily use!" },
  { title: "Best in class", text: "I have tried other brands but this one stands out. Extremely satisfied with my purchase." },
  { title: "Excellent features", text: "The specifications match exactly what is described. Display is beautiful and colors are vibrant." }
];

const NEUTRAL_REVIEWS = [
  { title: "Decent product, could be better", text: "Performance is okay for everyday tasks, but struggles slightly under heavy load. Average battery life." },
  { title: "Good but slightly overpriced", text: "The device runs fine, but I feel there are cheaper options available with similar specs." },
  { title: "Satisfactory purchase", text: "Satisfied overall. Nothing extraordinary but does the job well. The charger gets a bit hot during use." }
];

const NEGATIVE_REVIEWS = [
  { title: "Disappointing performance", text: "Lags frequently, battery drains within a couple of hours, and the casing feels cheap." },
  { title: "Not worth the money", text: "Had high hopes but the device stopped working properly after a week. Customer service was slow to respond." },
  { title: "Poor build quality", text: "The materials used feel very plastic and flimsy. Speakers are crackly at high volume. Returning it." }
];

// Generator logic
function generateProductDataset() {
  const products = [];
  const reviews = [];

  const categories = Object.keys(BRANDS);
  
  categories.forEach((catKey) => {
    const brands = BRANDS[catKey];
    const categoryName = CATEGORY_MAP[catKey];

    // Generate 50 products per category -> 500 products total
    for (let i = 1; i <= 50; i++) {
      const id = generateObjectId();
      const brand = randomChoice(brands);
      const adjective = randomChoice(MODEL_ADJECTIVES);
      const modelNum = randomRange(100, 9999);
      
      let title = "";
      let price = 0;
      let originalPrice = 0;
      let specs = {};
      let features = [];
      let tags = [];
      let description = "";
      
      // Determine values by category
      switch (catKey) {
        case "laptops":
          title = `${brand} ${adjective} ${modelNum} Gaming Laptop`;
          if (brand === "Apple") title = `${brand} MacBook ${adjective} M${randomRange(2, 3)}`;
          price = brand === "Apple" ? randomRange(90000, 249000) : randomRange(35000, 169000);
          originalPrice = Math.floor(price * (1 + randomRange(5, 25) / 100));
          
          specs = {
            Processor: randomChoice(PROCESSORS_LAPTOP),
            RAM: randomChoice(["8GB DDR5", "16GB DDR5", "32GB DDR5", "16GB Unified", "8GB Unified"]),
            Storage: randomChoice(["512GB PCIe Gen4 NVMe SSD", "1TB PCIe Gen4 NVMe SSD", "2TB SSD", "256GB SSD"]),
            Display: `${randomChoice(["14", "15.6", "16", "13.3", "17.3"])}-inch ${randomChoice(["FHD IPS", "QHD IPS 165Hz", "OLED 120Hz", "Retina XDR"])}`,
            Battery: `${randomRange(45, 99)}Whr (Up to ${randomRange(5, 18)} hours)`,
            Weight: `${randomFloat(1.1, 2.6)} kg`,
            GPU: randomChoice(GPU_LAPTOP)
          };
          features = [
            "Ultra-thin bezel design with metal finish",
            "Backlit tactile chiclet keyboard",
            "Advanced liquid cooling thermal design",
            "Dolby Atmos certified dual audio speakers"
          ];
          tags = ["laptop", "notebook", "computer", "intel", "amd", "nvidia", "windows", "coding", "gaming"];
          description = `A powerful and sleek ${categoryName.toLowerCase()} designed by ${brand}. Featuring a cutting-edge ${specs.Processor} paired with ${specs.RAM} RAM and ${specs.Storage} storage for seamless performance. Perfect for development, high-end gaming, creative workflows, and daily office productivity.`;
          break;

        case "smartphones":
          title = `${brand} ${adjective} ${randomRange(10, 15)} ${randomChoice(["5G", "Ultra", "Pro", "Lite"])}`;
          price = brand === "Apple" || brand === "Samsung" ? randomRange(45000, 149999) : randomRange(12000, 49000);
          originalPrice = Math.floor(price * (1 + randomRange(5, 20) / 100));

          specs = {
            Processor: randomChoice(PROCESSORS_PHONE),
            RAM: randomChoice(["6GB", "8GB LPDDR5X", "12GB LPDDR5X", "16GB"]),
            Storage: randomChoice(["128GB UFS 4.0", "256GB UFS 4.0", "512GB"]),
            Camera: `${randomChoice(["50MP + 12MP + 8MP", "200MP + 50MP + 12MP", "48MP + 12MP", "108MP"]) } Rear Triple Setup & ${randomRange(12, 32)}MP Front Camera`,
            Battery: `${randomChoice(["4500 mAh", "5000 mAh", "5500 mAh"])} with ${randomChoice(["33W", "67W", "100W", "20W"])} Fast Charging`,
            Display: `${randomFloat(6.1, 6.8)}-inch ${randomChoice(["AMOLED 120Hz", "Dynamic AMOLED 2X", "Super Retina XDR", "IPS LCD 90Hz"])}`,
            OS: brand === "Apple" ? "iOS 17" : "Android 14 with custom UI"
          };
          features = [
            "Stunning high refresh-rate display for fluid scroll",
            "Advanced night portrait mode cameras",
            "IP68 dust and water resistance rating",
            "Fast under-screen fingerprint biometrics"
          ];
          tags = ["phone", "smartphone", "mobile", "5g", "android", "ios", "camera", "snapdragon", "oled"];
          description = `The flagship ${brand} ${categoryName.toLowerCase()} comes packed with high-end camera sensors, a beautiful high-brightness ${specs.Display} screen, and a robust battery that handles intensive gaming and video capture easily.`;
          break;

        case "tablets":
          title = `${brand} Tab ${adjective} ${modelNum}`;
          if (brand === "Apple") title = `${brand} iPad ${adjective} ${randomChoice(["Air", "Pro", "Mini"])}`;
          price = brand === "Apple" ? randomRange(35900, 99999) : randomRange(14000, 45000);
          originalPrice = Math.floor(price * (1 + randomRange(5, 18) / 100));

          specs = {
            Processor: brand === "Apple" ? "M1/M2 Silicon" : "Octa-core MediaTek/Exynos",
            RAM: randomChoice(["4GB", "6GB", "8GB"]),
            Storage: randomChoice(["64GB", "128GB", "256GB"]),
            Display: `${randomChoice(["10.1", "10.9", "11", "12.4"])}-inch screen`,
            Battery: `${randomRange(6000, 10000)} mAh`,
            OS: brand === "Apple" ? "iPadOS" : "Android Tab Edition",
            Weight: `${randomRange(440, 580)}g`
          };
          features = [
            "Magnetic active stylus support inside box",
            "Quad stereophonic entertainment speakers",
            "Desktop DeX / Stage Manager window management mode",
            "Slim lightweight metallic alloy body"
          ];
          tags = ["tablet", "ipad", "drawing", "media", "screen", "school", "kids", "android", "ipados"];
          description = `A large-screen versatile ${categoryName.toLowerCase()} from ${brand} designed for digital drawings, taking university notes, watching videos, and lightweight work. Compatible with keyboards and drawing stylus accessories.`;
          break;

        case "smartwatches":
          title = `${brand} Watch ${adjective} ${randomChoice(["Active", "Sport", "Classic", "Fit"])}`;
          price = brand === "Apple" || brand === "Garmin" ? randomRange(24900, 79000) : randomRange(1999, 14999);
          originalPrice = Math.floor(price * (1 + randomRange(10, 40) / 100));

          specs = {
            Display: `${randomChoice(["1.3", "1.4", "1.78", "1.9"])}-inch ${randomChoice(["Always-on AMOLED", "Retina OLED", "TFT LCD"])}`,
            "Battery Life": `${randomChoice(["18 hours", "2 days", "7 days", "14 days", "21 days"])}`,
            Sensors: "Heart Rate, SpO2, Sleep Monitor, Accelerometer, GPS, Gyroscope",
            Waterproof: "5 ATM (Swimproof)",
            Weight: `${randomRange(25, 55)}g`,
            OS: brand === "Apple" ? "watchOS" : brand === "Samsung" ? "WearOS" : "Proprietary RTOS"
          };
          features = [
            "Continuous 24/7 heart rate and blood oxygen monitoring",
            "Built-in multi-satellite GPS run tracking",
            "Bluetooth calls with speaker and microphone built-in",
            "100+ athletic sports workout tracking modes"
          ];
          tags = ["watch", "smartwatch", "fitness", "gps", "heart", "steps", "health", "workout"];
          description = `Stay tracked and connected with the ${brand} smart fitness ${categoryName.toLowerCase()}. Features precision health trackers, sleep stage coaching, and customizable faces built into a premium swimproof case.`;
          break;

        case "cameras":
          title = `${brand} ${adjective} ${randomChoice(["Alpha R", "EOS Mark IV", "Z Mirrorless", "Lumix GH", "X-T5 Creator"])}`;
          price = brand === "Sony" || brand === "Canon" ? randomRange(85000, 245000) : randomRange(45000, 150000);
          originalPrice = Math.floor(price * (1 + randomRange(5, 20) / 100));

          specs = {
            Sensor: randomChoice(["Full-Frame CMOS", "APS-C CMOS", "Micro Four Thirds", "1-inch BSI CMOS"]),
            Resolution: randomChoice(["24.2 MP", "33.0 MP", "45.0 MP", "26.1 MP", "20.1 MP"]),
            "Lens Mount": brand === "Sony" ? "Sony E-Mount" : brand === "Canon" ? "Canon RF" : brand === "Nikon" ? "Nikon Z" : brand === "Fujifilm" ? "Fujifilm X" : "Micro Four Thirds",
            "Video Resolution": randomChoice(["4K 60p", "4K 120p", "8K 30p", "4K 30p", "1080p 120p"]),
            "ISO Range": randomChoice(["100 - 51,200", "100 - 102,400", "80 - 102,400", "160 - 51,200"]),
            "Image Stabilization": randomChoice(["5-axis In-body (IBIS)", "Lens-shift Stabilization", "None", "Digital Stabilization"]),
            Weight: `${randomRange(350, 780)}g`
          };
          features = [
            "Advanced Hybrid Autofocus with Real-time Eye AF tracking",
            "Dual UHS-II SD card slots for secure recording backups",
            "Weather-sealed magnesium alloy chassis and controls",
            "High-resolution OLED electronic view finder"
          ];
          tags = ["camera", "photography", "lens", "video", "4k", "mirrorless", "dslr", "vlogging", "sony", "canon"];
          description = `A professional ${categoryName.toLowerCase()} designed by ${brand}. Featuring a cutting-edge ${specs.Sensor} sensor with ${specs.Resolution} resolution and ${specs["Image Stabilization"]} for gorgeous shots. Perfect for professional filmmaking, portraiture, street photography, and content creation.`;
          break;

        case "headphones":
          title = `${brand} WH-${modelNum} ${adjective} Wireless Headphones`;
          price = brand === "Sony" || brand === "Bose" ? randomRange(14999, 29990) : randomRange(1299, 9999);
          originalPrice = Math.floor(price * (1 + randomRange(10, 30) / 100));

          specs = {
            "Driver Size": `${randomChoice(["30mm", "40mm", "45mm"])} Dynamic`,
            "Noise Cancellation": randomChoice(["Active Noise Cancellation (ANC)", "Hybrid ANC", "Passive Isolation"]),
            "Battery Life": `${randomRange(20, 60)} hours (ANC off)`,
            "Bluetooth Version": "Bluetooth 5.2 / 5.3",
            Weight: `${randomRange(180, 290)}g`
          };
          features = [
            "Deep active noise cancellation adapts to surroundings",
            "Multipoint connection pairs two devices at once",
            "Cushioned memory foam earcups for hours of comfort",
            "Quick charge: 10 mins gives 5 hours playback"
          ];
          tags = ["headphone", "headphones", "audio", "anc", "music", "bass", "wireless", "travel", "bose", "sony"];
          description = `Experience premium rich audio fidelity with ${brand}'s over-ear ${categoryName.toLowerCase()}. Designed with industry-grade ${specs["Noise Cancellation"]} and a massive battery delivering up to ${specs["Battery Life"]} of audio playback.`;
          break;

        case "earbuds":
          title = `${brand} Buds ${adjective} ${modelNum} TWS`;
          price = brand === "Apple" || brand === "Sony" || brand === "Bose" ? randomRange(12900, 24900) : randomRange(1499, 6999);
          originalPrice = Math.floor(price * (1 + randomRange(10, 35) / 100));

          specs = {
            "Driver Size": `${randomChoice(["6mm", "8mm", "10mm", "11mm"])} Dynamic`,
            "Noise Cancellation": randomChoice(["Active Noise Cancelling", "Smart ANC", "Passive"]),
            "Battery Life": `${randomRange(5, 10)} hours (Up to ${randomRange(24, 40)} hours with case)`,
            "Bluetooth Version": "Bluetooth 5.3",
            Weight: `${randomFloat(4.2, 5.8)}g per earbud`
          };
          features = [
            "IPX5 splash and sweat resistance rating",
            "Personalized spatial audio tuning with head tracking",
            "Ergonomic fit with multiple silicone ear tips",
            "Ultra-compact charging case fits in coin pockets"
          ];
          tags = ["earbud", "earbuds", "earphone", "tws", "audio", "gym", "wireless", "sound", "sports"];
          description = `Sleek true wireless ${categoryName.toLowerCase()} from ${brand}. Packed with high-fidelity acoustics, smart touch controls, and sweat resistance, making them ideal companions for the gym, commute, and daily calls.`;
          break;

        case "monitors":
          title = `${brand} UltraSync ${randomRange(24, 34)}-inch Monitor`;
          price = brand === "Samsung" || brand === "Dell" || brand === "ASUS" ? randomRange(12000, 48000) : randomRange(7999, 18999);
          originalPrice = Math.floor(price * (1 + randomRange(5, 25) / 100));

          specs = {
            "Display Size": `${randomChoice(["24", "27", "32", "34"])}-inch Diagonal`,
            Resolution: randomChoice(["FHD (1920x1080)", "QHD (2560x1440)", "4K UHD (3840x2160)", "WQHD UltraWide"]),
            "Panel Type": randomChoice(["IPS", "VA", "OLED"]),
            "Refresh Rate": randomChoice(["60Hz", "75Hz", "144Hz", "165Hz", "240Hz"]),
            "Response Time": `${randomChoice(["1ms", "4ms", "5ms"])} GtG`,
            Connectivity: "HDMI, DisplayPort, USB Type-C Alt Mode"
          };
          features = [
            "AMD FreeSync / G-Sync compatible for stutter-free gaming",
            "HDR10 / HDR400 support for vivid high-contrast media",
            "Flicker-Free technology with low blue light emission",
            "Height adjustable ergonomic tilt & swivel stand"
          ];
          tags = ["monitor", "display", "screen", "office", "gaming", "ips", "4k", "setup", "desk"];
          description = `Transform your workspace or battle station with ${brand}'s high-resolution ${categoryName.toLowerCase()}. Offering a gorgeous ${specs.Resolution} ${specs["Panel Type"]} screen with a high ${specs["Refresh Rate"]} refresh rate for clear image quality.`;
          break;

        case "keyboards":
          title = `${brand} ${adjective} Mechanical Gaming Keyboard`;
          price = brand === "Logitech" || brand === "Keychron" ? randomRange(45000 / 10, 14999) : randomRange(1299, 4999);
          originalPrice = Math.floor(price * (1 + randomRange(10, 45) / 100));

          specs = {
            Layout: randomChoice(["Full-Size (100%)", "Tenkeyless (80%)", "Compact (75%)", "Ultra-Compact (60%)"]),
            "Switch Type": randomChoice(["Cherry MX Red (Linear)", "Mechanical Brown (Tactile)", "Mechanical Blue (Clicky)", "Optical Linear", "Gateron G-Pro Yellow"]),
            Backlight: randomChoice(["RGB per-key customization", "Rainbow LED backlights", "Single white LED backlight", "No backlight"]),
            Connectivity: randomChoice(["USB Wired", "2.4GHz Wireless + Bluetooth + Wired", "Bluetooth only"]),
            Weight: `${randomRange(600, 1100)}g`
          };
          features = [
            "Double-shot ABS or PBT wear-resistant keycaps",
            "Hot-swappable key-switch sockets for custom mods",
            "N-key rollover anti-ghosting technology",
            "Durable metal base frame prevents flex"
          ];
          tags = ["keyboard", "keyboards", "typing", "mechanical", "keychron", "rgb", "gaming", "switches"];
          description = `A premium tactile ${categoryName.toLowerCase()} engineered by ${brand}. Features hot-swappable ${specs["Switch Type"]} switches in a solid frame with gorgeous ${specs.Backlight} lighting, built for programmers and gamers alike.`;
          break;

        case "mice":
          title = `${brand} ${adjective} Precision Wireless Mouse`;
          price = brand === "Logitech" || brand === "Razer" ? randomRange(1999, 12999) : randomRange(599, 2999);
          originalPrice = Math.floor(price * (1 + randomRange(10, 50) / 100));

          specs = {
            Sensor: `${brand} Optical Sensor`,
            MaxDPI: `${randomChoice(["8000", "12000", "16000", "20000", "26000"])} DPI`,
            Buttons: `${randomRange(5, 11)} Programmable Buttons`,
            Weight: `${randomRange(59, 120)}g`,
            Connectivity: randomChoice(["USB Wired", "LightSpeed 2.4GHz Wireless + Bluetooth", "Bluetooth + Wired"])
          };
          features = [
            "Ultra-lightweight design for effortless fast glides",
            "Zero-latency wireless connection system",
            "Optical mouse switches rated for 80 million clicks",
            "Ergonomic contoured grip reduces hand fatigue"
          ];
          tags = ["mouse", "mice", "precision", "gaming", "office", "wireless", "rgb", "dpi", "logitech", "razer"];
          description = `Navigate with total accuracy using ${brand}'s ergonomic ${categoryName.toLowerCase()}. Boasting an adjustable ${specs.MaxDPI} optical sensor and customizable buttons, it provides tracking for professional graphics and gaming.`;
          break;

        case "gaming_accessories":
          title = `${brand} ${adjective} Pro Gaming ${randomChoice(["Headset", "Controller", "Desk Mat", "Stream Mic", "Chair"])}`;
          price = randomRange(1499, 19999);
          originalPrice = Math.floor(price * (1 + randomRange(10, 30) / 100));

          specs = {
            Compatibility: "PC, PS5, Xbox Series X/S, Nintendo Switch, Mobile",
            RGB: randomChoice(["Chroma RGB supported", "Static lighting", "No RGB"]),
            Connection: "USB Wired / 2.4GHz Low-Latency Wireless",
            Weight: `${randomRange(250, 450)}g`
          };
          features = [
            "Custom-tuned audio drivers / low-drift analog sticks",
            "Premium breathable mesh cushions or leather finishes",
            "Noise-cancelling detachable cardiod microphone",
            "Heavy-duty solid steel reinforcement frame"
          ];
          tags = ["gaming", "gamer", "accessory", "headset", "rgb", "xbox", "ps5", "razer", "pc"];
          description = `Take your gaming setups to elite levels with ${brand}'s premium ${categoryName.toLowerCase()}. Formed from durable alloys and engineered for low latency, it provides the ultimate competitive advantage.`;
          break;
      }

      // Calculate discount percentage
      const discountPercentage = Math.round(((originalPrice - price) / originalPrice) * 100);
      const rating = randomFloat(3.8, 4.9);
      const reviewCount = randomRange(20, 50);
      const stock = randomRange(5, 120);

      // Generate recommendation metadata
      const popularityScore = randomRange(50, 100);
      const trendingScore = randomRange(40, 95);
      const recommendationWeight = randomFloat(0.5, 0.95);
      const targetAudience = randomChoice(AUDIENCES);

      // Searchable text block for vector generation fallback
      const specsString = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join(", ");
      const searchableText = `${title} ${brand} ${categoryName} ${description} ${features.join(" ")} ${specsString} ${tags.join(" ")}`.toLowerCase();

      const categoryImages = UNSPLASH_IMAGES[catKey] || [];
      const imageId = categoryImages[i % categoryImages.length] || "1496181130204-7552cc14ac1a";
      const imageUrl = `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=600&q=80`;

      const product = {
        _id: id,
        title,
        brand,
        category: catKey,
        price,
        originalPrice,
        discountPercentage,
        rating,
        reviewCount,
        stock,
        description,
        specifications: specs,
        features,
        imageUrl,
        tags,
        warranty: `${randomChoice(["1", "2"])} Year manufacturer warranty`,
        availability: stock > 0 ? "In Stock" : "Out of Stock",
        recommendationMetadata: {
          popularityScore,
          trendingScore,
          recommendationWeight,
          targetAudience
        },
        searchableText
      };

      products.push(product);

      // Generate 20-50 reviews for this product
      for (let rIdx = 0; rIdx < reviewCount; rIdx++) {
        const user = randomChoice(REVIEW_USERS);
        
        // Randomize review rating based on product rating
        let revRating = 5;
        const roll = Math.random();
        if (rating > 4.5) {
          revRating = roll < 0.7 ? 5 : roll < 0.9 ? 4 : 3;
        } else if (rating > 4.2) {
          revRating = roll < 0.5 ? 5 : roll < 0.8 ? 4 : roll < 0.95 ? 3 : 2;
        } else {
          revRating = roll < 0.3 ? 5 : roll < 0.6 ? 4 : roll < 0.85 ? 3 : roll < 0.95 ? 2 : 1;
        }

        let templateList = POSITIVE_REVIEWS;
        if (revRating === 3) templateList = NEUTRAL_REVIEWS;
        else if (revRating <= 2) templateList = NEGATIVE_REVIEWS;

        const template = randomChoice(templateList);
        
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - randomRange(2, 360));

        const review = {
          productId: id,
          userName: user,
          rating: revRating,
          reviewTitle: template.title,
          reviewText: template.text,
          verifiedPurchase: Math.random() > 0.15,
          date: reviewDate.toISOString()
        };

        reviews.push(review);
      }
    }
  });

  return { products, reviews };
}

console.log("Generating 500 products and associated reviews dataset...");
const data = generateProductDataset();

console.log(`Writing ${data.products.length} products to products.json...`);
fs.writeFileSync(
  path.join(DATA_DIR, "products.json"),
  JSON.stringify(data.products, null, 2)
);

console.log(`Writing ${data.reviews.length} reviews to reviews.json...`);
fs.writeFileSync(
  path.join(DATA_DIR, "reviews.json"),
  JSON.stringify(data.reviews, null, 2)
);

console.log("Generation complete! Datasets placed in backend/data/.");
