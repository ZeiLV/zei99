# ZEI Dubbing — To'liq yangilanish rejasi

So'rovingizda ~25 ta alohida vazifa bor. Ularni 6 fazaga bo'ldim. Har fazani tugatib, ko'rsataman, keyin keyingisiga o'tamiz.

---

## Faza 1 — Vizual tozalash (eng ko'rinadigan)

**Orqa fon gradientlarni o'chirish**
- Tepadagi ko'k / pastdagi qizil rang gradientlari 100% olib tashlanadi
- Yagona tekis fon: `#0A0F1E` (dark) / oq (light)
- Aksent rang faqat **neon blue**

**Oq / Qora rejim (theme toggle)**
- Headerda quyosh/oy tugmasi
- Tanlov `localStorage`da saqlanadi

**Tab bar (kategoriya pillari)**
- To'rtburchak, tepaga yopishgan emas → **to'liq yumaloq (pill)** ko'rinish
- Skrollda qimirlamaydi — joyida qotib turadi (sticky emas, statik)

**VIP tugmalari**
- Hozir juda pastda va uzun → admin paneldan biroz pastroq, **sariq (gold)** rangda
- Eni ~6-7 sm (mobil), PC va telefonga alohida moslashtiriladi

**Footer**
- Neon blue matn, tartibli tugmalar

---

## Faza 2 — Video pleer

**Buferlash tizimi**
- "Tomosha qilish" bosilganda video darhol o'ynamaydi
- Avval **15-20% oldindan yuklanadi** (preload buffer)
- Shu vaqt davomida ekranda chiroyli neon yuklanish animatsiyasi + foiz ko'rsatkichi: "Yuklanmoqda… 47%"
- Yuklanib bo'lgach avtomatik o'ynaydi → qotib qolish yo'qoladi

**Boshqaruv tugmalari qayta dizayn**
- Hozirgi g'alati tugmalar tozalanadi
- Minimalist oq ikonkalar: Play/Pause, vaqt chizig'i, ovoz, to'liq ekran
- To'liq ekran tugmasi ishonchli ishlaydi (mobil Safari/Chrome uchun ham)

---

## Faza 3 — VIP tizimi

**VIP sotib olish oynasi**
- Bosilganda avval **VIP nima beradi** to'liq ro'yxati chiqadi:
  - Erta kirish (early access)
  - Yuklab olish
  - 4K sifat
  - Profil rasm qo'yish
  - Ovoz berish
  - VIP badge
- Pastda "SOTIB OLISH" tugmasi → eski link o'rniga **@ZeiContactBot**
- Butun oyna sariq/gold uslubda

---

## Faza 4 — Admin panel qayta qurish

**Dashboard tozalanadi**
- Boshqaruvda hech qanday amal qolmaydi — faqat qisqa umumiy ko'rinish
- Media qo'shish, VIP berish, ovoz berish — har biri o'z bo'limida

**Yangi bo'lim: Statistika**
- Davr tanlash: Bugun / 1 hafta / 1 oy / 3 oy / 6 oy / 1 yil
- Nechta kontent qo'shilgan
- Qaysi media necha marta ko'rilgan (reyting jadvali)
- Eng faol foydalanuvchilar

**Yangi bo'lim: Sayt tahrirlash**
- Aksent rangni o'zgartirish (neon blue → boshqa rang)
- Footer matnini tahrirlash
- Footer tugmalarini qo'shish / o'chirish / footerni butunlay yashirish

**Yangi bo'lim: Adminlar**
- Admin qo'shish / admin huquqini olib tashlash

**Umumiy tuzatishlar**
- "Chiqish" tugmasi olib tashlanadi
- Mobil ko'rinish to'g'irlanadi (screenshotdagi buzilishlar)

---

## Faza 5 — Kategoriya, filtr, ikonkalar

**Kategoriya bo'limi + Filtr**
- Kategoriya sahifasida "Filtrlash" tugmasi
- Ochilganda: Janr, Yil, Tur (anime / drama / kino / multfilm)
- "Saqlash" bosiladi → natijalar chiqadi, "X" bilan yopiladi
- **Qidiruv sodda qoladi** — janr/filtr yo'q, faqat nom bo'yicha qidiradi

**Animatsion ikonkalar**
- Emojilar (🔥 va h.k.) o'rniga ikonkalar
- Animatsiya doim ishlamaydi — faqat **ustiga bosilganda/hover** jonlanadi (telefonni qizdirmaydi)

---

## Faza 6 — Profil va sharhlar

**Profil**
- Ism o'zgartirish
- Profil rasm yuklash — **faqat VIP uchun**

**Sharhlar (fikrlar)**
- VIP foydalanuvchi yozganda yoniga **yulduz badge** chiqadi
- Sharhga javob yozish (reply)
- Like tugmasi (faqat bosish, dislike yo'q)
- Like soni qisqa formatda: `2.3k`
- Admin boshqalarning fikrini o'chira oladi

**Maxsus profil: muhemmed097@gmail.com**
- Alohida **"Z E I"** badge
- Bu profil yozgan sharh boshqa rangda ajralib turadi
- Sharhlariga avtomatik 2.3k like
- Boshqa hech kimda yo'q imkoniyatlar

---

## Texnik qism

- **Baza**: `site_settings` (rang, footer), `comment_likes`, `comment_replies`, `content_views` (statistika uchun) jadvallari + RLS va GRANT
- **Tema**: `index.css` da light/dark tokenlar, `next-themes` bilan almashish
- **Pleer**: HTML5 `<video>` + `progress` event orqali bufer foizini kuzatish
- **Statistika**: `content` va `profiles` bo'yicha vaqt oralig'i so'rovlari
- **Rang sozlash**: HSL token bazadan o'qilib, CSS o'zgaruvchiga yoziladi

---

Qaysi fazadan boshlaymiz? Tavsiyam: **Faza 1** (darhol ko'rinadigan tozalash), keyin **Faza 2** (pleer).
