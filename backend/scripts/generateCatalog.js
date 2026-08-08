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

const colors = ["Silver", "Space Gray", "Midnight Blue", "Obsidian Black", "Starlight", "Titanium Grey"];
const strapColors = ["Black", "Midnight Blue", "Starlight", "Ocean Orange", "Graphite"];
const RAM_OPTIONS = ["8GB", "16GB", "32GB"];
const STORAGE_OPTIONS = ["512GB SSD", "1TB SSD"];

const REAL_PRODUCTS = {
  laptops: [
    {
      title: "Apple MacBook Air 13-inch",
      brand: "Apple",
      price: 114900,
      originalPrice: 119900,
      imageId: "1517336714731-489689fd1ca8",
      specs: {
        Processor: "Apple M3 (8-core CPU, 10-core GPU)",
        RAM: "8GB Unified Memory",
        Storage: "512GB Superfast SSD",
        Display: "13.6-inch Liquid Retina Display with True Tone",
        Battery: "52.6Whr (Up to 18 hours battery life)",
        Weight: "1.24 kg",
        GPU: "Apple 10-Core Integrated GPU"
      },
      features: [
        "Strikingly thin design with durable recycled aluminum enclosure",
        "Silent fanless thermal design for quiet operations",
        "1080p FaceTime HD camera with three-mic array",
        "Backlit Magic Keyboard with Touch ID sensor"
      ],
      tags: ["macbook", "apple", "thin", "m3", "laptop", "macos"],
      description: "Supercharged by the next-generation M3 chip, the incredibly thin MacBook Air glides through work and play. With up to 18 hours of battery life, you can take it anywhere."
    },
    {
      title: "Apple MacBook Pro 14-inch",
      brand: "Apple",
      price: 199900,
      originalPrice: 209900,
      imageId: "1517336714731-489689fd1ca8",
      specs: {
        Processor: "Apple M3 Pro (11-core CPU, 14-core GPU)",
        RAM: "18GB Unified Memory",
        Storage: "512GB Superfast SSD",
        Display: "14.2-inch Liquid Retina XDR 120Hz Display",
        Battery: "72.4Whr (Up to 18 hours battery life)",
        Weight: "1.61 kg",
        GPU: "Apple 14-Core Integrated GPU"
      },
      features: [
        "Liquid Retina XDR display with extreme dynamic range and high contrast",
        "Active cooling system for sustained high performance",
        "Six-speaker sound system with force-cancelling woofers",
        "MagSafe 3 charging port with fast charge support"
      ],
      tags: ["macbook", "pro", "m3-pro", "apple", "laptop", "development"],
      description: "The 14-inch MacBook Pro with M3 Pro delivers mind-blowing performance and exceptional battery life for designers, developers, and creative professionals."
    },
    {
      title: "Dell XPS 15 9530",
      brand: "Dell",
      price: 184990,
      originalPrice: 199990,
      imageId: "1593642632823-8f785ba67e45",
      specs: {
        Processor: "Intel Core i7-13700H (14-Core, up to 5.0 GHz)",
        RAM: "16GB DDR5 Dual Channel",
        Storage: "1TB PCIe Gen4 NVMe SSD",
        Display: "15.6-inch OLED 3.5K (3456 x 2160) Touch Display",
        Battery: "86Whr (Up to 10 hours battery life)",
        Weight: "1.92 kg",
        GPU: "NVIDIA GeForce RTX 4050 6GB GDDR6"
      },
      features: [
        "Stunning 4-sided InfinityEdge display with 92.9% screen-to-body ratio",
        "CNC machined aluminum chassis with carbon fiber palm rest",
        "Quad studio speakers tuned by Waves MaxxAudio Pro",
        "Dual Thunderbolt 4 ports for advanced expansion"
      ],
      tags: ["dell", "xps", "oled", "nvidia", "laptop", "windows", "creator"],
      description: "The Dell XPS 15 is the ultimate creator laptop. Packed with a 13th Gen Intel Core processor, brilliant high-res touch display, and dedicated RTX graphics."
    },
    {
      title: "HP Omen 16 Gaming",
      brand: "HP",
      price: 114990,
      originalPrice: 129990,
      imageId: "1603302576837-37561b2e2302",
      specs: {
        Processor: "AMD Ryzen 7 7840HS (8-Core, up to 5.1 GHz)",
        RAM: "16GB DDR5 5600MHz",
        Storage: "1TB PCIe Gen4 SSD",
        Display: "16.1-inch QHD IPS 165Hz Gaming Display",
        Battery: "83Whr (Up to 6 hours battery life)",
        Weight: "2.37 kg",
        GPU: "NVIDIA GeForce RTX 4060 8GB GDDR6"
      },
      features: [
        "Omen Tempest Cooling technology for low hardware temps",
        "4-zone RGB backlit keyboard with anti-ghosting keys",
        "Audio by Bang & Olufsen with dual stereo speakers",
        "Flicker-free display with low blue light certification"
      ],
      tags: ["hp", "omen", "gaming", "nvidia", "ryzen", "165hz", "laptop"],
      description: "Go beyond with the HP Omen 16 gaming laptop. Features a high refresh-rate QHD screen, powerful Ryzen processor, and RTX 4060 graphics for competitive play."
    },
    {
      title: "Lenovo ThinkPad X1 Carbon Gen 11",
      brand: "Lenovo",
      price: 169990,
      originalPrice: 189990,
      imageId: "1588872657578-7efd1f1555ed",
      specs: {
        Processor: "Intel Core i7-1355U (10-Core, up to 5.0 GHz)",
        RAM: "32GB LPDDR5 6400MHz",
        Storage: "1TB PCIe Gen4 NVMe SSD",
        Display: "14-inch WUXGA IPS Anti-Glare Display",
        Battery: "57Whr (Up to 15 hours battery life)",
        Weight: "1.12 kg",
        GPU: "Intel Iris Xe Graphics"
      },
      features: [
        "Ultralight carbon-fiber design weighing just 1.12kg",
        "Legendary spill-resistant ThinkPad keyboard with TrackPoint",
        "Robust enterprise security with dTPM 2.0 and fingerprint scanner",
        "MIL-STD 810H military-grade durability certified"
      ],
      tags: ["lenovo", "thinkpad", "business", "intel", "lightweight", "laptop"],
      description: "The Lenovo ThinkPad X1 Carbon Gen 11 is the gold standard for business laptops. Delivers extreme portability, military-grade durability, and an unmatched typing experience."
    },
    {
      title: "ASUS ROG Zephyrus G14",
      brand: "ASUS",
      price: 144990,
      originalPrice: 159990,
      imageId: "1603302576837-37561b2e2302",
      specs: {
        Processor: "AMD Ryzen 9 8945HS (8-Core, up to 5.2 GHz)",
        RAM: "16GB LPDDR5X Dual Channel",
        Storage: "1TB PCIe Gen4 NVMe SSD",
        Display: "14-inch ROG Nebula OLED 120Hz Display",
        Battery: "73Whr (Up to 9 hours battery life)",
        Weight: "1.50 kg",
        GPU: "NVIDIA GeForce RTX 4060 8GB GDDR6"
      },
      features: [
        "Ultra-premium all-aluminum chassis with slash lighting design",
        "ROG Nebula OLED display with G-Sync support and VESA HDR500",
        "Tri-fan technology with liquid metal thermal compound",
        "Dolby Atmos sound with 6-speaker spatial audio"
      ],
      tags: ["asus", "rog", "gaming", "oled", "rtx", "ryzen", "portable"],
      description: "Sleek, powerful, and portable. The ASUS ROG Zephyrus G14 features a gorgeous OLED screen, top-tier Ryzen AI processor, and dedicated graphics for gaming and creation on the go."
    }
  ],
  smartphones: [
    {
      title: "Apple iPhone 15 Pro",
      brand: "Apple",
      price: 129900,
      originalPrice: 134900,
      imageId: "1511707171634-5f897ff02aa9",
      specs: {
        Processor: "Apple A17 Pro (3nm flagship chip)",
        RAM: "8GB RAM",
        Storage: "256GB NVMe Storage",
        Camera: "48MP Main + 12MP UltraWide + 12MP 3x Telephoto & 12MP Front Camera",
        Battery: "3274 mAh with 20W Fast Charging (50% in 30 mins)",
        Display: "6.1-inch Super Retina XDR OLED 120Hz ProMotion Display",
        OS: "iOS 17 (upgradable to iOS 18)"
      },
      features: [
        "Aerospace-grade titanium design with textured matte glass back",
        "Action button customizable for favorite shortcuts",
        "Next-gen portraits with Focus and Depth Control",
        "USB-C connector supporting USB 3 speeds up to 10Gbps"
      ],
      tags: ["iphone", "apple", "pro", "titanium", "ios", "flagship"],
      description: "Forged in titanium, the iPhone 15 Pro features the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever."
    },
    {
      title: "Samsung Galaxy S24 Ultra",
      brand: "Samsung",
      price: 129999,
      originalPrice: 139999,
      imageId: "1610945265064-0e34e5519bbf",
      specs: {
        Processor: "Snapdragon 8 Gen 3 for Galaxy",
        RAM: "12GB LPDDR5X",
        Storage: "512GB UFS 4.0",
        Camera: "200MP Main + 50MP Periscope + 12MP UltraWide + 10MP Telephoto & 12MP Front",
        Battery: "5000 mAh with 45W Super Fast Charging 2.0",
        Display: "6.8-inch Dynamic AMOLED 2X QHD+ 120Hz display",
        OS: "Android 14 with One UI 6.1"
      },
      features: [
        "Built-in S Pen stylus for precise writing and drawing",
        "Advanced Galaxy AI with Circle to Search and Live Translate",
        "Titanium frame and Corning Gorilla Armor glass protection",
        "Quad Telephoto system with 5x optical zoom lens"
      ],
      tags: ["samsung", "galaxy", "ultra", "s-pen", "ai", "flagship", "android"],
      description: "Meet the Galaxy S24 Ultra, the ultimate form of Galaxy smartphone. Features a massive 200MP camera, built-in S Pen, and Galaxy AI integrations that change the way you search and connect."
    },
    {
      title: "OnePlus 12 5G",
      brand: "OnePlus",
      price: 64999,
      originalPrice: 69999,
      imageId: "1580910051074-3eb694886505",
      specs: {
        Processor: "Snapdragon 8 Gen 3 (4nm processor)",
        RAM: "16GB LPDDR5X",
        Storage: "512GB UFS 4.0",
        Camera: "50MP Main + 64MP 3x Periscope + 48MP UltraWide & 32MP Front",
        Battery: "5400 mAh with 100W SUPERVOOC Fast Charging",
        Display: "6.82-inch 2K ProXDR AMOLED 120Hz display",
        OS: "Android 14 with OxygenOS 14"
      },
      features: [
        "4th Gen Hasselblad Camera system for mobile photography",
        "100W wired and 50W AIRVOOC wireless fast charging support",
        "Dual Cryo-velocity VC cooling plate for thermal stability",
        "Aqua Touch technology for smooth operation with wet hands"
      ],
      tags: ["oneplus", "flagship", "100w", "hasselblad", "android", "5g"],
      description: "The OnePlus 12 is a masterpiece of design and performance. Boasting a elite Snapdragon 8 Gen 3 chip, Hasselblad color-tuned cameras, and 100W hyper-charging."
    },
    {
      title: "Google Pixel 8 Pro",
      brand: "Google",
      price: 99999,
      originalPrice: 106999,
      imageId: "1598327105666-5b89351aff97",
      specs: {
        Processor: "Google Tensor G3 with Titan M2",
        RAM: "12GB LPDDR5X",
        Storage: "128GB UFS 3.1",
        Camera: "50MP Main + 48MP UltraWide + 48MP 5x Telephoto & 10.5MP Front",
        Battery: "5050 mAh with 30W Fast Charging",
        Display: "6.7-inch Super Actua OLED 120Hz display",
        OS: "Android 14 with Pixel Experience"
      },
      features: [
        "Best Take, Magic Eraser, and Audio Magic Eraser AI features",
        "Polished aluminum frame with matte back glass",
        "Temperature sensor built into the rear camera bar",
        "Guaranteed 7 years of OS updates and Feature Drops"
      ],
      tags: ["google", "pixel", "pro", "tensor", "camera", "ai", "android"],
      description: "Google Pixel 8 Pro is the all-pro phone engineered by Google. It has the best Pixel camera yet, custom-built Google Tensor G3 AI chip, and next-gen photo editing tools."
    }
  ],
  smartwatches: [
    {
      title: "Apple Watch Series 9 GPS",
      brand: "Apple",
      price: 41900,
      originalPrice: 44900,
      imageId: "1508685096489-7aacd43bd3b1",
      specs: {
        Processor: "Apple S9 SiP (64-bit dual-core)",
        Display: "Always-On Retina LTPO OLED (Up to 2000 nits brightness)",
        Sensors: "ECG, Blood Oxygen, Heart Rate, Temperature, Fall Detection",
        Connectivity: "GPS, GLONASS, Galileo, QZSS, NFC, Bluetooth 5.3",
        "Battery Life": "Up to 18 hours (36 hours in Low Power Mode)",
        OS: "watchOS 10"
      },
      features: [
        "Double Tap gesture to control calls, timers, and music hands-free",
        "On-device Siri processing for quick and secure health queries",
        "Carbon neutral combinations available with Sport Loop bands",
        "Advanced cycling metrics and workout views"
      ],
      tags: ["apple", "watch", "series-9", "gps", "health", "smartwatch"],
      description: "The Apple Watch Series 9 is smarter, brighter, and mightier. Powered by the S9 SiP, featuring a magical double tap gesture and blood oxygen tracking."
    },
    {
      title: "Samsung Galaxy Watch 6",
      brand: "Samsung",
      price: 29999,
      originalPrice: 32999,
      imageId: "1523275335684-37898b6baf30",
      specs: {
        Processor: "Exynos W930 (Dual-core 1.4GHz)",
        Display: "1.5-inch Super AMOLED Display with Sapphire Crystal",
        Sensors: "BioActive Sensor (Heart Rate + ECG + BIA), Sleep Coach",
        Connectivity: "LTE, GPS, Wi-Fi, NFC, Bluetooth 5.3",
        "Battery Life": "Up to 40 hours (Always-On Display off)",
        OS: "Wear OS Powered by Samsung"
      },
      features: [
        "Personalized Heart Rate Zones for optimized workout drills",
        "Advanced sleep coaching to track stages and score sleep quality",
        "One-click bands for instant styling updates",
        "Body Composition analysis with Bioelectrical Impedance"
      ],
      tags: ["samsung", "watch", "galaxy", "lte", "wearos", "smartwatch"],
      description: "Track your health goals with the Samsung Galaxy Watch 6. Offers advanced sleep coach, customized heart-rate targets, and LTE connectivity so you can stay connected without a phone."
    },
    {
      title: "Garmin Venu 3 GPS",
      brand: "Garmin",
      price: 44990,
      originalPrice: 47990,
      imageId: "1523275335684-37898b6baf30",
      specs: {
        Processor: "Garmin Proprietary Sports Chip",
        Display: "1.4-inch AMOLED Display with optional Always-On mode",
        Sensors: "Elevate Gen 5 Heart Rate, Pulse Ox, Body Battery, Sleep Coach",
        Connectivity: "GPS, GLONASS, GALILEO, Bluetooth, ANT+, Wi-Fi",
        "Battery Life": "Up to 14 days in smartwatch mode",
        OS: "Garmin OS"
      },
      features: [
        "On-watch microphone and speaker for phone calls and voice assistant",
        "Body Battery energy monitoring to balance work and rest schedules",
        "Wheelchair mode with push tracking and hand-cycle activities",
        "Morning Report providing sleep, recovery, and weather briefings"
      ],
      tags: ["garmin", "venu", "sports", "gps", "battery-life", "fitness"],
      description: "Specifically designed with advanced health and fitness features and the ability to make calls and send texts, Garmin Venu 3 is more than just a smartwatch — it's your personal trainer."
    }
  ],
  cameras: [
    {
      title: "Sony Alpha 7 IV Mirrorless",
      brand: "Sony",
      price: 219990,
      originalPrice: 229990,
      imageId: "1616440347437-b1c73416efc2",
      specs: {
        Sensor: "33.0 MP Full-Frame Exmor R CMOS Sensor",
        Resolution: "33 Megapixels",
        "Lens Mount": "Sony E-Mount",
        "Video Resolution": "4K 60p 10-bit 4:2:2 recording",
        "ISO Range": "100 - 51,200 (expandable to 50 - 204,800)",
        "Image Stabilization": "5-axis In-body Image Stabilization (IBIS)",
        Weight: "658g"
      },
      features: [
        "Real-time Eye AF tracking for humans, animals, and birds",
        "Dual slots for SD (UHS-II) and CFexpress Type A cards",
        "3.0-inch vari-angle LCD touch screen monitor",
        "Superb low-light performance with high dynamic range"
      ],
      tags: ["sony", "alpha", "mirrorless", "fullframe", "camera", "4k"],
      description: "An ideal hybrid camera. The Sony Alpha 7 IV combines outstanding 33MP image quality, 4K 60p video, and real-time auto focus tracking to satisfy photographers and filmmakers alike."
    },
    {
      title: "Canon EOS R6 Mark II",
      brand: "Canon",
      price: 214990,
      originalPrice: 229990,
      imageId: "1516035069371-29a1b244cc32",
      specs: {
        Sensor: "24.2 MP Full-Frame CMOS Sensor",
        Resolution: "24.2 Megapixels",
        "Lens Mount": "Canon RF Mount",
        "Video Resolution": "4K 60p uncropped oversampled from 6K",
        "ISO Range": "100 - 102,400 (expandable to 204,800)",
        "Image Stabilization": "In-body Image Stabilizer (up to 8 stops control)",
        Weight: "670g"
      },
      features: [
        "High-speed continuous shooting up to 40fps electronic shutter",
        "Dual Pixel CMOS AF II with deep learning subject detection",
        "High-res OLED EVF with 120fps refresh rate",
        "Weatherproof magnesium alloy frame and controls"
      ],
      tags: ["canon", "eos", "mirrorless", "rf-mount", "camera", "sports"],
      description: "Unleash your creativity with the Canon EOS R6 Mark II. Capturing action at up to 40fps, recording stunning oversampled 4K videos, and stabilizing handheld shots up to 8 stops."
    },
    {
      title: "Fujifilm X-T5 Creator Camera",
      brand: "Fujifilm",
      price: 169990,
      originalPrice: 179990,
      imageId: "1607604276583-eef5d076aa5f",
      specs: {
        Sensor: "40.2 MP APS-C X-Trans CMOS 5 HR Sensor",
        Resolution: "40.2 Megapixels",
        "Lens Mount": "Fujifilm X-Mount",
        "Video Resolution": "6.2K 30p 10-bit recording",
        "ISO Range": "125 - 12,800 (expandable to 64 - 51,200)",
        "Image Stabilization": "5-axis In-body Image Stabilization (up to 7 stops)",
        Weight: "557g"
      },
      features: [
        "Classic tactile dials for shutter speed, ISO, and exposure",
        "Three-way tilting LCD screen for high/low angle shoots",
        "19 Film Simulation modes reproducing classic Fujifilm aesthetics",
        "Advanced subject tracking AI for trains, planes, and autos"
      ],
      tags: ["fujifilm", "xt5", "retro", "apsc", "camera", "street"],
      description: "The Fujifilm X-T5 is a photographer-first camera. Featuring a retro mechanical chassis, massive 40.2MP resolution sensor, and legendary film simulation modes."
    }
  ],
  headphones: [
    {
      title: "Sony WH-1000XM5 Wireless",
      brand: "Sony",
      price: 29990,
      originalPrice: 34990,
      imageId: "1505740420928-5e560c06d30e",
      specs: {
        "Driver Size": "30mm dynamic drivers",
        "Noise Cancellation": "Industry-leading Dual Processor Auto NC Optimizer",
        "Battery Life": "Up to 30 hours with ANC on",
        Weight: "250g",
        Connectivity: "Bluetooth 5.2, Multipoint, LDAC, AAC, Wired"
      },
      features: [
        "Precise Voice Pickup technology with 4 beamforming microphones",
        "Speak-to-Chat pauses music automatically when you start talking",
        "Ultra-comfortable lightweight leather headband and cups",
        "Fast charging giving 3 hours playback in just 3 minutes"
      ],
      tags: ["sony", "wh1000xm5", "anc", "audiophile", "headphones", "wireless"],
      description: "The Sony WH-1000XM5 wireless noise-cancelling headphones rewrite the rules for distraction-free listening and phone call clarity with custom audio processors."
    },
    {
      title: "Bose QuietComfort Ultra",
      brand: "Bose",
      price: 35990,
      originalPrice: 39990,
      imageId: "1546435770-a3e426bf472b",
      specs: {
        "Driver Size": "Custom Bose dynamic drivers",
        "Noise Cancellation": "Customizable CustomTune ANC with Aware Mode",
        "Battery Life": "Up to 24 hours playback",
        Weight: "252g",
        Connectivity: "Bluetooth 5.3, Snapdragon Sound, aptX Adaptive"
      },
      features: [
        "Spatial Bose Immersive Audio for multi-dimensional soundstages",
        "CustomTune technology auto-calibrating sound to fit your ears",
        "Premium build materials with steel hinges and soft leather padding",
        "Wind block technology for clear outdoor phone calls"
      ],
      tags: ["bose", "quietcomfort", "anc", "spatial", "headphones", "travel"],
      description: "Step into world-class quiet with the Bose QuietComfort Ultra. Delivers groundbreaking spatial audio, customizable quiet modes, and luxurious comfort for long flights."
    }
  ]
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
      let brand = randomChoice(brands);
      const adjective = randomChoice(MODEL_ADJECTIVES);
      const modelNum = randomRange(100, 9999);
      
      let title = "";
      let price = 0;
      let originalPrice = 0;
      let specs = {};
      let features = [];
      let tags = [];
      let description = "";
      let imageId = "";
      
      // Determine values by category
      switch (catKey) {
        case "laptops": {
          const laptopPresets = REAL_PRODUCTS.laptops;
          const basePreset = laptopPresets[i % laptopPresets.length];
          const color = colors[i % colors.length];
          const ram = basePreset.brand === "Apple" ? (i % 2 === 0 ? "8GB Unified" : "16GB Unified") : RAM_OPTIONS[i % RAM_OPTIONS.length] + " DDR5";
          const storage = STORAGE_OPTIONS[i % STORAGE_OPTIONS.length];
          
          brand = basePreset.brand;
          title = `${basePreset.title} - ${color} (${ram}, ${storage})`;
          price = basePreset.price + (i % 3) * 5000;
          originalPrice = Math.floor(price * (1 + (randomRange(5, 12) / 100)));
          specs = {
            ...basePreset.specs,
            RAM: ram,
            Storage: storage
          };
          features = [ ...basePreset.features ];
          tags = [ ...basePreset.tags ];
          description = basePreset.description;
          imageId = basePreset.imageId;
          break;
        }

        case "smartphones": {
          const phonePresets = REAL_PRODUCTS.smartphones;
          const basePreset = phonePresets[i % phonePresets.length];
          const color = colors[i % colors.length];
          const storage = i % 2 === 0 ? "128GB" : "256GB";
          
          brand = basePreset.brand;
          title = `${basePreset.title} - ${color} (${storage})`;
          price = basePreset.price + (i % 3) * 3500;
          originalPrice = Math.floor(price * (1 + (randomRange(5, 10) / 100)));
          specs = {
            ...basePreset.specs,
            Storage: storage
          };
          features = [ ...basePreset.features ];
          tags = [ ...basePreset.tags ];
          description = basePreset.description;
          imageId = basePreset.imageId;
          break;
        }

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

        case "smartwatches": {
          const watchPresets = REAL_PRODUCTS.smartwatches;
          const basePreset = watchPresets[i % watchPresets.length];
          const strapColor = strapColors[i % strapColors.length];
          const size = i % 2 === 0 ? "40mm" : "44mm";
          
          brand = basePreset.brand;
          title = `${basePreset.title} - ${strapColor} Strap (${size})`;
          price = basePreset.price + (i % 3) * 1500;
          originalPrice = Math.floor(price * (1 + (randomRange(10, 20) / 100)));
          specs = {
            ...basePreset.specs,
            Size: size
          };
          features = [ ...basePreset.features ];
          tags = [ ...basePreset.tags ];
          description = basePreset.description;
          imageId = basePreset.imageId;
          break;
        }

        case "cameras": {
          const cameraPresets = REAL_PRODUCTS.cameras;
          const basePreset = cameraPresets[i % cameraPresets.length];
          const lensKit = i % 2 === 0 ? "Body Only" : "with 28-70mm Lens Kit";
          
          brand = basePreset.brand;
          title = `${basePreset.title} Mirrorless Camera (${lensKit})`;
          price = basePreset.price + (i % 2) * 18000;
          originalPrice = Math.floor(price * (1 + (randomRange(5, 12) / 100)));
          specs = {
            ...basePreset.specs,
            "Lens Kit": lensKit
          };
          features = [ ...basePreset.features ];
          tags = [ ...basePreset.tags ];
          description = basePreset.description;
          imageId = basePreset.imageId;
          break;
        }

        case "headphones": {
          const audioPresets = REAL_PRODUCTS.headphones;
          const basePreset = audioPresets[i % audioPresets.length];
          const color = i % 2 === 0 ? "Carbon Black" : "Silver Sand";
          
          brand = basePreset.brand;
          title = `${basePreset.title} Wireless ANC - ${color}`;
          price = basePreset.price + (i % 3) * 1200;
          originalPrice = Math.floor(price * (1 + (randomRange(10, 18) / 100)));
          specs = {
            ...basePreset.specs,
            Color: color
          };
          features = [ ...basePreset.features ];
          tags = [ ...basePreset.tags ];
          description = basePreset.description;
          imageId = basePreset.imageId;
          break;
        }

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

      if (!imageId) {
        const categoryImages = UNSPLASH_IMAGES[catKey] || [];
        imageId = categoryImages[i % categoryImages.length] || "1496181130204-7552cc14ac1a";
      }
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
