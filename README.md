# ⚡ Pokétwo Autocatcher

An advanced **Pokétwo autocatcher + spammer** written in Node.js with multi-token support, Pokétwo Assistant integration, smart hint solver, captcha safety, and webhook logging.

---

## ✨ Features
- 🎯 Smart catching logic (Pokétwo Assistant + fallback solver with filters).
- 🤖 Multi-account support (each token spams in its own channel).
- 🕵️ Captcha safety (pauses on captcha, resumes after `.captcha solved`).
- 📢 Broadcast control with `.say <message>` (auto-clicks confirm/accept buttons).
- 📊 Logging & webhooks for catches and captchas.
- 🛠️ Built-in `.help` command for easy management.

---

## 📂 Project Structure
 - poketwo-autocatcher/
 - ├── autocatcher/index.js       # Selfbot autocatcher (spam + catching)
 - ├── utils/logger.js            # Logger + file/webhook logging
 - ├── data/tokens.txt            # Tokens + spam channel IDs
 - ├── data/pokemon.txt           # Full Pokémon list
 - ├── data/main_token.txt        # Main bot’s token
 - ├── logs/catches.txt           # Catch logs
 - ├── logs/stats.json            # Stats tracker
 - ├── config.json                # Webhooks + settings
 - ├── index.js                   # Main bot (manages autocatchers)
 - └── package.json

---

## ⚙️ Setup
1. Clone project & install dependencies:
   npm install
2. Fill in **config.json** with your webhooks:
   {
     "webhooks": {
       "catches": "YOUR_WEBHOOK_URL",
       "captchas": "YOUR_WEBHOOK_URL"
     }
   }
3. Add your main bot token in `data/main_token.txt`.
4. Run main bot:
   node index.js
5. Add tokens via:
   .add-token <userToken> <channelId>
6. Start autocatcher:
   .catcher start

---

## 📜 Commands
🔑 Token Management  
- `.add-token <token> <channelId>` → Add an account  
- `.list-tokens` → Show all accounts  
- `.remove-token <line>` → Remove an account  

🤖 Autocatcher Control  
- `.catcher start` → Start autocatcher  
- `.catcher stop` → Stop autocatcher  
- `.catcher restart` → Restart autocatcher  
- `.status` → Check status  

🕵️ Captcha Handling  
- `.captcha solved` → Resume autocatcher after captcha  

📢 Broadcasting  
- `.say <message>` → Broadcast to all selfbots  
- Auto-clicks Confirm / Accept buttons  

❓ Help  
- `.help` → Shows all commands  

---

## 📖 Notes
- Selfbots are against Discord ToS – use at your own risk.  
- For **educational purposes only**.  
- Webhook logging makes it easy to monitor everything remotely.  

---

## 🏆 Why this autocatcher?
- Multi-token & multi-channel ✅  
- Smart catching (Assistant + solver) ✅  
- Captcha-safe ✅  
- Central control via main bot ✅  
- Logging + webhooks ✅  

- User-friendly `.help` ✅
