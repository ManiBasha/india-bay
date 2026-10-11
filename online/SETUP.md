# Turning on online play

The online part has two free services:

- **Supabase**: accounts, usernames, cloud saves and admin settings.
- **Cloudflare**: the live server that shows players to each other and carries chat.

The game works offline until `js/online-config.js` is filled in.

## Part A · Supabase (about 10 minutes)

1. Go to **supabase.com**, click **Start your project** and sign in with GitHub.
2. Create the project:
   - Click **New project**. Name it `india-bay`, type a database password (keep it somewhere safe) and pick the region **South Asia (Mumbai)**.
   - Click **Create new project** and wait about 2 minutes.
3. Set up the database:
   - Open **SQL Editor → New query**.
   - Open `online/supabase-setup.sql` in Notepad, copy everything and paste it in.
   - Click **Run**. You should see "Success. No rows returned".
4. Turn on guest play and linking:
   - Go to **Authentication → Sign In / Providers**.
   - Turn on **Allow anonymous sign-ins** and **Allow manual linking**, then click **Save**.
5. Set the website address:
   - Go to **Authentication → URL Configuration**.
   - Set **Site URL** to `https://manibasha.github.io/india-bay/`.
   - Under **Redirect URLs**, add the same address. Save.
6. Copy two values into Notepad for later:
   - **Project URL**, like `https://abcd1234.supabase.co`. It's under **Project Settings → Data API**, or behind the **Connect** button at the top.
   - **Publishable key**, starting with `sb_publishable_`, under **Project Settings → API Keys**. If you only see legacy keys, use the **anon** key.

Both values are public, so it's safe for them to be in the website.

## Part B · Cloudflare server (about 10 minutes)

1. Install **Node.js LTS** from **nodejs.org**, using the default options.
2. Create a free account at **dash.cloudflare.com**.
3. Open `online\server\wrangler.toml` in Notepad and replace the two Supabase lines with your values from step A6. Save.
4. Open a command window in that folder and run these commands one by one:
   ```
   cd /d "A:\Personal\India Bay\online\server"
   npm install
   npx wrangler login
   npx wrangler deploy
   ```
   - `wrangler login` opens the browser; click **Allow**.
   - If deploy asks you to register a **workers.dev subdomain**, open the link it shows, pick a name, and run `npx wrangler deploy` again.
5. At the end it prints your server address, like `https://india-bay-online.yourname.workers.dev`. Open it in the browser with `/health` added to the end. You should see `{"ok":true,...}`.

## Part C · Connect the game

1. Open `js\online-config.js` in Notepad and fill in the three values: Project URL, publishable key and server address. Save.
2. Push the update. Go back to the main folder first:
   ```
   cd /d "A:\Personal\India Bay"
   git add .
   git commit -m "Online play"
   git push
   ```
3. After a minute or two, open the game. Tap **Start → Play as guest** and pick a username.
4. To test, open the game on your phone as a second guest, with a different username. Each player sees the other on the road.

## Part D · Google sign-in (optional, about 15 minutes)

1. Go to **console.cloud.google.com**, create a project called `India Bay` and open **Google Auth Platform**.
2. Set up branding:
   - Under **Branding**, enter the app name `India Bay` and your email.
   - Under **Audience**, choose **External**, then **Publish app**.
3. Create the sign-in client:
   - Go to **Clients → Create client → Web application**.
   - Under **Authorized redirect URIs**, add `https://YOUR-PROJECT.supabase.co/auth/v1/callback`, using your Project URL.
   - Click **Create**, then copy the **Client ID** and **Client secret**.
4. In Supabase, go to **Authentication → Sign In / Providers → Google**. Turn it on, paste both values and click **Save**.

## Part E · Make yourself admin

1. Sign in to the game once with **Google**.
2. In Supabase, open **SQL Editor → New query**. Run this, with your own email:
   ```
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@gmail.com'
   on conflict do nothing;
   ```
3. Reload the game. **Settings → Admin** now says **Save for all players**.

Player reports and suggestions are in Supabase → **Table Editor → reports** and **suggestions**. Suggestions also appear in the admin panel.

## Free limits

- **Cloudflare:** about 150–180 hours of play per day for all players together. If you go over, online play stops until 05:30 India time, when the free allowance resets. Offline play keeps working.
- **Supabase:** a free project pauses after a week with no visits. Open the Supabase dashboard and click **Restore** to wake it.
