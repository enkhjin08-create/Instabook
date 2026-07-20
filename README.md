# ZuvkhunTuund — Instagram Ном (Photo Book Builder)

Хэрэглэгч Instagram акаунтаа холбоод, зургуудаараа хэвлэхэд бэлэн ном (A5)
эсвэл дижитал PDF үүсгэдэг вэб хэрэгсэл.

## 1. Instagram акаунтаа бэлдэх
1. Instagram апп → Тохиргоо → Акаунт төрөл → **Creator** болгож хөрвүүлэх (үнэгүй).

## 2. Meta Developer App үүсгэх
1. https://developers.facebook.com/apps руу орж **Create App** дарна.
2. "Other" → **Instagram API with Instagram Login** бүтээгдэхүүнийг нэмнэ.
3. **App settings → Basic** хэсгээс `App ID` болон `App Secret`-ийг хуулж авна.
4. **Instagram → API setup with Instagram Login** хэсэгт очиж:
   - Redirect URI-д: `https://ТАНЫ-ДОМЭЙН/.netlify/functions/instagram-callback`
   - `instagram_business_basic` scope-г нэмнэ.
5. Development mode дээр өөрийн акаунтаараа шууд туршиж болно.
   Бусад хэрэглэгчид ашиглуулахын тулд **App Review** (Advanced Access)
   хүсэх шаардлагатай — нууцлалын бодлогын URL, скринкаст бэлдэх хэрэгтэй.
   Энэ процесс ихэвчлэн 1–4 долоо хоног үргэлжилдэг.

## 3. Netlify дээр deploy хийх
1. Энэ folder-ийг GitHub repo болгоод Netlify-тай холбоно (танай бусад
   төслүүдийн адил урсгал).
2. Netlify → Site settings → Environment variables дээр дараах 3 утгыг нэмнэ:

   | Key | Value |
   |---|---|
   | `IG_APP_ID` | Meta app-аас авсан App ID |
   | `IG_APP_SECRET` | Meta app-аас авсан App Secret |
   | `IG_REDIRECT_URI` | `https://ТАНЫ-ДОМЭЙН/.netlify/functions/instagram-callback` |

3. Deploy хийнэ.

## Юу хийж чадах вэ
- **Instagram холбох** товч → OAuth зөвшөөрлийн дараа зургууд dashboard дээр гарч ирнэ.
- Зургаа чирж хуудас дээрх слот руу тавина (grid эсвэл 1 зураг+бичвэр layout).
- Хуудас нэмэх/устгах, хавтасны загвар автоматаар орсон байгаа.
- **Хэвлэхэд бэлэн PDF (A5)** — өндөр чанартай (3x scale), хэвлэлийн газарт өгөхөд бэлэн.
- **Дижитал PDF** — жижиг хэмжээтэй, онлайнаар илгээхэд тохиромжтой.

## Хязгаарлалт (Meta-гийн тал)
- Зөвхөн хэрэглэгчийн зөвшөөрсөн өөрийнх нь зургийг татна (өөр хүний
  public хуудаснаас татах боломжгүй — Meta-гийн бодлого).
- Rate limit: цагт ~200 хүсэлт нэг акаунт дээр.
- Token 60 хоногийн дараа дахин холбогдох шаардлагатай болно (одоогийн
  хувилбарт auto-refresh орсонгүй — дараагийн шатанд нэмж болно).

## Дараагийн сайжруулалт (сонголтоор)
- A5 imposition (2 хуудсыг нэг A4 дээр хэвлэхэд зориулж байрлуулах)
- Auto token refresh (эвент-driven Netlify function, өдөр бүр ажиллах)
- Хуудасны илүү olon layout (3 зураг, полароид загвар г.м.)
- Захиалгын дараа автоматаар танай хэвлэлийн урсгал руу (JSONBin admin panel) нэвтрүүлэх
