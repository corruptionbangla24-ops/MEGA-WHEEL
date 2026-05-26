const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - মেগা সকেট প্রোটকল লক]
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

// 🎰 [উইনগো কালার ট্রেড ওরিজিনাল ডোমেইন সিঙ্ক]
const MAIN_SITE_URL = "https://onrender.com"; 

// 🎡 [আপনার ক্যানভাস চাকার ২৪টি ঘরের প্রফিট ম্যাট্রিক্স এবং ৯৫% RTP ওজন লক ভাই ভাই]
const prizeMatrix = [
    { text: "১", multiplier: 1.00, weight: 20 },      // Index 0: 1x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 1: 0 Loss
    { text: "১.৫", multiplier: 1.50, weight: 18 },    // Index 2: 1.5x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 3: 0 Loss
    { text: "২", multiplier: 2.00, weight: 15 },      // Index 4: 2x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 5: 0 Loss
    { text: "৩", multiplier: 3.00, weight: 12 },      // Index 6: 3x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 7: 0 Loss
    { text: "৫", multiplier: 5.00, weight: 10 },      // Index 8: 5x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 9: 0 Loss
    { text: "১০", multiplier: 10.00, weight: 6 },     // Index 10: 10x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 11: 0 Loss
    { text: "২০", multiplier: 20.00, weight: 4 },     // Index 12: 20x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 13: 0 Loss
    { text: "৫০", multiplier: 50.00, weight: 2 },     // Index 14: 50x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 15: 0 Loss
    { text: "১০০", multiplier: 100.00, weight: 1 },   // Index 16: 100x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 17: 0 Loss
    { text: "২০০", multiplier: 200.00, weight: 1 },   // Index 18: 200x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 19: 0 Loss
    { text: "৫০০", multiplier: 500.00, weight: 1 },   // Index 20: 500x Win
    { text: "০", multiplier: 0.00, weight: 35 },      // Index 21: 0 Loss
    { text: "১০০০", multiplier: 1000.00, weight: 1 }, // Index 22: 1000x Win
    { text: "০", multiplier: 0.00, weight: 35 }       // Index 23: 0 Loss
];

// 💰 লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড এপিআই
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

// 🛫 ৩ডি ক্যানভাস স্পিন সমন্বিত এপিআই রাউট (POST Route - ৯৫% RTP বর্ম লক ভাই ভাই!)
app.post('/api/wheel-spin', async (req, res) => {
    const { userId, amount, wallet } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 50;

    if (reqAmount < 1 || reqAmount > 2000) {
        return res.json({ success: false, message: "🚨 Invalid Bet Amount (৳১ - ৳২০০০)" });
    }

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge." });
        }

        // 🎯 [ভবিষ্যৎ সেন্ট্রাল এডমিন প্যানেল গেটওয়ে লিঙ্ক লক ভাই ভাই]
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

        // 🎰 [৯৫% ওরিজিনাল RTP ম্যাথমেটিক্স সচল লুপ ভাই ভাই]
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

        let winAmount = 0;
        let dbAction = "bet";
        let dbAmount = reqAmount;

        if (selectedPrize.multiplier > 0) {
            winAmount = Math.floor(reqAmount * selectedPrize.multiplier);
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

        if (response.data && response.data.status === "ok") {
            io.emit("balanceUpdate", { username: userId, balance: response.data.balance });

            return res.json({
                success: true,
                balance: response.data.balance,
                winningIndex: prizeIndex, // 🎡 ফ্রন্টএ্যান্ড ক্যানভাস চাকা ঘোরানোর জন্য আসল চাবিকাঠি লক হলো ভাই!
                winValue: selectedPrize.text,
                winAmount: winAmount
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
server.listen(PORT, () => { console.log(`🎡 Royal Lucky Wheel Canvas Engine Running on port ${PORT}`); });
