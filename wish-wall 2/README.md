# 💌 Bức tường lời chúc – Như Quỳnh

Trang web nội bộ để mọi người gửi lời chúc tới chị Như Quỳnh. Deploy free trên Cloudflare Pages.

## 🧱 Stack

- **Frontend**: Vite + React 18 + Tailwind CSS
- **API**: Cloudflare Pages Functions (serverless, free)
- **Storage**: Cloudflare KV (free tier: 100k reads / 1k writes mỗi ngày — quá đủ)

---

## 🚀 Deploy lên Cloudflare Pages (cách dễ nhất – qua Dashboard, không cần CLI)

### Bước 1 — Push code lên GitHub

1. Tạo repo mới trên GitHub (private cũng được)
2. Trong thư mục project này, mở terminal và chạy:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### Bước 2 — Tạo KV Namespace

1. Vào https://dash.cloudflare.com → chọn account của bạn
2. Sidebar trái: **Storage & Databases** → **KV** → **Create a namespace**
3. Đặt tên gì cũng được, ví dụ: `wish-wall-kv`
4. Click **Add** → ghi nhớ namespace này (sẽ bind ở Bước 4)

### Bước 3 — Connect repo lên Cloudflare Pages

1. Vào **Workers & Pages** → **Create** → tab **Pages** → **Connect to Git**
2. Authorize GitHub → chọn repo bạn vừa tạo
3. Build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: để trống
4. Click **Save and Deploy**

Đợi build xong (~1-2 phút). Site sẽ chạy ở `https://<project-name>.pages.dev`

> Ở lần deploy đầu API sẽ chưa hoạt động vì chưa bind KV. Sang Bước 4.

### Bước 4 — Bind KV namespace

1. Vào project Pages bạn vừa tạo → tab **Settings** → **Bindings**
2. Click **Add binding** → chọn **KV namespace**
3. Điền:
   - **Variable name**: `WISHES` ⚠️ (phải đúng chữ này, viết HOA)
   - **KV namespace**: chọn namespace bạn tạo ở Bước 2
4. **Save**
5. Sang tab **Deployments** → click "**...**" trên deployment mới nhất → **Retry deployment**

### Bước 5 — Xong! 🎉

Mở `https://<project-name>.pages.dev`, thử gửi 1 lời chúc.

---

## 🌐 Gắn custom domain (tùy chọn)

1. Project Pages → **Custom domains** → **Set up a custom domain**
2. Nhập domain bạn muốn (vd: `quynh.<công-ty>.com`)
3. Làm theo hướng dẫn về DNS — nếu domain đang quản lý ở Cloudflare thì 1-click

---

## 💻 Chạy local để chỉnh sửa

Cần Node.js 18+ ([tải tại đây](https://nodejs.org/))

```bash
# Cài dependencies
npm install

# Chạy frontend (chỉ UI, API mock)
npm run dev
# → http://localhost:5173
```

Để test cả API + KV ở local:

```bash
# Terminal 1: build frontend
npm run build

# Terminal 2: chạy full stack qua wrangler
npx wrangler pages dev dist --kv WISHES
# → http://localhost:8788
```

---

## 🎨 Tùy chỉnh nội dung

Mở `src/App.jsx`:

| Cần đổi gì | Tìm dòng nào |
|---|---|
| Tên hero (`NHƯ QUỲNH`) | search `NHƯ QUỲNH` |
| Mô tả phía dưới hero | search `Cảm ơn chị vì những bản tin` |
| 3 chip thẻ vai trò | search `Truyền thông nội bộ` |
| Bảng màu thiệp | search `const COLORS` |
| Emoji trang trí | search `EMOJI_FLOATERS` |
| Footer | search `Made with` |

Sau khi sửa, push lên GitHub là Cloudflare auto deploy lại.

---

## 🛡️ Bảo mật & vận hành

- **Rate limit**: mỗi IP tối đa 20 lời chúc/giờ (đổi qua env `RATE_LIMIT_PER_HOUR`)
- **Sanitize**: tên ≤ 60 ký tự, lời chúc ≤ 400 ký tự, đã trim & escape XSS bởi React
- **Không có auth**: bất kỳ ai có link đều gửi được. Khuyến nghị share link nội bộ qua Slack/email công ty thôi.
- **Xem dữ liệu**: vào KV namespace trong dashboard → có thể view/edit/xóa từng key
- **Export tất cả lời chúc**: gọi `https://<your-site>/api/wishes` sẽ trả về JSON đầy đủ — copy về làm kỷ niệm cho chị

---

## 📁 Cấu trúc project

```
wish-wall/
├── index.html              # Vite entry HTML
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── wrangler.toml           # Cloudflare config (cho local dev)
├── src/
│   ├── main.jsx            # React mount
│   ├── App.jsx             # ⭐ component chính, edit ở đây
│   └── index.css           # Tailwind directives
└── functions/
    └── api/
        └── wishes.js       # ⭐ API GET/POST cho KV
```

---

## 💡 Ý tưởng nâng cấp sau này

- React `❤️` / `🥺` / `🎉` cho mỗi lời chúc
- Filter theo phòng ban (cần thêm field khi submit)
- Trang `/export` xuất PDF/PNG để in tặng chị
- Upload ảnh chị Quỳnh ở hero
- Pinned wishes (lời chúc của ban lãnh đạo nổi lên đầu)

Cứ nhắn tới mỗi khi cần thêm là build tiếp 💪
