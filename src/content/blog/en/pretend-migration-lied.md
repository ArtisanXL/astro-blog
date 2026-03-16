---
title: "--pretend was clean, prod died anyway"
description: "A clean dry-run, a clean staging run, and one soft-deleted row from 2019 that took the prod deploy down."
pubDate: 2026-03-16
tags: ["laravel", "veritabani", "devops"]
translationKey: "pretend-migration-lied"
---

Shipped a Laravel migration on a Thursday morning that I'd run through every safety check I owned. `php artisan migrate --pretend` printed clean SQL. The staging deploy ran it without complaint. The prod deploy ran it and broke:

```
SQLSTATE[23000]: Integrity constraint violation: 1048
Column 'billing_email' cannot be null
(SQL: ALTER TABLE users MODIFY billing_email VARCHAR(255) NOT NULL)
```

The migration was making `users.billing_email` non-nullable. The defensible reasons existed. The app had been treating it as required for a year, validation enforced it everywhere, no UI could create a user without one. So I added the constraint. `--pretend` told me what SQL would run. Staging ran the same SQL and it worked. Prod ran the same SQL and threw on row 47,219, a user soft-deleted in 2019 with `billing_email` literally NULL. Soft-deleted in 2019, before the column was required, before validation existed, before anyone had cared.

What `--pretend` does is generate the SQL the migration would emit and print it. It doesn't run the SQL. It doesn't check the SQL against the actual data. It's a syntax check that knows the schema. It is not a safety check.

The bigger failure was staging. Staging had a schema dump from prod from six months ago plus seed data on top. The seed data was clean by construction. The schema-only copy meant the 2019 row didn't exist in staging because the seed script created users from scratch. The migration ran on staging against rows that all had `billing_email` set, because the seed had set them.

There's a real cost to running migrations against a prod snapshot. Disk, restore time, PII (handled with an anonymizer script). The reason I'd been on seed data was that the snapshot pipeline was a 90-minute setup the first time and I'd never gotten around to it. The cost of the broken deploy was higher than that 90 minutes would have been. That's how it went for me, and probably how it'll go for the next person too.

Now if a migration carries an assumption, the deploy script counts it first. For this migration the assumption was "every row has a non-null `billing_email`." The check:

```sql
SELECT COUNT(*) FROM users WHERE billing_email IS NULL;
```

Non-zero, deploy aborts, count printed. Three lines of bash. It catches the whole "the constraint we're adding contradicts existing data" class without needing a prod snapshot at all.

The tightening-migration rule: if you're adding a constraint, count the rows first. Non-zero, the job isn't the constraint, it's a backfill. Zero, the constraint is safe and the migration is one line. Either way you know before `--pretend` runs.
