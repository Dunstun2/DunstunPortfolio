# 🔗 Update Comrades360 Link

## Footer Link Configuration

The footer now displays **"Powered by Comrades360"** with a clickable link.

---

## 📍 Current Status

**File:** `frontend/src/components/layout/Footer.tsx`

**Current Code:**
```tsx
<Link 
  href="#" 
  target="_blank"
  className="text-primary hover:text-primary-hover transition-colors duration-200 hover:underline"
  rel="noopener noreferrer"
>
  Comrades360
</Link>
```

**Current Link:** `#` (placeholder)

---

## 🔧 How to Update the Link

### When you're ready to set the actual URL:

**1. Open the file:**
```
frontend/src/components/layout/Footer.tsx
```

**2. Find this line (around line 47):**
```tsx
href="#" 
```

**3. Replace `#` with your URL:**

**Option A: External Website**
```tsx
href="https://comrades360.com" 
```

**Option B: Social Media Profile**
```tsx
href="https://twitter.com/comrades360" 
```

**Option C: Contact Page**
```tsx
href="mailto:info@comrades360.com" 
```

**Option D: Portfolio Page**
```tsx
href="https://yourportfolio.com/comrades360" 
```

---

## 📝 Example Updates

### Example 1: Company Website
```tsx
<Link 
  href="https://comrades360.com" 
  target="_blank"
  className="text-primary hover:text-primary-hover transition-colors duration-200 hover:underline"
  rel="noopener noreferrer"
>
  Comrades360
</Link>
```

### Example 2: LinkedIn Profile
```tsx
<Link 
  href="https://linkedin.com/company/comrades360" 
  target="_blank"
  className="text-primary hover:text-primary-hover transition-colors duration-200 hover:underline"
  rel="noopener noreferrer"
>
  Comrades360
</Link>
```

### Example 3: Email Contact
```tsx
<Link 
  href="mailto:contact@comrades360.com" 
  target="_blank"
  className="text-primary hover:text-primary-hover transition-colors duration-200 hover:underline"
  rel="noopener noreferrer"
>
  Comrades360
</Link>
```

---

## 🎨 Footer Appearance

### Current Display:
```
© 2026 My Portfolio. Powered by Comrades360.
                                  ^^^^^^^^^^
                                  (clickable link)
```

### Visual Style:
- **Text Color:** Primary theme color
- **Hover Effect:** 
  - Changes to primary-hover color
  - Underline appears
- **Transition:** Smooth 200ms animation
- **Security:** Opens in new tab with security attributes

---

## 🔒 Security Features

The link includes these security attributes:

- `target="_blank"` - Opens in new tab
- `rel="noopener noreferrer"` - Prevents security vulnerabilities
  - `noopener` - Prevents access to `window.opener`
  - `noreferrer` - Doesn't send referrer information

---

## ⚙️ Alternative: Make it Dynamic (CMS-Controlled)

If you want to control this link from the admin panel:

### Step 1: Add to Settings Model

Add this field to the settings in your admin panel:
- **Key:** `footer_powered_by_url`
- **Value:** `https://comrades360.com`

### Step 2: Update Footer Component

```tsx
'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/utils/api';
import Link from 'next/link';
import { getSocialIcon } from '@/utils/socialIcons';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  
  const [socials, setSocials] = useState<any[]>([]);
  const [poweredByUrl, setPoweredByUrl] = useState('#');

  useEffect(() => {
    // Fetch socials
    fetchApi('/social')
      .then(res => {
        if (res.success) setSocials(res.data || []);
      })
      .catch(() => {});

    // Fetch powered by URL from settings
    fetchApi('/settings/footer_powered_by_url')
      .then(res => {
        if (res.success && res.data?.value) {
          setPoweredByUrl(res.data.value);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="w-full glass py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        {socials.length > 0 && (
          <div className="flex gap-4 mb-6">
            {socials.map((social: any) => {
              const href = social.url?.startsWith('http') ? social.url : `https://${social.url}`;
              return (
                <Link 
                  key={social.id} 
                  href={href} 
                  target="_blank" 
                  className="w-11 h-11 rounded-full bg-slate-900/80 dark:bg-slate-800/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-white hover:border-primary hover:scale-110 hover:shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)] transition-all duration-300 shadow-md"
                  title={social.platform_name}
                >
                  {getSocialIcon(social.platform_name)}
                </Link>
              );
            })}
          </div>
        )}
        <p className="text-muted-light text-sm">
          &copy; {new Date().getFullYear()} My Portfolio. Powered by{' '}
          <Link 
            href={poweredByUrl} 
            target="_blank"
            className="text-primary hover:text-primary-hover transition-colors duration-200 hover:underline"
            rel="noopener noreferrer"
          >
            Comrades360
          </Link>
          .
        </p>
      </div>
    </footer>
  );
}
```

---

## 📋 Summary

### What Was Changed:
- ❌ Removed: "Built with Next.js and Express."
- ✅ Added: "Powered by Comrades360" with clickable link

### Current Status:
- **Text:** "Powered by Comrades360"
- **Link:** `#` (placeholder)
- **File:** `frontend/src/components/layout/Footer.tsx`

### To Update Later:
1. Open `frontend/src/components/layout/Footer.tsx`
2. Find `href="#"`
3. Replace with your desired URL
4. Save and rebuild frontend

### OR Make it Dynamic:
- Add `footer_powered_by_url` setting in admin panel
- Fetch from settings API in Footer component
- Update via admin without code changes

---

**Updated:** July 24, 2026  
**Status:** ✅ Changed to "Powered by Comrades360"  
**Action Required:** Update href="#" with actual URL when ready
