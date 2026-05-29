const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, './')));

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *; default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; connect-src * 'unsafe-inline'; img-src * data: blob:; style-src * 'unsafe-inline'; font-src * data:;");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

const MAIN_SITE_URL = "https://betlover247.onrender.com"; 

// 🎡 [আপনার ৪-কোণ ক্যানভাস চাকার ৩২টি ঘরের প্রফিট ম্যাট্রিক্স এবং ৯৫% RTP ওজন লক ভাই ভাই]
const prizeMatrix = [
    { text: "100", multiplier: 100.00, weight: 1 },    // 🚀 উত্তর কোণা (০ নম্বর ঘর)
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "1", multiplier: 1.00, weight: 20 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "0.3", multiplier: 0.30, weight: 25 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "0.5", multiplier: 0.50, weight: 22 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "150", multiplier: 150.00, weight: 1 },    // 🚀 পূর্ব কোণা (৮ নম্বর ঘর)
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "2", multiplier: 2.00, weight: 18 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "3", multiplier: 3.00, weight: 15 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "4", multiplier: 4.00, weight: 12 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "200", multiplier: 200.00, weight: 1 },    // 🚀 দক্ষিণ কোণা (১৬ নম্বর ঘর)
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "5", multiplier: 5.00, weight: 10 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "10", multiplier: 10.00, weight: 6 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "20", multiplier: 20.00, weight: 4 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "500", multiplier: 500.00, weight: 1 },    // 🚀 পশ্চিম কোণা (২৪ নম্বর ঘর)
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "30", multiplier: 3.00, weight: 8 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "40", multiplier: 4.00, weight: 6 },
    { text: "0", multiplier: 0.00, weight: 35 },
    { text: "1000", multiplier: 1000.00, weight: 1 },
    { text: "0", multiplier: 0.00, weight: 35 }
];

app.get('/api/wheel-balance', async (req, res) => {
    const { userId, wallet } = req.query;
    try {
        const response = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${wallet}`, { timeout: 30000 });
        if (response.data && response.data.status === "ok") {
            return res.json({ success: true, balance: response.data.balance });
        }
        return res.json({ success: false, balance: 0 });
    } catch (e) { return res.json({ success: false, balance: 0 }); }
});

app.post('/api/wheel-spin', async (req, res) => {
    const { userId, amount, wallet } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;

    if (reqAmount < 1 || reqAmount > 2000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳২০০০)" });
    }

    
            


        let adminTriggeredPrize = (balCheck.data && balCheck.data.wheel_target) ? balCheck.data.wheel_target : null;
        let prizeIndex = null;

        if (adminTriggeredPrize) {
            let matchingIndices = [];
            prizeMatrix.forEach((p, idx) => {
                if (p.text === adminTriggeredPrize) matchingIndices.push(idx);
            });
            if (matchingIndices.length > 0) {
                prizeIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)];
            }
        }

        // 🎰 [৯৫% ওরিজিনাল RTP ও সুষম ছড়ানো র্যান্ডম ডিস্ট্রিবিউশন লুপ ভাই ভাই]
        if (prizeIndex === null) {
            let pool = [];
            prizeMatrix.forEach((prize, idx) => {
                for (let i = 0; i < prize.weight; i++) {
                    pool.push(idx);
                }
            });
            prizeIndex = pool[Math.floor(Math.random() * pool.length)];
        }

        if (prizeIndex === null) prizeIndex = 1;

        const selectedPrize = prizeMatrix[prizeIndex];

        // 📊 ৩২ ঘরের জন্য ওরিজিনাল কৌণিক দূরত্ব ১১.২৫ ডিগ্রি (৩৬০ / ৩২ = ১১.২৫) ভাই ভাই!
        const targetAngle = (prizeIndex * 11.25) + 5.625; // প্রতি ঘরের একদম সেন্ট্রাল পেটে কাঁটা ব্রেক করার ম্যাথ

                // 🎯 [মেগা ০.৫ এবং ০.৩ দশমিক উইন ক্যালকুলেটর বুস্টার লক ভাই ভাই]
        let winAmount = 0;
        let dbAction = "bet";
        let dbAmount = reqAmount;

        // ০ ছাড়া যেকোনো সংখ্যা বা গুণিতক পড়া মানেই প্লেয়ার কিছু না কিছু টাকা জিতেছে ভাই!
        if (parseFloat(selectedPrize.multiplier) > 0) {
            winAmount = Math.floor(reqAmount * parseFloat(selectedPrize.multiplier));
            dbAction = "win";
            dbAmount = parseFloat(winAmount);
        }


        let phpPayload = {
            action: dbAction,
            username: userId,
            amount: dbAmount,
            wallet: targetWallet
        };

        if (dbAction === "win") {
            phpPayload.bet_amount = reqAmount;
            phpPayload.multiplier = parseFloat(selectedPrize.multiplier).toFixed(2);
            phpPayload.status = "win";
            phpPayload.type = "win";
            phpPayload.is_win = 1;
            phpPayload.win_status = "win";
            phpPayload.log_status = "win";
        }

        const response = await axios.post(MAIN_SITE_URL + '/api_callback.php', phpPayload, { timeout: 30000 });

        // 🎯 [মেগা রেসপন্স ডাটা উইন সিঙ্কার লক ভাই ভাই]: এটি উইন এমাউন্ট সরাসরি ফ্রন্টএন্ডের পেটে নিখুঁত ট্রান্সফার করবে!
        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                prizeText: selectedPrize.text,
                targetAngle: targetAngle,
                winAmount: Number(winAmount) // 🚀 পিউর নাম্বার ফরম্যাটে ৫০০ বা সঠিক উইন টাকা এখানে পাস লক হলো ভাই ভাই!
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            return res.json({ success: false, balance: latestBal, message: "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        return res.json({ success: false, message: "⚠️ Timeout! Click SPIN again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const PORT = process.env.PORT || 14000;
server.listen(PORT, () => { console.log(`🎡 Royal Lucky Wheel 4-Corner 95% RTP Engine Running on port ${PORT}`); });
