# Branding & Theme Customization Guide

## Overview

The HR & Project Management SaaS platform now includes comprehensive branding and theme customization capabilities. Both **Company Admins** and **Super Admins** can customize the appearance, colors, and branding of their workspaces.

## Features

### Company Admin Capabilities

Company Admins can fully customize their company's workspace appearance:

1. **Brand Colors**
   - Primary Color (buttons, highlights, main brand color)
   - Secondary Color (supporting elements)
   - Accent Color (success states, call-to-actions)

2. **Theme Mode**
   - Light Mode
   - Dark Mode
   - Auto (follows system preference)

3. **Logos & Assets**
   - Company logo
   - Favicon
   - Custom company display name

4. **Preset Themes**
   - Ocean Blue
   - Forest Green
   - Sunset Orange
   - Purple Rain
   - Crimson Red
   - Midnight

5. **Live Preview**
   - See changes in real-time
   - Preview buttons, cards, and UI elements with new colors

### Super Admin Capabilities

Super Admins have additional company-level controls:

1. **All Company Admin Features** - Can customize any company's branding
2. **Domain Configuration**
   - Platform subdomain setup (e.g., `acme-corp.yourplatform.com`)
   - Custom domain configuration (e.g., `app.acmecorp.com`)
3. **Initial Brand Setup** - Configure branding when creating new companies
4. **Theme Override** - Can modify themes for any company

## Accessing Branding Settings

### For Company Admins

1. Login with admin credentials
2. Navigate to **Settings** → **Company Settings**
3. Click on the **Branding & Theme** tab
4. Make your customizations
5. Click **Save Branding**

### For Super Admins

#### When Creating a Company
1. Login as Super Admin (`superadmin@platform.com`)
2. Navigate to **Companies** → **New Company**
3. Fill in company details
4. Configure **Domain Configuration** section
5. Configure **Brand Colors** section
6. Click **Create Company**

#### When Editing an Existing Company
1. Navigate to **Companies**
2. Click on a company's action menu
3. Select **Edit**
4. Update domain and branding settings
5. Click **Update Company**

## Branding Settings Tabs

### 1. Colors Tab

Configure your company's color palette:

- **Primary Color**: Main brand color for buttons, links, and highlights
- **Secondary Color**: Supporting color for secondary UI elements
- **Accent Color**: Success states and accent elements
- **Color Preview**: See your colors in action
- **Preset Themes**: Quick start with pre-designed color schemes

**Example Usage:**
```
Primary: #007bff (Blue)
Secondary: #6c757d (Gray)
Accent: #28a745 (Green)
```

### 2. Logos & Assets Tab

Upload and configure visual assets:

- **Logo URL**: Company logo (recommended: PNG/SVG, 200x50px)
- **Favicon URL**: Browser tab icon (recommended: ICO/PNG, 32x32px)
- **Company Display Name**: How your company name appears in the UI
- **Logo Preview**: Validate logo appearance

**Example Usage:**
```
Logo URL: https://cdn.acmecorp.com/logo.png
Favicon URL: https://cdn.acmecorp.com/favicon.ico
Display Name: Acme Corp
```

### 3. Theme Mode Tab

Choose the default theme for all users:

- **Light Mode**: Traditional light background
- **Dark Mode**: Dark background for reduced eye strain
- **Auto**: Follows user's system preference

**Note:** This affects all users in your workspace.

### 4. Preview Tab

Live preview of how your branding will appear:

- Buttons in primary color
- Outline buttons
- Cards with color accents
- Company name display

## Domain Configuration (Super Admin Only)

### Platform Subdomain

Every company gets a subdomain on your platform:

```
Format: [company-slug].yourplatform.com
Example: acme-corp.yourplatform.com
```

**Configuration:**
- Set during company creation
- Automatically derived from company slug
- Can be modified by Super Admin

### Custom Domain

Companies on Professional and Enterprise plans can use custom domains:

```
Example: app.acmecorp.com
```

**Requirements:**
- Professional or Enterprise plan
- DNS configuration (CNAME record)
- SSL certificate setup

**DNS Setup:**
```
Type: CNAME
Name: app
Value: yourplatform.com
```

## Color Customization Guide

### Choosing Brand Colors

**Primary Color** - Your main brand identity
- Should have good contrast against white
- Used for CTAs, buttons, navigation highlights
- Examples: #007bff (Blue), #dc3545 (Red), #28a745 (Green)

**Secondary Color** - Supporting elements
- Usually a neutral color
- Used for backgrounds, borders, inactive states
- Examples: #6c757d (Gray), #6c757d (Dark Gray)

**Accent Color** - Success and highlights
- Complements primary color
- Used for success messages, badges, accents
- Examples: #28a745 (Green), #ffc107 (Yellow)

### Color Accessibility

Ensure colors meet WCAG AA standards:
- **Contrast Ratio**: Minimum 4.5:1 for text
- **Color Blindness**: Test with color blind simulators
- **Readability**: Ensure text is readable on colored backgrounds

### Preset Themes

Quick start options with professionally designed palettes:

| Theme | Primary | Secondary | Accent | Best For |
|-------|---------|-----------|--------|----------|
| Ocean Blue | #0077be | #6c757d | #00a8e8 | Tech companies |
| Forest Green | #28a745 | #6c757d | #5cb85c | Environmental, health |
| Sunset Orange | #ff6b35 | #6c757d | #f7931e | Creative, dynamic |
| Purple Rain | #8b5cf6 | #6c757d | #a78bfa | Modern, innovative |
| Crimson Red | #dc3545 | #6c757d | #e74c3c | Bold, assertive |
| Midnight | #1a1a2e | #16213e | #0f3460 | Professional, sleek |

## Theme Application

### How Themes Are Applied

When you save branding settings:

1. **CSS Variables Updated**: Primary and accent colors are converted to HSL and applied to CSS custom properties
2. **Theme Mode Applied**: Light/dark mode classes are toggled
3. **Local Storage**: Settings are cached for performance
4. **Real-time Update**: Changes apply immediately without page refresh

### CSS Variable Mapping

```css
--primary: [HSL value from primary_color]
--accent: [HSL value from accent_color]
```

### Theme Mode Classes

- Light Mode: No `dark` class
- Dark Mode: `dark` class added to root element
- Auto: Follows `@media (prefers-color-scheme: dark)`

## Company Settings Structure

### Company Profile Tab
- Company name, country, timezone
- Work week configuration
- Standard daily hours

### Branding & Theme Tab (NEW)
- Complete color customization
- Logo and asset management
- Theme mode configuration
- Live preview

### Locations Tab
- Office locations management
- Timezone per location
- Address information

### Attendance Rules Tab
- Shift timings
- Grace periods
- Weekly off days

### Timesheet Settings Tab
- Submission periods
- Deadlines
- Minimum hours

### Holidays Tab
- Company holidays
- Regional holidays
- Custom holiday management

## API Integration (For Development)

### Company Branding Object

```typescript
{
  branding: {
    primary_color: string;      // Hex color
    secondary_color: string;    // Hex color
    accent_color: string;       // Hex color
    theme_mode: 'light' | 'dark' | 'auto';
    logo_url?: string;
    favicon_url?: string;
    company_name_display?: string;
  }
}
```

### Domain Configuration Object

```typescript
{
  domain: string;              // Subdomain slug
  custom_domain?: string;      // Full custom domain
}
```

### Update Company Branding Endpoint

```typescript
PUT /api/companies/{id}/branding
{
  primary_color: "#007bff",
  secondary_color: "#6c757d",
  accent_color: "#28a745",
  theme_mode: "light",
  logo_url: "https://...",
  favicon_url: "https://..."
}
```

## Best Practices

### For Company Admins

1. **Test Colors**: Use the preview tab before saving
2. **Accessibility**: Ensure good contrast ratios
3. **Consistency**: Align with your company's brand guidelines
4. **Logo Quality**: Use high-resolution logos (PNG or SVG)
5. **Theme Choice**: Consider user preferences when choosing light/dark

### For Super Admins

1. **Domain Setup**: Configure DNS before enabling custom domains
2. **Plan Limits**: Only allow custom domains for paid plans
3. **Branding Review**: Review company branding for consistency
4. **Default Themes**: Set sensible defaults for new companies
5. **SSL Certificates**: Ensure SSL is configured for custom domains

## Troubleshooting

### Colors Not Applying
- Clear browser cache
- Check if colors are valid hex codes
- Ensure JavaScript is enabled
- Refresh the page

### Logo Not Displaying
- Verify URL is accessible (check CORS)
- Ensure image format is supported (PNG, SVG, JPG)
- Check image dimensions
- Try different URL

### Custom Domain Not Working
- Verify DNS CNAME record
- Check SSL certificate
- Confirm plan allows custom domains
- Allow 24-48 hours for DNS propagation

### Theme Mode Stuck
- Clear localStorage
- Check browser compatibility
- Verify theme_mode value is valid
- Try incognito mode

## Future Enhancements

1. **Font Customization**: Custom fonts per company
2. **Advanced Themes**: More UI element customization
3. **Component Library**: Customizable component styles
4. **Email Branding**: Branded email templates
5. **Mobile Apps**: Theme sync to mobile applications
6. **White Label**: Complete platform rebranding
7. **CSS Export**: Export theme as CSS file
8. **Theme Templates**: More preset theme options

## Security Considerations

1. **URL Validation**: All logo/favicon URLs are validated
2. **XSS Prevention**: Color inputs are sanitized
3. **Domain Verification**: Custom domains require DNS verification
4. **Plan Enforcement**: Feature access based on subscription plan
5. **Audit Logging**: All branding changes are logged

## Support

For assistance with branding customization:

- **Company Admins**: Contact your platform administrator
- **Super Admins**: Refer to platform documentation
- **Technical Issues**: Submit a support ticket
- **Design Help**: Consult with our design team

---

**Last Updated**: November 2024
**Version**: 2.0
