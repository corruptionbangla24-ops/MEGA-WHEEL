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

// 🎡 [আপনার রিকোয়ারমেন্ট অনুযায়ী পিউর ২৪টি ঘরের ওরিজিনাল মাল্টিপ্লায়ার ম্যাট্রিক্স লক ভাই ভাই!]
const prizeMatrix = [
    { text: "x0", multiplier: 0 }, { text: "x1.5", multiplier: 1.50 },
    { text: "x2", multiplier: 2.00 }, { text: "x0", multiplier: 0 },
    { text: "x5", multiplier: 5.00 }, { text: "x10", multiplier: 10.00 },
    { text: "x0", multiplier: 0 }, { text: "x20", multiplier: 20.00 },
    { text: "x0", multiplier: 0 }, { text: "x50", multiplier: 50.00 },
    { text: "x100", multiplier: 100.00 }, { text: "x1", multiplier: 1.00 },
    { text: "x0", multiplier: 0 }, { text: "x1.5", multiplier: 1.50 },
    { text: "x0", multiplier: 0 }, { text: "x200", multiplier: 200.00 },
    { text: "x0", multiplier: 0 }, { text: "x500", multiplier: 500.00 },
    { text: "x1", multiplier: 1.00 }, { text: "x2", multiplier: 2.00 },
    { text: "x0", multiplier: 0 }, { text: "x1000", multiplier: 1000.00 }, // 🎯 ১০০০ গুণ মেগা জ্যাকপট ঘর ভাই ভাই!
    { text: "x0", multiplier: 0 }, { text: "x1", multiplier: 1.00 }
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
    let reqAmount = parseFloat(amount) || 10;
    
    // 🎯 সার্ভার সাইডেও বাজি ১ থেকে ২০০০বিডিটি কড়া ভ্যালিডেশন লক ভাই ভাই
    if (reqAmount < 1) reqAmount = 1;
    if (reqAmount > 2000) reqAmount = 2000;

    try {
        const balCheck = await axios.get(`${MAIN_SITE_URL}/api_callback.php?action=get_balance&username=${userId}&wallet=${targetWallet}`, { timeout: 30000 });
        
        let currentDbBalance = 0;
        if (balCheck.data && balCheck.data.balance !== undefined && balCheck.data.balance !== null) {
            currentDbBalance = parseFloat(balCheck.data.balance);
        } else { currentDbBalance = 9999999; }

        if (currentDbBalance < reqAmount && currentDbBalance !== 9999999) {
            return res.json({ success: false, balance: currentDbBalance, message: "❌ Insufficient Balance! Please Recharge." });
        }

        // 🎯 চাকার ২৪টি ঘরের মধ্যে ১টি র্যান্ডম ঘর চূড়ান্ত করার ক্যাসিনো ম্যাথ ইঞ্জিন ভাই ভাই
        const prizeIndex = Math.floor(Math.random() * prizeMatrix.length);
        const selectedPrize = prizeMatrix[prizeIndex];

        // ২৪ ঘরের জন্য কৌণিক দূরত্ব ১৫ ডিগ্রি (৩৬ۆ / ২৪ = ১৫) ভাই ভাই
        const targetAngle = (prizeIndex * 15) + 7.5; // ঘরের মাঝখানে সুঁই লক করার নিখুঁত ডিগ্রি হিসাব ভাই

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
                winAmount: winAmount,
                multiplier: selectedPrize.multiplier
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
