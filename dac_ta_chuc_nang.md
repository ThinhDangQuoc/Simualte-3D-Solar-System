# Đặc tả chi tiết chức năng mô hình 3D Solar System Simulation

## 1. Tổng quan mô hình

**Tên mô hình:** 3D Solar System Simulation  
**Loại ứng dụng:** Mô phỏng Hệ Mặt Trời 3D tương tác trên trình duyệt  
**Công nghệ sử dụng:** Three.js, Vite, GSAP, lil-gui, HTML, CSS, JavaScript  
**Tệp chính:** `index.html`, `main.js`, `style.css`  

Mô hình xây dựng một không gian 3D mô phỏng Hệ Mặt Trời, trong đó người dùng có thể quan sát Mặt Trời, các hành tinh, quỹ đạo chuyển động, môi trường sao nền, và tương tác với từng hành tinh thông qua camera, bảng thông tin, chế độ xem từ bề mặt hành tinh và bảng điều khiển thời gian/tham số.

Mục tiêu chính của mô hình là minh họa các kiến thức đồ họa máy tính như:

- Tạo cảnh 3D bằng các hình học cơ bản.
- Áp dụng texture mapping lên các thiên thể.
- Thiết lập hệ thống ánh sáng và đổ bóng.
- Mô phỏng chuyển động quay và chuyển động quanh tâm.
- Thể hiện quỹ đạo elip và độ nghiêng quỹ đạo.
- Điều khiển camera trong không gian 3D.
- Tương tác chọn vật thể bằng raycasting.
- Thay đổi chế độ hiển thị vật liệu và ánh sáng theo thời gian thực.

---

## 2. Phạm vi chức năng

Mô hình tập trung vào các chức năng sau:

1. Khởi tạo và hiển thị cảnh 3D Hệ Mặt Trời.
2. Tạo Mặt Trời, 8 hành tinh, Mặt Trăng của Trái Đất và vành đai tiểu hành tinh.
3. Tạo quỹ đạo elip cho từng hành tinh.
4. Mô phỏng chuyển động quay quanh trục và chuyển động quanh Mặt Trời.
5. Hiển thị môi trường không gian gồm sao, bụi tinh vân và hiệu ứng phát sáng.
6. Áp dụng texture cho Mặt Trời và các hành tinh.
7. Tạo hệ thống ánh sáng, bóng đổ và glow shader.
8. Cho phép người dùng chọn hành tinh bằng chuột hoặc danh sách HUD.
9. Hiển thị bảng thông tin chi tiết của hành tinh được chọn.
10. Cho phép chuyển sang chế độ quan sát từ bề mặt hành tinh.
11. Tự động tham quan các hành tinh bằng chế độ Autopilot.
12. Điều chỉnh tốc độ mô phỏng thời gian.
13. Điều chỉnh tham số camera, vật liệu, ánh sáng, lưới tọa độ và chế độ render bằng lil-gui.
14. Cập nhật telemetry như tọa độ camera, ngày mô phỏng và FPS.
15. Tự động thích ứng kích thước màn hình khi thay đổi cửa sổ trình duyệt.

---

## 3. Đặc tả dữ liệu mô hình

### 3.1. Cấu hình hệ thống

Mô hình sử dụng đối tượng `CONFIG` để lưu các tham số điều khiển chính:

| Thuộc tính | Ý nghĩa |
|---|---|
| `rotationSpeed` | Tốc độ tự quay quanh trục của các hành tinh. |
| `revolutionSpeed` | Tốc độ chuyển động quanh Mặt Trời. |
| `lightsEnabled` | Bật/tắt hệ thống ánh sáng và hiệu ứng glow. |
| `texturesEnabled` | Bật/tắt texture của vật thể. |
| `orbitsEnabled` | Bật/tắt đường quỹ đạo hành tinh. |
| `flatLighting` | Bật/tắt chế độ chiếu sáng phẳng không phụ thuộc nguồn sáng. |
| `shadingModel` | Chọn mô hình vật liệu/đổ bóng. |
| `textureFilter` | Chọn kiểu lọc texture mượt hoặc pixelated. |
| `showAxes` | Hiển thị trục tọa độ. |
| `showGrid` | Hiển thị lưới mặt phẳng quỹ đạo. |
| `renderMode` | Chế độ hiển thị mesh dạng solid hoặc wireframe. |
| `near` | Mặt phẳng cắt gần của camera. |
| `far` | Mặt phẳng cắt xa của camera. |

### 3.2. Dữ liệu hành tinh

Danh sách hành tinh được khai báo trong `PLANET_DATA`. Mỗi hành tinh có các thông tin:

| Trường dữ liệu | Ý nghĩa |
|---|---|
| `name` | Tên hành tinh. |
| `size` | Kích thước hiển thị trong mô hình. |
| `a` | Bán trục lớn của quỹ đạo elip. |
| `e` | Độ lệch tâm quỹ đạo. |
| `i` | Độ nghiêng quỹ đạo. |
| `speed` | Tốc độ chuyển động quanh quỹ đạo. |
| `color` | Màu đại diện khi chưa dùng texture. |
| `orbitColor` | Màu đường quỹ đạo. |
| `texture` | Đường dẫn ảnh texture. |
| `type` | Loại hành tinh: Terrestrial, Gas Giant, Ice Giant. |
| `distance` | Khoảng cách trung bình từ Mặt Trời. |
| `period` | Chu kỳ quỹ đạo. |
| `diameter` | Đường kính thực tế. |

Các hành tinh hiện có trong mô hình:

1. Mercury.
2. Venus.
3. Earth.
4. Mars.
5. Jupiter.
6. Saturn.
7. Uranus.
8. Neptune.

---

## 4. Đặc tả chức năng chi tiết

## 4.1. Chức năng khởi tạo cảnh 3D

### Mục đích

Tạo môi trường 3D nền tảng để render toàn bộ mô hình Hệ Mặt Trời.

### Thành phần liên quan

- `THREE.Scene`
- `THREE.WebGLRenderer`
- `THREE.PerspectiveCamera`
- `OrbitControls`
- Canvas HTML có id `canvas`

### Mô tả hoạt động

Khi ứng dụng được mở, chương trình khởi tạo một scene Three.js. Renderer được gắn với thẻ canvas để hiển thị hình ảnh 3D. Camera phối cảnh được đặt ở vị trí cao và xa so với tâm hệ, giúp người dùng quan sát toàn cảnh Hệ Mặt Trời.

Camera được cấu hình bằng `PerspectiveCamera` với góc nhìn 45 độ, mặt phẳng cắt gần `near` và mặt phẳng cắt xa `far`. Điều khiển camera được thực hiện bằng `OrbitControls`, cho phép xoay, zoom và quan sát scene bằng chuột.

### Kết quả

Người dùng nhìn thấy một không gian 3D có Mặt Trời, các hành tinh, quỹ đạo và nền sao.

---

## 4.2. Chức năng tạo Mặt Trời

### Mục đích

Hiển thị Mặt Trời ở trung tâm mô hình và đóng vai trò nguồn sáng chính.

### Thành phần liên quan

- `SphereGeometry`
- `MeshBasicMaterial`
- Texture `sunmap.jpg`
- `PointLight`
- Shader glow Fresnel

### Mô tả hoạt động

Mặt Trời được tạo bằng hình cầu với bán kính lớn hơn hành tinh. Vật liệu của Mặt Trời sử dụng `MeshBasicMaterial` để luôn sáng, không phụ thuộc vào nguồn sáng khác. Texture của Mặt Trời được tải từ đường dẫn ảnh bên ngoài.

Ngoài phần lõi, Mặt Trời còn có một lớp glow dạng corona bao quanh. Lớp này sử dụng custom shader Fresnel để tạo cảm giác phát sáng ở viền. Trong vòng lặp animation, glow của Mặt Trời được thay đổi nhẹ theo thời gian để tạo hiệu ứng dao động nhiệt.

### Kết quả

Mặt Trời xuất hiện tại trung tâm, có texture, có hiệu ứng phát sáng và cung cấp ánh sáng cho toàn bộ hệ.

---

## 4.3. Chức năng tạo hành tinh

### Mục đích

Tạo các hành tinh trong Hệ Mặt Trời với kích thước, màu sắc, texture và dữ liệu riêng.

### Thành phần liên quan

- `PLANET_DATA`
- `SphereGeometry`
- `MeshStandardMaterial`
- `TextureLoader`
- Mảng `planets`

### Mô tả hoạt động

Chương trình duyệt qua từng phần tử trong `PLANET_DATA`. Với mỗi hành tinh, hệ thống tạo một mesh hình cầu bằng `SphereGeometry`. Vật liệu mặc định là `MeshStandardMaterial`, cho phép nhận ánh sáng, bóng và texture.

Texture của từng hành tinh được tải bằng `TextureLoader`. Khi texture tải xong, chương trình gán texture vào material và đổi màu material về trắng để texture hiển thị đúng màu.

Mỗi hành tinh được lưu trong mảng `planets` dưới dạng một object gồm:

- Mesh của hành tinh.
- Dữ liệu hành tinh.
- Bán trục lớn `a`.
- Bán trục nhỏ `b`.
- Nhóm nghiêng quỹ đạo.
- Góc hiện tại `theta`.
- Tốc độ chuyển động.

### Kết quả

Tám hành tinh được hiển thị trong scene, có texture riêng và có thể chuyển động quanh Mặt Trời.

---

## 4.4. Chức năng tạo quỹ đạo elip

### Mục đích

Biểu diễn đường chuyển động của các hành tinh quanh Mặt Trời theo dạng elip.

### Thành phần liên quan

- `EllipseCurve`
- `BufferGeometry`
- `LineBasicMaterial`
- `THREE.Line`
- Mảng `orbitLines`

### Mô tả hoạt động

Với mỗi hành tinh, chương trình tính bán trục nhỏ của quỹ đạo theo công thức:

```text
b = a * sqrt(1 - e^2)
```

Trong đó:

- `a` là bán trục lớn.
- `e` là độ lệch tâm.
- `b` là bán trục nhỏ.

Đường quỹ đạo được tạo bằng `EllipseCurve`, sau đó chuyển thành `BufferGeometry`. Vì quỹ đạo trong Three.js ban đầu nằm trên mặt phẳng XY, chương trình xoay đường quỹ đạo quanh trục X để đưa quỹ đạo về mặt phẳng XZ.

Để mô phỏng quỹ đạo có tiêu điểm tại Mặt Trời, đường elip được dịch theo trục X một khoảng `c = a * e`.

### Kết quả

Mỗi hành tinh có một đường quỹ đạo elip riêng, màu sắc khác nhau và có thể bật/tắt bằng bảng điều khiển.

---

## 4.5. Chức năng mô phỏng độ nghiêng quỹ đạo

### Mục đích

Tăng tính trực quan cho mô hình bằng cách cho mỗi quỹ đạo có độ nghiêng riêng.

### Thành phần liên quan

- `THREE.Group`
- `inclinationGroup`
- Thuộc tính `i` trong `PLANET_DATA`

### Mô tả hoạt động

Mỗi hành tinh và quỹ đạo của nó được đặt trong một group riêng gọi là `inclinationGroup`. Group này được xoay theo trục Z dựa trên độ nghiêng quỹ đạo `i` của hành tinh.

Giá trị độ nghiêng được chuyển từ độ sang radian bằng `THREE.MathUtils.degToRad`.

### Kết quả

Các quỹ đạo không hoàn toàn nằm trên cùng một mặt phẳng, giúp mô hình thể hiện rõ hơn đặc trưng không gian 3D.

---

## 4.6. Chức năng mô phỏng chuyển động hành tinh

### Mục đích

Cho các hành tinh chuyển động quanh Mặt Trời và tự quay quanh trục.

### Thành phần liên quan

- Hàm `animate()`
- Thuộc tính `theta`
- Thuộc tính `speed`
- `CONFIG.revolutionSpeed`
- `CONFIG.rotationSpeed`

### Mô tả hoạt động

Trong mỗi frame render, chương trình cập nhật vị trí của từng hành tinh. Bán kính tức thời của quỹ đạo được tính theo công thức elip:

```text
r = a * (1 - e^2) / (1 + e * cos(theta))
```

Tốc độ góc được thay đổi theo khoảng cách đến Mặt Trời:

```text
angularVelocity = speed * a^2 / r^2
```

Điều này làm cho hành tinh chuyển động nhanh hơn khi ở gần Mặt Trời và chậm hơn khi ở xa Mặt Trời, mô phỏng ý tưởng từ định luật Kepler.

Vị trí hành tinh được cập nhật:

```text
x = r * cos(theta)
z = r * sin(theta)
```

Ngoài chuyển động quanh Mặt Trời, mesh của hành tinh cũng được xoay quanh trục Y để tạo hiệu ứng tự quay.

### Kết quả

Các hành tinh vừa tự quay, vừa chuyển động quanh Mặt Trời theo quỹ đạo elip với tốc độ khác nhau.

---

## 4.7. Chức năng tạo Mặt Trăng của Trái Đất

### Mục đích

Bổ sung vệ tinh tự nhiên cho Trái Đất để minh họa mô hình phân cấp.

### Thành phần liên quan

- `moonOrbit`
- `moonMesh`
- `SphereGeometry`
- `MeshStandardMaterial`

### Mô tả hoạt động

Khi hành tinh hiện tại là Earth, chương trình tạo một group con tên `moonOrbit` gắn vào mesh của Trái Đất. Mặt Trăng được tạo bằng hình cầu nhỏ và đặt lệch theo trục X.

Trong vòng lặp animation, group quỹ đạo của Mặt Trăng được xoay quanh trục Y, làm Mặt Trăng quay quanh Trái Đất.

### Kết quả

Trái Đất có một Mặt Trăng chuyển động xung quanh, thể hiện quan hệ cha - con trong scene graph.

---

## 4.8. Chức năng tạo vành đai Sao Thổ

### Mục đích

Thể hiện đặc trưng riêng của Sao Thổ.

### Thành phần liên quan

- `RingGeometry`
- `MeshBasicMaterial`
- `ringMesh`

### Mô tả hoạt động

Khi hành tinh hiện tại là Saturn, chương trình tạo một hình vành khăn bằng `RingGeometry`. Vành đai được gắn trực tiếp vào mesh của Sao Thổ, xoay để nằm quanh mặt phẳng xích đạo của hành tinh.

Vật liệu của vành đai có độ trong suốt, giúp tạo cảm giác nhẹ và thẩm mỹ.

### Kết quả

Sao Thổ có vành đai riêng, dễ phân biệt so với các hành tinh khác.

---

## 4.9. Chức năng tạo vành đai tiểu hành tinh

### Mục đích

Mô phỏng vùng tiểu hành tinh giữa Sao Hỏa và Sao Mộc.

### Thành phần liên quan

- Hàm `createAsteroidBelt()`
- `BufferGeometry`
- `PointsMaterial`
- `THREE.Points`

### Mô tả hoạt động

Chương trình sinh ngẫu nhiên 1200 điểm trong khoảng bán kính từ 50 đến 56. Các điểm này được đặt gần mặt phẳng quỹ đạo, tạo thành một vành mỏng.

Vành đai sử dụng `PointsMaterial` với blending cộng màu và độ trong suốt, giúp nhìn giống bụi/đá nhỏ trong không gian.

Trong vòng lặp animation, vành đai tiểu hành tinh được xoay chậm quanh trục Y.

### Kết quả

Giữa Sao Hỏa và Sao Mộc xuất hiện một vành đai tiểu hành tinh động.

---

## 4.10. Chức năng tạo môi trường sao và tinh vân

### Mục đích

Tạo nền không gian sinh động cho mô hình.

### Thành phần liên quan

- Hàm `createSpaceEnvironment()`
- `createStarLayer()`
- `BufferGeometry`
- `PointsMaterial`
- `nebulaGroup`

### Mô tả hoạt động

Môi trường không gian gồm hai phần chính:

1. **Starfield:** nhiều lớp sao trắng được sinh ngẫu nhiên trong không gian lớn.
2. **Nebula dust:** các đám bụi/tinh vân màu cyan, magenta và amber phân bố quanh mặt phẳng quỹ đạo.

Các lớp sao có kích thước và độ mờ khác nhau. Trong animation, opacity của từng lớp sao được thay đổi bằng hàm sin/cos để tạo hiệu ứng nhấp nháy.

Tinh vân được gom vào `nebulaGroup` và quay rất chậm theo thời gian.

### Kết quả

Không gian nền có sao nhấp nháy, bụi màu và cảm giác chiều sâu tốt hơn.

---

## 4.11. Chức năng ánh sáng và đổ bóng

### Mục đích

Tạo cảm giác vật thể 3D có sáng tối, bóng đổ và chiều sâu.

### Thành phần liên quan

- `AmbientLight`
- `PointLight`
- `shadowMap`
- `castShadow`
- `receiveShadow`

### Mô tả hoạt động

Mô hình sử dụng hai nguồn sáng:

1. **AmbientLight:** ánh sáng nền yếu giúp các vật thể không bị tối hoàn toàn.
2. **PointLight:** nguồn sáng mạnh đặt tại Mặt Trời, chiếu sáng ra toàn hệ.

Renderer bật `shadowMap`, các hành tinh bật `castShadow` và `receiveShadow`, cho phép vật thể tạo và nhận bóng.

Người dùng có thể bật/tắt hệ thống ánh sáng thông qua `lil-gui` bằng tham số `lightsEnabled`.

### Kết quả

Hành tinh có vùng sáng/tối theo hướng nguồn sáng từ Mặt Trời. Khi tắt ánh sáng, các hiệu ứng sáng và glow cũng bị ẩn.

---

## 4.12. Chức năng shader phát sáng Fresnel

### Mục đích

Tạo hiệu ứng phát sáng ở viền cho Mặt Trời, khí quyển Trái Đất và Sao Kim.

### Thành phần liên quan

- `FresnelGlowShader`
- `ShaderMaterial`
- Vertex shader
- Fragment shader

### Mô tả hoạt động

Shader Fresnel tính cường độ sáng dựa trên góc giữa pháp tuyến bề mặt và hướng nhìn của camera. Các vùng gần viền vật thể sẽ sáng hơn, tạo cảm giác vật thể có hào quang.

Shader này được dùng cho:

- Corona của Mặt Trời.
- Lớp khí quyển Trái Đất.
- Lớp khí quyển Sao Kim.

Trong animation, shader của Mặt Trời còn được thay đổi tham số `c` và `p` theo thời gian để mô phỏng dao động năng lượng.

### Kết quả

Các thiên thể có hiệu ứng phát sáng mềm, tăng tính thẩm mỹ và cảm giác không gian.

---

## 4.13. Chức năng texture mapping

### Mục đích

Áp ảnh bề mặt thật/giả lập lên các thiên thể để mô hình trực quan hơn.

### Thành phần liên quan

- `TextureLoader`
- `material.map`
- `BASE_TEXTURE_URL`
- `textureFilter`

### Mô tả hoạt động

Texture của Mặt Trời và các hành tinh được tải từ kho ảnh trực tuyến. Sau khi tải thành công, texture được gán vào thuộc tính `map` của material.

Người dùng có thể thay đổi bộ lọc texture:

- `Linear (Smooth)`: texture mượt hơn.
- `Nearest (Pixelated)`: texture dạng pixel rõ hơn.

Chức năng lọc texture được cập nhật qua `updateTextureFiltering()`.

### Kết quả

Các hành tinh có bề mặt riêng biệt, ví dụ Trái Đất có màu xanh đại dương, Sao Hỏa có bề mặt đỏ, Sao Mộc có vân khí quyển.

---

## 4.14. Chức năng chọn hành tinh bằng chuột

### Mục đích

Cho phép người dùng click trực tiếp vào hành tinh trong scene để xem chi tiết.

### Thành phần liên quan

- `Raycaster`
- `mouse`
- Sự kiện `window.addEventListener('click')`
- Hàm `selectPlanet()`

### Mô tả hoạt động

Khi người dùng click vào canvas, chương trình chuyển tọa độ chuột từ hệ tọa độ màn hình sang normalized device coordinates. Sau đó `Raycaster` được dùng để bắn tia từ camera vào scene.

Chương trình chỉ kiểm tra giao cắt với mesh của các hành tinh, không chọn các mesh phụ như khí quyển, vành đai hoặc Mặt Trăng.

Nếu tia giao với một hành tinh, hàm `selectPlanet()` được gọi.

### Điều kiện loại trừ

Click sẽ không chọn hành tinh nếu người dùng click vào:

- HUD overlay.
- Bảng thông tin hành tinh.
- Bảng lil-gui.
- Khi đang ở chế độ xem từ bề mặt hành tinh.

### Kết quả

Hành tinh được chọn, camera zoom tới hành tinh và bảng thông tin được hiển thị.

---

## 4.15. Chức năng chọn hành tinh từ HUD Sidebar

### Mục đích

Cho phép chọn hành tinh thông qua danh sách bên trái giao diện.

### Thành phần liên quan

- `buildPlanetSelectionDock()`
- `hud-planet-list`
- `syncHUDSelection()`

### Mô tả hoạt động

Chương trình tự động tạo danh sách nút hành tinh dựa trên mảng `planets`. Mỗi nút hiển thị:

- Tên hành tinh.
- Khoảng cách từ Mặt Trời.

Khi người dùng bấm một nút, hệ thống gọi `selectPlanet()` để chuyển camera tới hành tinh tương ứng.

Nếu Autopilot đang bật, thao tác chọn thủ công sẽ tự động tắt Autopilot.

### Kết quả

Người dùng có thể chọn nhanh bất kỳ hành tinh nào mà không cần click trực tiếp vào scene.

---

## 4.16. Chức năng hiển thị bảng thông tin hành tinh

### Mục đích

Hiển thị thông tin cơ bản của hành tinh đang được chọn.

### Thành phần liên quan

- `info-panel`
- `updateInfoPanel()`
- Các phần tử HTML: `planet-name`, `planet-type`, `planet-distance`, `planet-period`, `planet-diameter`

### Mô tả hoạt động

Khi một hành tinh được chọn, hàm `updateInfoPanel(data)` cập nhật nội dung bảng thông tin dựa trên dữ liệu của hành tinh.

Thông tin hiển thị gồm:

- Tên hành tinh.
- Loại hành tinh.
- Khoảng cách từ Mặt Trời.
- Chu kỳ quỹ đạo.
- Đường kính.

Bảng thông tin được thiết kế dạng holographic scanner, có hiệu ứng radar và nút thao tác.

### Kết quả

Người dùng xem được thông tin chi tiết của hành tinh đang quan sát.

---

## 4.17. Chức năng zoom camera tới hành tinh

### Mục đích

Tạo trải nghiệm chuyển cảnh mượt khi chọn hành tinh.

### Thành phần liên quan

- `selectPlanet()`
- `gsap.to()`
- `controls.target`
- `camera.position`

### Mô tả hoạt động

Khi chọn hành tinh, chương trình lấy vị trí thế giới của mesh hành tinh. Sau đó GSAP được dùng để animate:

- `controls.target` di chuyển tới vị trí hành tinh.
- `camera.position` di chuyển tới vị trí gần hành tinh.

Khoảng cách camera phụ thuộc vào kích thước hành tinh, giúp hành tinh lớn/nhỏ đều được quan sát hợp lý.

### Kết quả

Camera bay mượt tới hành tinh được chọn thay vì nhảy đột ngột.

---

## 4.18. Chức năng target reticle 3D

### Mục đích

Hiển thị vòng khóa mục tiêu quanh hành tinh đang được chọn.

### Thành phần liên quan

- `createTargetReticle()`
- `targetReticle`
- `reticleInner`
- `reticleOuter`

### Mô tả hoạt động

Reticle gồm các vòng ring và đoạn bracket màu cyan. Khi hành tinh được chọn, reticle được bật và đặt tại vị trí hành tinh.

Trong vòng lặp animation:

- Reticle luôn bám theo vị trí hành tinh.
- Vòng trong và vòng ngoài xoay ngược chiều nhau.
- Kích thước reticle được scale theo kích thước hành tinh.

### Kết quả

Người dùng dễ nhận biết hành tinh nào đang được theo dõi.

---

## 4.19. Chức năng reset góc nhìn

### Mục đích

Đưa camera và giao diện về trạng thái quan sát toàn cảnh.

### Thành phần liên quan

- `resetView()`
- Nút `DISCONNECT SCANNER`
- `infoPanel`
- `syncHUDSelection(null)`

### Mô tả hoạt động

Khi người dùng bấm nút đóng bảng thông tin, hàm `resetView()` được gọi. Hàm này:

- Tắt chế độ xem từ hành tinh nếu đang bật.
- Bật lại OrbitControls.
- Ẩn bảng thông tin.
- Bỏ trạng thái chọn hành tinh trong HUD.
- Ẩn target reticle.
- Di chuyển camera về vị trí toàn cảnh.
- Đặt lại target của camera về tâm hệ.

### Kết quả

Người dùng quay lại chế độ quan sát toàn bộ Hệ Mặt Trời.

---

## 4.20. Chức năng xem từ bề mặt hành tinh

### Mục đích

Cho phép người dùng quan sát Hệ Mặt Trời từ vị trí gần bề mặt hành tinh đã chọn.

### Thành phần liên quan

- `enterPlanetView()`
- `exitPlanetView()`
- `togglePlanetView()`
- `updatePlanetViewCamera()`
- `setupPlanetViewMouseLook()`

### Mô tả hoạt động

Khi người dùng chọn một hành tinh và bấm nút `VIEW FROM PLANET`, mô hình chuyển sang chế độ xem từ bề mặt hành tinh.

Ở chế độ này:

- Camera được đặt gần bề mặt hành tinh.
- OrbitControls bị tắt.
- Zoom và pan bị tắt.
- Mesh của hành tinh chủ được ẩn để không chắn camera.
- Người dùng có thể kéo chuột để thay đổi hướng nhìn.
- Góc pitch được giới hạn để tránh lật camera quá mức.

Camera không đứng yên tuyệt đối mà được cập nhật liên tục theo vị trí hành tinh, vì hành tinh vẫn đang chuyển động quanh Mặt Trời.

Khi bấm lại nút, chương trình thoát chế độ xem từ hành tinh và quay về trạng thái chọn hành tinh.

### Kết quả

Người dùng có trải nghiệm quan sát dạng first-person/planet-surface view từ hành tinh.

---

## 4.21. Chức năng Autopilot Tour

### Mục đích

Tự động tham quan lần lượt các hành tinh.

### Thành phần liên quan

- `toggleAutopilotMode()`
- `updateAutopilotTour()`
- `nextAutopilotTarget()`
- Nút `AUTOPILOT`

### Mô tả hoạt động

Khi bật Autopilot, mô hình tự động chọn lần lượt các hành tinh. Sau mỗi khoảng thời gian khoảng 10 giây, chương trình chuyển sang hành tinh kế tiếp.

Trước khi chuyển target, camera được tăng FOV ngắn hạn để tạo hiệu ứng warp/hyperdrive. Sau đó camera quay về FOV bình thường.

Nếu người dùng chọn hành tinh thủ công hoặc click vào scene, Autopilot sẽ tự động tắt.

### Kết quả

Mô hình có chế độ trình diễn tự động, phù hợp khi thuyết trình hoặc demo.

---

## 4.22. Chức năng điều khiển tốc độ thời gian

### Mục đích

Cho phép người dùng thay đổi tốc độ chuyển động quanh quỹ đạo.

### Thành phần liên quan

- `setupTimeChronosDock()`
- Các nút `PAUSE`, `0.25X`, `1X`, `2X`, `5X`, `10X`
- `CONFIG.revolutionSpeed`

### Mô tả hoạt động

Các nút tốc độ nằm ở footer HUD. Khi người dùng chọn một mức tốc độ, chương trình cập nhật `CONFIG.revolutionSpeed`.

Các mức tốc độ gồm:

| Nút | Giá trị tốc độ |
|---|---:|
| PAUSE | 0 |
| 0.25X | 0.25 |
| 1X | 1 |
| 2X | 2 |
| 5X | 5 |
| 10X | 10 |
### Kết quả

Người dùng có thể tạm dừng hoặc tăng tốc chuyển động quỹ đạo.

---

## 4.23. Chức năng lịch mô phỏng

### Mục đích

Hiển thị thời gian mô phỏng dạng năm và ngày trong năm.

### Thành phần liên quan

- `updateSimCalendar(deltaSeconds)`
- `simYear`
- `simSol`
- Phần tử HTML `hud-date`

### Mô tả hoạt động

Mô hình bắt đầu từ năm 2026 và Sol 148. Khi mô phỏng chạy, `simSol` tăng theo `deltaSeconds` và `CONFIG.revolutionSpeed`.

Khi `simSol` vượt 365.25, chương trình tăng năm và lấy phần dư của số ngày.

Nếu tốc độ chuyển động bằng 0, lịch mô phỏng không tăng.

### Kết quả

HUD hiển thị thời gian mô phỏng đang trôi theo tốc độ người dùng chọn.

---

## 4.24. Chức năng HUD telemetry

### Mục đích

Hiển thị thông tin trạng thái hệ thống trong giao diện.

### Thành phần liên quan

- `hud-header`
- `cam-coords`
- `fps-counter`
- `hud-date`
- `hud-footer`

### Mô tả hoạt động

HUD hiển thị các thông tin:

- Trạng thái scanner.
- Tọa độ camera hiện tại.
- Thời gian mô phỏng.
- FPS hiện tại.
- Danh sách hành tinh.
- Nút Autopilot.
- Nút điều khiển tốc độ thời gian.

Trong vòng lặp animation, tọa độ camera và FPS được cập nhật liên tục.

### Kết quả

Người dùng có giao diện điều khiển trực quan giống bảng điều khiển không gian.

---

## 4.25. Chức năng bảng điều khiển lil-gui

### Mục đích

Cho phép thay đổi tham số kỹ thuật của mô hình trong thời gian thực.

### Thành phần liên quan

- `lil-gui`
- `CONFIG`
- Các hàm update tương ứng

### Nhóm điều khiển

#### Camera Telemetry

| Tham số | Chức năng |
|---|---|
| `Near Range` | Điều chỉnh mặt phẳng cắt gần của camera. |
| `Far Range` | Điều chỉnh mặt phẳng cắt xa của camera. |

#### Shading & Materials

| Tham số | Chức năng |
|---|---|
| `Mesh Mode` | Chuyển giữa Solid và Wireframe. |
| `Shading Model` | Chọn Standard, Phong, Lambert, Normal hoặc Basic. |
| `Texture Filter` | Chọn texture mượt hoặc pixelated. |

#### Space Diagnostics & Helpers

| Tham số | Chức năng |
|---|---|
| `Glow Sources` | Bật/tắt ánh sáng và glow. |
| `Planet Orbits` | Bật/tắt đường quỹ đạo. |
| `Flat Lighting` | Bật/tắt vật liệu Basic không phụ thuộc nguồn sáng. |
| `Coordinate Axes` | Bật/tắt trục tọa độ. |
| `Ecliptic Grid` | Bật/tắt lưới mặt phẳng quỹ đạo. |

#### Time Multipliers

| Tham số | Chức năng |
|---|---|
| `Axial Rotate` | Điều chỉnh tốc độ tự quay quanh trục của hành tinh. |

### Kết quả

Người dùng có thể kiểm tra và điều chỉnh trực tiếp các yếu tố đồ họa của mô hình.

---

## 4.26. Chức năng đổi chế độ render Solid/Wireframe

### Mục đích

Minh họa cấu trúc lưới tam giác của vật thể hoặc hiển thị vật thể ở dạng đầy đủ.

### Thành phần liên quan

- `updateRenderMode()`
- `CONFIG.renderMode`

### Mô tả hoạt động

Khi người dùng đổi `Mesh Mode`, chương trình duyệt toàn bộ scene. Với các mesh hợp lệ, thuộc tính `material.wireframe` được cập nhật.

Các đối tượng đặc biệt như Mặt Trời, glow và ring được loại trừ để tránh lỗi hiển thị hoặc làm mất thẩm mỹ.

### Kết quả

Người dùng có thể quan sát mô hình ở dạng solid hoặc wireframe.

---

## 4.27. Chức năng đổi mô hình shading

### Mục đích

So sánh trực quan các mô hình vật liệu/chiếu sáng khác nhau.

### Thành phần liên quan

- `updateShadingModel()`
- `MeshStandardMaterial`
- `MeshPhongMaterial`
- `MeshLambertMaterial`
- `MeshNormalMaterial`
- `MeshBasicMaterial`

### Mô tả hoạt động

Người dùng có thể chọn một trong các mô hình shading:

| Chế độ | Ý nghĩa |
|---|---|
| Standard (PBR) | Vật liệu vật lý chuẩn, có roughness/metalness. |
| Phong | Có phản xạ specular, phù hợp minh họa highlight. |
| Lambert | Khuếch tán đơn giản, không có specular rõ. |
| Normal | Hiển thị màu theo pháp tuyến bề mặt. |
| Basic | Không chịu ảnh hưởng bởi ánh sáng. |

Khi đổi chế độ, chương trình tạo material mới, giữ lại texture nếu có, rồi gán vào mesh hành tinh.

### Kết quả

Người dùng quan sát được sự khác nhau giữa các kỹ thuật shading trong đồ họa máy tính.

---

## 4.28. Chức năng Flat Lighting

### Mục đích

Cho phép xem vật thể ở chế độ không phụ thuộc ánh sáng và bóng.

### Thành phần liên quan

- `updateFlatLighting()`
- `MeshBasicMaterial`
- `sunLight.castShadow`

### Mô tả hoạt động

Khi bật Flat Lighting, chương trình đổi material của hành tinh sang `MeshBasicMaterial`, đồng thời tắt khả năng cast/receive shadow. Khi tắt Flat Lighting, material ban đầu được khôi phục.

### Kết quả

Các hành tinh hiển thị rõ màu/texture mà không có vùng tối do ánh sáng.

---

## 4.29. Chức năng hiển thị trục tọa độ và lưới

### Mục đích

Hỗ trợ học tập và quan sát hệ tọa độ 3D.

### Thành phần liên quan

- `AxesHelper`
- `GridHelper`
- `updateHelpers()`

### Mô tả hoạt động

Mô hình tạo sẵn:

- Trục tọa độ kích thước 150.
- Lưới mặt phẳng kích thước 400, chia 80 ô.

Hai helper này mặc định bị ẩn. Người dùng có thể bật/tắt trong lil-gui.

### Kết quả

Người dùng thấy rõ hệ trục và mặt phẳng tham chiếu khi cần phân tích không gian.

---

## 4.30. Chức năng cập nhật FPS

### Mục đích

Hiển thị tốc độ render hiện tại của mô hình.

### Thành phần liên quan

- `fpsCounterElem`
- `fpsInterval`
- `deltaSeconds`

### Mô tả hoạt động

Trong vòng lặp animation, chương trình tính FPS xấp xỉ bằng:

```text
FPS = round(1 / deltaSeconds)
```

Giá trị FPS được cập nhật sau mỗi khoảng 0.5 giây để tránh thay đổi quá nhanh.

### Kết quả

Người dùng có thể theo dõi hiệu năng render của ứng dụng.

---

## 4.31. Chức năng responsive resize

### Mục đích

Đảm bảo mô hình hiển thị đúng khi thay đổi kích thước cửa sổ trình duyệt.

### Thành phần liên quan

- Sự kiện `window.addEventListener('resize')`
- `camera.aspect`
- `camera.updateProjectionMatrix()`
- `renderer.setSize()`

### Mô tả hoạt động

Khi cửa sổ trình duyệt thay đổi kích thước, chương trình cập nhật lại tỉ lệ khung hình camera và kích thước renderer.

Pixel ratio được giới hạn tối đa 2 để cân bằng chất lượng và hiệu năng.

### Kết quả

Canvas 3D luôn phủ đúng kích thước màn hình, không bị méo hình.

---

## 5. Đặc tả luồng tương tác chính

## 5.1. Luồng mở ứng dụng

1. Người dùng chạy project bằng `npm run dev`.
2. Trình duyệt mở ứng dụng Vite.
3. `index.html` tải `style.css` và `main.js`.
4. `main.js` khởi tạo scene, camera, renderer, controls.
5. Mặt Trời, hành tinh, quỹ đạo, môi trường sao và HUD được tạo.
6. Hàm `animate()` bắt đầu vòng lặp render.
7. Người dùng thấy mô hình Hệ Mặt Trời 3D.

## 5.2. Luồng chọn hành tinh

1. Người dùng click vào hành tinh hoặc bấm nút trong danh sách HUD.
2. Hệ thống xác định hành tinh được chọn.
3. Bảng thông tin được cập nhật.
4. Camera di chuyển mượt tới hành tinh.
5. Reticle bám vào hành tinh.
6. Nút hành tinh tương ứng trong HUD được đánh dấu active.

## 5.3. Luồng xem từ hành tinh

1. Người dùng chọn một hành tinh.
2. Người dùng bấm `VIEW FROM PLANET`.
3. Camera chuyển tới gần bề mặt hành tinh.
4. Mesh hành tinh chủ được ẩn khỏi render.
5. Người dùng kéo chuột để xoay hướng nhìn.
6. Khi bấm lại nút, hệ thống thoát chế độ xem từ hành tinh.

## 5.4. Luồng Autopilot

1. Người dùng bấm `AUTOPILOT`.
2. Trạng thái Autopilot chuyển sang ON.
3. Sau khoảng thời gian định kỳ, hệ thống tự chọn hành tinh kế tiếp.
4. Camera chuyển tới hành tinh đó với hiệu ứng FOV.
5. Nếu người dùng chọn thủ công, Autopilot tắt.

## 5.5. Luồng điều chỉnh tham số bằng GUI

1. Người dùng mở bảng `HUD Diagnostics`.
2. Người dùng thay đổi tham số camera, vật liệu, ánh sáng hoặc helper.
3. Hàm update tương ứng được gọi.
4. Scene cập nhật ngay lập tức mà không cần tải lại trang.

---

## 6. Đặc tả giao diện người dùng

## 6.1. HUD Header

Hiển thị:

- Trạng thái hệ thống: `SYS_STATUS: ACTIVE_SCANNER`.
- Tiêu đề: `ORBITAL SIMULATION MATRIX`.
- Tọa độ camera hiện tại.

## 6.2. Sidebar Orbital Fleet

Hiển thị danh sách hành tinh. Mỗi dòng gồm:

- Tên hành tinh.
- Khoảng cách từ Mặt Trời.

Có thêm nút bật/tắt Autopilot.

## 6.3. Footer Chronos Controls

Hiển thị:

- Thời gian mô phỏng.
- Các nút tốc độ: pause, 0.25X, 1X, 2X, 5X, 10X.
- FPS hiện tại.

## 6.4. Info Panel

Hiển thị khi chọn hành tinh. Nội dung gồm:

- Tên hành tinh.
- Loại hành tinh.
- Radar scanner trang trí.
- Khoảng cách từ Mặt Trời.
- Chu kỳ quỹ đạo.
- Đường kính.
- Nút xem từ hành tinh.
- Nút đóng scanner/reset view.

## 6.5. lil-gui Panel

Bảng điều khiển kỹ thuật cho phép thay đổi thông số đồ họa và camera.

---

## 7. Đặc tả kỹ thuật đồ họa

## 7.1. Hình học sử dụng

| Đối tượng | Hình học |
|---|---|
| Mặt Trời | `SphereGeometry` |
| Hành tinh | `SphereGeometry` |
| Mặt Trăng | `SphereGeometry` |
| Vành đai Sao Thổ | `RingGeometry` |
| Quỹ đạo | `EllipseCurve` + `Line` |
| Vành đai tiểu hành tinh | `BufferGeometry` + `Points` |
| Sao nền | `BufferGeometry` + `Points` |
| Tinh vân | `BufferGeometry` + `Points` |
| Target reticle | `RingGeometry` |

## 7.2. Vật liệu sử dụng

| Vật liệu | Vai trò |
|---|---|
| `MeshBasicMaterial` | Mặt Trời, ring, chế độ không ánh sáng. |
| `MeshStandardMaterial` | Vật liệu mặc định của hành tinh. |
| `MeshPhongMaterial` | Chế độ shading Phong. |
| `MeshLambertMaterial` | Chế độ shading Lambert. |
| `MeshNormalMaterial` | Chế độ hiển thị pháp tuyến. |
| `ShaderMaterial` | Hiệu ứng Fresnel glow. |
| `PointsMaterial` | Sao nền, tinh vân, tiểu hành tinh. |
| `LineBasicMaterial` | Đường quỹ đạo. |

## 7.3. Kỹ thuật tương tác

| Kỹ thuật | Vai trò |
|---|---|
| OrbitControls | Xoay/zoom camera toàn cảnh. |
| Raycaster | Chọn hành tinh bằng click chuột. |
| GSAP Tween | Chuyển động camera mượt. |
| Pointer Events | Xoay hướng nhìn trong chế độ xem từ hành tinh. |
| lil-gui | Điều chỉnh tham số runtime. |

---

## 8. Yêu cầu cài đặt và chạy chương trình

## 8.1. Yêu cầu môi trường

- Máy tính có trình duyệt hiện đại hỗ trợ WebGL.
- Node.js đã được cài đặt.
- npm đã được cài đặt kèm Node.js.

## 8.2. Cài đặt thư viện

Tại thư mục project, chạy:

```bash
npm install
```

Các thư viện chính:

- `three`: thư viện đồ họa 3D.
- `gsap`: tạo animation mượt.
- `lil-gui`: tạo bảng điều khiển runtime.
- `vite`: server phát triển và build project.

## 8.3. Chạy project

```bash
npm run dev
```

Sau đó mở địa chỉ do Vite cung cấp, thường là:

```text
http://localhost:5173
```

## 8.4. Build project

```bash
npm run build
```

## 8.5. Xem bản build

```bash
npm run preview
```

---

## 9. Đánh giá mức độ đáp ứng yêu cầu đồ họa máy tính

| Yêu cầu/khía cạnh | Mức độ đáp ứng |
|---|---|
| Vẽ đối tượng 3D cơ bản | Đáp ứng: dùng sphere, ring, line, points. |
| Phép biến đổi hình học | Đáp ứng: translate, rotate, scale, group transform. |
| Camera LookAt / quan sát | Đáp ứng: camera nhìn tâm hệ, hành tinh, surface view. |
| Chiếu sáng | Đáp ứng: ambient light, point light, shadow. |
| Texture mapping | Đáp ứng: texture cho Mặt Trời và hành tinh. |
| Animation | Đáp ứng: orbit, rotation, twinkle, glow, autopilot. |
| Tương tác người dùng | Đáp ứng: click chọn, HUD, GUI, speed control. |
| Scene graph phân cấp | Đáp ứng: Trái Đất chứa Moon orbit, hành tinh nằm trong inclination group. |
| Shader tùy chỉnh | Đáp ứng: Fresnel glow shader. |

---

## 10. Hạn chế hiện tại

1. Tỷ lệ kích thước và khoảng cách hành tinh đã được thu nhỏ và điều chỉnh để dễ quan sát, không phải tỷ lệ thực tuyệt đối.
2. Texture được tải từ nguồn trực tuyến, nên cần kết nối Internet để hiển thị đầy đủ texture.
3. Mô phỏng quỹ đạo chỉ mang tính trực quan, không phải mô phỏng vật lý thiên văn chính xác hoàn toàn.
4. Chỉ có Mặt Trăng của Trái Đất, chưa có vệ tinh của các hành tinh khác.
5. Chưa có âm thanh, chú thích nâng cao hoặc chức năng tìm kiếm hành tinh.
6. Dữ liệu hành tinh được khai báo tĩnh trong code, chưa đọc từ file JSON/API.

---

## 11. Hướng phát triển đề xuất

1. Bổ sung thêm vệ tinh cho Sao Mộc, Sao Thổ, Sao Thiên Vương và Sao Hải Vương.
2. Thêm dữ liệu chi tiết hơn cho từng hành tinh như khối lượng, trọng lực, nhiệt độ, số vệ tinh.
3. Thêm chế độ tìm kiếm hành tinh theo tên.
4. Thêm nhãn 3D hiển thị tên hành tinh trực tiếp trong scene.
5. Thêm tùy chọn bật/tắt texture trực tiếp trong GUI.
6. Tách dữ liệu hành tinh ra file JSON để dễ bảo trì.
7. Thêm chế độ giáo dục: giải thích quỹ đạo elip, độ nghiêng, ánh sáng, shader.
8. Thêm hiệu ứng âm thanh nền hoặc âm thanh khi chọn hành tinh.
9. Tối ưu cho thiết bị yếu bằng cách giảm số lượng particle hoặc giảm độ phân giải hình cầu.
10. Bổ sung chế độ toàn màn hình và hướng dẫn phím tắt.

---

## 12. Kết luận

Mô hình 3D Solar System Simulation là một ứng dụng mô phỏng Hệ Mặt Trời trực quan, có tương tác và có nhiều thành phần đồ họa máy tính quan trọng. Project không chỉ hiển thị các thiên thể trong không gian 3D mà còn tích hợp quỹ đạo elip, ánh sáng, texture, shader glow, camera animation, HUD, Autopilot và bảng điều khiển runtime.

Với các chức năng hiện có, mô hình phù hợp để trình bày trong học phần Đồ họa máy tính, đặc biệt ở các nội dung về dựng hình 3D, phép biến đổi, camera, chiếu sáng, texture mapping và tương tác người dùng.
