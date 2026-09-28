# Media fayllarni Zeilab CDN orqali ishlatish

## Maqsad
Anime katalogi, akkauntlar, VIP va izohlar Lovable Cloud’da qoladi. Poster, banner va barcha video manbalari `cdn.zeilab.uz` dagi tayyor havolalar orqali ko‘rsatiladi.

## O‘zgarishlar
- Admin kontent sahifasidagi poster va banner uchun Cloud’ga fayl yuklashni olib tashlab, CDN havola kiritish va oldindan ko‘rishni qoldirish.
- Epizod oynasidagi Cloud video yuklash qismini olib tashlab, asosiy video, zaxira server va 4K uchun `cdn.zeilab.uz` URL maydonlarini berish.
- MP4 va HLS (`.m3u8`) CDN havolalarini mavjud pleerda to‘g‘ridan-to‘g‘ri ochish; noto‘g‘ri domen yoki format bo‘lsa adminda aniq xabar ko‘rsatish.
- Oldin saqlangan media havolalarini buzmaslik; yangi va almashtirilgan media uchun CDN manzilini talab qilish.
- Cloud javobi cho‘zilganda sahifa cheksiz yuklanib qolmasligi uchun kirish va katalog yuklanishiga xato/timeout holatini qo‘shish. Cloud baribir akkaunt va katalog uchun yoqilgan bo‘lishi kerak.

## Tekshiruv
- Telefon va kompyuterda katalog ochilishi, poster/banner ko‘rinishi va CDN videosi ijro etilishini tekshirish.
- Admin panelda CDN havolalarini saqlash va qayta ochilganda saqlangan qiymatlarni tekshirish.
- Ilova tekshiruvlaridan xatosiz o‘tishini tasdiqlash.

## Texnik eslatma
`cdn.zeilab.uz` hozir ochiq katalog API bermaydi. Shu sabab fayl CDN’ga avval uning o‘z paneli yoki Telegram boti orqali yuklanadi, hosil bo‘lgan to‘g‘ridan-to‘g‘ri havola admin panelga kiritiladi.
