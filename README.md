# 🇮🇩 Indonesia Stock Comparison

**Indonesia Stock Comparison** adalah website untuk membandingkan berbagai emiten yang terdaftar di Bursa Efek Indonesia (IDX) berdasarkan data pasar, fundamental, dividen, dan berbagai indikator lainnya.

> 📊 **Compare. Analyze. Understand.**

---

## 🌐 Website

🔗 **Live Website:**
https://sadinho-cool.github.io/indonesia-stock-comparison/

---

## 📌 Tentang Proyek

Indonesia Stock Comparison dibuat untuk membantu pengguna melihat dan membandingkan beberapa emiten dalam satu tampilan.

Contohnya:

```text
DMAS vs SMSM vs TAPG
```

Pengguna dapat melihat berbagai informasi seperti:

* 💰 Harga saham
* 📊 Data fundamental
* 💵 Dividen
* 📈 Performa saham
* 🏢 Profil perusahaan
* 📑 Laporan keuangan
* 👥 Kepemilikan saham

Proyek ini terus dikembangkan dan direncanakan memiliki fitur **comparison, stock screener, chart, technical analysis, watchlist, dashboard, dan portfolio simulator.**

---

## 🚀 Roadmap

### V1 — Professional UI

* Modern interface
* Dark / Light Mode
* Search ticker
* Responsive design
* Stock cards
* Navigation system

### V2 — Stock Comparison

* Membandingkan dua emiten dalam satu sesi
* Perbandingan harga
* Dividend Yield
* PER
* PBV
* ROE
* ROA
* DER
* Revenue
* Net Profit
* Mempertahankan format/satuan fundamental dari penyedia
* Menampilkan sumber dan timestamp data
* Menandai endpoint gagal dan format angka yang belum terverifikasi

### V3 — Stock Screener

Filter saham berdasarkan kriteria seperti:

```text
Price < Rp2.000
Dividend Yield > 10%
PER < 15x
PBV < 2x
ROE > 10%
```

### V4 — Charts & Technical Analysis

* 📈 Historical price chart
* 🕯️ Candlestick
* 📊 Volume
* MA20 / MA50 / MA200
* RSI
* MACD
* Support & Resistance
* 52-week High / Low

### V5 — Fundamental Intelligence

* Fundamental analysis
* Financial trends
* Profitability analysis
* Valuation analysis
* Dividend analysis
* Structured company insights

### V6 — Watchlist & Dashboard

* ⭐ Personal watchlist
* Market overview
* Stock monitoring
* Dashboard
* Price movement tracking

### V7 — Portfolio Simulator

* Portfolio simulation
* Investment calculator
* Dividend calculator
* Historical performance simulation

### V8 — Indonesia Stock Intelligence Platform

Menggabungkan seluruh fitur menjadi satu platform analisis saham Indonesia.

* Perbandingan lanjutan 3+ emiten dalam satu tampilan
* Dukungan tabel dan grafik dinamis untuk banyak emiten
* Ringkasan analisis lintas emiten yang tetap menunjukkan sumber, periode, dan keterbatasan data

---

## 🛠️ Teknologi

Project ini menggunakan:

* **HTML**
* **CSS**
* **JavaScript**
* **GitHub Pages**
* **Cloudflare Workers**
* **Zapi / IDX data**

Arsitektur data secara sederhana:

```text
User
  │
  ▼
GitHub Pages
  │
  ▼
JavaScript
  │
  ▼
Cloudflare Worker
  │
  ▼
Stock Data API
  │
  ▼
Indonesia Stock Comparison
```

API key digunakan melalui backend/Cloudflare Worker sehingga tidak perlu diletakkan langsung di kode frontend.

---

## 📊 Data

Data yang digunakan dalam aplikasi dapat mencakup:

* Market data
* Company profile
* Historical price
* Financial reports
* Dividends
* Ownership
* Company information

Ketersediaan data dapat berbeda untuk setiap emiten dan endpoint.

Dalam mode pengembangan, respons Cloudflare Worker disimpan di KV tanpa kedaluwarsa otomatis untuk menghemat kuota API. Karena itu, status cache `HIT` berarti respons lama dari cache digunakan kembali; **data tidak dijamin real-time**. Aplikasi menampilkan status cache, sumber/timestamp fundamental yang tersedia, dan memperlakukan angka dengan format satuan yang belum dikenal sebagai belum terverifikasi. Audit Dividend Yield membandingkan yield penyedia dengan total dividen ber-Ex Date dalam 365 hari terakhir dibagi harga penutupan pada tanggal referensi. Untuk ASGR, karena cache penyedia belum memuat dividen interim Rp297 per saham (Ex Date 8 Oktober 2026), audit melengkapi event tersebut berdasarkan catatan Corporate Action KSEI dan jadwal aksi korporasi. Event ditambahkan hanya jika Ex Date tersebut belum ada di respons, untuk mencegah duplikasi. Bila selisih lebih dari 2 poin persentase, nilai ditandai untuk pemeriksaan; estimasi berbasis event hanya dipakai bila ada event lebih baru daripada tanggal pembaruan fundamental dan hasil event lebih tinggi dari yield penyedia. Karena daftar event mungkin tidak lengkap, estimasi tersebut diberi label dan bukan dianggap angka resmi. DER pada tabel dihitung dari Total Liabilitas ÷ Total Ekuitas yang dilaporkan untuk periode neraca yang sama; DER mentah penyedia tidak dipakai bila format/unitnya tidak konsisten. Jika Total Aset tidak seimbang dengan Total Liabilitas + Ekuitas lebih dari 5%, nilai DER diberi tanda * dan perlu dicocokkan dengan laporan resmi. Pada data SMSM tersimpan, ketidakseimbangan tersebut terdeteksi. Periode laporan juga penting: untuk sampel laporan laba rugi Q2 2026 yang diverifikasi, angkanya merupakan kumulatif 6 bulan (6M), bukan kuartal tunggal. Untuk keputusan penting, periksa laporan keuangan resmi dan tanggal data sumber.

Referensi aksi korporasi ASGR:
* KSEI — [data efek terdaftar dan Corporate Action ASGR](https://web.ksei.co.id/services/registered-securities/shares/lc/ASGR)
* BCA Sekuritas/IQPlus — [jadwal dividen interim ASGR Oktober 2026](https://webcrp.bcasekuritas.co.id/latest-news/news/asgr-akan-bagikan-dividen-pada-26-oktober-2026)

---

## 🎯 Tujuan

Proyek ini dibuat sebagai proyek pengembangan web sekaligus sebagai sarana untuk mempelajari:

* Web development
* API integration
* Data processing
* Financial data
* Stock analysis
* UI/UX
* Cloudflare Workers
* GitHub Pages

---

## ⚠️ Disclaimer

Indonesia Stock Comparison dibuat untuk **tujuan edukasi dan informasi**.

Data dan hasil analisis yang ditampilkan tidak dimaksudkan sebagai nasihat keuangan atau rekomendasi untuk membeli maupun menjual saham.

Selalu lakukan riset dan pertimbangan sendiri sebelum mengambil keputusan investasi.

---

## 📈 Status Pengembangan

**Current Version: V2 — In Development 🚧**

Proyek ini masih aktif dikembangkan. Fitur dan tampilan dapat berubah seiring perkembangan proyek.

---

## 👨‍💻 Developer

**Sadinho-cool**

GitHub:
https://github.com/Sadinho-cool

---

⭐ Jika proyek ini menarik, kamu dapat memberikan **Star** pada repository ini dan mengikuti perkembangannya.
