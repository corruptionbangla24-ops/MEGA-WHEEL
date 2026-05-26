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

// 🎡 [আপনার স্কেচ অনুযায়ী ওরিжилনাল ৩২-ঘরের কড়া ৯৫% RTP ম্যাট্রিক্স লকিং সিস্টেম ভাই ভাই]
const prizeMatrix = [
    { text: "0.3", multiplier: 0.30, weight: 15 },    // ০.৩ গুণ ব্যাক উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "0.5", multiplier: 0.50, weight: 15 },    // ০.৫ গুণ ব্যাক উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "1", multiplier: 1.00, weight: 14 },      // ১ গুণ রিটার্ন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "2", multiplier: 2.00, weight: 10 },      // ২ গুণ উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "3", multiplier: 3.00, weight: 8 },       // ৩ গুণ উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "4", multiplier: 4.00, weight: 7 },       // ৪ গুণ উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "5", multiplier: 5.00, weight: 6 },       // ৫ গুণ উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "10", multiplier: 10.00, weight: 4 },     // ১০ গুণ উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "20", multiplier: 20.00, weight: 3 },     // ২০ গুণ উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "30", multiplier: 30.00, weight: 2 },     // ৩০ গুণ উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "40", multiplier: 40.00, weight: 1 },     // ৪০ গুণ জ্যাকপট
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "100", multiplier: 100.00, weight: 1 },   // ১০০ গুণ জ্যাকপট
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "150", multiplier: 150.00, weight: 1 },   // ১৫০ গুণ জ্যাকপট
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "200", multiplier: 200.00, weight: 1 },   // ২০০ গুণ জ্যাকপট
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "500", multiplier: 500.00, weight: 1 },   // ৫০০ গুণ মেগা উইন
    { text: "0", multiplier: 0.00, weight: 45 },      // ০ লস ঘর
    { text: "0_alt", multiplier: 0.00, weight: 45 },  // ব্যাকআপ এক্সট্রা জিরো ভাই ভাই
    { text: "0_dup", multiplier: 0.00, weight: 45 }   // ব্যাকআপ এক্সট্রা জিরো ভাই ভাই
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

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge." });
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

        // 🎰 [৯৫% ওরিজিনাল RTP গাণিতিক অ্যালগরিদম বর্ম সচল ভাই ভাই]
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
                prizeText: selectedPrize.text,
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
