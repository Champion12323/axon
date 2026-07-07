# Common backend runtime errors (and what to check)

This repo includes common failure categories during startup.

## 1) Invalid database credentials
**Symptoms**
- Prisma throws an error mentioning authentication failure / password authentication failed.

**What to check**
- `DATABASE_URL` hostname/user/password/database
- If using a `.env` file, confirm it is loaded (`dotenv.config()` is called)

**Typical substrings**
- `password authentication failed`
- `FATAL: role "..." does not exist`
- `Invalid username or password`

## 2) No database server running under the provided hostname/port
**Symptoms**
- Prisma error like `getaddrinfo ENOTFOUND` or `ECONNREFUSED`.

**What to check**
- Ensure PostgreSQL is running
- Ensure `DATABASE_URL` points to the correct host and port

**Typical substrings**
- `ECONNREFUSED`
- `getaddrinfo ENOTFOUND`

## 3) Port already taken (EADDRINUSE)
**Symptoms**
- Server fails to start and you see `EADDRINUSE`.

**What to check**
- Another process might already be using `PORT` (default `5000`).
- Stop the other process or change `PORT` in env.

**Typical substrings**
- `EADDRINUSE`

## 4) Missing or inaccessible environment variable
**Symptoms**
- Startup aborts early with a list of missing env vars.

**What to check**
- Make sure required env vars exist in your environment or `.env` file

**Typical substrings**
- `Missing environment variables:`

## 5) Prisma generator block / platform mismatch
**Symptoms**
- Prisma client import/build fails.

**What to check**
- Run `npm install` (and/or `npx prisma generate`)
- Ensure Prisma dependencies are installed for the current OS/architecture

**Typical substrings**
- `generator block`
- `prisma-client-js`
- `could not be found`

