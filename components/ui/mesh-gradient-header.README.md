# Mesh Gradient Header Component 🎨

Modern, animated gradient header components with floating blobs and pattern overlay.

## Components

### `MeshGradientHeader`
Used for header sections within pages (with padding already applied).

```tsx
import { MeshGradientHeader } from '@/components/ui/mesh-gradient-header';

<MeshGradientHeader>
  <div className="flex justify-between items-center">
    <h1 className="text-3xl font-bold text-white">Page Title</h1>
    <Button>Action</Button>
  </div>
</MeshGradientHeader>
```

### `MeshGradientSection`
Used for full-width hero sections (text is already white).

```tsx
import { MeshGradientSection } from '@/components/ui/mesh-gradient-header';

<MeshGradientSection className="mt-4">
  <div className="flex gap-6">
    <h1 className="text-4xl font-bold">Welcome</h1>
    <p className="text-white/80">Your description here</p>
  </div>
</MeshGradientSection>
```

## Features

✨ **Animated Mesh Gradient** - Smooth color transitions across 5 vibrant colors
🎭 **Floating Blobs** - Three animated blob shapes with different delays
🌐 **Pattern Overlay** - Subtle geometric pattern for depth
💫 **Modern Design** - 2024-2025 design trends

## Customization

Both components accept a `className` prop for additional styling:

```tsx
<MeshGradientHeader className="mb-8">
  {/* Your content */}
</MeshGradientHeader>
```

## Animation Details

- **Gradient Animation**: 15s infinite loop
- **Blob Animation**: 7s infinite with staggered delays (0s, 2s, 4s)
- **Colors**: Purple → Indigo → Pink → Blue → Cyan spectrum

## Migration from Old Gradient

**Before:**
```tsx
<div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 rounded-3xl">
  {/* content */}
</div>
```

**After:**
```tsx
<MeshGradientHeader>
  {/* content */}
</MeshGradientHeader>
```

## Notes

- Content inside is automatically positioned relatively
- Padding is already applied (p-8 lg:p-10)
- Shadow and border-radius are included
- Works great with white text and glassmorphism effects
