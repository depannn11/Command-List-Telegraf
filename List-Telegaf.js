bot.command('mediafire', async (ctx) => {
  const args = ctx.message.text.split(' ').slice(1);
  if (!args.length) return ctx.reply('Gunakan: /mediafire <url>');

  try {
    const { data } = await axios.get(`https://www.velyn.biz.id/api/downloader/mediafire?url=${encodeURIComponent(args[0])}`);
    const { title, url } = data.data;

    const filePath = `/tmp/${title}`;
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    fs.writeFileSync(filePath, response.data);

    const zip = new AdmZip();
    zip.addLocalFile(filePath);
    const zipPath = filePath + '.zip';
    zip.writeZip(zipPath);

    await ctx.replyWithDocument({ source: zipPath }, {
      filename: path.basename(zipPath),
      caption: '📦 File berhasil di-zip dari MediaFire'
    });

      
    fs.unlinkSync(filePath);
    fs.unlinkSync(zipPath);

  } catch (err) {
    console.error('[MEDIAFIRE ERROR]', err);
    ctx.reply('Terjadi kesalahan saat membuat ZIP.');
  }
});

bot.command('countryinfo', async (ctx) => {
  try {
    const input = ctx.message.text.split(' ').slice(1).join(' ');
    if (!input) {
      return ctx.reply('Masukkan nama negara setelah perintah.\n\nContoh:\n`/countryinfo Indonesia`', { parse_mode: 'Markdown' });
    }

    const res = await axios.post('https://api.siputzx.my.id/api/tools/countryInfo', {
      name: input
    });

    const { data } = res.data;

    if (!data) {
      return ctx.reply('Negara tidak ditemukan atau tidak valid.');
    }

    const caption = `
🌍 *${data.name}* (${res.data.searchMetadata.originalQuery})
📍 *Capital:* ${data.capital}
📞 *Phone Code:* ${data.phoneCode}
🌐 *Continent:* ${data.continent.name} ${data.continent.emoji}
🗺️ [Google Maps](${data.googleMapsLink})
📏 *Area:* ${data.area.squareKilometers} km²
🏳️ *TLD:* ${data.internetTLD}
💰 *Currency:* ${data.currency}
🗣️ *Languages:* ${data.languages.native.join(', ')}
🧭 *Driving Side:* ${data.drivingSide}
⚖️ *Government:* ${data.constitutionalForm}
🍺 *Alcohol Prohibition:* ${data.alcoholProhibition}
🌟 *Famous For:* ${data.famousFor}
      `.trim();

    await ctx.replyWithPhoto(
      { url: data.flag },
      {
        caption,
        parse_mode: 'Markdown',
      }
    );

     
    if (data.neighbors && data.neighbors.length) {
      const neighborText = data.neighbors.map(n => `🧭 *${n.name}*\n📍 [Maps](https://www.google.com/maps/place/${n.coordinates.latitude},${n.coordinates.longitude})`).join('\n\n');
      await ctx.reply(`🌐 *Negara Tetangga:*\n\n${neighborText}`, { parse_mode: 'Markdown' });
    }

  } catch (err) {
    console.error(err);
    ctx.reply('Gagal mengambil informasi negara. Coba lagi nanti atau pastikan nama negara valid.');
  }
});

bot.command("chat", async (ctx) => {
  if (!OPENAI_KEY || !OpenAI) return ctx.reply("⚠️ /chat butuh OPENAI_KEY di config.js");
  const prompt = ctx.message.text.split(" ").slice(1).join(" ");
  if (!prompt) return ctx.reply("❗ /chat <pesan>");
  try {
    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    const r = await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] });
    ctx.reply(r.choices[0].message.content.trim());
  } catch { ctx.reply("❌ Gagal menghubungi GPT."); }
});

bot.command("fixcode", async (ctx) => {
  if (!OPENAI_KEY || !OpenAI) return ctx.reply("⚠️ /fixcode butuh OPENAI_KEY di config.js");
  let code = ""; const rep = ctx.message.reply_to_message;
  if (rep?.text) code = rep.text; else code = ctx.message.text.split(" ").slice(1).join(" ");
  if (!code) return ctx.reply("❗ Reply ke kode atau /fixcode <kode>");
  try {
    const openai = new OpenAI({ apiKey: OPENAI_KEY });
    const prompt = `Perbaiki kode berikut agar bebas error dan rapi. Balas hanya dengan kode final:\n\n${code}`;
    const r = await openai.chat.completions.create({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: prompt }] });
    ctx.reply("✅ Kode diperbaiki:\n\n" + r.choices[0].message.content.trim());
  } catch { ctx.reply("❌ Gagal memperbaiki kode."); }
});

bot.command("anime", async (ctx) => {
  try { const { data } = await axios.get("https://api.waifu.pics/sfw/waifu"); await ctx.replyWithPhoto(data.url); }
  catch { ctx.reply("❌ Gagal mengambil gambar anime"); }
});

bot.command("softanime", async (ctx) => {
  try { const cats=["neko","shinobu","megumin"]; const cat=cats[Math.floor(Math.random()*cats.length)];
    const { data } = await axios.get(`https://api.waifu.pics/sfw/${cat}`);
    await ctx.replyWithPhoto(data.url,{caption:`🐱 ${cat} (SFW)`});
  } catch { ctx.reply("❌ Gagal mengambil softanime"); }
});

bot.command("waifu", async (ctx) => {
  try { const { data } = await axios.get("https://api.waifu.pics/sfw/waifu"); await ctx.replyWithPhoto(data.url,{caption:"🌸 Waifu (SFW)"}); }
  catch { ctx.reply("❌ Gagal mengambil waifu"); }
});

bot.command("rdomquote", async (ctx) => {
  try { const { data } = await axios.get("https://animechan.xyz/api/random");
    ctx.reply(`💬 "${data.quote}"\n— ${data.character} (${data.anime})`);
  } catch { ctx.reply("❌ Gagal mengambil quote"); }
});

bot.command("info", async (ctx) => {
  const q = ctx.message.text.split(" ").slice(1).join(" ");
  if (!q) return ctx.reply("❗ /info <nama_anime>");
  try {
    const { data } = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=1`);
    if (!data.data?.length) return ctx.reply("❌ Anime tidak ditemukan");
    const a = data.data[0];
    await ctx.replyWithPhoto(a.images?.jpg?.image_url, { caption: `📌 ${a.title}\n⭐ ${a.score ?? "-"}\n📖 ${a.synopsis ?? "-"}` });
  } catch { ctx.reply("❌ Gagal mengambil info anime"); }
});

bot.command("tourl", async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("❗ Reply ke media (foto/video/audio/doc/sticker) lalu kirim /tourl");
  try {
    const pick = r.photo?.slice(-1)[0]?.file_id || r.video?.file_id || r.document?.file_id || r.audio?.file_id || r.voice?.file_id || r.sticker?.file_id;
    if (!pick) return ctx.reply("❌ Tidak menemukan media valid.");
    const link = await ctx.telegram.getFileLink(pick);
    ctx.reply(`🔗 ${link}`);
  } catch { ctx.reply("❌ Gagal membuat URL media."); }
});

const fetch = require('node-fetch');
bot.command('tourl', async (ctx) => {
  try {
    // Ambil message sumber: kalau reply pakai reply, kalau tidak pakai message sekarang
    const msg = ctx.message.reply_to_message || ctx.message;

    // --- ambil file dari Telegram (pilih yang ada) ---
    let fileId, fileName, dlUrl;

    if (msg.document) {
      fileId = msg.document.file_id;
      fileName = msg.document.file_name || `file_${fileId}.bin`;
    } else if (msg.photo?.length) {
      const ph = msg.photo[msg.photo.length - 1];
      fileId = ph.file_id;
      fileName = `photo_${fileId}.jpg`;
    } else if (msg.audio) {
      fileId = msg.audio.file_id;
      fileName = msg.audio.file_name || `audio_${fileId}.mp3`;
    } else if (msg.voice) {
      fileId = msg.voice.file_id;
      fileName = `voice_${msg.voice.file_id}.ogg`;
    } else if (msg.video) {
      fileId = msg.video.file_id;
      fileName = msg.video.file_name || `video_${fileId}.mp4`;
    } else {
      return ctx.reply('❗ Kirim/reply file (document/photo/audio/video) lalu ketik /tourl');
    }

    dlUrl = (await ctx.telegram.getFileLink(fileId)).href;

    // Download dari Telegram → Buffer
    const tgRes = await fetch(dlUrl);
    if (!tgRes.ok) throw new Error(`Gagal download dari Telegram: HTTP ${tgRes.status}`);
    const buffer = Buffer.from(await tgRes.arrayBuffer());

    await ctx.reply(`⏳ Uploading ke Website endpoint...\n📄 ${fileName}`);

    // 1) Buat BIN di filebin
    const mk = await fetch('https://filebin.net', { method: 'POST' });
    if (!mk.ok) throw new Error(`Gagal buat bin: HTTP ${mk.status}`);
    const loc = mk.headers.get('location'); // contoh: /abcd123
    if (!loc) throw new Error('Tidak dapat Location header dari filebin');
    const binId = loc.replace(/^\//, '');

    // 2) PUT file ke BIN
    const safeName = fileName.replace(/\s+/g, '_').slice(0, 180);
    const putUrl = `https://filebin.net/${binId}/${encodeURIComponent(safeName)}`;
    const up = await fetch(putUrl, {
      method: 'PUT',
      body: buffer,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    if (!up.ok) throw new Error(`Gagal upload: HTTP ${up.status}`);

    // Sukses
    await ctx.reply(`✅ Sukses!\n🔗 ${putUrl}`, { disable_web_page_preview: false });
  } catch (e) {
    await ctx.reply(`❌ Gagal: ${e.message || e}`);
  }
});

bot.command("getsource", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;
  const url = ctx.message.text.split(' ')[1]; // Mengambil URL dari command

  // Validasi URL
  if (!url || !/^https?:\/\//i.test(url)) {
    return ctx.reply("🔗 *Masukkan domain atau URL yang valid!*\n\nContoh:\n`/getsource https://example.com`", {
      parse_mode: "Markdown",
    });
  }

  try {
    await ctx.reply("⏳ Mengambil source code dari URL...");

    const res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ *Gagal mengambil source code dari URL tersebut!*");
    }

    const html = await res.text();
    const filePath = path.join(__dirname, "source_code.html");
    fs.writeFileSync(filePath, html);

    // Mengirim file sebagai document
    await ctx.replyWithDocument({
      source: filePath,
      filename: "source_code.html",
      contentType: "text/html"
    });

    fs.unlinkSync(filePath); // Hapus file setelah dikirim
    
  } catch (err) {
    console.error(err);
    ctx.reply(`❌ *Terjadi kesalahan:*\n\`${err.message}\``, {
      parse_mode: "Markdown",
    });
  }
});

bot.command("enc", checkPremium, async (ctx) => {
    console.log(`Perintah diterima: /enc dari pengguna: ${ctx.from.username || ctx.from.id}`);
    const replyMessage = ctx.message.reply_to_message;

    if (!replyMessage || !replyMessage.document || !replyMessage.document.file_name.endsWith('.js')) {
        return ctx.reply('❌ Silakan balas file .js untuk dienkripsi.');
    }

    const fileId = replyMessage.document.file_id;
    const fileName = replyMessage.document.file_name;

    try {
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileLink.href, { responseType: "text" });
        let codeString = response.data;

        if (typeof codeString !== "string") {
            throw new Error("File bukan dalam format string yang valid.");
        }

        ctx.reply("⚡️ Processing hard code encryption...");

        let obfuscatedCode = await JsConfuser.obfuscate(codeString, {
            target: "node",
            compact: true,
            controlFlowFlattening: 0.8,
            deadCode: 0.3,
            dispatcher: true,
            duplicateLiteralsRemoval: 0.7,
            globalConcealing: true,
            minify: true,
            movedDeclarations: true,
            objectExtraction: true,
            renameVariables: true,
            renameGlobals: true,
            stringEncoding: true,
            stringSplitting: 0.5,
            stringConcealing: true,
            stringCompression: true,
            opaquePredicates: 0.9,
            calculator: true,
            hexadecimalNumbers: true,
            shuffle: true,
            identifierGenerator: () => "高宝座Encrypt齐File高宝座" + Math.random().toString(36).substring(7),
        });

        if (typeof obfuscatedCode === 'object' && obfuscatedCode.code) {
            obfuscatedCode = obfuscatedCode.code;
        }

        if (typeof obfuscatedCode !== 'string') {
            throw new Error("Hasil enkripsi bukan dalam format string.");
        }

        console.log(typeof obfuscatedCode, obfuscatedCode);

        const encryptedFilePath = `./encrypted_${fileName}`;
        fs.writeFileSync(encryptedFilePath, obfuscatedCode, "utf-8");

        await ctx.replyWithDocument(
            { source: encryptedFilePath, filename: `encrypted_${fileName}` },
            { caption: `✅ Encryption Successful\n• Type: Hard Code` }
        );

        fs.unlinkSync(encryptedFilePath);
    } catch (err) {
        console.error("Error during encryption:", err);
        await ctx.reply(`❌ An error occurred: ${err.message}`);
    }
});

bot.command("sticker", async (ctx) => {
  const rep = ctx.message.reply_to_message;
  if (!rep || !rep.sticker) return ctx.reply("❗ Reply ke sticker Telegram.");
  try { const link = await ctx.telegram.getFileLink(rep.sticker.file_id); ctx.reply(`🔗 URL Sticker: ${link}`); }
  catch { ctx.reply("❌ Gagal ambil URL sticker."); }
});

bot.command("myip", async (ctx) => {
  try { const { data } = await axios.get("https://api.ipify.org?format=json"); ctx.reply(`🌐 IP Server: ${data.ip}`); }
  catch { ctx.reply("❌ Gagal ambil IP."); }
});

bot.command("country", async (ctx) => {
  const ip = ctx.message.text.split(" ")[1];
  if (!ip) return ctx.reply("❗ /country <ip>");
  try { const { data } = await axios.get(`https://ipapi.co/${ip}/json/`); ctx.reply(`🌐 IP: ${ip}\nNegara: ${data.country_name}\nKota: ${data.city}`); }
  catch { ctx.reply("❌ Gagal ambil info negara."); }
});

bot.command("ipwhois", async (ctx) => {
  const ip = ctx.message.text.split(" ")[1];
  if (!ip) return ctx.reply("❗ /ipwhois <ip>");
  try { const { data } = await axios.get(`https://ipwhois.app/json/${ip}`); ctx.reply(`🌐 IP: ${data.ip}\nASN: ${data.asn}\nISP: ${data.org}\nNegara: ${data.country}`); }
  catch { ctx.reply("❌ Gagal ambil WHOIS."); }
});

bot.command("getdbuse", async (ctx) => {
  const users = [{ id: 1, name: "Ggz" }, { id: 2, name: "Admin" }];
  ctx.reply(`📂 Database user:\n${JSON.stringify(users, null, 2)}`);
});

bot.command('gpt', async (ctx) => {
  const text = ctx.message.text.split(' ').slice(1).join(' ');
  if (!text) return ctx.reply('Penggunaan: /gpt <teks>');

  try {
    const res = await fetch(`https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo?ask=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json || !json.result) {
      return ctx.reply('Gagal mendapatkan balasan dari AI.');
    }

    const replyText = `*RES YOY*\n\n\`\`\`\n${json.result}\n\`\`\``;

    await ctx.reply(replyText, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(err);
    ctx.reply('Terjadi kesalahan saat memproses permintaan.');
  }
});

bot.command("maintenancestatus", (ctx) => {
    sessions = loadSessions();
    const status = sessions.maintenance ? "🔴 Sedang Maintenance" : "🟢 Normal";
    const msg = `ℹ️ Status bot: *${status}*\nPesan: ${sessions.customMessage || "-"}\nUsers terdaftar: ${sessions.users.length}`;
    ctx.reply(msg, { parse_mode: "Markdown" });
  });

bot.command("maintenanceon", (ctx) => {
  if (!config.adminIDs.includes(ctx.from.id.toString())) {
    return ctx.reply("❌ Kamu tidak punya izin untuk mengaktifkan maintenance.");
  }
  maintenance = true;
  ctx.reply("✅ Mode *Maintenance* telah diaktifkan.", { parse_mode: "Markdown" });
});

bot.command("nsfwimg", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1);
  const prompt = args.join(" ");
  if (!prompt) {
    return ctx.reply("⚠️ Mohon sertakan prompt. Contoh:\n/nsfwimg furry antro nude on the beach");
  }

  const API_URL = "https://fastrestapis.fasturl.cloud/aiimage/nsfw";

  try {
    const response = await axios.get(API_URL, {
      params: { prompt },
      responseType: "arraybuffer",
      headers: { "accept": "image/png" },
      validateStatus: () => true,
    });

    switch (response.status) {
      case 200:
        return ctx.replyWithPhoto(
          { source: Buffer.from(response.data) },
          { caption: `Prompt: ${prompt}` }
        );

      case 400:
        return ctx.reply("❌ Bad Request: Prompt tidak ditemukan atau invalid.");

      case 403:
        return ctx.reply("🚫 Forbidden: Akses ditolak.");

      case 404:
        return ctx.reply("🔍 Not Found: Tidak ada gambar untuk prompt tersebut.");

      case 429:
        return ctx.reply("⏳ Too Many Requests: Terlalu banyak permintaan, coba lagi nanti.");

      case 500:
        return ctx.reply("💥 Internal Server Error: Terjadi kesalahan server.");

      default:
        return ctx.reply(`⚠️ Error ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error(error);
    return ctx.reply("❌ Gagal menghubungi API, coba lagi nanti.");
  }
});

bot.command('xnxx', async (ctx) => {
  const title = ctx.message.text.split(' ').slice(1).join(' ');
  if (!title) return ctx.reply('✏️ Masukkan judul:\nContoh: /xnxx Lari ada wibu');

  const reply = ctx.message.reply_to_message;
  if (!reply || !reply.photo) {
    return ctx.reply('📸 Balas perintah ini dengan sebuah foto!\nContoh:\n1. Kirim foto\n2. Reply dengan: /xnxx Judulnya');
  }

  try {
    const photo = reply.photo[reply.photo.length - 1]; // resolusi terbesar
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);

    const imageBuffer = (await axios.get(fileLink.href, { responseType: 'arraybuffer' })).data;

    const form = new FormData();
    form.append('title', title);
    form.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    const apiRes = await axios.post('https://api.siputzx.my.id/api/canvas/xnxx', form, {
      headers: form.getHeaders(),
      responseType: 'arraybuffer',
    });

    await ctx.replyWithPhoto({ source: Buffer.from(apiRes.data) });
  } catch (err) {
    console.error(err);
    ctx.reply('❌ Gagal membuat gambar XNXX. Coba lagi nanti.');
  }
});
  
bot.command('stiktok', async (ctx) => {
  // Ambil keyword dari teks perintah setelah /tiktok
  const keyword = ctx.message.text.split(' ').slice(1).join(' ');
  if (!keyword) {
    return ctx.reply('❌ Mohon masukkan kata kunci. Contoh: /stiktok sad');
  }

  try {
    // Request POST ke API TikTok
    const response = await axios.post('https://api.siputzx.my.id/api/s/tiktok', {
      query: keyword
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
     
    const data = response.data;
    if (!data.status || !data.data || data.data.length === 0) {
      return ctx.reply('⚠️ Tidak ditemukan video TikTok dengan kata kunci tersebut.');
    }

    // Ambil maksimal 3 video untuk balasan agar tidak terlalu panjang
    const videos = data.data.slice(0, 3);
    let replyText = `🔎 Hasil pencarian TikTok untuk: *${keyword}*\n\n`;

    videos.forEach((video, i) => {
      replyText += `🎬 *${video.title.trim()}*\n`;
      replyText += `👤 ${video.author.nickname} (@${video.author.unique_id})\n`;
      replyText += `▶️ [Link Video](${video.play})\n`;
      replyText += `🎵 Musik: ${video.music_info.title} - ${video.music_info.author}\n`;
      replyText += `⬇️ [Download WM](${video.wmplay})\n\n`;
    });

    ctx.replyWithMarkdown(replyText);

  } catch (error) {
    console.error(error);
    ctx.reply('❌ Terjadi kesalahan saat mengambil data TikTok.');
  }
});

const TIKTOK_API_URL = "https://tiktok-video-no-watermark10.p.rapidapi.com/index/Tiktok/getVideoInfo";
const RAPIDAPI_HEADERS = {
    "content-type": "application/x-www-form-urlencoded",
    "X-RapidAPI-Host": "tiktok-video-no-watermark10.p.rapidapi.com",
    "X-RapidAPI-Key": "d0f697a402msh5db691d2b18cfe3p1ca359jsnd9c219bd5948"
};

bot.command('ttvideo', checkPremium, async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length === 0) {
        return ctx.reply("Gunakan format: /ttvideo <url_tiktok>\nContoh: /ttvideo https://vm.tiktok.com/abc123");
    }

    const tiktokUrl = args[0];
    
    if (!tiktokUrl.includes('tiktok.com') && !tiktokUrl.includes('vm.tiktok')) {
        return ctx.reply("❌ URL TikTok tidak valid!");
    }

    await ctx.reply("🔄 Mengunduh video TikTok...");

    try {
        const payload = `url=${encodeURIComponent(tiktokUrl)}`;
        
        const response = await axios.post(TIKTOK_API_URL, payload, {
            headers: RAPIDAPI_HEADERS,
            timeout: 30000
        });

        const data = response.data;

        if (data.code === 0 && data.data) {
            const videoData = data.data;
            
            const caption = `🎬 **TikTok Video Downloader**\n\n` +
                          `👤 **Author:** ${videoData.author?.nickname || 'Unknown'}\n` +
                          `📝 **Description:** ${videoData.title || 'No description'}\n` +
                          `❤️ **Likes:** ${videoData.digg_count || 0}\n` +
                          `💬 **Comments:** ${videoData.comment_count || 0}\n` +
                          `🔄 **Shares:** ${videoData.share_count || 0}\n` +
                          `▶️ **Plays:** ${videoData.play_count || 0}\n` +
                          `⏱️ **Duration:** ${videoData.duration || 0} seconds\n\n` +
                          `🔗 **Downloaded via @${ctx.botInfo.username}`;

            const videoUrl = videoData.play || videoData.hdplay;
            
            if (videoUrl) {
                await ctx.replyWithVideo(videoUrl, {
                    caption: caption,
                    parse_mode: 'Markdown'
                });
                
                const additionalInfo = `💡 **Info Tambahan:**\n` +
                                     `📸 Cover: ${videoData.cover || 'N/A'}\n` +
                                     `🎵 Music: ${videoData.music_info?.title || 'N/A'}\n` +
                                     `🔊 Music Author: ${videoData.music_info?.author || 'N/A'}\n` +
                                     `🎵 Music URL: ${videoData.music_info?.play || 'N/A'}`;
                
                await ctx.reply(additionalInfo);
            } else {
                ctx.reply("❌ Gagal mendapatkan link video download");
            }
        } else {
            ctx.reply(`❌ Error: ${data.msg || 'Gagal mendownload video'}`);
        }
    } catch (error) {
        console.error('TikTok Download Error:', error);
        ctx.reply(`❌ Error: ${error.message}`);
    }
});

bot.command("videydl", async (ctx) => {
  const input = ctx.message.text.split(" ").slice(1).join(" ");
    
  if (!input || !input.startsWith("http")) {
    return ctx.reply(
      "❌ Kirim perintah dengan menyertakan URL video dari videy.co\nContoh: `/videydl https://videy.co/v?id=XXXX`",
      { parse_mode: "Markdown" }
    );
  }

  await ctx.reply("⏳ Sedang memproses video...");

  try {
    const res = await axios.post(
      "https://fastapi.acodes.my.id/api/downloader/videy",
      { text: input },
      {
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data?.status && res.data?.data) {
      await ctx.replyWithVideo(
        { url: res.data.data },
        { caption: "✅ Video berhasil diunduh dari videy.co!" }
      );
    } else {
      await ctx.reply("❌ Gagal mendapatkan video. Coba cek ulang link-nya.");
    }
  } catch (err) {
    console.error("VideyDL error:", err.message || err);
    ctx.reply("❌ Terjadi kesalahan saat memproses video.");
  }
});


bot.command("animbrat", async (ctx) => {
   const args = ctx.message.text.split(" ").slice(1).join(" ");
   if (!args) {
    return ctx.reply(`❌ Masukkan teks untuk gambar!\n\nContoh:\n/animbrat Halo, aku user lucu | center | image`);
    }

   // Parsing format: /animbrat teks | posisi | mode
   const [text, position, mode] = args.split("|").map(v => v?.trim());

   if (!text) {
     return ctx.reply("❌ Teks tidak boleh kosong.");
   }

   try {
    const res = await axios.get("https://fastrestapis.fasturl.cloud/maker/animbrat", {
      responseType: "arraybuffer",
      params: {
        text,
        position: position || "center",
        mode: mode || "image"
      },
      headers: {
        accept: "image/png"
        // 'x-api-key': 'APIKEY' // opsional
      }
    });

    const buffer = Buffer.from(res.data, "binary");

    const fileType = (mode || "image").toLowerCase() === "animated" ? "video" : "photo";
    const caption = `🎭 Anime Brat\n📝 Teks: ${text}\n📍 Posisi: ${position || "center"}\n🎞️ Mode: ${mode || "image"}`;

    if (fileType === "photo") {
      await ctx.replyWithPhoto({ source: buffer }, { caption });
    } else {
      await ctx.replyWithAnimation({ source: buffer }, { caption });
      }
  } catch (err) {
    console.error(err?.response?.data || err.message);
    ctx.reply("❌ Gagal membuat gambar Anime Brat. Pastikan format benar atau coba lagi nanti.");
  }
});

bot.command("ceknegara", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("⚠️ Contoh: /ceknegara id");

  try {
    const res = await axios.get(`https://restcountries.com/v3.1/alpha/${args}`);
    const c = res.data[0];

    let msg = `🏴 *Info Negara:*\n\n` +
              `• Nama: ${c.name.common}\n` +
              `• Ibu Kota: ${c.capital ? c.capital[0] : "-"}\n` +
              `• Populasi: ${c.population.toLocaleString()}\n` +
              `• Mata Uang: ${Object.values(c.currencies)[0].name} (${Object.keys(c.currencies)[0]})\n` +
              `• Bahasa: ${Object.values(c.languages).join(", ")}\n` +
              `• Timezone: ${c.timezones.join(", ")}`;

    ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    ctx.reply("❌ Kode negara tidak valid!");
  }
});

bot.command("ceknum", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("⚠️ Contoh: /ceknum +6281234567890");

  try {
    const res = await axios.get(`https://api.apilayer.com/number_verification/validate?number=${args}`, {
      headers: { apikey: config.apilayerKey }
    });

    if (!res.data.valid) return ctx.reply("❌ Nomor tidak valid!");

    const msg = `📱 *Info Nomor:*\n\n` +
                `• Nomor: ${res.data.international_format}\n` +
                `• Negara: ${res.data.country_name} (${res.data.country_code})\n` +
                `• Operator: ${res.data.carrier}\n` +
                `• Tipe: ${res.data.line_type}`;

    ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    ctx.reply("❌ Gagal cek nomor (pastikan APIKEY Api sudah benar)");
  }
});

bot.command("cekdomain", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("⚠️ Contoh: /cekdomain google.com");

  try {
    const res = await axios.get(`https://api.api-ninjas.com/v1/whois?domain=${args}`, {
      headers: { "X-Api-Key": config.apiNinjasKey }
    });

    const msg = `🌐 *Info Domain:*\n\n` +
                `• Domain: ${args}\n` +
                `• Registrar: ${res.data.registrar}\n` +
                `• Dibuat: ${res.data.creation_date}\n` +
                `• Expired: ${res.data.expiration_date}\n` +
                `• DNS: ${res.data.name_servers.join(", ")}`;

    ctx.reply(msg, { parse_mode: "Markdown" });
  } catch (e) {
    ctx.reply("❌ Gagal cek domain (pastikan APIKEY api- sudah benar)");
  }
});

bot.command('gpt4o', async (ctx) => {
  const text = ctx.message.text.split(' ').slice(1).join(' ');
  if (!text) return ctx.reply('Penggunaan: /gpt4o <teks>');

  try {
    const res = await fetch(`https://fastrestapis.fasturl.cloud/aillm/gpt-4o-turbo?ask=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json || !json.result) {
      return ctx.reply('Gagal mendapatkan balasan dari AI.');
    }

    const replyText = `*B O C C H I   -   M D*\n\n\`\`\`\n${json.result}\n\`\`\``;

    await ctx.reply(replyText, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(err);
    ctx.reply('Terjadi kesalahan saat memproses permintaan.');
  }
});


const axios = require('axios');

module.exports = (bot) => {
bot.command('githubstalk', async (ctx) => {
  const input = ctx.message.text.split(' ').slice(1).join(' ');
  if (!input) {
    return ctx.reply('Usage: /githubstalk <username>');
  }

  try {
    const response = await axios.post(
      'https://api.siputzx.my.id/api/stalk/github',
      { user: input },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = response.data;
    if (!data.status) {
      return ctx.reply('User not found or API error.');
    }

    const profile = data.data;

    let replyText = `GitHub Profile Info:\n\n` +
      `👤 Username: ${profile.username}\n` +
      `📝 Nickname: ${profile.nickname || 'N/A'}\n` +
      `📄 Bio: ${profile.bio || 'N/A'}\n` +
      `🏢 Company: ${profile.company || 'N/A'}\n` +
      `🔗 Blog: ${profile.blog || 'N/A'}\n` +
      `📍 Location: ${profile.location || 'N/A'}\n` +
      `📧 Email: ${profile.email || 'N/A'}\n` +
      `📦 Public Repos: ${profile.public_repo}\n` +
      `📝 Public Gists: ${profile.public_gists}\n` +
      `👥 Followers: ${profile.followers}\n` +
      `👣 Following: ${profile.following}\n` +
      `🆔 ID: ${profile.id}\n` +
      `📅 Created at: ${new Date(profile.created_at).toLocaleDateString()}\n` +
      `🔗 URL: ${profile.url}`;

    return ctx.replyWithPhoto(profile.profile_pic, { caption: replyText });
  } catch (error) {
    console.error(error);
    return ctx.reply('Error fetching data from GitHub API.');
  }
});

bot.command("twitterstalk", async (ctx) => {
    const username = ctx.message.text.split(" ")[1];
    if (!username) {
      return ctx.reply("❌ Masukkan username Twitter!\nContoh: /twitterstalk siputzx");
    }

    try {
      const { data } = await axios.post("https://api.siputzx.my.id/api/stalk/twitter", {
        user: username,
      });

      if (!data.status) {
        return ctx.reply("❌ Gagal mengambil data Twitter.");
      }

      const user = data.data;

      const caption = `
🐦 *${user.name}* (@${user.username})
🆔 ID: \`${user.id}\`
✅ Verified: ${user.verified ? "Yes" : "No"}
📍 Lokasi: ${user.location || "-"}
📅 Bergabung: ${new Date(user.created_at).toLocaleDateString("id-ID")}
📝 Bio: ${user.description || "-"}

📊 *Statistik*
🧵 Tweets: ${user.stats.tweets}
👥 Followers: ${user.stats.followers}
👣 Following: ${user.stats.following}
❤️ Likes: ${user.stats.likes}
🖼️ Media: ${user.stats.media}
      `;

      await ctx.replyWithPhoto(
        { url: user.profile.image },
        {
          caption,
          parse_mode: "Markdown",
        }
      );
    } catch (err) {
      console.error(err);
      ctx.reply("🚫 Terjadi kesalahan saat mengambil data Twitter.");
    }
  });
};


bot.command(["toanime", "jadianime"], async (ctx) => {
    try {
      const message = ctx.message;
      const reply = message?.reply_to_message;

      if (!reply || !reply.photo) {
        return ctx.reply("❌ Balas foto yang ingin diubah menjadi anime.");
      }

      const fileId = reply.photo[reply.photo.length - 1].file_id;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      const tempFilePath = `./temp_${Date.now()}.jpg`;

      // Unduh gambar dari Telegram
      const photo = await axios.get(fileLink.href, { responseType: "arraybuffer" });
      fs.writeFileSync(tempFilePath, photo.data);

      // Upload gambar ke hosting publik (qu.ax)
      const form = new FormData();
      form.append("files[]", fs.createReadStream(tempFilePath));
      const uploadRes = await axios.post("https://qu.ax/upload.php", form, {
        headers: form.getHeaders(),
      });

      if (!uploadRes.data.success || !uploadRes.data.files?.length) {
        fs.unlinkSync(tempFilePath);
        return ctx.reply("❌ Gagal upload gambar ke server.");
      }

      const imageUrl = uploadRes.data.files[0].url;

      // Kirim request ke PixNova API
      const payload = {
        session_hash: Math.random().toString(36).substring(2, 10),
        data: {
          source_image: imageUrl,
          strength: 0.6,
          prompt: "(masterpiece), best quality",
          negative_prompt:
            "(worst quality, low quality:1.4), (greyscale, monochrome:1.1), cropped, lowres , username, blurry, trademark, watermark, title, multiple view, Reference sheet, curvy, plump, fat, strabismus, clothing cutout, side slit,worst hand, (ugly face:1.2), extra leg, extra arm, bad foot, text, name",
          request_from: 2,
        },
      };

      const animeRes = await axios.post("https://pixnova.ai/api/photo2anime", payload, {
        headers: { "Content-Type": "application/json" },
      });

      fs.unlinkSync(tempFilePath); // Hapus file lokal sementara

      const resultUrl = animeRes.data?.output?.result?.[0];
      if (!resultUrl) {
        return ctx.reply("❌ Gagal mendapatkan hasil dari PixNova.");
      }

      await ctx.replyWithPhoto(
        { url: `https://oss-global.pixnova.ai/${resultUrl}` },
        { caption: "_✅ Gambar berhasil diubah menjadi anime!_" }
      );
    } catch (err) {
      console.error("[toanime] Error:", err);
      ctx.reply("⚠️ Terjadi kesalahan saat memproses gambar.");
    }
  });
};


bot.command('id', async (ctx) => {
  const chat = ctx.chat;
  const sender = ctx.from;

  if (!chat) return ctx.reply('Tidak dapat mengambil informasi chat.');

  const type = chat.type === 'private' ? 'User' : chat.type;
  ctx.reply(`*Informasi Chat:*\n• Type: ${type}\n• ID: \`${chat.id}\`\n• Title: ${chat.title || sender.first_name}`, {
    parse_mode: 'Markdown'
  });
});

bot.command('getid', async (ctx) => {
    const args = ctx.message.text.split(' ').slice(1).join(' ');
    if (!args) return ctx.reply('Contoh penggunaan:\n/getid https://t.me/nama_grup');

    const match = args.match(/t\.me\/(?:joinchat\/)?([a-zA-Z0-9_-]+)/);
    if (!match) return ctx.reply('Link tidak valid.');

    const username = match[1];

    try {
      const chat = await ctx.telegram.getChat(`@${username}`);
      ctx.reply(`*Informasi Grup:*\n• Title: ${chat.title}\n• ID: \`${chat.id}\`\n• Type: ${chat.type}`, {
        parse_mode: 'Markdown'
      });
    } catch (err) {
      console.error(err);
      ctx.reply('Gagal mengambil informasi grup. Pastikan bot sudah join ke grup tersebut atau link valid.');
    }
  });
};

bot.command("cekid", async (ctx) => {
    const reply = ctx.message.reply_to_message;

    // Cek apakah ada reply
    if (reply) {
      const user = reply.from;
      const id = `\`${user.id}\``;
      const username = user.username ? `@${user.username}` : "(tidak ada username)";
      return ctx.reply(`ID: ${id}\nUsername: ${username}`, { parse_mode: "Markdown" });
    }

    // Jika tidak ada reply, ambil dari pengirim command
    const user = ctx.message.from;
    const id = `\`${user.id}\``;
    const username = user.username ? `@${user.username}` : "(tidak ada username)";
    return ctx.reply(`ID: ${id}\nUsername: ${username}`, { parse_mode: "Markdown" });
  });
};

bot.command('cekganteng', async (ctx) => {
  const nama = ctx.message.from.first_name || 'Kamu';
  const nilai = Math.floor(Math.random() * 101); // 0 - 100

  let rating;
  if (nilai < 20) rating = '😵‍💫 Gantengnya cuma numpang lewat';
  else if (nilai < 40) rating = '😅 Masih perlu skincare sama doa';
  else if (nilai < 60) rating = '🙂 Lumayan, bisa bikin orang nengok';
  else if (nilai < 80) rating = '😎 Ganteng broo, aura terpancar';
  else if (nilai < 95) rating = '🔥 Ganteng parah, bikin iri satu RT';
  else rating = '👑 Gantengnya level dewa, auto banyak fans';

  ctx.reply(📊 *Cek Ganteng*\n👤 ${nama}\n✨ Tingkat kegantengan: *${nilai}%*\n⭐ ${rating}, { parse_mode: 'Markdown' });
});

✦ 𝙁𝙄𝙏𝙐𝙍 𝘽𝙊𝙏 𝙏𝙀𝘽𝘼𝙆 𝙉𝙀𝙂𝘼𝙍𝘼
bot.command('tebaknegara', async (ctx) => {
  try {
    const negaraList = [
      { nama: "Indonesia", clue: "I.....", gambar: "https://flagcdn.com/w320/id.png" },
      { nama: "Jepang", clue: "J.....", gambar: "https://flagcdn.com/w320/jp.png" },
      { nama: "Malaysia", clue: "M.......", gambar: "https://flagcdn.com/w320/my.png" },
      { nama: "Thailand", clue: "T.......", gambar: "https://flagcdn.com/w320/th.png" },
      { nama: "Amerika Serikat", clue: "A...... S.....", gambar: "https://flagcdn.com/w320/us.png" },
      { nama: "Kanada", clue: "K.....", gambar: "https://flagcdn.com/w320/ca.png" },
      { nama: "Jerman", clue: "J.....", gambar: "https://flagcdn.com/w320/de.png" },
      { nama: "Perancis", clue: "P.......", gambar: "https://flagcdn.com/w320/fr.png" },
      { nama: "Italia", clue: "I.....", gambar: "https://flagcdn.com/w320/it.png" },
      { nama: "Spanyol", clue: "S......", gambar: "https://flagcdn.com/w320/es.png" },
      { nama: "Korea Selatan", clue: "K.... S......", gambar: "https://flagcdn.com/w320/kr.png" },
      { nama: "India", clue: "I....", gambar: "https://flagcdn.com/w320/in.png" },
      { nama: "Australia", clue: "A........", gambar: "https://flagcdn.com/w320/au.png" },
      { nama: "Singapura", clue: "S........", gambar: "https://flagcdn.com/w320/sg.png" },
      { nama: "Brazil", clue: "B.....", gambar: "https://flagcdn.com/w320/br.png" },
      { nama: "Argentina", clue: "A........", gambar: "https://flagcdn.com/w320/ar.png" },
      { nama: "Portugal", clue: "P.......", gambar: "https://flagcdn.com/w320/pt.png" },
      { nama: "Belanda", clue: "B......", gambar: "https://flagcdn.com/w320/nl.png" },
      { nama: "Arab Saudi", clue: "A... S....", gambar: "https://flagcdn.com/w320/sa.png" },
      { nama: "Mesir", clue: "M....", gambar: "https://flagcdn.com/w320/eg.png" },
      { nama: "Meksiko", clue: "M......", gambar: "https://flagcdn.com/w320/mx.png" },
      { nama: "Chile", clue: "C....", gambar: "https://flagcdn.com/w320/cl.png" },
      { nama: "Swiss", clue: "S....", gambar: "https://flagcdn.com/w320/ch.png" },
      { nama: "Swedia", clue: "S.....", gambar: "https://flagcdn.com/w320/se.png" },
      { nama: "Norwegia", clue: "N.......", gambar: "https://flagcdn.com/w320/no.png" },
      { nama: "Finlandia", clue: "F........", gambar: "https://flagcdn.com/w320/fi.png" },
      { nama: "Polandia", clue: "P.......", gambar: "https://flagcdn.com/w320/pl.png" },
      { nama: "Yunani", clue: "Y.....", gambar: "https://flagcdn.com/w320/gr.png" },
      { nama: "Turki", clue: "T....", gambar: "https://flagcdn.com/w320/tr.png" },
      { nama: "Afrika Selatan", clue: "A..... S......", gambar: "https://flagcdn.com/w320/za.png" },
      { nama: "Ukraina", clue: "U......", gambar: "https://flagcdn.com/w320/ua.png" },
      { nama: "Rusia", clue: "R....", gambar: "https://flagcdn.com/w320/ru.png" },
      { nama: "Cina", clue: "C...", gambar: "https://flagcdn.com/w320/cn.png" },
      { nama: "Pakistan", clue: "P.......", gambar: "https://flagcdn.com/w320/pk.png" },
      { nama: "Bangladesh", clue: "B.........", gambar: "https://flagcdn.com/w320/bd.png" },
      { nama: "Iran", clue: "I...", gambar: "https://flagcdn.com/w320/ir.png" },
      { nama: "Irak", clue: "I...", gambar: "https://flagcdn.com/w320/iq.png" },
      { nama: "Afghanistan", clue: "A..........", gambar: "https://flagcdn.com/w320/af.png" },
      { nama: "Nepal", clue: "N....", gambar: "https://flagcdn.com/w320/np.png" },
      { nama: "Sri Lanka", clue: "S.. L....", gambar: "https://flagcdn.com/w320/lk.png" },
      { nama: "Filipina", clue: "F.......", gambar: "https://flagcdn.com/w320/ph.png" },
      { nama: "Vietnam", clue: "V......", gambar: "https://flagcdn.com/w320/vn.png" },{ nama: "Myanmar", clue: "M......", gambar: "https://flagcdn.com/w320/mm.png" },
      { nama: "Kamboja", clue: "K......", gambar: "https://flagcdn.com/w320/kh.png" },
      { nama: "Laos", clue: "L...", gambar: "https://flagcdn.com/w320/la.png" },
      { nama: "Israel", clue: "I.....", gambar: "https://flagcdn.com/w320/il.png" },
      { nama: "Arab Emirat", clue: "A... E.....", gambar: "https://flagcdn.com/w320/ae.png" },
      { nama: "Qatar", clue: "Q....", gambar: "https://flagcdn.com/w320/qa.png" },
      { nama: "Oman", clue: "O...", gambar: "https://flagcdn.com/w320/om.png" },
      { nama: "Yaman", clue: "Y....", gambar: "https://flagcdn.com/w320/ye.png" },
      { nama: "Georgia", clue: "G......", gambar: "https://flagcdn.com/w320/ge.png" },
      { nama: "Kazakhstan", clue: "K.........", gambar: "https://flagcdn.com/w320/kz.png" },
      { nama: "Uzbekistan", clue: "U.........", gambar: "https://flagcdn.com/w320/uz.png" },
      { nama: "Tajikistan", clue: "T.........", gambar: "https://flagcdn.com/w320/tj.png" },
      { nama: "Kirgizstan", clue: "K........", gambar: "https://flagcdn.com/w320/kg.png" },
      { nama: "Mongolia", clue: "M.......", gambar: "https://flagcdn.com/w320/mn.png" },
      { nama: "Islandia", clue: "I.......", gambar: "https://flagcdn.com/w320/is.png" },
      { nama: "Denmark", clue: "D......", gambar: "https://flagcdn.com/w320/dk.png" },
      { nama: "Belgia", clue: "B.....", gambar: "https://flagcdn.com/w320/be.png" },
      { nama: "Austria", clue: "A......", gambar: "https://flagcdn.com/w320/at.png" },
      { nama: "Hungaria", clue: "H.......", gambar: "https://flagcdn.com/w320/hu.png" },
      { nama: "Ceko", clue: "C...", gambar: "https://flagcdn.com/w320/cz.png" },
      { nama: "Slovakia", clue: "S.......", gambar: "https://flagcdn.com/w320/sk.png" },
      { nama: "Rumania", clue: "R......", gambar: "https://flagcdn.com/w320/ro.png" },
      { nama: "Bulgaria", clue: "B.......", gambar: "https://flagcdn.com/w320/bg.png" },
      { nama: "Kroasia", clue: "K......", gambar: "https://flagcdn.com/w320/hr.png" },
      { nama: "Serbia", clue: "S.....", gambar: "https://flagcdn.com/w320/rs.png" },
      { nama: "Slovenia", clue: "S.......", gambar: "https://flagcdn.com/w320/si.png" },
      { nama: "Bosnia", clue: "B.....", gambar: "https://flagcdn.com/w320/ba.png" },
      { nama: "Albania", clue: "A......", gambar: "https://flagcdn.com/w320/al.png" },
      { nama: "Makedonia Utara", clue: "M........ U....", gambar: "https://flagcdn.com/w320/mk.png" },
      { nama: "Georgia", clue: "G......", gambar: "https://flagcdn.com/w320/ge.png" }
    ];

    const negara = negaraList[Math.floor(Math.random() * negaraList.length)];
    await ctx.replyWithPhoto({ url: negara.gambar }, { caption: 🇺🇳 Tebak Negara!\n\nClue: ${negara.clue}\n\nItu negara apa? });

    ctx.session = ctx.session || {};
    ctx.session.tebakNegaraJawaban = negara.nama.toLowerCase();
  } catch (e) {
    console.error(e);
    ctx.reply("Terjadi kesalahan saat menjalankan fitur /tebaknegara.");
  }
});

bot.on('text', (ctx) => {
  if (ctx.session && ctx.session.tebakNegaraJawaban) {
    const jawabanUser = ctx.message.text.toLowerCase().trim();
    if (jawabanUser === ctx.session.tebakNegaraJawaban) {
      ctx.reply(✅ Jawaban benar! Itu adalah *${ctx.session.tebakNegaraJawaban.toUpperCase()}* 🇺🇳);
      ctx.session.tebakNegaraJawaban = null;
    }
  }
});

composer.command(["ping", "speed", "info-speed"], async (ctx) => {
    if (!enabled) return;

    const start = performance.now();
    const end = performance.now();
    const speed = (end - start).toFixed(4);

    const uptime = moment.duration(process.uptime(), 'seconds');
    const formattedUptime = `${uptime.hours()}h ${uptime.minutes()}m ${uptime.seconds()}s`;

    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
    const usedMem = (totalMem - freeMem).toFixed(2);

    const cpuUsage = await getCpuUsage();
=
    const sourceUrl = "https://telegra.ph/file/ec8cf04e3a2890d3dce9c.jpg";
    const textMessage = `*「 PING BOT 」*\n
🚀 *Speed:* ${speed} ms
🕐 *Uptime:* ${formattedUptime}
💾 *RAM:* ${usedMem} MB / ${totalMem} MB
🧠 *CPU Usage:* ${cpuUsage}%`;

    try {
      await ctx.reply(textMessage, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🛠 Source", url: sourceUrl }]
          ]
        }
      });
    } catch (err) {
      console.error(err);
      ctx.reply("❌ Terjadi kesalahan saat mengirim informasi.");
    }
  });

  bot.use(composer.middleware());

  return {
    enable() {
      enabled = true;
      console.log('[PLUGIN] Ping Info diaktifkan');
    },
    disable() {
      enabled = false;
      console.log('[PLUGIN] Ping Info dinonaktifkan');
    }
  };
};

// Fungsi untuk ambil CPU usage dalam persen
function getCpuUsage() {
  return new Promise((resolve) => {
    const startMeasure = cpuAverage();
    setTimeout(() => {
      const endMeasure = cpuAverage();
      const idleDifference = endMeasure.idle - startMeasure.idle;
      const totalDifference = endMeasure.total - startMeasure.total;
      const percentageCPU = 100 - Math.round(100 * idleDifference / totalDifference);
      resolve(percentageCPU);
    }, 100);
  });
}

function cpuAverage() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;

  for (let cpu of cpus) {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

bot.command('text2qr', async (ctx) => {
    try {
      const input = ctx.message.text.split(' ').slice(1).join(' ');
      if (!input) return ctx.reply('❌ Mohon masukkan teks setelah perintah.\nContoh:\n/text2qr Hello World');

      // Request ke API text2qr
      const response = await axios.post(
        'https://api.siputzx.my.id/api/tools/text2qr',
        { text: input },
        { responseType: 'arraybuffer', headers: { 'Content-Type': 'application/json' } }
      );

      // Kirim gambar QR code sebagai foto
      await ctx.replyWithPhoto({ source: Buffer.from(response.data) }, { caption: `QR Code untuk:\n${input}` });
    } catch (err) {
      console.error(err);
      ctx.reply('❌ Gagal membuat QR code, coba lagi nanti.');
    }
  });
};

bot.command("ailogo", async (ctx) => {
    const args = ctx.message.text.split(" ").slice(1).join(" ");
    const [brandname, prompt, industry, style] = args.split("|").map(v => v?.trim());

    if (!brandname || !prompt || !industry || !style) {
      return ctx.reply("❌ Format salah!\n\nGunakan format:\n/logogenerator BrandName | Deskripsi Logo | Industri | Gaya\n\nContoh:\n/logogenerator Tech Innovators | A modern logo with a futuristic feel | Technology | Minimalist");
    }

    try {
      const res = await axios.get("https://fastrestapis.fasturl.cloud/aiimage/logogenerator", {
        responseType: "arraybuffer",
        params: {
          brandname,
          prompt,
          industry,
          style
        },
        headers: {
          accept: "image/png"
          // Jika punya API key: 'x-api-key': 'APIKEY'
        }
      });

      const imageBuffer = Buffer.from(res.data, "binary");
      await ctx.replyWithPhoto({ source: imageBuffer }, {
        caption: `✅ Logo untuk *${brandname}*\n📝 Prompt: ${prompt}\n🏢 Industri: ${industry}\n🎨 Gaya: ${style}`,
        parse_mode: "Markdown"
      });
    } catch (error) {
      console.error(error?.response?.data || error.message);
      ctx.reply("❌ Gagal membuat logo. Pastikan parameter benar dan coba lagi nanti.");
    }
  });
};

bot.command("listcreds", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa melihat credentials.");
  
  
  
    return ctx.reply("📭 Tidak ada credentials yang tersimpan.");
  
  
  let message = "🔐 *Daftar Credentials:*\n\n";
  credsData.credentials.forEach((cred, index) => {
    message += `*${index + 1}.* ${cred.name}\n`;
    message += `   👤 Oleh: ${cred.addedBy}\n`;
    message += `   📅 Tanggal: ${new Date(cred.addedAt).toLocaleDateString('id-ID')}\n\n`;
  });
  
  ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("savecreds", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa menyimpan credentials.");
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Format: /savecreds <nama> <credentials_json>");
  
  const name = args[1];
  const credsJson = args.slice(2).join(" ");
  
  try {
    
    const parsedCreds = JSON.parse(credsJson);
    
    const credsData = getCreds();
    
    // Cek jika nama sudah ada
    if (credsData.credentials.some(c => c.name === name)) {
      return ctx.reply("❌ Nama credentials sudah ada. Gunakan nama yang berbeda.");
    }
    
    credsData.credentials.push({
      name,
      credentials: parsedCreds,
      addedBy: ctx.from.id,
      addedAt: new Date().toISOString()
    });
    
    saveCreds(credsData);
    ctx.reply(`✅ Credentials "${name}" berhasil disimpan.`);
  } catch (error) {
    ctx.reply("❌ Format JSON tidak valid. Pastikan credentials dalam format JSON yang benar.");
  }
});

bot.command("addblacklist", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa menambahkan blacklist.");
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Format: /addblacklist <|userid|pattern> <value> [alasan]");
  
  const type = args[1].toLowerCase();
  const value = args[2];
  const reason = args.slice(3).join(" ") || "Tidak ada alasan";
  
  const blacklist = getBlacklist();
  
  if (!['t', 'userid', 'pattern'].includes(type)) {
    return ctx.reply("❌ Jenis blacklist tidak valid. Gunakan: , userid, atau pattern");
  }
  
  // Cek jika sudah ada di blacklist
  if (blacklist[type + 's'].some(item => item.value === value)) {
    return ctx.reply(`❌ ${value} sudah ada di blacklist ${type}.`);
  }
  
  blacklist[type + 's'].push({
    value,
    reason,
    addedBy: ctx.from.id,
    addedAt: new Date().toISOString()
  });
  
  saveBlacklist(blacklist);
  ctx.reply(`✅ Berhasil menambahkan ${value} ke blacklist ${type}.`);
});

bot.command("delblacklist", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa menghapus blacklist.");
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Format: /delblacklist <|userid|pattern> <value>");
  
  const type = args[1].toLowerCase();
  const value = args[2];
  
  const blacklist = getBlacklist();
  
  if (!['t', 'userid', 'pattern'].includes(type)) {
    return ctx.reply("❌ Jenis blacklist tidak valid. Gunakan: , userid, atau pattern");
  }
  
  const initialLength = blacklist[type + 's'].length;
  blacklist[type + 's'] = blacklist[type + 's'].filter(item => item.value !== value);
  
  if (blacklist[type + 's'].length === initialLength) {
    return ctx.reply(`❌ ${value} tidak ditemukan di blacklist ${type}.`);
  }
  
  saveBlacklist(blacklist);
  ctx.reply(`✅ Berhasil menghapus ${value} dari blacklist ${type}.`);
});

bot.command("listblacklist", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa melihat blacklist.");
  
  const blacklist = getBlacklist();
  let message = "🚫 *Daftar Blacklist:*\n\n";
  
  ['numbers', 'users', 'patterns'].forEach(type => {
    message += `*${type.toUpperCase()}:* ${blacklist[type].length} item\n`;
    
    if (blacklist[type].length > 0) {
      blacklist[type].forEach((item, index) => {
        if (index < 5) { // Tampilkan maksimal 5 item per jenis
          message += `  • ${item.value} (${item.reason})\n`;
        }
      });
      if (blacklist[type].length > 5) {
        message += `  • ...dan ${blacklist[type].length - 5} lainnya\n`;
      }
    }
    message += "\n";
  });
  
  ctx.reply(message, { parse_mode: "Markdown" });
});



bot.command("checkblacklist", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa mengecek blacklist.");
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Format: /checkblacklist <value>");
  
  const value = args[1];
  const blacklist = getBlacklist();
  
  let foundIn = [];
  
  // Cek di semua jenis blacklist
  Object.keys(blacklist).forEach(type => {
    if (blacklist[type].some(item => item.value === value)) {
      foundIn.push(type);
    }
  });
  
  if (foundIn.length > 0) {
    ctx.reply(`✅ ${value} ditemukan di blacklist: ${foundIn.join(', ')}`);
  } else {
    ctx.reply(`❌ ${value} tidak ditemukan di blacklist manapun.`);
  }
});

bot.command("antispam", (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa mengatur anti-spam.");
  
  const args = ctx.message.text.split(" ");
  if (args.length !== 2) return ctx.reply("Format: /antispam <on/off>");
  
  const mode = args[1].toLowerCase();
  if (mode === "on") {
    ANTI_SPAM = true;
    ctx.reply("✅ Anti-spam diaktifkan.");
  } else if (mode === "off") {
    ANTI_SPAM = false;
    ctx.reply("❌ Anti-spam dinonaktifkan.");
  } else {
    ctx.reply("❌ Format salah. Gunakan: /antispam on atau /antispam off");
  }
});


bot.command("createrepo", async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa membuat repository.");
  
  const args = ctx.message.text.split(" ");
  if (args.length < 3) return ctx.reply("Format: /createrepo <nama_repo> <jenis_repo> [deskripsi]");
  
  const repoName = args[1];
  const repoType = args[2].toLowerCase();
  const description = args.slice(3).join(" ") || "Repository dibuat via Telegram Bot";
  
  // Validasi jenis repo
  const validTypes = ['public', 'private', 'internal'];
  if (!validTypes.includes(repoType)) {
    return ctx.reply("❌ Jenis repo tidak valid. Gunakan: public, private, atau internal");
  }
  
  const githubData = getGitHubData();
  if (githubData.tokens.length === 0) {
    return ctx.reply("❌ Tidak ada token GitHub yang tersedia. Tambahkan token dengan /addghtoken");
  }
  
  // Gunakan token pertama yang valid
  const validToken = githubData.tokens.find(t => t.isValid);
  if (!validToken) {
    return ctx.reply("❌ Tidak ada token GitHub yang valid.");
  }
  
  try {
    const response = await axios.post('https://api.github.com/user/repos', {
      name: repoName,
      description,
      private: repoType === 'private',
      auto_init: true
    }, {
      headers: {
        'Authorization': `token ${validToken.token}`,
        'User-Agent': 'Telegram-Bot',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    // Simpan info repo ke database
    githubData.repos.push({
      name: repoName,
      type: repoType,
      description,
      url: response.data.html_url,
      createdAt: new Date().toISOString(),
      createdBy: ctx.from.id,
      tokenUsed: validToken.username
    });
    
    saveGitHubData(githubData);
    
    ctx.reply(
      `✅ Repository berhasil dibuat!\n\n` +
      `📁 *Nama:* ${repoName}\n` +
      `🔒 *Tipe:* ${repoType}\n` +
      `📝 *Deskripsi:* ${description}\n` +
      `🔗 *URL:* ${response.data.html_url}`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("GitHub Repo Error:", error.response?.data || error.message);
    ctx.reply("❌ Gagal membuat repository. Pastikan nama repo belum digunakan.");
  }
});


// List repository
bot.command("listrepo", (ctx) => {
  const githubData = getGitHubData();
  
  if (githubData.repos.length === 0) {
    return ctx.reply("📭 Tidak ada repository yang terdaftar.");
  }
  
  let message = "📂 *Daftar Repository:*\n\n";
  githubData.repos.forEach((repo, index) => {
    message += `*${index + 1}.* ${repo.name}\n`;
    message += `   🔒 Tipe: ${repo.type}\n`;
    message += `   👤 Dibuat oleh: ${repo.createdBy}\n`;
    message += `   📅 Tanggal: ${new Date(repo.createdAt).toLocaleDateString('id-ID')}\n`;
    message += `   🔗 URL: ${repo.url}\n\n`;
  });
  
  ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command("delrepo", async (ctx) => {
  if (!isAdmin(ctx.from.id)) return ctx.reply("❌ Hanya admin yang bisa menghapus repository.");
  
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return ctx.reply("Format: /delrepo <nama_repo>");
  
  const repoName = args[1];
  const githubData = getGitHubData();
  
  const repoIndex = githubData.repos.findIndex(r => r.name === repoName);
  if (repoIndex === -1) {
    return ctx.reply("❌ Repository tidak ditemukan di database.");
  }
  
  const repo = githubData.repos[repoIndex];
  const validToken = githubData.tokens.find(t => t.username === repo.tokenUsed && t.isValid);
  
  if (!validToken) {
    return ctx.reply("❌ Token untuk repository ini tidak valid atau tidak tersedia.");
  }
  
  try {
    // Hapus dari GitHub
    await axios.delete(`https://api.github.com/repos/${validToken.username}/${repoName}`, {
      headers: {
        'Authorization': `token ${validToken.token}`,
        'User-Agent': 'Telegram-Bot'
      }
    });
    
    // Hapus dari database
    githubData.repos.splice(repoIndex, 1);
    saveGitHubData(githubData);
    
    ctx.reply(`✅ Repository *${repoName}* berhasil dihapus dari GitHub dan database.`, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("GitHub Delete Error:", error.response?.data || error.message);
    ctx.reply("❌ Gagal menghapus repository. Mungkin repository sudah dihapus atau tidak ada akses.");
  }
});

bot.command("ghstatus", async (ctx) => {
  const githubData = getGitHubData();
  
  let message = "📊 *Status GitHub Database:*\n\n";
  message += `🔑 *Token Tersedia:* ${githubData.tokens.length}\n`;
  message += `📂 *Repository Tersedia:* ${githubData.repos.length}\n\n`;
  
  // Cek rate limit untuk token pertama yang valid
  if (githubData.tokens.length > 0) {
    const validToken = githubData.tokens.find(t => t.isValid);
    if (validToken) {
      try {
        const response = await axios.get('https://api.github.com/rate_limit', {
          headers: {
            'Authorization': `token ${validToken.token}`,
            'User-Agent': 'Telegram-Bot'
          }
        });
        
        const limits = response.data.resources.core;
        message += `📈 *Rate Limit:* ${limits.remaining}/${limits.limit}\n`;
        message += `🕒 *Reset:* ${new Date(limits.reset * 1000).toLocaleTimeString('id-ID')}\n`;
      } catch (error) {
        message += `❌ *Status Token:* Tidak valid\n`;
      }
    }
  }
  
  ctx.reply(message, { parse_mode: "Markdown" });
});

bot.command('resetsender', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const sessionsPath = path.join(__dirname, 'session');

    fs.stat(sessionsPath, (err, stats) => {
        if (err) {
            return ctx.reply("❌ ☇ Gagal melakukan reset, Karena tidak ada sender terhubung");
        }

        if (stats.isDirectory()) {
            fs.rm(sessionsPath, { recursive: true, force: true }, (err) => {
                if (err) {
                    return ctx.reply("❌ ☇ Gagal melakukan reset sender");
                }
                ctx.reply("✅ ☇ Berhasil melakukan reset sender");
            });
        } else {
            ctx.reply("❌ ☇ Gagal melakukan reset, Karena tidak ada sender terhubung");
        }
    });
});

bot.command("donasi", async (ctx) => {
  try {
    const username = ctx.from?.username ? @${ctx.from.username} : ctx.from?.first_name || "User";

    await ctx.replyWithChatAction("upload_photo");

    await ctx.replyWithPhoto(
      { url: "https://files.catbox.moe/ig2zjx.jpg" },
      {
        caption: <pre>
╭──────[ DONASI BOT ]──────
┃ ~Olaa ${username}
┃ 📸 Minta QR di Owner untuk berdonasi
┃ Donasimu bantu pengembangan bot ini 
╰────────────────────────────</pre>,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Saya Sudah Donasi", callback_data: "donasi_terima" }],
            [{ text: "👤 Kontak Developer", url: "https://t.me/Ertanrl" }]
          ]
        }
      }
    );
  } catch (err) {
    console.error("❌ Gagal memproses perintah donasi:", err);
    await ctx.reply("⚠️ Terjadi kesalahan saat memproses perintah donasi.");
  }
});

bot.action("donasi_terima", async (ctx) => {
  try {
    await ctx.answerCbQuery();

    // Hapus pesan donasi (gambar + caption + tombol)
    await ctx.deleteMessage(ctx.callbackQuery.message.message_id);

    const username = ctx.from?.username ? @${ctx.from.username} : ctx.from?.first_name || "User";

    // Animasi Progress Bar
    const steps = [
      "[█░░░░░░░░░] 10%",
      "[██░░░░░░░░] 20%",
      "[████░░░░░░] 40%",
      "[██████░░░░] 60%",
      "[████████░░] 80%",
      "[██████████] 100%"
    ];

    const progress = await ctx.reply("🎁 [░░░░░░░░░░] 0%");

    for (const step of steps) {
      await new Promise(res => setTimeout(res, 300));
      await ctx.telegram.editMessageText(
        ctx.chat.id,
        progress.message_id,
        null,
        🎁 ${step}
      );
    }

    // Hapus progress bar
    await ctx.telegram.deleteMessage(ctx.chat.id, progress.message_id);

    await ctx.replyWithChatAction("upload_photo");

    await ctx.replyWithPhoto(
      { url: "https://files.catbox.moe/ig2zjx.jpg" }, // Gambar ucapan terima kasih
      {
        caption: `<pre>
╭──────[ TERIMA KASIH ]──────
┃ 📥 Makasih banyak udah support bot ini!
┃ 🙋‍♂️ ${username}
┃ Dukunganmu sangat berarti 🙏
╰─────────────────────────</pre>`;
        parse_mode: "HTML"
      }
    );
  } catch (err) {
    console.error("❌ Gagal kirim ucapan terima kasih:", err);
    await ctx.reply("⚠️ Terjadi kesalahan saat mengirim ucapan terima kasih.");
  }
});

bot.command("done", async (ctx) => {
  const input = ctx.message.text.split(" ").slice(1).join(" ");

  if (!input) {
    return ctx.reply(`
📌 *FORMAT SALAH!*

Gunakan format berikut:
done <nama barang>,<harga>,<metode bayar>

*Contoh:*
\`done jasa install panel,15000,Dana\``, {
      parse_mode: "Markdown"
    });
  }

  const [namaBarang, hargaBarang, metodeBayar] = input.split(",").map(part => part?.trim());
  if (!namaBarang || !hargaBarang) {
    return ctx.reply(`
❗ *FORMAT TIDAK LENGKAP!*

Minimal isi *nama barang* dan *harga*.

*Contoh:*
\`done jasa install panel,15000,Dana\``, {
      parse_mode: "Markdown"
    });
  }

  const hargaFormatted = Rp${Number(hargaBarang).toLocaleString("id-ID")};
  const metodePembayaran = metodeBayar || "Tidak disebutkan";
  const now = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const caption = `
\\\`
⿻ ⌜ TRANSAKSI BERHASIL ⌟ ⿻
────────────────────
▧ BARANG: ${namaBarang}
▧ NOMINAL: ${hargaFormatted}
▧ PAYMENT: ${metodePembayaran}
▧ WAKTU: ${now}
────────────────────
▧ KETERANGAN : ALL TRX NO REFF!!! 
────────────────────
𝐂𝐎𝐍𝐓𝐀𝐂𝐓 𝟏 : @Ertanrl
────────────────────
#
\\\``;

  await ctx.reply(caption, {
    parse_mode: "Markdown"
  });
});

bot.command("broadcast", async (ctx) => {
    // Tambahkan pengguna ke daftar broadcast
    users.add(ctx.from.id);
    saveUsers(users);

    // Hanya admin yang bisa broadcast (ambil dari config.js)
    if (ctx.from.id !== config.ADMIN_ID) {
        return ctx.replyWithMarkdown("❌ *Akses Ditolak:*\nHanya Developer Yang Bisa Menggunakan Perintah Ini!");
    }

    const message = ctx.message.text.split(" ").slice(1).join(" ");
    if (!message) {
        return ctx.replyWithMarkdown("❌ *_Akses Ditolak_*\nTulis pesan untuk broadcast,\ncontoh: `/broadcast Halo Everyone 👋!`");
    }

    log(`Mengirim broadcast: ${message}`);
    let successCount = 0;
    let failCount = 0;

    for (const userId of users) {
        try {
            await bot.telegram.sendMessage(userId, message, { parse_mode: "Markdown" });
            successCount++;
        } catch (error) {
            log(`Gagal mengirim ke ${userId}`, error);
            failCount++;
        }
    }

    await ctx.replyWithMarkdown(
        `📢 *Broadcast Selesai:*\n\n` +
        `- Berhasil dikirim ke: ${successCount} pengguna\n` +
        `- Gagal dikirim ke: ${failCount} pengguna\n` +
        `- © Ertanrl 2025`
    );
});
