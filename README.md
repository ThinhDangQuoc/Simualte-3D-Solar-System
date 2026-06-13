# 🌌 Mô phỏng Hệ Mặt Trời 3D (3D Solar System Simulation)

Ứng dụng mô phỏng Hệ Mặt Trời 3D tương tác chất lượng cao được xây dựng bằng **Three.js**, **Vite**, và **GSAP**. Dự án đáp ứng các tiêu chuẩn của học phần Đồ họa Máy tính, thể hiện việc áp dụng các hình khối cơ bản, phép biến đổi phân cấp (hierarchical transformations), quỹ đạo elip (Keplerian mechanics), ánh sáng, vật liệu/texture và tương tác điều khiển camera.

Đặc biệt, dự án đã tích hợp thành công hệ thống **Planet Constructor** cho phép tự thiết kế và đặt hành tinh tùy chỉnh vào không gian mô phỏng bằng chuột (Raycasting).

---

## 🚀 Tính năng nổi bật

- **Tương tác & Khám phá**: Click chọn hành tinh để camera zoom mượt mà cận cảnh, hiển thị bảng đo quét thông tin vật lý thực tế. Hỗ trợ chế độ **First-Person Surface View** (Quan sát từ bề mặt hành tinh) và chuyến bay tự động **Autopilot Tour**.
- **Planet Constructor (Bảng thiết kế hành tinh)**: Cho phép tinh chỉnh tên, kích thước, độ lệch tâm elip, góc nghiêng quỹ đạo, tốc độ quay, màu sắc lõi, vân bề mặt và vành đai. Hỗ trợ **Clone Preset** lấy thông số chuẩn từ các hành tinh mẫu có sẵn.
- **Ecliptic Mouse Placement (Đặt hành tinh bằng chuột)**: Sử dụng kỹ thuật Raycasting chiếu tọa độ chuột lên mặt phẳng hoàng đạo 3D ($Y=0$), hiển thị quỹ đạo preview nét đứt dạng holographic và wireframe mesh xoay theo chuột trước khi đặt.
- **Quỹ đạo Keplerian & Nội suy phi tuyến tính**: Các hành tinh di chuyển theo quỹ đạo elip với vận tốc thay đổi theo khoảng cách (Định luật 2 Kepler). Khoảng cách vật lý hiển thị trên HUD được tự động ánh xạ phi tuyến tính (Non-linear Interpolation) dựa trên 8 hành tinh mẫu, đảm bảo độ khớp 100% về mặt đo đạc vũ trụ.
- **HUD Glassmorphism cao cấp**: Giao diện mang phong cách viễn tưởng Hologram với hiệu ứng làm mờ kính cường độ cao, thanh timeline Chronos điều chỉnh tốc độ dòng thời gian (0.25x - 10x) và bảng chẩn đoán kỹ thuật `lil-gui`.
- **Đa dạng mô hình chiếu sáng**: Cho phép chuyển đổi linh hoạt giữa các shading model (Standard, Phong, Lambert, Normal, Basic) và bật/tắt hiển thị lưới tọa độ helper.

---

## 🛠 Hướng dẫn cài đặt chi tiết (Dành cho máy mới tinh - Fresh Machine)

Làm theo các bước chi tiết dưới đây để thiết lập môi trường và chạy ứng dụng từ đầu.

### Bước 1: Cài đặt Node.js và npm
Node.js là môi trường chạy JavaScript bên ngoài trình duyệt, đi kèm với trình quản lý thư viện `npm`. Đây là công cụ bắt buộc để chạy dự án.

#### 🔹 Trên Windows:
1. Truy cập trang chủ Node.js: [https://nodejs.org/](https://nodejs.org/)
2. Tải bản **LTS** (khuyên dùng vì tính ổn định cao, ví dụ bản `20.x` hoặc `22.x`).
3. Chạy file `.msi` vừa tải xuống và nhấn **Next** liên tục. Hãy chắc chắn tích chọn ô **"Add to PATH"** khi được hỏi.
4. Mở Command Prompt (`cmd`) hoặc PowerShell và gõ lệnh kiểm tra:
   ```bash
   node -v
   npm -v
   ```
   If the screen displays the version numbers (e.g., `v20.11.0` and `10.2.4`), it is installed successfully.

#### 🔹 Trên macOS:
- Cách đơn giản nhất là tải trình cài đặt `.pkg` từ trang chủ [nodejs.org](https://nodejs.org/) và chạy cài đặt.
- Hoặc cài đặt qua **Homebrew** (nếu máy đã cài Homebrew):
   ```bash
   brew install node
   ```

#### 🔹 Trên Linux (Ubuntu/Debian):
Mở terminal và chạy chuỗi lệnh sau để cài đặt phiên bản LTS:
```bash
sudo apt update
sudo apt install -y nodejs npm
```

---

### Bước 2: Tải mã nguồn dự án
- Nếu bạn có Git cài sẵn, chạy lệnh clone dự án:
  ```bash
  git clone <đường-dẫn-repository>
  ```
- Hoặc tải file **ZIP** của dự án về máy, giải nén ra một thư mục (ví dụ: `C:\Project-3D-Solar-System` hoặc `/home/user/Project-3D-Solar-System`).

---

### Bước 3: Cài đặt thư viện phụ thuộc (Dependencies)
1. Mở terminal (Command Prompt trên Windows, Terminal trên macOS/Linux).
2. Di chuyển vào thư mục dự án vừa giải nén:
   ```bash
   # Ví dụ trên Windows:
   cd C:\Project-3D-Solar-System
   
   # Ví dụ trên macOS/Linux:
   cd ~/Downloads/Project-3D-Solar-System
   ```
3. Chạy lệnh cài đặt toàn bộ dependencies (Vite, Three.js, GSAP, lil-gui) được định nghĩa sẵn trong file `package.json`:
   ```bash
   npm install
   ```
   *Lưu ý: Quá trình này sẽ tạo ra thư mục `node_modules` chứa các thư viện cần thiết. Đảm bảo bạn có kết nối Internet ổn định.*

---

### Bước 4: Khởi chạy dự án ở chế độ Local Development
Sau khi cài đặt xong, khởi chạy máy chủ phát triển cục bộ bằng lệnh:
```bash
npm run dev
```
Sau khi chạy thành công, terminal sẽ hiển thị địa chỉ local, thường là:
```
  VITE v5.x.x  ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```
Giữ nguyên terminal đang chạy, mở trình duyệt web (Chrome, Edge, Firefox, Safari) và truy cập địa chỉ: [http://localhost:5173/](http://localhost:5173/) để trải nghiệm mô phỏng.

---

### Bước 5: Đóng gói bản Production (Tùy chọn)
Nếu bạn muốn đóng gói toàn bộ dự án thành các tệp HTML/CSS/JS tĩnh tối ưu hóa để upload lên hosting hoặc nộp bài:
1. Chạy lệnh build:
   ```bash
   npm run build
   ```
   Thư mục `/dist` sẽ được tạo ra chứa toàn bộ mã nguồn đã nén.
2. Để chạy thử bản đóng gói này ngay trên máy cục bộ:
   ```bash
   npm run preview
   ```

---

## 🎮 Hướng dẫn điều khiển mô phỏng

- **Xoay Camera**: Nhấp giữ chuột trái và kéo trên không gian 3D.
- **Phóng to / Thu nhỏ**: Cuộn bánh xe chuột (Mouse Wheel) hoặc dùng cử chỉ zoom trên touchpad.
- **Chọn hành tinh nhanh**: Click trực tiếp vào quả cầu hành tinh 3D hoặc click tên hành tinh trong danh sách **ORBITAL FLEET** ở sidebar trái.
- **Tắt Scanner**: Click nút **DISCONNECT SCANNER** hoặc nhấp chuột vào khoảng không gian trống để đưa camera về chế độ tổng quan.
- **Chế độ tự hành**: Click **AUTOPILOT: OFF** để bật chuyến bay tự động tham quan hệ Mặt Trời. Click lại để tắt.
- **Bảng thiết kế hành tinh**: 
  1. Bấm nút **CONSTRUCT PLANET** ở góc dưới sidebar trái để mở panel thiết kế.
  2. Chọn một hành tinh mẫu tại dropdown **CLONE TEMPLATE** để lấy thông số nhanh, hoặc tự tùy chỉnh các thanh trượt.
  3. Bấm **LAUNCH PLANET** $\rightarrow$ Camera sẽ chuyển sang góc nhìn từ trên xuống và khóa tương tác xoay.
  4. Rê chuột trên màn hình để điều chỉnh kích thước quỹ đạo preview $\rightarrow$ **Click chuột trái** để đặt hành tinh.
  5. Bấm phím **ESC** bất kỳ lúc nào để hủy chế độ đặt và quay về bảng cấu hình.
- **Tốc độ thời gian**: Điều chỉnh các nút tốc độ (PAUSE, 0.25X, 1X, 2X, 5X, 10X) ở thanh timeline footer dưới cùng để thay đổi tốc độ quay của hệ thống.
- **Bảng điều khiển kỹ thuật (lil-gui)**: Nằm ở góc trên bên phải màn hình, cho phép tinh chỉnh khoảng cách camera (`Near/Far Range`), bật/tắt lưới tọa độ (`Coordinate Helpers`), đổi mô hình chiếu sáng (`Shading Model`) hoặc chuyển sang chế độ khung dây (`Wireframe`).

---

## 🛑 Xử lý sự cố thường gặp (Troubleshooting)

#### 1. Gặp lỗi `"npm: command not found"` hoặc `"node không phải là lệnh được công nhận"`
* **Nguyên nhân**: Bạn chưa cài Node.js hoặc cài rồi nhưng chưa cấu hình biến môi trường PATH (thường gặp trên Windows).
* **Khắc phục**: Khởi động lại terminal hoặc khởi động lại máy tính để cập nhật PATH. Nếu vẫn không được, hãy gỡ Node.js ra cài lại và đảm bảo đã tích chọn `"Add to PATH"`.

#### 2. Cổng `5173` bị chiếm dụng
* **Mô tả**: Khi chạy `npm run dev`, Vite báo cổng `5173` đã có ứng dụng khác sử dụng và tự động đổi sang cổng khác (ví dụ `http://localhost:5174/`).
* **Khắc phục**: Đây không phải là lỗi, bạn chỉ cần truy cập đúng địa chỉ mới hiển thị trên terminal (ví dụ `http://localhost:5174/`).

#### 3. Trình duyệt hiển thị màn hình đen hoặc báo lỗi WebGL
* **Nguyên nhân**: Trình duyệt của bạn chưa bật tăng tốc phần cứng hoặc card đồ họa không tương thích WebGL.
* **Khắc phục**: 
  - Truy cập cài đặt trình duyệt (Settings) $\rightarrow$ Tìm kiếm từ khóa "hardware acceleration" (Tăng tốc phần cứng) $\rightarrow$ Bật tính năng này lên và khởi động lại trình duyệt.
  - Đảm bảo driver card đồ họa của máy tính đã được cập nhật phiên bản mới nhất.

#### 4. Thư mục cài đặt bị lỗi hoặc xung đột phiên bản thư viện
* **Khắc phục**: Xóa thư mục `node_modules` và tệp `package-lock.json`, sau đó mở terminal tại thư mục dự án và chạy lại lệnh cài đặt:
  ```bash
  npm install
  ```
