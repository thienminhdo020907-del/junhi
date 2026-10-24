# Junhi – Nhật ký & Mood

Web app (PWA) ghi nhật ký và theo dõi tâm trạng hằng ngày. Giao diện tiếng Việt, ưu tiên điện thoại.
Dữ liệu lưu cục bộ trong IndexedDB, không có backend.

## Công nghệ

React 19 · TypeScript · Vite · Tailwind CSS v4 · Dexie (IndexedDB) · React Router · vite-plugin-pwa

## Cấu trúc thư mục

```
src/
├─ components/   Layout, Sidebar (desktop/tablet), BottomNav (điện thoại), ...
├─ constants/    Hằng số toàn app (route, mục điều hướng, tag cảm xúc)
├─ db/           Dexie schema và hook truy vấn dữ liệu
├─ lib/          Hàm tiện ích thuần (date, mood)
├─ pages/        Hôm nay, Lịch, Nhật ký, Thống kê, Cài đặt; pages/calendar chứa các chế độ xem Lịch
├─ App.tsx       Khai báo router
└─ main.tsx      Điểm vào
```

Giao diện desktop-first: sidebar đầy đủ (>= 1024px), thu gọn còn icon (768–1023px), thanh điều hướng dưới cùng trên điện thoại (< 768px).

Import dùng alias `@/` trỏ tới `src/` (ví dụ `import { db } from '@/db/db'`).

## Lệnh

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Chạy dev server |
| `npm run build` | Kiểm tra kiểu và build production |
| `npm run preview` | Xem bản build |
| `npm run lint` | Chạy oxlint |
| `npm run format` | Định dạng code bằng Prettier |

## Quy ước

- Màu mood định nghĩa bằng biến CSS `--mood-1..5` trong `src/index.css` (có bản dark mode).
- Ngày lưu dạng chuỗi `YYYY-MM-DD` theo giờ địa phương.
- Chữ hiển thị cho người dùng viết bằng tiếng Việt.
