# Run Production Cleanup Now

The cleanup script needs to run FROM the Railway environment (not locally) to connect to the production database.

## Quick Steps:

1. **Make sure Railway CLI is installed:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   railway link
   ```
   (Select your DunstunPortfolio project)

4. **Run the cleanup:**
   ```bash
   railway run NODE_ENV=production node backend/scripts/run-cleanup-production.js
   ```

5. **Expected output:**
   ```
   🧹 Cleanup: Removing bad About record...
   ✅ Connected to production database.
   Found bad record: "Comrades360 Software Developers Limitted"
   ID: 43139c06-0a7e-4abc-b25c-e8c0ce7cc388
   Business Type: products (BLOCKING SERVICES)
   ✅ Bad About record deleted successfully!
   🎉 Services will now display on the corporate homepage.
   ```

## After Cleanup:

1. Services section will immediately display on the homepage
2. Clear browser cache if needed
3. Refresh https://your-corporate-website.com

## Troubleshooting:

If cleanup says "No bad About record found":
- The record was already deleted (which is fine)
- Services should now display on the homepage

If you get "unknown timed out" error:
- Make sure you're using `railway run` command
- The connection must come from Railway's network
