# Manual Setup
If you'd prefer to set things up manually - without the setup wizard - follow these steps:

### Fork the repo
Click here to fork this repository: <a class="github-button" href="https://github.com/paperclip-cms/supabase-cms-kit/fork" data-color-scheme="no-preference: light; light: light; dark: dark;" data-icon="octicon-repo-forked" data-size="large" data-show-count="true" aria-label="Fork paperclip-cms/supabase-cms-kit on GitHub">Fork</a>

or, fork with the GitHub CLI:
```bash
gh repo fork paperclip-cms/supabase-cms-kit
```

Clone the repository to your local machine:
```
git clone https://github.com/you/your-fork.git
```

### Create a new Supabase project
Paperclip OSS works by using a Supabase project as the backend for your CMS. Create a new project here: https://supabase.com

Once your project is created, find and take note of these three values:
1. Project URL ([here](https://supabase.com/dashboard/project/_/settings/api))
1. Publishable key (generate one [here](https://supabase.com/dashboard/project/_/settings/api-keys/new))
1. Service role key (generate one [here](https://supabase.com/dashboard/project/_/settings/api-keys/new))

### Run the Supabase migrations
Paperclip creates several tables and functions in your Supabase project.

Use the [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=macos) to run the Paperclip database migrations:

```bash
# log in to supabase
supabase login

# link to your new project
supabase link

# run migrations on your project
supabase db push
```

### Update environment variables

Copy the sample into your own file:
```bash
cp .env.example .env
```

Update the variables with values from your Supabase project:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Service role key

Your service role key is only used for admin account setup. If you do not feel comfortable using this key, you have two options:

1. Once you've gone through the account setup wizard, revoke this key and/or remove it from your `.env` file
1. Manually create your first user in the Supabase Studio ([here](https://supabase.com/dashboard/project/_/auth/users?sortBy=id)), **after** you have run the migrations


### Start the server

Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` (check terminal output for the correct URL), and create your first admin user.
