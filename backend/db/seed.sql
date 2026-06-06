USE lumina;

INSERT IGNORE INTO categories (id, name, slug) VALUES
(1, 'Electronics', 'electronics'),
(2, 'Audio', 'audio'),
(3, 'Wearables', 'wearables'),
(4, 'Lifestyle', 'lifestyle');

INSERT IGNORE INTO products (id, categoryId, name, slug, description, price, comparePrice, images, stock, featured, rating, reviewCount) VALUES
(1, 1, 'MacBook Pro 14" M3 Pro', 'macbook-pro-14-m3-pro',
 'The most powerful MacBook Pro ever. With the M3 Pro chip, it features a stunning Liquid Retina XDR display, all-day battery life, and performance that crushes professional workloads.',
 2499.00, 2799.00,
 '["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format","https://images.unsplash.com/photo-1611186871525-6c75da3d53a5?w=800&auto=format","https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=800&auto=format"]',
 45, TRUE, 4.9, 2341),

(2, 1, 'Dell XPS 15 OLED', 'dell-xps-15-oled',
 'Stunning 3.5K OLED display with InfinityEdge design. Intel Core i9, 32GB RAM, RTX 4070 graphics — built for creators who demand the best.',
 1899.00, 2099.00,
 '["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&auto=format","https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format","https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format"]',
 30, TRUE, 4.7, 1876),

(3, 1, 'iPad Pro 12.9" M2', 'ipad-pro-12-m2',
 'The ultimate iPad experience. M2 chip, Liquid Retina XDR display with ProMotion, Apple Pencil hover, and Wi-Fi 6E. Transform the way you work.',
 1099.00, NULL,
 '["https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=800&auto=format","https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format","https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format"]',
 60, TRUE, 4.8, 3102),

(4, 1, 'Keychron Q1 Pro Mechanical Keyboard', 'keychron-q1-pro',
 'Fully assembled wireless mechanical keyboard with QMK/VIA support, aluminum body, gasket mount, and RGB backlight. The ultimate typing experience.',
 199.00, 229.00,
 '["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format","https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format","https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format"]',
 120, FALSE, 4.6, 892),

(5, 1, 'Sony A7 IV Mirrorless Camera', 'sony-a7-iv',
 '33MP full-frame BSI-CMOS sensor, 4K 60p video, real-time tracking AF, and 10fps burst shooting. The definitive hybrid camera for professionals.',
 2499.00, NULL,
 '["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format","https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format","https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=800&auto=format"]',
 25, TRUE, 4.9, 1543),

(6, 1, 'Anker USB-C 12-in-1 Hub', 'anker-usb-c-hub',
 'Expand your connectivity with 4K HDMI, 100W Power Delivery, 2x USB-A 3.0, SD card reader, Ethernet, and more. Compact and powerful.',
 79.00, 99.00,
 '["https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=800&auto=format","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format","https://images.unsplash.com/photo-1606229365485-93a3b8ee0385?w=800&auto=format"]',
 200, FALSE, 4.5, 2341),

(7, 2, 'Sony WH-1000XM5 Headphones', 'sony-wh-1000xm5',
 'Industry-leading noise cancellation with 8 microphones. Up to 30-hour battery, multipoint connection, and crystal-clear call quality. The best ANC headphones ever made.',
 349.00, 399.00,
 '["https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format","https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format"]',
 150, TRUE, 4.8, 4521),

(8, 2, 'Apple AirPods Pro (2nd Gen)', 'airpods-pro-2nd-gen',
 'Active Noise Cancellation, Transparency mode, Adaptive Audio, and Personalized Spatial Audio with dynamic head tracking. H2 chip delivers next-level audio performance.',
 249.00, NULL,
 '["https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format","https://images.unsplash.com/photo-1588423771073-b8903fead4c6?w=800&auto=format","https://images.unsplash.com/photo-1606741965429-02919c6a4230?w=800&auto=format"]',
 300, TRUE, 4.7, 6234),

(9, 2, 'Bose QuietComfort 45', 'bose-quietcomfort-45',
 'Acclaimed noise cancellation technology, soft earcup cushions, and 24-hour battery life. TriPort acoustic architecture delivers deep, balanced audio.',
 279.00, 329.00,
 '["https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format","https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&auto=format","https://images.unsplash.com/photo-1519519166045-b47b81f3e6d6?w=800&auto=format"]',
 85, FALSE, 4.6, 3102),

(10, 2, 'Yamaha HS8 Studio Monitor', 'yamaha-hs8-studio-monitor',
 'Industry-standard near-field studio monitor. 8-inch woofer with 120W bi-amp system. Flat frequency response for accurate mixing. The choice of professional studios worldwide.',
 699.00, NULL,
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format","https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format","https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format"]',
 40, FALSE, 4.9, 876),

(11, 2, 'Audio-Technica AT-LP120XUSB Turntable', 'audio-technica-at-lp120xusb',
 'Direct-drive professional turntable with USB output for digitizing your vinyl collection. High-torque motor, adjustable tone arm, built-in phono preamp.',
 299.00, 349.00,
 '["https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format","https://images.unsplash.com/photo-1542272201-b1ca555f8505?w=800&auto=format","https://images.unsplash.com/photo-1593697909683-bccb1b9e3a7e?w=800&auto=format"]',
 55, TRUE, 4.7, 1234),

(12, 3, 'Apple Watch Ultra 2', 'apple-watch-ultra-2',
 'The most rugged and capable Apple Watch. Titanium case, precision dual-frequency GPS, up to 60-hour battery, 100m water resistance. Built for extreme environments.',
 799.00, NULL,
 '["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format"]',
 200, TRUE, 4.9, 2876),

(13, 3, 'Samsung Galaxy Watch 6 Classic', 'samsung-galaxy-watch-6-classic',
 'Iconic rotating bezel design with advanced health monitoring. BioActive Sensor tracks heart rate, blood oxygen, body composition, and sleep. 3-day battery life.',
 399.00, 449.00,
 '["https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format","https://images.unsplash.com/photo-1542496658-e33a6d0d0bd8?w=800&auto=format","https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&auto=format"]',
 130, FALSE, 4.5, 1543),

(14, 3, 'Garmin Fenix 7X Solar', 'garmin-fenix-7x-solar',
 'The ultimate multisport GPS smartwatch. Solar charging extends battery to 37 days. Topographic maps, multi-band GPS, triathlon mode, advanced training metrics.',
 899.00, NULL,
 '["https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format","https://images.unsplash.com/photo-1553545204-4f7d339aa06a?w=800&auto=format","https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&auto=format"]',
 60, TRUE, 4.8, 987),

(15, 3, 'Fitbit Sense 2', 'fitbit-sense-2',
 'Advanced health smartwatch with stress management, ECG app, skin temperature sensor, and built-in GPS. 6-day battery. Google Maps and Google Wallet compatible.',
 249.00, 299.00,
 '["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format","https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format","https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&auto=format"]',
 175, FALSE, 4.4, 2134),

(16, 4, 'Aesop Resurrection Aromatique Hand Balm Set', 'aesop-hand-balm-set',
 'A curated trio of Resurrection Aromatique formulations — hand wash, rinse-free hand wash, and hand balm. Nourishes and protects with a sophisticated botanical scent.',
 129.00, NULL,
 '["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&auto=format","https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&auto=format","https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format"]',
 90, TRUE, 4.8, 456),

(17, 4, 'Moleskine Pro Collection Notebook', 'moleskine-pro-notebook',
 'The essential tool for creative professionals. Lay-flat binding, numbered pages, table of contents, and detachable inner folders. Ivory-colored acid-free paper.',
 49.00, NULL,
 '["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format","https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format","https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format"]',
 300, FALSE, 4.6, 1234),

(18, 4, 'BenQ ScreenBar Plus Monitor Light', 'benq-screenbar-plus',
 'Auto-dimming LED monitor light with wireless dial controller. No glare on screen, wide color temperature range (2700K-6500K), and USB-C powered. Perfect for late-night coding.',
 159.00, 189.00,
 '["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format","https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format"]',
 110, TRUE, 4.7, 876),

(19, 4, 'Logitech MX Master 3S Mouse', 'logitech-mx-master-3s',
 '8K DPI Darkfield sensor works on any surface including glass. MagSpeed electromagnetic scrolling, 7 customizable buttons, USB-C charging, 70-day battery life.',
 99.00, 119.00,
 '["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format","https://images.unsplash.com/photo-1527864550417-7519abe947fa?w=800&auto=format","https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format"]',
 220, FALSE, 4.8, 3456),

(20, 4, 'Grovemade Wool Felt Desk Pad', 'grovemade-desk-pad',
 'Premium desk pad made from natural wool felt. Protects your desk, reduces noise, and elevates your workspace aesthetic. 31" x 16" with leather trim edge.',
 79.00, NULL,
 '["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format","https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&auto=format"]',
 150, FALSE, 4.5, 678),

(21, 1, 'LG UltraWide 34" Monitor', 'lg-ultrawide-34',
 '21:9 QHD (3440x1440) Nano IPS display with 1ms GtG response time, 144Hz refresh, HDR10, and VESA DisplayHDR 400. Dual Thunderbolt 3 ports for seamless multi-device workflow.',
 799.00, 999.00,
 '["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format","https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=800&auto=format","https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format"]',
 45, TRUE, 4.7, 1876),

(22, 2, 'Sennheiser HD 660S2', 'sennheiser-hd-660s2',
 'Open-back audiophile headphones with improved bass extension and detail retrieval. 150-ohm impedance, replaceable cable, velour ear pads. Reference-grade listening.',
 499.00, NULL,
 '["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format","https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&auto=format","https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=800&auto=format"]',
 65, FALSE, 4.8, 543);
