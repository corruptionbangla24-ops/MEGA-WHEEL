const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 🎯 [উইনগো কালার ট্রেড সিঙ্ক - মেগা সকেট প্রোটোকল লক]
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

// 🎡 চাকার ১২টি ঘরের ডাইনামিক রেট মেমোরি ইনডেক্স ভাই ভাই
const prizeMatrix = [
    { text: "iPhone", multiplier: 15.00 },
    { text: "৳০", multiplier: 0 },
    { text: "৳১০০", multiplier: 1.50 },
    { text: "৳০", multiplier: 0 },
    { text: "Motorcycle", multiplier: 8.00 },
    { text: "৳০", multiplier: 0 },
    { text: "৳৫০০", multiplier: 3.50 },
    { text: "৳০", multiplier: 0 },
    { text: "Car", multiplier: 50.00 }, // কার মিললে সরাসরি ৫০ গুণ জ্যাকপট উইন ভাই ভাই!
    { text: "৳০", multiplier: 0 },
    { text: "৳১০০০", multiplier: 5.00 },
    { text: "৳০", multiplier: 0 }
];

// 💰 ১. লাইভ অ্যাকাউন্ট ব্যালেন্স নিয়ে আসার ডেডিকেটেড গেটওয়ে
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

// 🛫 ২. লাকি হুইল কোর স্পিন মেগা রাউট (POST Route - কড়া সিকিউরিটি বর্ম লক ভাই ভাই!)
app.post('/api/wheel-spin', async (req, res) => {
    const { userId, amount, wallet } = req.body;
    const targetWallet = wallet || "main";
    const reqAmount = parseFloat(amount) || 10;

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else if (balCheck.data && balCheck.data.status === "ok") {
            currentDbBalance = 9999999;
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge." });
        }

        // 🎯 চাকার ১২টি ঘরের মধ্যে ১টি র্যান্ডম ঘর চূড়ান্ত করার ক্যাসিনো ম্যাথ ইঞ্জিন ভাই ভাই
        const prizeIndex = Math.floor(Math.random() * prizeMatrix.length);
        const selectedPrize = prizeMatrix[prizeIndex];

        // ১টি ঘরের কৌণিক দূরত্ব ৩০ ডিগ্রি (৩৬০ / ১২ = ৩০) ভাই ভাই
        const targetAngle = (prizeIndex * 30) + 15; // ঘরের মাঝখানে সুঁই লক করার নিখুঁত ডিগ্রি হিসাব ভাই

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
                targetAngle: targetAngle,
                prizeText: selectedPrize.text,
                winAmount: winAmount
            });
        } else {
            let latestBal = (response.data && response.data.balance !== undefined) ? response.data.balance : currentDbBalance;
            if (latestBal === 9999999) latestBal = 0;
            return res.json({ success: false, balance: latestBal, message: response.data.message || "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        console.error("Lucky Wheel Core Engine Error:", e.message);
        return res.json({ success: false, message: "⚠️ Connection Timeout! Click SPIN again." });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log("Player connected to Lucky Wheel Fortune Engine!");
});

// ৫ নম্বর গেম ১২০০০, ৬ নম্বর ১৩০০০, তাই এই ৭ নম্বর গেম প্রজেক্টের স্বাধীন পোর্ট ১৪০০০ এ কড়া লক হলো ভাই ভাই!
const PORT = process.env.PORT || 14000;
server.listen(PORT, () => {
    console.log(`🎡 Royal Lucky Wheel Engine Running on port ${PORT}`);
});
