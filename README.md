# ToDo App z Next.js in Sanity

ToDo aplikacija zgrajena z Next.js 15, NextAuth.js in Sanity kot bazo podatkov.

## 🚀 Funkcionalnosti

- **Avtentikacija**: Prijava/registracija z NextAuth.js
- **Upravljanje opravil**: Dodajanje, urejanje, brisanje in označevanje opravil
- **Admin panel**: Pregled vseh opravil in uporabnikov
- **Sanity CMS**: Uporaba Sanity kot baze podatkov
- **Responsivni dizajn**: Deluje na desktop in mobilnih napravah

## 📋 Zahteve

- Node.js 18+
- Sanity projekt z API ključem

## 🛠 Namestitev

1. **Klonirajte repozitorij:**
   ```bash
   git clone <your-repo-url>
   cd todolist1
   ```

2. **Namestite odvisnosti:**
   ```bash
   npm install
   ```

3. **Nastavite okoljske spremenljivke:**
   Uredite `.env` datoteko z vašimi Sanity podatki:
   ```env
   # Sanity configuration
   SANITY_PROJECT_ID="l0n7s8js"
   SANITY_DATASET="production"
   SANITY_API_TOKEN="your-api-token-here"
   NEXT_PUBLIC_SANITY_PROJECT_ID="l0n7s8js"
   NEXT_PUBLIC_SANITY_DATASET="production"

   # NextAuth configuration
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Zaženite aplikacijo:**
   ```bash
   npm run dev
   ```

## 📊 Nastavitev Sanity podatkov

### 1. Ustvarite sheme v Sanity

Aplikacija uporablja naslednje sheme v Sanity:

**User shema:**
```javascript
{
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'username',
      title: 'Username',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'role',
      title: 'Role',
      type: 'string',
      options: { list: ['user', 'admin'] },
      initialValue: 'user'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime'
    }
  ]
}
```

**Todo shema:**
```javascript
{
  name: 'todo',
  title: 'Todo',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text'
    },
    {
      name: 'completed',
      title: 'Completed',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'user',
      title: 'User',
      type: 'reference',
      to: [{ type: 'user' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime'
    }
  ]
}
```

### 2. Dodajte testne podatke

Ustvarite uporabnike in opravila v Sanity Studio ali uporabite API.

**Primer uporabnikov:**
- Admin: `admin@test.com` (vloga: admin)
- User: `user@test.com` (vloga: user)

## 🎯 Uporaba aplikacije

### Registracija/Prijava
1. Pojdite na `/signup` za registracijo
2. Ali na `/login` za prijavo
3. Uporabite katerokoli geslo za testne uporabnike

### Dashboard
- Pregled vaših opravil
- Dodajanje novih opravil
- Urejanje/brisanje obstoječih opravil

### Admin panel
- Dostopen samo za uporabnike z vlogo "admin"
- Pregled vseh opravil in uporabnikov
- Upravljanje opravil vseh uporabnikov

## 📱 API Endpoints

### Avtentikacija
- `POST /api/auth/signup` - Registracija
- `POST /api/auth/signin` - Prijava
- `POST /api/auth/signout` - Odjava

### Oprvila
- `GET /api/todos` - Pridobi opravila uporabnika
- `POST /api/todos` - Ustvari novo opravilo
- `GET /api/todos/[id]` - Pridobi specifično opravilo
- `PATCH /api/todos/[id]` - Posodobi opravilo
- `DELETE /api/todos/[id]` - Izbriši opravilo

### Admin
- `GET /api/admin/todos/[id]` - Admin operacije z opravili

## 🚀 Objava na Vercel

1. **Push kode na GitHub**
2. **Povežite z Vercel:**
   - Uvozite projekt iz GitHub
   - Dodajte okoljske spremenljivke v Vercel dashboard
   - Deploy

3. **Nastavite okoljske spremenljivke v Vercel:**
   ```
   SANITY_PROJECT_ID=l0n7s8js
   SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_PROJECT_ID=l0n7s8js
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your-api-token
   NEXTAUTH_SECRET=your-secret-key
   NEXTAUTH_URL=https://your-vercel-domain.vercel.app
   ```

## 🐛 Odpravljanje težav

### NextAuth CLIENT_FETCH_ERROR
- Preverite `NEXTAUTH_URL` okoljske spremenljivke
- Za lokalni razvoj: `http://localhost:3000`
- Za produkcijo: vaš Vercel URL

### Sanity napake
- Preverite API token permissions
- Preverite project ID in dataset ime
- Preverite omrežne povezave

### Build napake
- Počistite npm cache: `npm cache clean --force`
- Ponovno namestite odvisnosti: `rm -rf node_modules && npm install`

## 📚 Tehnologije

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS
- **Avtentikacija:** NextAuth.js v4
- **Baza podatkov:** Sanity CMS
- **Deployment:** Vercel

## 🤝 Prispevki

Za prispevke ali vprašanja odprite issue ali pull request.

## 📄 Licenca

Ta projekt je odprt za uporabo v izobraževalne namene.
