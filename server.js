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

const MAIN_SITE_URL = "https://onrender.com"; 

// 🎡 [আপনার রিকোয়ারমেন্ট অনুযায়ী ৩টি ফিজিক্যাল আইটেম বাদে পিউর ২৪-ঘরের ওরিজিনাল ব্যাকএন্ড প্রফিট তালিকা ভাই ভাই]
const prizeMatrix = [
    { text: "1000", multiplier: 1000.00 }, { text: "0", multiplier: 0 },
    { text: "1.5", multiplier: 1.50 }, { text: "0", multiplier: 0 },
    { text: "2", multiplier: 2.00 }, { text: "0", multiplier: 0 },
    { text: "5", multiplier: 5.00 }, { text: "0", multiplier: 0 },
    { text: "10", multiplier: 10.00 }, { text: "0", multiplier: 0 },
    { text: "20", multiplier: 20.00 }, { text: "0", multiplier: 0 },
    { text: "50", multiplier: 50.00 }, { text: "0", multiplier: 0 },
    { text: "100", multiplier: 100.00 }, { text: "0", multiplier: 0 },
    { text: "200", multiplier: 200.00 }, { text: "0", multiplier: 0 },
    { text: "500", multiplier: 500.00 }, { text: "0", multiplier: 0 },
    { text: "2", multiplier: 2.00 }, { text: "0", multiplier: 0 },
    { text: "5", multiplier: 5.00 }, { text: "0", multiplier: 0 }
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

    // 🔒 বেট রেঞ্জ সিকিউরিটি বর্ম ফিল্টার ভাই ভাই
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
        let safeLoopCounter = 0;

        while (prizeIndex === null && safeLoopCounter < 100) {
            let randomIndex = Math.floor(Math.random() * prizeMatrix.length);
            if (adminTriggeredPrize) {
                if (prizeMatrix[randomIndex].text === adminTriggeredPrize) {
                    prizeIndex = randomIndex;
                }
            } else {
                prizeIndex = randomIndex; // পিউর ডাইনামিক র্যান্ডম মোড সচল ভাই
            }
            safeLoopCounter++;
        }

        if (prizeIndex === null) prizeIndex = 1;

        const selectedPrize = prizeMatrix[prizeIndex];
        const targetAngle = (prizeIndex * 15) + 7.5; // ২৪ ঘরের পারফেক্ট সুঁই এলাইনমেন্ট ম্যাথ ভাই ভাই

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
            return res.json({ success: false, balance: latestBal, message: "❌ Bet Declined by Database!" });
        }

    } catch (e) {
        return res.json({ success: false, message: "⚠️ Timeout! Click SPIN again." });
    }
});

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });

const PORT = process.env.PORT || 14000;
server.listen(PORT, () => { console.log(`🎡 Royal Lucky Wheel Engine Running on port ${PORT}`); });
