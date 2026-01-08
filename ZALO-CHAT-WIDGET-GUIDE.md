# Hướng dẫn: Zalo Chat Widget (Bubble Widget)

## Tổng quan
Zalo Chat Widget là một widget nổi (floating bubble) hiển thị ở góc màn hình, cho phép người dùng chat trực tiếp với Zalo Official Account (OA) của bạn mà không cần rời khỏi trang web.

## Các file đã tạo/sửa đổi

### 1. **components/zalo/zalo-chat-widget.tsx** (MỚI)
Component React chứa Zalo Chat Widget với các tính năng:
- Tự động load Zalo SDK từ `https://sp.zalo.me/plugins/sdk.js`
- Hiển thị bubble widget với OA ID: `194643797257239355`
- Message chào mừng: "Rất vui khi được hỗ trợ bạn!"
- Không tự động popup (`data-autopopup="0"`)

### 2. **app/layout.tsx** (CẬP NHẬT)
Đã thêm `<ZaloChatWidget />` vào root layout để widget hiển thị trên toàn bộ website.

## Chi tiết Component

```tsx
"use client";

import { useEffect } from "react";

export function ZaloChatWidget() {
  useEffect(() => {
    // Load Zalo SDK script
    const script = document.createElement("script");
    script.src = "https://sp.zalo.me/plugins/sdk.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      className="zalo-chat-widget"
      data-oaid="194643797257239355"
      data-welcome-message="Rất vui khi được hỗ trợ bạn!"
      data-autopopup="0"
      data-width=""
      data-height=""
    />
  );
}
```

## Cấu hình Widget

### Các thuộc tính (data attributes):

| Thuộc tính | Giá trị | Mô tả |
|------------|---------|-------|
| `data-oaid` | `194643797257239355` | ID của Zalo Official Account |
| `data-welcome-message` | `"Rất vui khi được hỗ trợ bạn!"` | Tin nhắn chào mừng khi mở chat |
| `data-autopopup` | `0` | Không tự động mở popup (0 = tắt, 1 = bật) |
| `data-width` | `""` | Chiều rộng popup (để trống = mặc định) |
| `data-height` | `""` | Chiều cao popup (để trống = mặc định) |

### Tùy chỉnh cấu hình:

#### 1. Thay đổi OA ID
```tsx
data-oaid="YOUR_OA_ID_HERE"
```

#### 2. Bật tự động popup
```tsx
data-autopopup="1"
```

#### 3. Tùy chỉnh kích thước popup
```tsx
data-width="400"
data-height="600"
```

#### 4. Thay đổi tin nhắn chào
```tsx
data-welcome-message="Xin chào! Chúng tôi có thể giúp gì cho bạn?"
```

## Cách hoạt động

### 1. **Khi trang web load:**
- Component `ZaloChatWidget` được render
- `useEffect` chạy và thêm Zalo SDK script vào `<body>`
- Zalo SDK tự động phát hiện element với class `zalo-chat-widget`
- Widget bubble hiển thị ở góc dưới bên phải màn hình

### 2. **Khi người dùng click vào bubble:**
- Cửa sổ chat Zalo mở ra
- Hiển thị tin nhắn chào mừng
- Người dùng có thể chat trực tiếp với OA

### 3. **Khi component unmount:**
- Script được cleanup để tránh memory leak

## Vị trí hiển thị

Widget sẽ hiển thị trên **TẤT CẢ** các trang của website vì được thêm vào `app/layout.tsx` - root layout.

### Để ẩn widget trên một số trang cụ thể:

**Cách 1: Conditional rendering trong layout**
```tsx
export function ZaloChatWidget({ hideOnPaths = [] }: { hideOnPaths?: string[] }) {
  const pathname = usePathname();
  
  if (hideOnPaths.some(path => pathname.startsWith(path))) {
    return null;
  }
  
  // ... rest of component
}

// Trong layout.tsx:
<ZaloChatWidget hideOnPaths={['/auth', '/admin']} />
```

**Cách 2: CSS để ẩn**
```css
/* Ẩn trên trang auth */
.auth-page .zalo-chat-widget {
  display: none !important;
}
```

## Responsive Design

Widget Zalo tự động responsive:
- **Desktop**: Bubble size lớn hơn, popup rộng hơn
- **Mobile**: Bubble size nhỏ hơn, popup full screen hoặc bottom sheet
- **Tablet**: Kích thước trung bình

## Tích hợp với Zalo OA

### Yêu cầu:
1. Phải có Zalo Official Account (OA)
2. OA phải được kích hoạt và verified
3. Đã cấu hình plugin Chat Widget trong Zalo OA Admin

### Cách lấy OA ID:
1. Truy cập https://oa.zalo.me/
2. Chọn OA của bạn
3. Vào **Cài đặt** → **Thông tin OA**
4. Copy **OA ID** (dạng số dài)

### Cách cấu hình Chat Widget trong Zalo OA:
1. Vào https://oa.zalo.me/
2. Chọn **Công cụ** → **Chat Plugin**
3. Bật **Chat Plugin for Website**
4. Tùy chỉnh:
   - Màu sắc bubble
   - Vị trí hiển thị (trái/phải)
   - Tin nhắn chào mặc định
   - Thời gian hiển thị
5. Copy code và sử dụng OA ID trong component

## Testing

### 1. Kiểm tra Widget hiển thị:
- Mở bất kỳ trang nào trên website
- Kiểm tra góc dưới bên phải có bubble Zalo không
- Bubble thường có icon Zalo màu xanh/trắng

### 2. Kiểm tra chức năng chat:
- Click vào bubble
- Popup chat Zalo mở ra
- Thử gửi tin nhắn
- Kiểm tra tin nhắn có đến OA không (xem trong Zalo OA Admin)

### 3. Kiểm tra responsive:
- Test trên desktop (Chrome DevTools)
- Test trên mobile (iOS Safari, Android Chrome)
- Test trên tablet
- Kiểm tra widget không che khuất content quan trọng

### 4. Kiểm tra performance:
- Mở DevTools Network tab
- Kiểm tra Zalo SDK script load thành công
- Thời gian load không ảnh hưởng đến trang
- Không có lỗi console

## Troubleshooting

### Vấn đề 1: Widget không hiển thị
**Nguyên nhân:**
- Zalo SDK script chưa load
- OA ID không đúng
- OA chưa kích hoạt Chat Plugin

**Giải pháp:**
1. Check console có lỗi không
2. Kiểm tra Network tab xem script có load không
3. Verify OA ID đúng
4. Kiểm tra OA settings trong Zalo OA Admin

### Vấn đề 2: Widget hiển thị nhưng không chat được
**Nguyên nhân:**
- OA chưa kích hoạt
- OA bị khóa tính năng chat
- User chưa follow OA

**Giải pháp:**
1. Kiểm tra trạng thái OA
2. User cần follow OA trước khi chat (tùy cấu hình)
3. Kiểm tra settings "Cho phép chat từ website"

### Vấn đề 3: Widget che khuất content
**Nguyên nhân:**
- Widget position mặc định trùng với nút khác

**Giải pháp:**
- Sử dụng CSS để điều chỉnh vị trí:
```css
.zalo-chat-widget {
  bottom: 80px !important; /* Nâng lên cao hơn */
  right: 20px !important;
}
```

### Vấn đề 4: Script load chậm
**Nguyên nhân:**
- Mạng chậm
- Zalo server chậm

**Giải pháp:**
- Script đã set `async` nên không block page render
- Có thể thêm loading state nếu cần

### Vấn đề 5: Widget hiển thị duplicate
**Nguyên nhân:**
- Component bị render nhiều lần
- Script bị load duplicate

**Giải pháp:**
- Kiểm tra component chỉ được import 1 lần trong layout
- useEffect cleanup đảm bảo script không duplicate

## Performance Optimization

### 1. Lazy Loading (Optional)
Nếu muốn load widget chỉ khi cần:
```tsx
import dynamic from 'next/dynamic';

const ZaloChatWidget = dynamic(
  () => import('@/components/zalo/zalo-chat-widget').then(mod => ({ default: mod.ZaloChatWidget })),
  { ssr: false }
);
```

### 2. Defer Script Loading
Widget đã sử dụng `async` cho script, nhưng có thể thêm defer:
```tsx
script.defer = true;
```

## Best Practices

1. ✅ **Chỉ thêm 1 lần trong layout** - Tránh duplicate widget
2. ✅ **Cleanup script** - Sử dụng return function trong useEffect
3. ✅ **Async loading** - Không block page render
4. ✅ **Responsive design** - Test trên nhiều devices
5. ✅ **Accessibility** - Widget không che khuất nội dung chính
6. ✅ **Performance monitoring** - Kiểm tra script load time
7. ✅ **Error handling** - Monitor console errors
8. ✅ **OA verification** - Đảm bảo OA active và verified

## Tính năng nâng cao

### 1. Tracking user interactions
```tsx
useEffect(() => {
  // Listen to Zalo widget events
  window.addEventListener('zalo-chat-opened', () => {
    // Track analytics
    console.log('User opened Zalo chat');
  });
}, []);
```

### 2. Custom styling
```css
/* Tùy chỉnh bubble appearance */
.zalo-chat-widget iframe {
  border-radius: 50% !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
}
```

### 3. Multiple OA support
Nếu cần hỗ trợ nhiều OA (ví dụ: sales, support):
```tsx
export function ZaloChatWidget({ oaId, message }: Props) {
  return (
    <div
      className="zalo-chat-widget"
      data-oaid={oaId}
      data-welcome-message={message}
      // ...
    />
  );
}
```

## Kết luận

Zalo Chat Widget giúp:
- ✅ Tăng engagement với khách hàng
- ✅ Hỗ trợ khách hàng real-time
- ✅ Không cần rời khỏi website
- ✅ Dễ dàng tích hợp (chỉ 1 component)
- ✅ Tự động responsive
- ✅ Performance tốt (async loading)

Widget sẽ tự động hiển thị trên toàn bộ website sau khi refresh trang!
