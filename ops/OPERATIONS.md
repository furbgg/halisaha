# Operations Runbook

This runbook turns the project into a repeatable customer deployment package.

## 1) First-time setup (new customer server)

1. Copy project to server.
2. Create and auto-fill secure `.env`:

```bash
./ops/init-env.sh
```

3. Edit `.env` and set real customer values:
- `APP_BASE_URL`, `CORS_ALLOWED_ORIGINS`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MAIL_*`
- `ADMIN_EMAIL`, `ADMIN_NAME`

4. Validate production env:

```bash
./ops/validate-env.sh
```

5. Bootstrap stack + initial admin:

```bash
./ops/bootstrap.sh
```

Optional: set explicit admin password once:

```bash
./ops/bootstrap-admin.sh --admin-email admin@customer.com --admin-password 'StrongPassword123!'
```

If you want local/staging demo data after bootstrap:

```bash
./ops/bootstrap.sh --seed-test-data
```

Or persist it via `.env`:

```env
SEED_TEST_DATA_ON_BOOTSTRAP=true
```

## 2) Secret management rules

- Keep secrets only in server `.env` (or platform secret manager).
- Use unique secrets per customer deployment.
- Never reuse JWT/DB/Stripe secrets across customers.
- Never commit `.env`.

## 3) Backups and restore (critical)

### Daily backup

```bash
./ops/backup.sh daily
```

### Restore after incident

```bash
./ops/restore.sh /absolute/path/to/backup.sql.gz
```

Restore latest backup automatically:

```bash
./ops/restore.sh --latest
```

`restore.sh` automatically:
- takes a safety backup first
- stops backend
- restores DB
- starts backend and verifies health

### Recommended target

- RPO: 24h (max data loss = 1 day)
- RTO: 1-2h (service back within 1-2 hours)

To improve RPO, run backup every 6 hours.

## 4) Update + rollback flow

### Safe update

```bash
./ops/update.sh
```

`update.sh` automatically:
- takes pre-update backup
- stores previous backend image id
- deploys update
- checks backend health
- auto-rolls back image if health fails

### Manual rollback

```bash
./ops/rollback.sh
```

Rollback with DB restore from pre-update backup:

```bash
./ops/rollback.sh --restore-db
```

## 5) Monitoring and alerts

### Health check now

```bash
./ops/monitor.sh
```

Checks:
- backend container running
- postgres container running
- backend `/api/actuator/health` is UP
- DB query works
- disk usage threshold

### Alert channels

Configure in `.env`:
- `ALERT_WEBHOOK_URL` (Slack/Discord/custom webhook)
- or `ALERT_TELEGRAM_BOT_TOKEN` + `ALERT_TELEGRAM_CHAT_ID`

### Cron schedule

```bash
./ops/print-cron.sh
```

Then copy entries to `crontab -e`.

## 6) Monthly reliability check

Run monthly:

1. `./ops/backup.sh monthly_test`
2. Restore that backup on a staging copy (`./ops/restore.sh ...`)
3. Verify key tables and login.

## 7) Demo/Test data seeding

Load idempotent demo users/reservations/payments:

```bash
./ops/seed-test-data.sh
```

Reset old `DEMO-*` rows first, then reseed:

```bash
./ops/seed-test-data.sh --reset-demo
```

Notes:
- Demo users are `demo1@halisaha.local`, `demo2@halisaha.local`, `demo3@halisaha.local`
- Demo user password is `DemoUser2026!`

This is the proof that backups are not only created, but actually restorable.
