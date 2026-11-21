# DYNgoc Deutsch: học tiếng Đức cho người Việt

Ứng dụng flashcard học từ vựng tiếng Đức, giải nghĩa song ngữ Việt–Anh. Chạy trên **iPhone** (cài như app từ Safari, hoặc qua Expo Go) và trên **máy tính** (trình duyệt web).

> **Dùng hằng ngày trên iPhone:** mở **https://haianhverynice.github.io/dyngoc-deutsch/** bằng Safari → Chia sẻ → **Thêm vào MH chính**. Không cần laptop. Xem [mục 7](#7-bản-web-cho-iphone-github-pages--thông-báo).

- **Miễn phí 100%:** không tài khoản, không server, không API key, không quảng cáo.
- **Offline hoàn toàn:** toàn bộ từ vựng và tiến độ học nằm trên máy.
- **Nền tảng:** Expo SDK 58 · React Native 0.88 · TypeScript (strict) · expo-router.

> **Trạng thái:** cả 5 giai đoạn đã xong: từ vựng + SRS, quiz + streak/XP, ngữ pháp + bảng chia động từ, luyện phát âm (ghi âm tự so sánh), đọc hiểu + hội thoại. Xem [Lộ trình](#12-lộ-trình).

---

## Mục lục

1. [Tính năng](#1-tính-năng)
2. [Yêu cầu](#2-yêu-cầu)
3. [Cài đặt từ GitHub](#3-cài-đặt-từ-github)
4. [Chạy trên iPhone](#4-chạy-trên-iphone)
5. [Không kết nối được iPhone? Khắc phục sự cố](#5-không-kết-nối-được-iphone-khắc-phục-sự-cố)
6. [Chạy trên máy tính (web)](#6-chạy-trên-máy-tính-web)
7. [Bản web cho iPhone: GitHub Pages + thông báo](#7-bản-web-cho-iphone-github-pages--thông-báo)
8. [Hướng dẫn sử dụng](#8-hướng-dẫn-sử-dụng)
9. [Thêm và sửa từ vựng](#9-thêm-và-sửa-từ-vựng)
10. [Dành cho lập trình viên](#10-dành-cho-lập-trình-viên)
11. [Hạn chế đã biết](#11-hạn-chế-đã-biết)
12. [Lộ trình](#12-lộ-trình)
13. [Checklist kiểm thử trên iPhone](#13-checklist-kiểm-thử-trên-iphone)

---

## 1. Tính năng

|                         |                                                                                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Từ vựng**             | 173 từ A1 (danh từ, động từ, tính từ, từ chức năng, chia theo chủ đề) và 10 từ mẫu cho mỗi cấp A2/B1/B2. Mỗi từ có giống (der/die/das), số nhiều, nghĩa tiếng Việt và tiếng Anh, câu ví dụ kèm bản dịch, và dạng chia đối với động từ. |
| **Flashcard SRS**       | Thuật toán lặp lại ngắt quãng kiểu SM-2 (tự viết). Bốn mức Again/Hard/Good/Easy, có hiện trước khoảng ôn kế tiếp dưới mỗi nút.                                                                                                         |
| **Quiz luyện tập**      | 5 dạng: chọn nghĩa, chọn der/die/das, điền từ, sắp xếp câu, nghe rồi chọn. Ưu tiên từ đang học. Không làm thay đổi lịch ôn thẻ.                                                                                                        |
| **Streak, XP, biểu đồ** | Chuỗi ngày học liên tiếp, điểm XP cho mỗi lượt ôn/câu quiz, biểu đồ XP 7 ngày trên màn hình chính.                                                                                                                                     |
| **Ngữ pháp**            | 11 bài A1 (giống, số nhiều, chia động từ, sein/haben, đổi nguyên âm, trật tự từ, phủ định, bốn cách, động từ tách, động từ khuyết thiếu, Perfekt), có bảng, ví dụ đọc mẫu và bài tập.                                                  |
| **Bảng chia động từ**   | Präsens, Präteritum, Perfekt, Futur I, Imperativ cho mọi động từ (kể cả từ tự import). Dạng bất quy tắc in đậm, chạm để nghe.                                                                                                          |
| **Luyện phát âm**       | Nghe giọng mẫu, ghi âm giọng mình, bấm So sánh để nghe mẫu rồi nghe giọng mình liền nhau. Tự đánh giá (không chấm điểm tự động). Có ở màn Phát âm, trang chi tiết từ và từng câu hội thoại.                                            |
| **Đọc & hội thoại**     | 10 bài A1–B2 (5 hội thoại, 5 bài đọc): nghe cả bài, hiện/ẩn bản dịch, nhập vai (ẩn lời một nhân vật), từ vựng trong bài, câu hỏi đọc hiểu.                                                                                             |
| **Phát âm mẫu**         | Nút 🔊 đọc từ và câu ví dụ bằng giọng Đức (TTS `de-DE`).                                                                                                                                                                               |
| **Màu theo giống**      | der = xanh dương, die = hồng, das = xanh lá. Luôn kèm nhãn chữ, không chỉ dựa vào màu.                                                                                                                                                 |
| **Tìm kiếm**            | Tìm bằng tiếng Đức, Việt hoặc Anh, gõ có dấu hay không dấu đều được (`strasse` → Straße, `ngoi nha` → Haus). Lọc theo cấp độ và chủ đề.                                                                                                |
| **Thông báo từ vựng**   | Nhắc từ theo chu kỳ giờ hoặc vào các mốc giờ cố định trong ngày, có giờ yên tĩnh. Chạm vào thông báo để mở đúng từ đó.                                                                                                                 |
| **Giao diện**           | Sáng/tối/theo hệ thống. Ngôn ngữ giao diện tiếng Việt, tiếng Anh hoặc cả hai.                                                                                                                                                          |
| **Sao lưu**             | Xuất/nhập toàn bộ tiến độ và cài đặt ra file JSON để chuyển máy.                                                                                                                                                                       |
| **Import**              | Thêm từ của riêng bạn từ file CSV hoặc JSON.                                                                                                                                                                                           |

---

## 2. Yêu cầu

| Thứ cần có                                                         | Ghi chú                                                                     |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Máy tính Linux (đã thử trên Linux Mint / Arch), macOS hoặc Windows | Không cần Mac hay Xcode                                                     |
| **Node.js ≥ 22.13** (khuyên dùng 24 LTS)                           | Kiểm tra bằng `node -v`                                                     |
| Git                                                                | `sudo apt install git` trên Mint                                            |
| iPhone có cài **Expo Go** (App Store, miễn phí)                    | Cập nhật bản mới nhất, vì dự án dùng SDK 58                                 |
| iPhone và máy tính dùng **cùng mạng Wi-Fi**                        | Hoặc dùng tunnel, xem [mục 5](#5-không-kết-nối-được-iphone-khắc-phục-sự-cố) |

### Cài Node.js trên Linux Mint (nếu `node -v` báo thiếu hoặc < 22.13)

Bản Node trong kho `apt` của Mint quá cũ, nên hãy cài qua **nvm** (không cần sudo):

```bash
sudo apt update && sudo apt install -y curl git
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

**Đóng terminal rồi mở lại** (nếu không sẽ gặp lỗi `nvm: command not found`), sau đó chạy:

```bash
nvm install 24
node -v        # phải ra v24.x
```

---

## 3. Cài đặt từ GitHub

```bash
git clone https://github.com/HaiAnhverynice/dyngoc-deutsch.git
cd dyngoc-deutsch
npm install
```

> ⚠️ Mọi lệnh `npm`/`npx` phía dưới phải chạy **bên trong thư mục dự án** (`cd dyngoc-deutsch`).
> Nếu thấy lỗi `Starting project at /home/<bạn>` hoặc `Missing script`, nghĩa là bạn đang đứng sai thư mục.

Có thể kiểm tra cài đặt bằng lệnh sau (không bắt buộc, lệnh tự thoát khi chạy xong):

```bash
npm run check     # type-check + lint + format + 91 test
```

---

## 4. Chạy trên iPhone

1. Trên iPhone, cài **Expo Go** từ App Store. Mở Expo Go một lần, và khi được hỏi _"Expo Go muốn tìm thiết bị trong mạng cục bộ"_ thì chọn **Cho phép**.
2. Trên máy tính, trong thư mục dự án:
   ```bash
   npm run start:lan
   ```
   Script này tự tìm địa chỉ Wi-Fi của máy và ghi đúng địa chỉ đó vào mã QR, tránh lỗi khi máy có VPN, Tailscale hoặc Docker. Bạn cũng có thể dùng `npx expo start`, nhưng xem [mục 5](#5-không-kết-nối-được-iphone-khắc-phục-sự-cố) nếu không kết nối được.
3. Terminal sẽ hiện một **mã QR** và một dòng `exp://192.168.x.x:8081`. Mở **ứng dụng Camera** của iPhone, quét mã QR, rồi chạm vào banner **"Mở trong Expo Go"**.
4. Lần đầu sẽ mất 20–60 giây để tải bundle. Khi app hiện màn hình **"Hôm nay"** là xong.

**Giữ terminal chạy** suốt lúc dùng app. Nhấn **Ctrl+C** để dừng. Sửa code thì app tự tải lại.

---

## 5. Không kết nối được iPhone? Khắc phục sự cố

Làm **lần lượt** từng bước, dừng lại khi đã chạy được.

### Bước 1: Kiểm tra mạng bằng Safari (không dùng Expo Go)

Chạy `npm run start:lan`, ghi lại IP mà script in ra (ví dụ `192.168.1.8`). Trên iPhone, mở **Safari** và vào:

```
http://192.168.1.8:8081/status
```

| Kết quả                               | Ý nghĩa                                                                    | Làm gì                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Hiện `packager-status:running`        | Mạng ổn                                                                    | Sang **Bước 2**                                                                          |
| Không tải được hoặc báo hết thời gian | Router chặn các thiết bị nói chuyện với nhau, hoặc hai máy không cùng mạng | Kiểm tra lại cùng Wi-Fi (không phải Wi-Fi khách). Nếu vẫn không được thì sang **Bước 3** |

Các trường hợp mạng hay gặp:

- **Wi-Fi khách, Wi-Fi trường/công ty, Wi-Fi quán cà phê:** thường bật "client isolation" nên không kết nối được. Dùng tunnel (Bước 3).
- **Laptop phát Wi-Fi từ iPhone (Personal Hotspot):** thường vẫn chạy được, IP sẽ có dạng `172.20.10.x`.
- **Tường lửa trên Linux:** nếu đang bật `ufw`, chạy `sudo ufw allow 8081/tcp`.

### Bước 2: Kiểm tra Expo Go

- iPhone → **Cài đặt → Quyền riêng tư & Bảo mật → Mạng cục bộ → Expo Go**: phải **bật**.
- Cập nhật Expo Go lên bản mới nhất trên App Store. Nếu thấy lỗi _"incompatible SDK"_ thì nguyên nhân là chưa cập nhật.
- Thay vì quét QR, mở Expo Go và chọn **"Enter URL manually"**, rồi gõ `exp://192.168.1.8:8081` (thay bằng IP của bạn).
- Nếu IP trong mã QR không phải IP Wi-Fi (ví dụ `100.x.x.x` của Tailscale, hay `172.17.x.x` của Docker), hãy truyền IP thủ công:
  ```bash
  npm run start:lan -- 192.168.1.8
  ```

### Bước 3: Dùng tunnel (chạy được với mọi mạng)

Tunnel đưa kết nối qua Internet nên chậm hơn, nhưng không bị router chặn.

```bash
npm run tunnel          # = npx expo start --tunnel ngrok
```

- Lần đầu sẽ hỏi cài `@expo/ngrok` toàn cục, bạn trả lời **y**.
  Nếu bị lỗi quyền (`EACCES`), chạy trước `npm install -g @expo/ngrok` (máy cài Node bằng nvm thì không cần sudo).
- Lệnh `npx expo start --tunnel` (không có chữ `ngrok`) trên SDK 58 **bắt buộc đăng nhập tài khoản Expo** (`npx expo login`, miễn phí). Dự án này không yêu cầu tài khoản, nên khuyên dùng bản `ngrok` ở trên.
- Hạn chế của tunnel: tải chậm hơn, đôi khi rớt kết nối và phải chạy lại.

### Thông báo lỗi thường gặp

| Thông báo                                                            | Nguyên nhân                                           |
| -------------------------------------------------------------------- | ----------------------------------------------------- |
| `Could not connect to development server` / `Unable to resolve host` | Vấn đề mạng, làm lại Bước 1–3                         |
| `Project is incompatible with this version of Expo Go`               | Cập nhật Expo Go                                      |
| `ConfigError: Cannot determine the project's Expo SDK version`       | Chạy lệnh sai thư mục, hoặc chưa `npm install`        |
| `nvm: command not found`                                             | Chưa mở lại terminal sau khi cài nvm                  |
| Quét QR mà không có gì xảy ra                                        | Xem mục "Link chạy nhưng QR không quét được" bên dưới |

#### Link `exp://…` chạy nhưng QR không quét được

Nghĩa là mạng đã ổn, chỉ có bước quét QR bị lỗi. Nguyên nhân thường gặp:

- **Quét trong Expo Go:** bản Expo Go cho iOS không có máy quét QR. Phải mở app **Camera** của iPhone, hướng vào QR, rồi bấm vào dòng **"Mở trong Expo Go"** hiện ở mép dưới khung hình. Ứng dụng quét QR khác thường không mở được link `exp://`.
- **QR trong terminal bị méo:** do giãn dòng, font hoặc màu của terminal. Thử phóng to cửa sổ terminal (`Ctrl` + `+`), đổi sang theme nền tối/sáng khác, hoặc chụp màn hình QR rồi phóng to.
- **QR mở trên máy khác:** QR luôn chứa đúng địa chỉ in ngay bên dưới (`Metro waiting on exp://192.168.1.8:8081`). Nếu địa chỉ đó đúng thì nhập tay cũng được, không cần QR.

**Cách nhanh nhất:** nhập link một lần trong Expo Go (**Enter URL manually**). Sau đó dự án nằm trong mục **Recently opened** của Expo Go, lần sau chỉ cần bấm vào đó, miễn là IP của máy tính không đổi.

---

## 6. Chạy trên máy tính (web)

```bash
npm run web       # hoặc nhấn phím "w" trong terminal đang chạy expo start
```

Mở http://localhost:8081 bằng Chrome hoặc Firefox.

**Phím tắt khi ôn tập:** `Space`/`Enter` để lật thẻ; `1` Again · `2` Hard · `3` Good · `4` Easy.

Trên web, tiến độ lưu trong trình duyệt (localStorage). Bản chạy trên máy (`npm run web`) không có thông báo; bản GitHub Pages có thông báo qua GitHub Actions, xem [mục 7](#7-bản-web-cho-iphone-github-pages--thông-báo).

---

## 7. Bản web cho iPhone: GitHub Pages + thông báo

Expo Go cần laptop chạy server mỗi lần mở app. Để dùng hằng ngày, app được đăng **miễn phí** lên GitHub Pages và cài vào iPhone như một app (PWA):

- Mở từ icon trên Màn hình chính, toàn màn hình, **không cần laptop**, chạy được cả khi **offline** (sau lần mở đầu có mạng).
- Mỗi lần push lên nhánh `main`, GitHub tự build và đăng lại (workflow `.github/workflows/pages.yml`, có chạy `npm run check` trước).
- **Thông báo từ vựng** do GitHub Actions gửi theo lịch (workflow `.github/workflows/push.yml`).

> ⚠️ **Thông báo trên bản web KHÔNG đúng giờ chính xác.** GitHub chạy lịch hẹn giờ trễ, thường **5–30 phút**, đôi khi hơn, và **có thể bỏ lượt** khi GitHub quá tải. Lời nhắc học từ thì không cần chính xác đến phút, nhưng đừng dùng nó như đồng hồ báo thức. App cũng hiện cảnh báo này trong Cài đặt.

### Cách hoạt động

```
GitHub Actions (cron)  ──push rỗng──▶  Máy chủ push của Apple  ──▶  iPhone
                                                                     │
                                         service worker (public/sw.js) đọc hàng đợi từ
                                         IndexedDB, chọn từ đang học/đến hạn, hiện
                                         thông báo "der Tisch · bàn"
```

- Push **không chứa nội dung**: GitHub chỉ báo "đến giờ". Từ nào được hiện là do app trên điện thoại chọn, từ hàng đợi 60 từ mà app chuẩn bị mỗi lần mở (ưu tiên từ đang học, đến hạn, rồi từ mới). **Tiến độ học không bao giờ rời khỏi điện thoại.**
- Chạm vào thông báo thì mở đúng từ đó.
- Icon app hiện **số thẻ cần học hôm nay** (cập nhật mỗi lần mở app).

### Cài đặt lần đầu (chủ repo làm, khoảng 10 phút)

1. **Bật GitHub Pages:** repo trên GitHub → **Settings → Pages** → mục _Build and deployment_, _Source_ chọn **GitHub Actions**.
2. **Tạo cặp khóa push (VAPID)** trên laptop:
   ```bash
   npx web-push@3.6.7 generate-vapid-keys
   ```
   Lệnh in ra `Public Key` và `Private Key`.
3. **Lưu khóa vào repo:** **Settings → Secrets and variables → Actions**
   - Tab **Variables** → _New repository variable_: tên `VAPID_PUBLIC_KEY`, giá trị là Public Key.
   - Tab **Secrets** → _New repository secret_: tên `VAPID_PRIVATE_KEY`, giá trị là Private Key.

   > 🔒 **Private Key phải giữ bí mật.** Chỉ dán vào Secrets, không commit vào code, không gửi qua chat. Lỡ lộ thì tạo cặp khóa mới, thay cả hai, và mọi máy phải đăng ký lại.

4. **Build lại để app có khóa:** tab **Actions** → **Deploy web app** → **Run workflow**. Đợi khoảng 3 phút, có dấu ✅ là xong. Địa chỉ app: **https://haianhverynice.github.io/dyngoc-deutsch/**

### Cài app lên iPhone (người học làm)

1. Mở **Safari** (bắt buộc Safari) → vào https://haianhverynice.github.io/dyngoc-deutsch/
2. Bấm nút **Chia sẻ** (ô vuông có mũi tên) → **Thêm vào MH chính** → **Thêm**.
3. **Từ giờ luôn mở app bằng icon "DYNgoc"** trên Màn hình chính. Dữ liệu của app mở từ icon **tách biệt** với tab Safari.
4. Trong app: **Cài đặt → Thông báo từ vựng → Bật thông báo** → **Cho phép**.
5. Bấm **Thử hiện thông báo ngay** để kiểm tra quyền.
6. Bấm **Sao chép mã** rồi gửi mã cho chủ repo (Zalo, Messenger…). Mã này chỉ dùng để gửi lời nhắc tới máy đó.

Cần iOS 16.4 trở lên.

### Thêm mã của máy vào GitHub (chủ repo làm)

**Settings → Secrets and variables → Actions → Secrets** → _New repository secret_: tên `PUSH_SUBSCRIPTIONS`, giá trị là mã vừa nhận.

- Nhiều máy: đặt các mã trong ngoặc vuông, cách nhau dấu phẩy: `[mã_máy_1, mã_máy_2]`.
- Thử ngay: tab **Actions → Vocab push → Run workflow**. Thông báo đến trong khoảng 1 phút (chạy tay thì không bị trễ như chạy theo lịch).

### Đổi giờ gửi

Sửa dòng `cron` trong `.github/workflows/push.yml`. Giờ trong cron là **giờ UTC** (Việt Nam = UTC+7, nên trừ 7 tiếng):

| Muốn gửi (giờ Việt Nam)          | Dòng cron          |
| -------------------------------- | ------------------ |
| Mỗi 2 giờ, 8:00–20:00 (mặc định) | `'0 1-13/2 * * *'` |
| Mỗi giờ, 7:00–22:00              | `'0 0-15 * * *'`   |
| 3 lần/ngày: 8:00, 12:00, 19:00   | `'0 1,5,12 * * *'` |

Giờ yên tĩnh trên bản web chính là khoảng thời gian **không có** trong cron. Các tùy chọn giờ/giờ yên tĩnh trong app chỉ áp dụng cho bản Expo Go. GitHub giới hạn lịch tối thiểu 5 phút một lần; repo Public thì không tính phí.

### Khi thông báo ngừng đến

| Hiện tượng                                              | Cách xử lý                                                                                                                                                   |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Workflow **Vocab push** báo ❌ "has expired (HTTP 410)" | Mã của máy đã hết hạn (gỡ app, xóa dữ liệu, hoặc tắt/bật thông báo). Trên máy đó: tắt rồi bật thông báo, sao chép mã mới và thay trong `PUSH_SUBSCRIPTIONS`. |
| Workflow không chạy nữa                                 | GitHub **tự tắt lịch sau 60 ngày repo không có commit**. Vào **Actions → Vocab push → Enable workflow**.                                                     |
| Workflow ✅ nhưng không thấy thông báo                  | Kiểm tra Cài đặt iOS → Thông báo → DYNgoc; tắt chế độ Tập trung (Focus); mở app từ icon (không phải tab Safari).                                             |
| Chỉ thấy "Đến giờ ôn từ vựng" thay vì một từ cụ thể     | Hàng đợi từ trống: mở app một lần để app chuẩn bị lại.                                                                                                       |

GitHub gửi email cho chủ repo khi workflow lỗi, nên mã hết hạn sẽ được phát hiện sớm.

### Lưu ý về dữ liệu

- Tiến độ của bản web nằm trong app trên iPhone (localStorage), **tách biệt** với Expo Go. Muốn chuyển tiến độ từ Expo Go sang: Expo Go → Cài đặt → Xuất sao lưu; bản web → Cài đặt → Khôi phục sao lưu.
- **Xóa app khỏi Màn hình chính là mất dữ liệu.** Hãy dùng **Xuất sao lưu** định kỳ.

---

## 8. Hướng dẫn sử dụng

### Màn hình "Hôm nay"

Hiện số **thẻ đến hạn** và số **từ mới hôm nay**. Bấm **Bắt đầu ôn** để vào phiên ôn, hoặc **Luyện tập (quiz)** để làm quiz.

Thẻ tiến độ bên dưới gồm:

- 🔥 **Streak:** số ngày học liên tiếp. Ngày nào có ít nhất 1 lượt ôn hoặc 1 câu quiz thì tính là đã học. Chưa học hôm nay thì streak của hôm qua vẫn giữ tới hết ngày (4 giờ sáng hôm sau).
- **XP hôm nay** và **biểu đồ XP 7 ngày** (cột đậm là hôm nay), kèm kỷ lục streak và tổng XP.

| Hành động        | XP  |
| ---------------- | --- |
| Ôn thẻ: Lại      | 2   |
| Ôn thẻ: Khó      | 4   |
| Ôn thẻ: Tốt / Dễ | 5   |
| Quiz: đúng       | 10  |
| Quiz: gần đúng   | 7   |
| Quiz: sai        | 2   |

XP được tính lại từ lịch sử mỗi lần mở, không lưu riêng, nên sao lưu/khôi phục giữ nguyên streak và XP.

Phía dưới có lối vào **Từ vựng** và **Cài đặt**.

### Ôn tập

1. Mặt trước chỉ hiện từ tiếng Đức. Bấm 🔊 để nghe.
2. Chạm vào từ hoặc nút **Chạm để lật thẻ**. Mặt sau hiện giống, số nhiều, nghĩa Việt/Anh và câu ví dụ.
3. Tự chấm mức độ nhớ của mình:

| Nút             | Khi nào chọn           | Ví dụ khoảng ôn với thẻ mới |
| --------------- | ---------------------- | --------------------------- |
| **Lại (Again)** | Không nhớ              | 1 phút                      |
| **Khó (Hard)**  | Nhớ nhưng rất chật vật | 6 phút                      |
| **Tốt (Good)**  | Nhớ được               | 10 phút, rồi 1 ngày         |
| **Dễ (Easy)**   | Quá dễ                 | 4 ngày                      |

Thẻ đến hạn luôn được ôn trước thẻ mới. Số từ mới mỗi ngày chỉnh trong Cài đặt. Một "ngày học" bắt đầu lúc **4 giờ sáng**, nên ôn lúc 1 giờ sáng vẫn tính cho hôm trước.

### Luyện tập (quiz)

1. Chọn **dạng câu hỏi** (một hoặc nhiều) và **số câu** (10 / 20 / 30). App nhớ lựa chọn cho lần sau.
2. Bấm **Bắt đầu**. Các dạng được trộn xen kẽ, mỗi từ chỉ hỏi một lần trong một bài.

| Dạng                 | Cách làm                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Chọn nghĩa**       | Xem từ tiếng Đức, chọn 1 trong 4 nghĩa.                                                                              |
| **Chọn der/die/das** | Xem danh từ (không tô màu để khỏi lộ đáp án), chọn mạo từ.                                                           |
| **Điền từ**          | Xem nghĩa (và câu ví dụ có chỗ trống nếu có), gõ từ tiếng Đức. Có hàng phím ä ö ü ß và gợi ý chữ cái đầu + số ký tự. |
| **Sắp xếp câu**      | Xem bản dịch, chạm các từ theo đúng thứ tự. Chạm vào từ đã xếp để bỏ ra.                                             |
| **Nghe rồi chọn**    | App tự đọc từ (bấm 🔊 để nghe lại), chọn 1 trong 4 cách viết. Nhớ tắt chế độ im lặng.                                |

Chấm điểm phần **Điền từ**:

- Gõ có hoặc không có mạo từ đều được (`Tisch` hay `der Tisch`). Gõ **sai mạo từ** (`die Tisch`) thì tính là sai.
- Sai **chữ hoa/thường, umlaut hoặc ß** (`tisch`, `Strasse`, `Backer`, `Baecker`) thì tính là **gần đúng**: vẫn qua, nhưng app hiện cách viết chuẩn.

Hết bài, app hiện số câu đúng, XP nhận được và danh sách **Cần xem lại** (bấm để mở chi tiết từ).

Quiz ưu tiên từ **đang học** (đã ôn ít nhất một lần), sau đó tới từ thuộc **cấp độ đang chọn**. Quiz **chỉ để luyện tập**: kết quả được cộng XP và tính streak nhưng **không làm thay đổi lịch ôn** của thẻ SRS.

Trên máy tính: phím **1–4** chọn đáp án, **Enter** sang câu tiếp.

### Ngữ pháp

Từ màn hình chính bấm **Ngữ pháp**.

- **Bảng chia động từ:** danh sách mọi động từ, tìm bằng tiếng Đức/Việt/Anh. Bấm vào một động từ để mở trang chi tiết có bảng chia (cũng hiện ở trang chi tiết của từng động từ trong Từ vựng).
  - Chọn thì: **Präsens, Präteritum, Perfekt, Futur I, Imperativ**.
  - Ở Präsens, các dạng **bất quy tắc được in đậm** (ví dụ `sprichst`, `spricht`).
  - **Chạm vào một dòng để nghe** (ví dụ "du sprichst").
  - Imperativ: `(e)` nghĩa là có thể thêm -e (`mach!` hoặc `mache!`). Động từ khuyết thiếu không có Imperativ.
  - Bảng được **tạo tự động** từ 4 dạng chính lưu cùng mỗi động từ (ngôi 3 số ít, Präteritum, Partizip II, trợ động từ), nên từ bạn tự import cũng có bảng. Hãy nhập đúng 4 dạng này khi import động từ.
- **Bài học A1** (11 bài): mỗi bài gồm giải thích (Việt/Anh theo cài đặt ngôn ngữ), bảng, mẹo, ví dụ có nút 🔊, và **4 bài tập điền chỗ trống** có giải thích sau mỗi câu.
  - Mỗi câu trả lời được cộng XP (như quiz) và tính vào streak.
  - Bài được đánh dấu **Đã xong ✓** khi mọi bài tập đã từng được trả lời đúng ít nhất một lần.

### Luyện phát âm

Từ màn hình chính bấm **Phát âm** (hoặc dùng thẻ "Luyện phát âm" ở trang chi tiết từ, hay chạm vào một câu trong hội thoại).

| Nút         | Tác dụng                                                                              |
| ----------- | ------------------------------------------------------------------------------------- |
| 🔊 Nghe mẫu | Giọng đọc tiếng Đức của máy                                                           |
| 🎤 Ghi âm   | Bấm để ghi, bấm lần nữa để dừng (tự dừng sau 15 giây). Lần đầu máy sẽ hỏi quyền micro |
| ▶️ Của tôi  | Nghe lại giọng bạn                                                                    |
| 🔁 So sánh  | Phát giọng mẫu, rồi phát ngay giọng bạn: dễ nghe ra chỗ khác nhau nhất                |

- Màn **Phát âm**: 10 từ mỗi lượt (ưu tiên từ đang học), chọn luyện **Từ** hoặc **Câu ví dụ**. Sau khi ghi âm, tự đánh giá **Giống / Gần giống / Chưa giống** để nhận XP (10 / 7 / 2) và tính streak.
- **Không có chấm điểm phát âm tự động**: làm offline và miễn phí thì không khả thi. Bạn tự nghe và tự đánh giá.
- **Bản ghi không được lưu**: chỉ nằm tạm trong bộ nhớ khi đang luyện, không ghi vào sao lưu, không gửi đi đâu.
- Tắt chế độ im lặng của iPhone để nghe được giọng mẫu.

### Đọc & hội thoại

Từ màn hình chính bấm **Đọc & hội thoại**. Bài thuộc cấp độ bạn đang học được xếp lên đầu.

- **Nghe cả bài:** máy đọc lần lượt từng câu, câu đang đọc được tô nền. Mỗi nhân vật có cao độ giọng khác nhau cho dễ phân biệt.
- **Hiện bản dịch:** bật để xem bản dịch dưới mọi câu. Hoặc chạm vào từng câu để xem bản dịch của câu đó và **luyện phát âm câu đó**.
- **Nhập vai** (chỉ với hội thoại): chọn một nhân vật để ẩn lời của họ. Bạn đọc bản dịch, tự nói câu tiếng Đức, rồi chạm vào câu để xem đáp án và ghi âm so sánh.
- **Từ vựng trong bài** và **câu hỏi đọc hiểu** (hỏi bằng tiếng Đức, có dịch). Mỗi câu trả lời được cộng XP và tính streak. Bài hiện **Đã xong ✓** khi mọi câu hỏi đã từng được trả lời đúng.

### Từ vựng

Tìm theo tiếng Đức, Việt hoặc Anh, lọc theo cấp và chủ đề. Chấm xanh nghĩa là từ đang học. Bấm vào một từ để xem chi tiết, rồi bấm **Thêm vào học** để từ đó xuất hiện ở lượt từ mới kế tiếp, kể cả khi không thuộc cấp đang học.

### Cài đặt

- **Ngôn ngữ giao diện**, **Giao diện** (sáng/tối), **Cấp độ đang học** (chọn nhiều), **Số từ mới mỗi ngày**.
- **Thông báo từ vựng:**
  - Bật lần đầu thì iOS sẽ hỏi quyền, hãy chọn **Cho phép**. Nếu đã lỡ từ chối, app sẽ hiện nút mở Cài đặt iOS.
  - **Theo giờ:** mỗi N giờ trong một khung giờ (ví dụ 8:00–21:00, mỗi 2 giờ).
  - **Theo ngày:** một hoặc vài mốc giờ cố định.
  - **Giờ yên tĩnh:** không gửi thông báo trong khoảng này, kể cả khoảng qua nửa đêm (ví dụ 22:00–07:00).
  - Nội dung thông báo có dạng `der Tisch · bàn`, thân là câu ví dụ. Từ đang học hoặc đến hạn được ưu tiên.
  - ⚠️ iOS chỉ giữ tối đa 64 thông báo chờ. App xếp lô 60 cái mỗi lần mở app, nên **nếu nhiều ngày không mở app thì thông báo sẽ dừng**.
- **Dữ liệu:** Nhập từ vựng, Xuất sao lưu, Khôi phục sao lưu.

### Sao lưu và chuyển máy

1. **Cài đặt → Xuất sao lưu**, rồi lưu file `dyngoc-backup-YYYYMMDD-HHMM.json` vào app Tệp, iCloud Drive hoặc gửi qua AirDrop/email.
2. Trên máy mới: **Cài đặt → Khôi phục sao lưu**, chọn file. App kiểm tra file và **hỏi xác nhận trước khi ghi đè**.

> Dữ liệu nằm trong Expo Go. **Gỡ Expo Go là mất dữ liệu**, nên hãy sao lưu thường xuyên.

---

## 9. Thêm và sửa từ vựng

### Cách 1: Import trong app (CSV hoặc JSON)

**Cài đặt → Nhập từ vựng**, rồi chọn file `.csv` hoặc `.json`. App báo lại số từ đã thêm, số từ trùng bị bỏ qua và lỗi theo từng dòng. Import **không bao giờ ghi đè** từ hay tiến độ đã có.

**CSV** (UTF-8, dấu phẩy, có dòng tiêu đề), mẫu ở [`content/examples/import-example.csv`](content/examples/import-example.csv):

```csv
lemma,article,plural,pos,level,vi,en,example_de,example_vi,example_en,tags,third_person,preterite,participle,auxiliary
Löffel,der,Löffel,noun,A1,cái thìa,spoon,"Ich brauche einen Löffel, bitte.",Làm ơn cho tôi một cái thìa.,"I need a spoon, please.",food;home,,,,
laufen,,,verb,A1,chạy,to run,Er läuft jeden Morgen.,Sáng nào anh ấy cũng chạy.,He runs every morning.,verbs,läuft,lief,gelaufen,sein
```

| Cột                                                    | Bắt buộc | Ghi chú                                                                                                                                    |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `lemma`                                                | ✔        | Danh từ phải viết hoa chữ đầu                                                                                                              |
| `article`                                              | danh từ  | `der`, `die` hoặc `das`; để trống nếu không phải danh từ                                                                                   |
| `plural`                                               |          | Dạng số nhiều không kèm mạo từ (`Häuser`); để trống hoặc `-` nếu không có                                                                  |
| `pos`                                                  | ✔        | `noun`, `verb`, `adjective`, `adverb`, `preposition`, `pronoun`, `conjunction`, `article`, `numeral`, `particle`, `interjection`, `phrase` |
| `level`                                                | ✔        | `A1`, `A2`, `B1`, `B2`                                                                                                                     |
| `vi`, `en`                                             | ✔        | Nghĩa tiếng Việt / tiếng Anh                                                                                                               |
| `example_de`                                           | ✔        | Câu ví dụ tiếng Đức                                                                                                                        |
| `example_vi`, `example_en`                             |          | Bản dịch câu ví dụ                                                                                                                         |
| `tags`                                                 |          | Chủ đề, ngăn cách bằng `;`                                                                                                                 |
| `third_person`, `preterite`, `participle`, `auxiliary` |          | Dành cho động từ; nếu điền thì phải đủ cả 4 cột, `auxiliary` là `haben` hoặc `sein`                                                        |

Ô có dấu phẩy thì phải đặt trong ngoặc kép `"..."`. Khi soạn bằng LibreOffice Calc, chọn _Lưu dưới dạng → CSV, mã hóa UTF-8, dấu phân cách `,`_.

**JSON**, mẫu ở [`content/examples/import-example.json`](content/examples/import-example.json): dạng `{ "words": [ ... ] }` hoặc một mảng, mỗi phần tử theo schema dưới đây.

Từ bị coi là **trùng** khi cùng `lemma` + `article` + `pos` (ví dụ `der Leiter` và `die Leiter` là hai từ khác nhau).

### Cách 2: Sửa nội dung có sẵn (cho người phát triển)

File nằm ở `content/vocab/a1.json`, `a2.json`, `b1.json`, `b2.json`:

```json
{
  "version": 1,
  "level": "A1",
  "words": [
    {
      "id": "de.a1.haus",
      "lemma": "Haus",
      "article": "das",
      "plural": "Häuser",
      "pos": "noun",
      "level": "A1",
      "vi": "ngôi nhà",
      "en": "house",
      "example": {
        "de": "Das Haus hat einen Garten.",
        "vi": "Ngôi nhà có một khu vườn.",
        "en": "The house has a garden."
      },
      "tags": ["home"],
      "verb": { "thirdPerson": "…", "preterite": "…", "participle": "…", "auxiliary": "haben" }
    }
  ]
}
```

- `id` là **khóa ổn định** (`de.<cấp>.<từ>`). Tiến độ học gắn với `id`, nên **đừng đổi `id`** của từ đã có.
- `plural: null` dùng cho danh từ không có số nhiều (das Obst, die Milch…). Trường `verb` chỉ có ở động từ.
- Sau khi sửa, **tăng `version`** của file đó (1 → 2) để app nạp lại nội dung ở lần mở tiếp theo. Tiến độ vẫn giữ nguyên.
- Chạy `npm test` để kiểm tra: danh từ có giống và viết hoa, động từ đủ dạng chia, `id` không trùng, ví dụ có bản dịch.

---

## 10. Dành cho lập trình viên

### Lệnh

```bash
npm start            # expo start
npm run start:lan    # expo start, ép IP LAN vào QR
npm run tunnel       # expo start --tunnel ngrok
npm run web          # bản web (dev)
npm run build:web    # build bản web production vào dist/ (GitHub Pages dùng lệnh này)
npm test             # Jest: SRS, hàng đợi, thông báo, import, seed, backup, quiz, streak/XP
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint (eslint-config-expo)
npm run format       # Prettier (ghi file)
npm run check        # typecheck + lint + format:check + test
```

Test chạy với `TZ=Europe/Berlin` (đặt trong `jest.config.js`) để kiểm tra cả thời điểm chuyển giờ mùa hè.

### Thư viện và lý do chọn

Runtime chỉ dùng **module chính thức của Expo** (đều có sẵn trong Expo Go), **không có thư viện bên thứ ba**:

| Thư viện                                                                                                     | Lý do                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `expo-router` (+ `react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants`) | Điều hướng theo file, deep link từ thông báo, safe area                                  |
| `expo-sqlite`                                                                                                | Lưu tiến độ cục bộ                                                                       |
| `expo-notifications`                                                                                         | Thông báo cục bộ lên lịch trước                                                          |
| `expo-audio`                                                                                                 | Ghi âm và phát lại để luyện phát âm (Giai đoạn 4)                                        |
| `expo-speech`                                                                                                | TTS `de-DE`                                                                              |
| `expo-file-system` + `expo-sharing`                                                                          | Xuất file sao lưu qua share sheet                                                        |
| `expo-document-picker`                                                                                       | Chọn file để import hoặc khôi phục                                                       |
| `expo-crypto`                                                                                                | `randomUUID()`                                                                           |
| `web-push` (**chỉ trong GitHub Actions**, không nằm trong app)                                               | Ký VAPID và mã hóa Web Push; tự viết dễ sai mà không kiểm thử được với máy chủ push thật |
| `react-native-web`, `react-dom`                                                                              | Bản web                                                                                  |

Thuật toán SRS (SM-2), parser CSV, i18n và validate đều tự viết. Dev tools: `jest` + `jest-expo`, `eslint` + `eslint-config-expo`, `prettier`.

### Cấu trúc thư mục

```
app/                    # màn hình (expo-router)
  _layout.tsx           # provider, Stack, xử lý chạm thông báo
  index.tsx             # Hôm nay
  review.tsx            # Ôn tập
  quiz.tsx              # Luyện tập (quiz)
  grammar/index.tsx     # Danh sách bài ngữ pháp
  grammar/[id].tsx      # Bài học + bài tập
  verbs.tsx             # Danh sách động từ
  speak.tsx             # Luyện phát âm
  reading/index.tsx     # Danh sách bài đọc & hội thoại
  reading/[id].tsx      # Bài đọc / hội thoại + câu hỏi
  browse.tsx            # Từ vựng
  word/[id].tsx         # Chi tiết từ
  settings.tsx          # Cài đặt + dữ liệu
src/
  srs/                  # SM-2 thuần, interface Scheduler, hàng đợi, ngày địa phương (+ test)
  db/                   # Repository interface, SQLite, in-memory, migration, bản web
  vocab/                # kiểu dữ liệu, validate, CSV parser, import, tìm/lọc, seed
  notifications/        # planner.ts (hàm thuần) + adapter.ts (expo-notifications)
  backup/               # định dạng + kiểm tra sao lưu, đọc/ghi file
  grammar/              # chia động từ (hàm thuần), kiểu + validate nội dung ngữ pháp, tiến độ bài (+ test)
  quiz/                 # tạo câu hỏi + chấm điểm (hàm thuần, RNG có seed) (+ test)
  reading/              # kiểu + validate nội dung đọc, tiến độ (+ test)
  progress/             # XP, streak, thống kê 7 ngày (hàm thuần) (+ test)
  i18n/                 # vi.ts, en.ts, createT()
  tts/                  # bọc expo-speech
  state/                # settings, logic học, quiz session, AppContext, hook
  ui/                   # theme tokens, component dùng chung
content/
  vocab/                # a1.json … b2.json
  grammar/              # a1.json: bài ngữ pháp
  reading/              # reading.json: bài đọc & hội thoại A1–B2
  examples/             # file import mẫu
public/                 # file tĩnh của bản web: sw.js (offline + push), manifest.json, icon
scripts/
  start-lan.sh          # khởi động Expo với IP LAN
  build-web.mjs         # expo export + thẻ PWA + 404.html cho GitHub Pages
  send-push.mjs         # gửi Web Push (chạy trong GitHub Actions)
.github/workflows/
  pages.yml             # build + đăng GitHub Pages mỗi lần push main
  push.yml              # gửi thông báo theo lịch (cron)
app.config.js           # thêm baseUrl khi build cho GitHub Pages
```

File `*.web.ts` là bản thay thế dành riêng cho web (Metro tự chọn theo nền tảng).

### Kiến trúc

- **SRS** (`src/srs/sm2.ts`) là **hàm thuần**: nhận trạng thái thẻ, đánh giá và thời điểm, trả về trạng thái mới. Hàm không đọc đồng hồ và không phụ thuộc UI hay DB. Nó nằm sau interface `Scheduler`, nên đổi sang FSRS chỉ cần sửa `src/srs/index.ts`.
  - Learning steps 1 phút → 10 phút; relearning 10 phút; tốt nghiệp sau 1 ngày, Easy được 4 ngày.
  - Hệ số dễ (ease) khởi đầu 2.5, giới hạn trong khoảng [1.3, 3.5]. Ôn trễ hạn được cộng thêm khoảng (kiểu Anki).
- **Lập lịch thông báo** (`src/notifications/planner.ts`) cũng là hàm thuần: nhận cài đặt, danh sách từ và thời điểm, trả về danh sách thông báo. Phần gọi `expo-notifications` nằm riêng ở `adapter.ts`.
- **Quiz** (`src/quiz/build.ts`) là hàm thuần: nhận danh sách từ, dạng câu hỏi, số câu và một hàm random (`seededRng` khi test), trả về danh sách câu hỏi. Phương án nhiễu ưu tiên cùng từ loại và cùng cấp, không trùng nghĩa Việt/Anh hay cách viết với nhau. Chấm điểm (`gradeSpelling`, `gradeOrder`, `gradeChoice`) cũng thuần.
- **Streak/XP** (`src/progress/`) tính từ `review_logs` + `quiz_logs` theo ngày học (bắt đầu 4:00 sáng giờ địa phương, đúng cả lúc đổi giờ mùa hè).
- **Chia động từ** (`src/grammar/conjugate.ts`) là hàm thuần: từ nguyên mẫu + 4 dạng chính sinh ra 5 thì. Xử lý đuôi đều, đổi nguyên âm (lấy từ ngôi 3), chèn -e- (arbeitest, öffnet), gốc -s/-ß/-z (heißt), -eln/-ern, động từ kiểu khuyết thiếu (kann, weiß), động từ tách (steht auf), và bảng riêng cho sein/haben/werden/tun. Có test cho từng quy tắc và cho mọi động từ có sẵn.
- **Nội dung ngữ pháp** nằm trong `content/grammar/a1.json` (tách khỏi code, có `validateGrammarFile` + test kiểm tra cấu trúc, đáp án, chỗ trống). Kết quả bài tập ghi vào `quiz_logs` với `type = "grammar"` và `word_id = "grammar:<bài>:<câu>"`, nên không cần bảng mới và sao lưu tự bao gồm.
- **Ghi âm** dùng `expo-audio` (module chính thức của Expo, có sẵn trong Expo Go; trên web dùng MediaRecorder của trình duyệt). Bản ghi chỉ là file tạm, không lưu vào DB.
- **Nội dung đọc & hội thoại** nằm trong `content/reading/reading.json`, có `validateReadingFile` + test. Kết quả câu hỏi ghi vào `quiz_logs` với `type = "reading"`; tự đánh giá phát âm ghi với `type = "speaking"`.
- **Biểu đồ tuần** vẽ bằng `View` thường, không thêm thư viện biểu đồ.
- **Lưu trữ:** mọi truy cập đi qua interface `Repository`, có bản SQLite (iOS) và bản bộ nhớ (Jest, web).
- **Schema DB v2:** `words` (khóa ổn định), `cards` (trạng thái SRS, duy nhất theo `(word_id, kind)`), `review_logs`, `settings`, `content_meta`; migration v2 thêm `quiz_logs` (`word_id`, `type`, `result`, `answered_at`, `duration_ms`). Bản ghi người dùng có `id` (UUID), `updated_at`, `deleted`, `user_id` để sẵn sàng đồng bộ sau này. Migration có phiên bản qua `PRAGMA user_version`.
- **Sẵn chỗ cho các giai đoạn sau:**
  - `cards.kind` cho phép thêm loại thẻ mới (der/die/das, điền từ…).
  - Bảng mới (ngữ pháp, hội thoại, ghi âm) sẽ được thêm bằng migration.
- **Định dạng sao lưu:** `{ format: "dyngoc-backup", formatVersion: 2, exportedAt, schemaVersion, settings, cards, reviewLogs, quizLogs, importedWords }`. File v1 (Giai đoạn 1, chưa có `quizLogs`) vẫn khôi phục được.

---

## 11. Hạn chế đã biết

**iOS / Expo Go**

- **64 thông báo chờ:** app dùng tối đa 60, xếp lại mỗi lần mở app, quay lại từ nền hoặc đổi cài đặt. **Không mở app nhiều ngày thì lô thông báo sẽ hết.**
- Trong Expo Go, thông báo mang tên/biểu tượng **Expo Go**, và quyền thông báo là quyền của Expo Go.
- Chạm vào thông báo khi Expo Go **đã bị tắt hẳn** có thể chỉ mở màn hình chính của Expo Go, chưa vào đúng từ. Khi Expo Go còn chạy nền thì mở đúng từ.
- **TTS không phát tiếng khi iPhone bật chế độ im lặng.** Muốn giọng Đức hay hơn: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Đức, rồi tải giọng nâng cao.
- **Gỡ Expo Go là mất dữ liệu.** Hãy dùng Xuất sao lưu.
- Không có chấm điểm phát âm tự động (không khả thi miễn phí, offline). Thay vào đó: ghi âm, nghe lại, so sánh với giọng mẫu và tự đánh giá.
- Giọng mẫu là giọng máy (TTS) của iPhone, không phải người bản xứ thật: nghe tự nhiên ở mức khá nhưng ngữ điệu có thể hơi máy.

**Web**

- Không dùng SQLite (bản web cần WASM và header COOP/COEP). Thay vào đó dùng **localStorage** (khoảng 5 MB, riêng từng trình duyệt; xóa dữ liệu trang web là mất).
- Không có thông báo lên lịch kiểu iOS. Bản GitHub Pages dùng **Web Push qua GitHub Actions**: **trễ 5–30 phút**, có thể bỏ lượt, giờ gửi đặt trong file workflow, lịch tự tắt sau 60 ngày repo không có commit (xem [mục 7](#7-bản-web-cho-iphone-github-pages--thông-báo)).
- Trên iPhone, thông báo web chỉ hoạt động khi app được **thêm vào Màn hình chính** và mở từ icon (iOS 16.4+).
- Xuất sao lưu sẽ **tải file về** thay vì mở share sheet.
- Ghi âm trên web cần quyền micro của trình duyệt (iPhone: lần đầu Safari sẽ hỏi). Trên iPhone, app mở từ Màn hình chính có thể hỏi lại quyền micro sau mỗi lần mở lại app (giới hạn của iOS với web app).
- TTS dùng giọng của trình duyệt. Trên Linux, nếu không có tiếng, hãy cài `speech-dispatcher` và `espeak-ng`.

**Khác**

- SRS chưa có "fuzz" (ngẫu nhiên hóa khoảng ôn), nhằm giữ kết quả xác định.
- Quiz không ảnh hưởng lịch ôn SRS (cố ý, để tránh làm sai thuật toán SM-2).
- **Điền từ** chỉ hiện câu ví dụ có chỗ trống khi từ xuất hiện nguyên dạng trong câu. Động từ đã chia (`fahren` → `fährt`) hoặc danh từ số nhiều thì chỉ hiện nghĩa và gợi ý.
- **Sắp xếp câu** chỉ dùng câu ví dụ có 3–10 từ; từ đầu câu viết hoa nên là một gợi ý nhỏ.
- **Nghe rồi chọn** cần TTS hoạt động (tắt chế độ im lặng trên iPhone).

---

## 12. Lộ trình

- [x] **Giai đoạn 1:** từ vựng có giống, flashcard SRS, SQLite, thông báo, sáng/tối, song ngữ, sao lưu, import
- [x] **Giai đoạn 2:** quiz (trắc nghiệm, điền từ, sắp xếp câu, chọn der/die/das, nghe rồi chọn), streak, XP, biểu đồ tuần
- [x] **Giai đoạn 3:** ngữ pháp, bảng chia động từ, bốn cách (Nominativ/Akkusativ/Dativ/Genitiv)
- [x] **Giai đoạn 4:** ghi âm và phát lại để tự so sánh phát âm
- [x] **Giai đoạn 5:** hội thoại và đọc hiểu theo cấp độ

---

## 13. Checklist kiểm thử trên iPhone

- [ ] Mở lần đầu: "Hôm nay" hiện **0 thẻ đến hạn · 10 từ mới**.
- [ ] **Lật thẻ** bằng cách chạm vào từ hoặc nút dưới đáy. Mặt sau đủ giống (badge + màu), số nhiều, nghĩa VI/EN, ví dụ kèm dịch.
- [ ] **4 nút đánh giá** dễ bấm một tay, mỗi nút có khoảng ôn dự kiến (thẻ mới: 1 phút / 6 phút / 10 phút / 4 ngày).
- [ ] 🔊 đọc từ và câu ví dụ bằng giọng Đức (tắt chế độ im lặng trước khi thử).
- [ ] **Tắt hẳn Expo Go rồi mở lại:** tiến độ vẫn đúng.
- [ ] Từ vựng: tìm `strasse`, `haeuser`, `ngoi nha`, `house`; lọc cấp/chủ đề; "Thêm vào học".
- [ ] Hiển thị đúng **Ä Ö Ü ß** (die Straße, die Häuser, die Übung, süß) và tiếng Việt có dấu.
- [ ] **Sáng/tối:** đổi qua 3 chế độ. Ở chế độ "Theo hệ thống", bật/tắt Dark Mode của iOS để thử.
- [ ] Ngôn ngữ: Việt / English / Cả hai.
- [ ] **Thông báo:** bật, cho phép quyền, chọn "Theo giờ" mỗi 1 giờ. Cài đặt hiện _"Đã xếp N thông báo…"_.
- [ ] **Nhận thông báo khi app đóng** (dạng `der Tisch · bàn`). Chạm vào thì mở đúng từ.
- [ ] **Giờ yên tĩnh** bao trùm giờ hiện tại (thử cả khoảng qua nửa đêm): không nhận được thông báo.
- [ ] Từ chối quyền thông báo trong Cài đặt iOS: app hiện cảnh báo đỏ kèm nút mở Cài đặt.
- [ ] **Sao lưu rồi khôi phục:** xuất, ôn thêm vài thẻ, khôi phục, app hỏi xác nhận, tiến độ trở về lúc xuất.
- [ ] Import `content/examples/import-example.csv`: báo "Đã thêm 5 từ". Import lại lần nữa thì báo "trùng 5".
- [ ] **Quiz:** làm một bài 10 câu với đủ 5 dạng. Kiểm tra:
  - Đáp án đúng viền xanh ✓, đáp án chọn sai viền đỏ ✗.
  - Câu **der/die/das** không tô màu từ trước khi trả lời.
  - **Điền từ:** hàng phím ä ö ü ß gõ được; gõ `strasse` cho Straße báo "Gần đúng"; Enter trên bàn phím iOS = Kiểm tra.
  - **Sắp xếp câu:** chạm từ đã xếp để bỏ ra; Kiểm tra chỉ bật khi đã xếp hết.
  - **Nghe rồi chọn:** tự đọc khi mở câu, 🔊 đọc lại.
  - Màn kết quả: số câu đúng, XP, danh sách cần xem lại mở được chi tiết từ.
- [ ] **Streak/XP:** sau khi ôn hoặc làm quiz, "Hôm nay" hiện 🔥 1 ngày liên tiếp, XP hôm nay > 0, cột hôm nay trên biểu đồ có giá trị.
- [ ] **Nâng cấp từ Giai đoạn 1:** cài bản mới lên máy đã có tiến độ cũ: tiến độ vẫn còn, streak tính cả lượt ôn cũ.
- [ ] Khôi phục một file sao lưu cũ (v1) vẫn thành công.

**Bản web (GitHub Pages)**

- [ ] Safari → link → Thêm vào MH chính: icon "DE" xanh với 3 vạch màu hiện trên Màn hình chính; mở ra toàn màn hình.
- [ ] Bật chế độ máy bay rồi mở app từ icon: app vẫn mở được.
- [ ] Cài đặt → Bật thông báo → Cho phép → **Thử hiện thông báo ngay**: có thông báo.
- [ ] Cài đặt hiện cảnh báo thông báo trễ 5–30 phút.
- [ ] Sao chép mã, thêm vào `PUSH_SUBSCRIPTIONS`, chạy **Actions → Vocab push → Run workflow**: trong khoảng 1 phút nhận thông báo dạng `der Tisch · bàn` khi app đang đóng.
- [ ] Chạm vào thông báo: mở đúng từ đó.
- [ ] Sau khi ôn vài thẻ, icon app hiện số thẻ còn lại hôm nay.

**Giai đoạn 3: ngữ pháp**

- [ ] Hôm nay → **Ngữ pháp**: thấy thẻ "Bảng chia động từ" và 11 bài A1, mỗi bài hiện "0/4 bài tập".
- [ ] Mở bài "Bốn cách": bảng cuộn ngang được trên iPhone, ví dụ có 🔊 đọc tiếng Đức.
- [ ] Làm 4 bài tập: đáp án đúng viền xanh ✓, sai viền đỏ ✗, có giải thích. Quay lại danh sách thấy số bài tập đúng cập nhật; làm đúng hết thì "Đã xong ✓".
- [ ] Bảng chia động từ → tìm `fahr` → `fahren`: Präsens in đậm `fährst`, `fährt`; Imperativ `fahr(e)!`; chạm một dòng nghe được.
- [ ] `können`: Imperativ báo "không có thể mệnh lệnh"; `aufstehen`: `stehe auf`, `bin aufgestanden`.
- [ ] Đổi ngôn ngữ sang English / Cả hai: bài học hiện tiếng Anh / cả hai.

**Giai đoạn 4: phát âm**

- [ ] Hôm nay → **Phát âm** → 🎤 Ghi âm: iOS hỏi quyền micro → Cho phép. Nói, bấm lại để dừng.
- [ ] ▶️ Của tôi phát lại giọng bạn **to qua loa** (không phải loa thoại nhỏ). 🔁 So sánh: giọng mẫu rồi giọng bạn.
- [ ] Nút Giống / Gần giống / Chưa giống chỉ bấm được sau khi đã ghi âm; bấm xong sang từ kế tiếp; hết 10 từ hiện tổng XP.
- [ ] Trang chi tiết một từ: thẻ "Luyện phát âm" với Từ / Câu ví dụ.
- [ ] Ghi âm hơn 15 giây: tự dừng.

**Giai đoạn 5: đọc & hội thoại**

- [ ] Hôm nay → **Đọc & hội thoại**: 10 bài, cấp đang học ở đầu.
- [ ] "Trong quán cà phê" → **Nghe cả bài**: đọc lần lượt, câu đang đọc được tô nền, hai nhân vật giọng khác nhau; **Dừng** dừng ngay.
- [ ] Nhập vai → chọn "Minh": lời của Minh thành "••• đến lượt bạn" kèm bản dịch; chạm vào thì hiện câu Đức và bảng ghi âm.
- [ ] Trả lời 3 câu hỏi: có ✓/✗ và giải thích; quay lại danh sách thấy tiến độ cập nhật.
