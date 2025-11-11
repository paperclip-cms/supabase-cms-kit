# ⚠️ WIP!!! todo list:
_...starting from not-zero lol_
- [x] Build item create/edit form
- [x] Build item view page
- [ ] Add real media uploads (reference [adboio/adboio](https://github.com/adboio/adboio))
  - [ ] Allow HEIC uploads (auto-convert client-side)
  - [ ] Add new migration for storage bucket(s)
  - [ ] Image/mutli-image type uploads
  - [ ] Generic file type uploads
  - [ ] Rich text inline image/video uploads
  - [ ] Fix edit form to pull image list on load - shows empty right now if you hit the URL directly, but works if you click the edit button
- [ ] Fix max-width on item viewer and create/edit form (it's more constrained than the other pages)
- [ ] Fix breadcrums, they are inconsistent across the app
- [ ] Collection edit validation (what happens to exisitng items if you remove a field, or rename a slug, for example)
  - [ ] Auto-update collection data if a field slug changes, OR disallow field slug editing, OR just give a big fat warning lol
- [ ] New item/collection validation pre-DB hit, e.g. dupe slugs etc
- [ ] Add API layer for non-direct-Supabase integrations
  - [ ] Build API layer
  - [ ] Add separate API-only auth layer (maybe use some base like `/api/public/{route}`)
- [ ] Implement content / data caching (blob storage @ edge ?)
- [ ] Create JS SDK
  - [ ] Supabase-direct connection, e.g. `paperclip.init({ url: '', anonKey: '' })`
  - [ ] API connection, e.g. `paperclip.init({ apiUrl: '', apiKey: '' })`
- [ ] Create TS type generator for collections
- [ ] Implement on my [personal site](https://www.adbo.io) ([repo](https://github.com/adboio/adboio)) as a nextjs example
- [ ] Build Framer plugin
  - [ ] Implement in [vibeclinic](https://www.vibeclinic.io) as example
- [ ] Build Webflow plugin
  - [ ] Implement in [forkfile](https://www.getforkfile.com) as example
- [ ] Add ability to invite new users
- [ ] Add auto-save to item creation

---

# 📎 Paperclip OSS (Supabase CMS Kit)

Paperclip OSS (Supabase CMS kit) is an open-source API + UI layer for Supabase.

## Getting Started

### Fork the repo

[Click here](https://github.com/paperclip-cms/supabase-cms-kit/fork) to fork this repository.

Then, clone the forked repository to your local machine:

```
git clone https://github.com/your-username/your-fork.git
```

### Run the server

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` (check terminal output for the correct URL), and follow the setup wizard's instructions. It will guide you through:

1. Creating a Supabase project
2. Setting your environment variables
3. Running migrations
4. Create your first CMS user

If you'd prefer to set things up manually, or want deeper instructions, see [MANUAL_SETUP.md](./MANUAL_SETUP.md)
