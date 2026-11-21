# DYNgoc Deutsch: học tiếng Đức cho người Việt

Ứng dụng flashcard học từ vựng tiếng Đức, giải nghĩa song ngữ Việt–Anh. Chạy trên **iPhone (qua Expo Go)** và trên **máy tính (trình duyệt web)**.

- **Miễn phí 100%:** không tài khoản, không server, không API key, không quảng cáo.
- **Offline hoàn toàn:** toàn bộ từ vựng và tiến độ học nằm trên máy.
- **Nền tảng:** Expo SDK 58 · React Native 0.88 · TypeScript (strict) · expo-router.

> **Trạng thái:** Giai đoạn 1 (MVP) và Giai đoạn 2 (quiz, streak, XP, biểu đồ tuần) đã xong. Xem [Lộ trình](#11-lộ-trình).

---

## Mục lục

1. [Tính năng](#1-tính-năng)
2. [Yêu cầu](#2-yêu-cầu)
3. [Cài đặt từ GitHub](#3-cài-đặt-từ-github)
4. [Chạy trên iPhone](#4-chạy-trên-iphone)
5. [Không kết nối được iPhone? Khắc phục sự cố](#5-không-kết-nối-được-iphone-khắc-phục-sự-cố)
6. [Chạy trên máy tính (web)](#6-chạy-trên-máy-tính-web)
7. [Hướng dẫn sử dụng](#7-hướng-dẫn-sử-dụng)
8. [Thêm và sửa từ vựng](#8-thêm-và-sửa-từ-vựng)
9. [Dành cho lập trình viên](#9-dành-cho-lập-trình-viên)
10. [Hạn chế đã biết](#10-hạn-chế-đã-biết)
11. [Lộ trình](#11-lộ-trình)
12. [Checklist kiểm thử trên iPhone](#12-checklist-kiểm-thử-trên-iphone)

---

## 1. Tính năng

|                         |                                                                                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Từ vựng**             | 173 từ A1 (danh từ, động từ, tính từ, từ chức năng, chia theo chủ đề) và 10 từ mẫu cho mỗi cấp A2/B1/B2. Mỗi từ có giống (der/die/das), số nhiều, nghĩa tiếng Việt và tiếng Anh, câu ví dụ kèm bản dịch, và dạng chia đối với động từ. |
| **Flashcard SRS**       | Thuật toán lặp lại ngắt quãng kiểu SM-2 (tự viết). Bốn mức Again/Hard/Good/Easy, có hiện trước khoảng ôn kế tiếp dưới mỗi nút.                                                                                                         |
| **Quiz luyện tập**      | 5 dạng: chọn nghĩa, chọn der/die/das, điền từ, sắp xếp câu, nghe rồi chọn. Ưu tiên từ đang học. Không làm thay đổi lịch ôn thẻ.                                                                                                        |
| **Streak, XP, biểu đồ** | Chuỗi ngày học liên tiếp, điểm XP cho mỗi lượt ôn/câu quiz, biểu đồ XP 7 ngày trên màn hình chính.                                                                                                                                     |
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

Trên web, tiến độ lưu trong trình duyệt (localStorage). Web không có thông báo, xem [Hạn chế](#10-hạn-chế-đã-biết).

---

## 7. Hướng dẫn sử dụng

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

## 8. Thêm và sửa từ vựng

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

## 9. Dành cho lập trình viên

### Lệnh

```bash
npm start            # expo start
npm run start:lan    # expo start, ép IP LAN vào QR
npm run tunnel       # expo start --tunnel ngrok
npm run web          # bản web
npm test             # Jest: SRS, hàng đợi, thông báo, import, seed, backup, quiz, streak/XP
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint (eslint-config-expo)
npm run format       # Prettier (ghi file)
npm run check        # typecheck + lint + format:check + test
```

Test chạy với `TZ=Europe/Berlin` (đặt trong `jest.config.js`) để kiểm tra cả thời điểm chuyển giờ mùa hè.

### Thư viện và lý do chọn

Runtime chỉ dùng **module chính thức của Expo** (đều có sẵn trong Expo Go), **không có thư viện bên thứ ba**:

| Thư viện                                                                                                     | Lý do                                                   |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `expo-router` (+ `react-native-screens`, `react-native-safe-area-context`, `expo-linking`, `expo-constants`) | Điều hướng theo file, deep link từ thông báo, safe area |
| `expo-sqlite`                                                                                                | Lưu tiến độ cục bộ                                      |
| `expo-notifications`                                                                                         | Thông báo cục bộ lên lịch trước                         |
| `expo-speech`                                                                                                | TTS `de-DE`                                             |
| `expo-file-system` + `expo-sharing`                                                                          | Xuất file sao lưu qua share sheet                       |
| `expo-document-picker`                                                                                       | Chọn file để import hoặc khôi phục                      |
| `expo-crypto`                                                                                                | `randomUUID()`                                          |
| `react-native-web`, `react-dom`                                                                              | Bản web                                                 |

Thuật toán SRS (SM-2), parser CSV, i18n và validate đều tự viết. Dev tools: `jest` + `jest-expo`, `eslint` + `eslint-config-expo`, `prettier`.

### Cấu trúc thư mục

```
app/                    # màn hình (expo-router)
  _layout.tsx           # provider, Stack, xử lý chạm thông báo
  index.tsx             # Hôm nay
  review.tsx            # Ôn tập
  quiz.tsx              # Luyện tập (quiz)
  browse.tsx            # Từ vựng
  word/[id].tsx         # Chi tiết từ
  settings.tsx          # Cài đặt + dữ liệu
src/
  srs/                  # SM-2 thuần, interface Scheduler, hàng đợi, ngày địa phương (+ test)
  db/                   # Repository interface, SQLite, in-memory, migration, bản web
  vocab/                # kiểu dữ liệu, validate, CSV parser, import, tìm/lọc, seed
  notifications/        # planner.ts (hàm thuần) + adapter.ts (expo-notifications)
  backup/               # định dạng + kiểm tra sao lưu, đọc/ghi file
  quiz/                 # tạo câu hỏi + chấm điểm (hàm thuần, RNG có seed) (+ test)
  progress/             # XP, streak, thống kê 7 ngày (hàm thuần) (+ test)
  i18n/                 # vi.ts, en.ts, createT()
  tts/                  # bọc expo-speech
  state/                # settings, logic học, quiz session, AppContext, hook
  ui/                   # theme tokens, component dùng chung
content/
  vocab/                # a1.json … b2.json
  examples/             # file import mẫu
scripts/start-lan.sh    # khởi động Expo với IP LAN
```

File `*.web.ts` là bản thay thế dành riêng cho web (Metro tự chọn theo nền tảng).

### Kiến trúc

- **SRS** (`src/srs/sm2.ts`) là **hàm thuần**: nhận trạng thái thẻ, đánh giá và thời điểm, trả về trạng thái mới. Hàm không đọc đồng hồ và không phụ thuộc UI hay DB. Nó nằm sau interface `Scheduler`, nên đổi sang FSRS chỉ cần sửa `src/srs/index.ts`.
  - Learning steps 1 phút → 10 phút; relearning 10 phút; tốt nghiệp sau 1 ngày, Easy được 4 ngày.
  - Hệ số dễ (ease) khởi đầu 2.5, giới hạn trong khoảng [1.3, 3.5]. Ôn trễ hạn được cộng thêm khoảng (kiểu Anki).
- **Lập lịch thông báo** (`src/notifications/planner.ts`) cũng là hàm thuần: nhận cài đặt, danh sách từ và thời điểm, trả về danh sách thông báo. Phần gọi `expo-notifications` nằm riêng ở `adapter.ts`.
- **Quiz** (`src/quiz/build.ts`) là hàm thuần: nhận danh sách từ, dạng câu hỏi, số câu và một hàm random (`seededRng` khi test), trả về danh sách câu hỏi. Phương án nhiễu ưu tiên cùng từ loại và cùng cấp, không trùng nghĩa Việt/Anh hay cách viết với nhau. Chấm điểm (`gradeSpelling`, `gradeOrder`, `gradeChoice`) cũng thuần.
- **Streak/XP** (`src/progress/`) tính từ `review_logs` + `quiz_logs` theo ngày học (bắt đầu 4:00 sáng giờ địa phương, đúng cả lúc đổi giờ mùa hè).
- **Biểu đồ tuần** vẽ bằng `View` thường, không thêm thư viện biểu đồ.
- **Lưu trữ:** mọi truy cập đi qua interface `Repository`, có bản SQLite (iOS) và bản bộ nhớ (Jest, web).
- **Schema DB v2:** `words` (khóa ổn định), `cards` (trạng thái SRS, duy nhất theo `(word_id, kind)`), `review_logs`, `settings`, `content_meta`; migration v2 thêm `quiz_logs` (`word_id`, `type`, `result`, `answered_at`, `duration_ms`). Bản ghi người dùng có `id` (UUID), `updated_at`, `deleted`, `user_id` để sẵn sàng đồng bộ sau này. Migration có phiên bản qua `PRAGMA user_version`.
- **Sẵn chỗ cho các giai đoạn sau:**
  - `cards.kind` cho phép thêm loại thẻ mới (der/die/das, điền từ…).
  - Bảng mới (ngữ pháp, hội thoại, ghi âm) sẽ được thêm bằng migration.
- **Định dạng sao lưu:** `{ format: "dyngoc-backup", formatVersion: 2, exportedAt, schemaVersion, settings, cards, reviewLogs, quizLogs, importedWords }`. File v1 (Giai đoạn 1, chưa có `quizLogs`) vẫn khôi phục được.

---

## 10. Hạn chế đã biết

**iOS / Expo Go**

- **64 thông báo chờ:** app dùng tối đa 60, xếp lại mỗi lần mở app, quay lại từ nền hoặc đổi cài đặt. **Không mở app nhiều ngày thì lô thông báo sẽ hết.**
- Trong Expo Go, thông báo mang tên/biểu tượng **Expo Go**, và quyền thông báo là quyền của Expo Go.
- Chạm vào thông báo khi Expo Go **đã bị tắt hẳn** có thể chỉ mở màn hình chính của Expo Go, chưa vào đúng từ. Khi Expo Go còn chạy nền thì mở đúng từ.
- **TTS không phát tiếng khi iPhone bật chế độ im lặng.** Muốn giọng Đức hay hơn: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói → Tiếng Đức, rồi tải giọng nâng cao.
- **Gỡ Expo Go là mất dữ liệu.** Hãy dùng Xuất sao lưu.
- Không có chấm điểm phát âm tự động (không khả thi miễn phí trong Expo Go). Ghi âm và nghe lại để tự so sánh sẽ có ở Giai đoạn 4.

**Web**

- Không dùng SQLite (bản web cần WASM và header COOP/COEP). Thay vào đó dùng **localStorage** (khoảng 5 MB, riêng từng trình duyệt; xóa dữ liệu trang web là mất).
- Không có thông báo lên lịch. Xuất sao lưu sẽ **tải file về** thay vì mở share sheet.
- TTS dùng giọng của trình duyệt. Trên Linux, nếu không có tiếng, hãy cài `speech-dispatcher` và `espeak-ng`.

**Khác**

- SRS chưa có "fuzz" (ngẫu nhiên hóa khoảng ôn), nhằm giữ kết quả xác định.
- Quiz không ảnh hưởng lịch ôn SRS (cố ý, để tránh làm sai thuật toán SM-2).
- **Điền từ** chỉ hiện câu ví dụ có chỗ trống khi từ xuất hiện nguyên dạng trong câu. Động từ đã chia (`fahren` → `fährt`) hoặc danh từ số nhiều thì chỉ hiện nghĩa và gợi ý.
- **Sắp xếp câu** chỉ dùng câu ví dụ có 3–10 từ; từ đầu câu viết hoa nên là một gợi ý nhỏ.
- **Nghe rồi chọn** cần TTS hoạt động (tắt chế độ im lặng trên iPhone).

---

## 11. Lộ trình

- [x] **Giai đoạn 1:** từ vựng có giống, flashcard SRS, SQLite, thông báo, sáng/tối, song ngữ, sao lưu, import
- [x] **Giai đoạn 2:** quiz (trắc nghiệm, điền từ, sắp xếp câu, chọn der/die/das, nghe rồi chọn), streak, XP, biểu đồ tuần
- [ ] **Giai đoạn 3:** ngữ pháp, bảng chia động từ, bốn cách (Nominativ/Akkusativ/Dativ/Genitiv)
- [ ] **Giai đoạn 4:** ghi âm và phát lại để tự so sánh phát âm
- [ ] **Giai đoạn 5:** hội thoại và đọc hiểu theo cấp độ

---

## 12. Checklist kiểm thử trên iPhone

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
