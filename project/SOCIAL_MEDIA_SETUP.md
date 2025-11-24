# Social Media Connection Setup Guide

To allow your users to connect their social media accounts, you need to create "Apps" on each social platform's developer portal. These apps provide the **Client ID** and **Client Secret** that you must enter into Supabase.

## 1. General Supabase Configuration
First, you need your **Callback URL** from Supabase.
1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Navigate to **Authentication** -> **Providers**.
3.  The callback URL is usually: `https://<your-project-ref>.supabase.co/auth/v1/callback`
    *   *You will need to paste this URL into the settings of each social platform below.*

---

## 2. Facebook / Instagram (Meta)
**Portal:** [Meta for Developers](https://developers.facebook.com/)

1.  **Create App**:
    *   Go to "My Apps" -> "Create App".
    *   Select **"Business"** as the app type.
2.  **Configure Login**:
    *   Add the **"Facebook Login for Business"** product.
    *   In the settings for Facebook Login, add your **Supabase Callback URL** to the "Valid OAuth Redirect URIs".
3.  **Get Keys**:
    *   Go to **App Settings** -> **Basic**.
    *   Copy the **App ID** (Client ID) and **App Secret** (Client Secret).
4.  **Permissions**:
    *   For posting, you will eventually need to request permissions like `pages_manage_posts` and `pages_read_engagement` through the App Review process for public use.

## 3. X (formerly Twitter)
**Portal:** [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)

1.  **Create Project/App**:
    *   Create a new Project and App.
2.  **User Authentication Settings**:
    *   Edit "User authentication settings".
    *   Select **OAuth 2.0**.
    *   Type of App: **Web App, Automated App or Bot**.
    *   **Callback URI / Redirect URL**: Enter your **Supabase Callback URL**.
    *   **Website URL**: Enter your app's URL (e.g., `http://localhost:5173` for dev, or your production domain).
3.  **Get Keys**:
    *   Go to the **Keys and Tokens** tab.
    *   Generate the **OAuth 2.0 Client ID and Client Secret**.

## 4. LinkedIn
**Portal:** [LinkedIn Developers](https://www.linkedin.com/developers/)

1.  **Create App**:
    *   Click "Create App" and fill in the details (you'll need a LinkedIn Page).
2.  **Auth Settings**:
    *   Go to the **Auth** tab.
    *   Under "OAuth 2.0 settings", add your **Supabase Callback URL** to "Authorized redirect URLs for your app".
3.  **Get Keys**:
    *   Copy the **Client ID** and **Client Secret** from the Auth tab.
4.  **Products**:
    *   Go to the **Products** tab and request access to "Share on LinkedIn" and "Sign In with LinkedIn".

---

## 5. Final Step: Connect to Supabase
Once you have the keys for the platforms you want to support:

1.  Return to your **Supabase Dashboard** -> **Authentication** -> **Providers**.
2.  Enable the provider (e.g., Facebook).
3.  Paste the **Client ID** and **Client Secret** you obtained.
4.  Click **Save**.

**Note:** For development (localhost), these platforms often allow you to add "Test Users" so you can try it out without full verification. For production, you will need to go through "App Review" with each platform to allow any user to connect.
