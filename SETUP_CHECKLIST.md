# Translation API Setup Checklist

## Phase 1: Google Cloud Setup (10 minutes)

- [ ] Open Google Cloud Console (https://console.cloud.google.com)
- [ ] Create new project named "Kisaan App"
- [ ] Navigate to APIs & Services
- [ ] Search for "Cloud Translation API"
- [ ] Click "Enable"
- [ ] Wait for API to be enabled (1-2 minutes)
- [ ] Go to "Service Accounts" → "Create Service Account"
- [ ] Name: "kisaan-translator"
- [ ] Click "Create and Continue"
- [ ] Grant role: "Editor" (or "Translator" for production)
- [ ] Click "Continue" twice
- [ ] Go to "Keys" tab
- [ ] Click "Add Key" → "Create new key"
- [ ] Choose "JSON"
- [ ] Click "Create"
- [ ] File automatically downloads (save in project root!)
- [ ] Note your Project ID (visible in console)

**By end of Phase 1, you should have:**
- ✅ Service account JSON file
- ✅ Project ID (e.g., "kisaan-app-123456")

## Phase 2: Local Development Setup (5 minutes)

- [ ] Create `.env.local` file in project root:
  ```
  GOOGLE_CLOUD_PROJECT_ID=your-project-id
  GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
  VITE_TRANSLATION_API_URL=http://localhost:3000/api/translate
  ```
- [ ] Place downloaded JSON file in project root
- [ ] Rename JSON file to `service-account-key.json` (if needed)
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Open terminal and verify npm packages installed

**By end of Phase 2:**
- ✅ .env.local configured
- ✅ Credentials in place
- ✅ Ready for deployment

## Phase 3: Deploy Translation Function (Choose One)

### Option A: Supabase (Recommended) ⭐

- [ ] Have Supabase project ready
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Login: `supabase login`
- [ ] Link project: `supabase link --project-ref your-ref`
- [ ] Deploy function: `supabase functions deploy translate --no-verify-jwt`
- [ ] Get function URL from Supabase dashboard
- [ ] Set environment variable:
  ```
  VITE_TRANSLATION_API_URL=https://your-project.supabase.co/functions/v1/translate
  ```
- [ ] Set secret in Supabase:
  ```
  supabase secrets set GOOGLE_CLOUD_PROJECT_ID=your-project-id
  supabase secrets set GOOGLE_APPLICATION_CREDENTIALS_JSON='{...}'
  ```

### Option B: Vercel

- [ ] Copy `api/translate.js` to your Vercel project
- [ ] Add environment variables in Vercel dashboard:
  - `GOOGLE_CLOUD_PROJECT_ID`
  - `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- [ ] Deploy: `vercel deploy`
- [ ] Get function URL
- [ ] Set environment variable:
  ```
  VITE_TRANSLATION_API_URL=https://your-domain.vercel.app/api/translate
  ```

### Option C: Firebase

- [ ] Initialize Firebase: `firebase init functions`
- [ ] Copy translation function code
- [ ] Deploy: `firebase deploy --only functions`
- [ ] Get function URL
- [ ] Set environment variable:
  ```
  VITE_TRANSLATION_API_URL=https://region-projectid.cloudfunctions.net/translate
  ```

**By end of Phase 3:**
- ✅ Function deployed
- ✅ API URL working
- ✅ Environment variables set

## Phase 4: Testing (5 minutes)

### Local Testing:

- [ ] Start dev server: `npm run dev`
- [ ] Open browser to http://localhost:5173
- [ ] Click language selector (top right)
- [ ] Choose "हिंदी" (Hindi)
- [ ] Wait for "Translating..." message
- [ ] Content appears in Hindi
- [ ] Click "English" 
- [ ] Content reverts to English
- [ ] Check browser console for errors
- [ ] Try another language (Kannada, Tamil)

### Quick Verification:

- [ ] Translation service loads (no console errors)
- [ ] Language selector shows all 9 languages
- [ ] First translation takes 2-5 seconds
- [ ] Subsequent changes use cache (instant)
- [ ] Can switch between languages freely

**By end of Phase 4:**
- ✅ Translation working locally
- ✅ All languages respond
- ✅ Cache working (second load is instant)

## Phase 5: Production Deployment (5 minutes)

### Before Deploying:

- [ ] Remove `service-account-key.json` from repository
- [ ] Add `.env.local` to `.gitignore`
- [ ] Create `.env.production` with production API URL
- [ ] Test with translation API in production

### Deploy:

- [ ] Push code to repository
- [ ] Deploy to hosting platform (Vercel/Firebase/Your server)
- [ ] Add production environment variables
- [ ] Test translation in production
- [ ] Monitor Google Cloud console for API usage

### Post-Deployment:

- [ ] Set up cost alerts in Google Cloud Console
- [ ] Monitor first week for errors
- [ ] Check translation quality across pages
- [ ] Verify caching is working
- [ ] Document any issues

**By end of Phase 5:**
- ✅ Production deployment complete
- ✅ API URL points to production
- ✅ Monitoring is active

## Phase 6: Optimization (Optional)

- [ ] Review Google Cloud costs
- [ ] Implement batch translation for large content
- [ ] Pre-translate static content
- [ ] Add retry logic for failed translations
- [ ] Implement offline mode fallback
- [ ] Monitor monthly usage trends

## ❌ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "API error" | Enable Cloud Translation API in Google Cloud Console |
| "Invalid credentials" | Download new JSON key from Google Cloud |
| "Permission denied" | Service account needs "Editor" or "Translator" role |
| "No translation" | Check browser console for errors; verify API URL |
| "Slow first load" | Normal - first load calls API; subsequent use cache |
| ".env not loading" | Restart dev server after creating .env.local |
| "Function not found" | Verify deployment status in Supabase/Vercel/Firebase |
| "High costs" | Check Google Cloud console for run-away translations |

## 📊 Verification Points

After each phase, verify:
- ✓ No errors in browser console (`F12` → Console)
- ✓ No errors in terminal/server logs
- ✓ API calls visible in Network tab (`F12` → Network)
- ✓ Translation completing within 2-5 seconds
- ✓ Cache working (instant on second visit)

## 📈 Success Criteria

Your setup is complete when:
- ✅ All 9 languages appear in selector
- ✅ Translation works for each language
- ✅ No console errors
- ✅ First translation takes 2-5 seconds
- ✅ Second identical translation is instant
- ✅ Can switch languages without issues
- ✅ API URL is production-ready
- ✅ Costs are monitored

## 🚀 Next Steps After Setup

1. **Integrate into more pages** - Add translation to all user-facing strings
2. **Pre-translate static content** - Reduce first-load latency
3. **Add analytics** - Track which languages users choose
4. **Optimize costs** - Review and optimize based on usage
5. **Gather feedback** - Ask users if translations are accurate
6. **Add more content** - Translate help texts, forms, modals

## 📞 Troubleshooting Guide

**If stuck on any step:**
1. Check the relevant documentation file:
   - Quick issues → TRANSLATION_QUICKSTART.md
   - Detailed help → TRANSLATION_SETUP.md
   - Reference → TRANSLATION_README.md
2. Check browser console (`F12` → Console tab)
3. Check server/function logs
4. Search for error message in documentation
5. Review .env.local configuration
6. Verify API endpoint is accessible

## ✅ Final Checklist

Before declaring success, verify:
- [ ] All 6 phases completed
- [ ] No errors in console
- [ ] All 9 languages working
- [ ] Caching verified
- [ ] Production deployed
- [ ] Monitoring active
- [ ] Documentation reviewed
- [ ] Team trained on usage

---

**Progress Tracking:**
- Phase 1: ____% complete
- Phase 2: ____% complete
- Phase 3: ____% complete
- Phase 4: ____% complete
- Phase 5: ____% complete
- Phase 6: ____% complete

**Overall Progress:** ____% (sum of all phases ÷ 6)

**Timeline:**
- Start Date: _____________
- Target Completion: _____________
- Actual Completion: _____________

---

**Questions? Check:**
1. TRANSLATION_QUICKSTART.md - Fastest path
2. TRANSLATION_SETUP.md - Most detailed
3. IMPLEMENTATION_SUMMARY.md - Overview
