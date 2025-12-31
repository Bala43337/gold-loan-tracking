
# 🟡 GOLD LOAN TRACKING & OPTIMIZATION WEB APP

**(React + NestJS + MongoDB)**

---

## 1. PURPOSE

Build a **personal gold-loan tracking web application** that:

* Tracks **ONLY gold loans**
* Calculates **interest dynamically**
* Fetches **live gold rate**
* Shows **current asset value**
* Uploads & stores **bill images as base64**
* Provides **advanced loan closure & re-loan simulation** to minimize interest and close loans faster

This app is **not generic loan software**.
It is designed for **real-world Indian gold-loan banking rules**.

---

## 2. TECH STACK (MANDATORY)

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* Axios
* React Hook Form
* Day.js

### Backend

* NestJS
* TypeScript
* MongoDB
* Mongoose
* Axios
* class-validator
* class-transformer

### Database

* MongoDB (No SQL)

---

## 3. CORE BUSINESS RULES

1. App supports **only gold loans**
2. Gold value must be recalculated **on every app open or refresh**
3. Interest must be calculated **based on current date**
4. Bank accepts **lower gold rate than market**
5. Bank retains **~10% gold**
6. Loan closure simulation must show **profitability**

---

## 4. DATA MODELS

### 4.1 GoldLoan Schema

```ts
{
  _id: ObjectId,
  loanName: string,
  startDate: Date,
  endDate: Date,
  principalAmount: number,
  annualInterestRate: number,
  goldGrams: number,
  bankAcceptedRate: number,
  bankRetentionPercent: number,
  billImageBase64: string,
  status: "ACTIVE" | "CLOSED",
  createdAt: Date,
  updatedAt: Date
}
```

---

### 4.2 AppSettings Schema

```ts
{
  marketGoldRate: number,
  bankGoldRate: number,
  defaultRetentionPercent: number,
  lastUpdated: Date
}
```

---

## 5. INTEREST CALCULATION LOGIC

```text
DaysPassed = Today - StartDate
Interest = Principal × (AnnualInterestRate / 100) × (DaysPassed / 365)
```

* Calculated **real-time**
* Displayed in listing and detail view

---

## 6. GOLD RATE INTEGRATION

### Behavior:

* Fetch gold rate from public API
* Trigger on:

  * App load
  * Page refresh
* Cache last value in DB
* Fallback if API fails

### Asset Value:

```text
CurrentAssetValue = GoldGrams × MarketGoldRate
```

---

## 7. IMAGE HANDLING

* Upload loan bill image
* Convert to **base64**
* Store as string in MongoDB
* Render preview in UI

---

## 8. LOAN LIST PAGE (VERY IMPORTANT)

### Columns:

* Loan Name
* Start Date
* End Date
* Gold Grams
* Principal Amount
* Interest Till Today
* Current Asset Value
* Status

### Features:

* Sort by **End Date**
* Search by loan name
* Filter Active / Closed
* Asc / Desc sorting

---

## 9. 🔥 CORE FEATURE – LOAN CLOSURE & RE-LOAN SIMULATION

### 9.1 Purpose

Determine **how fast and profitably** loans can be closed using:

* Partial cash
* Redeeming one loan
* Re-loaning gold
* Closing bigger loans faster

---

### 9.2 Simulation Inputs

```ts
{
  availableCash: number,
  bankGoldRate: number,
  retentionPercent: number
}
```

---

### 9.3 Banking Logic (CRITICAL)

```text
EffectiveGold = GoldGrams × (1 - retentionPercent / 100)
NewLoanAmount = EffectiveGold × bankGoldRate
```

---

### 9.4 Simulation Algorithm

1. Sort loans by **highest interest burden**
2. Redeem smallest or highest-interest loan
3. Re-loan redeemed gold using bank rules
4. Combine generated loan + cash
5. Attempt to close next biggest loan
6. Repeat until no further profit possible

---

### 9.5 Simulation Output

```ts
{
  steps: [
    {
      action: "REDEEM" | "RELOAN",
      loanId: string,
      goldGrams: number,
      amountUsed: number,
      amountGenerated: number
    }
  ],
  totalGoldRecovered: number,
  totalInterestSaved: number,
  remainingLoans: number,
  suggestion: string
}
```

---

## 10. BACKEND APIs

### Loans

* POST `/loans`
* GET `/loans`
* GET `/loans/:id`
* PUT `/loans/:id`
* DELETE `/loans/:id`

### Interest

* GET `/loans/:id/interest`

### Gold Rate

* GET `/gold-rate/live`

### Simulation

* POST `/simulate/loan-closure`

---

## 11. FRONTEND PAGES

1. Dashboard
2. Loan List
3. Add / Edit Loan
4. Loan Detail View
5. Simulation Tool
6. Settings

---

## 12. UI/UX REQUIREMENTS

* Clean dashboard cards
* Color-coded profit/loss
* Graph: interest vs time
* Mobile responsive
* Instant calculation feedback

---

## 13. NON-FUNCTIONAL REQUIREMENTS

* Clean architecture
* Reusable services
* DTO validation
* Error handling
* No over-engineering
* Personal-use optimized

---

## 14. AI INSTRUCTIONS (MANDATORY)

You MUST:

* Generate **working code**
* Follow banking rules strictly
* Add inline comments
* Use realistic dummy data
* Avoid unnecessary abstractions
* Output file-by-file structure

You MUST NOT:

* Skip simulation logic
* Simplify interest math
* Ignore bank retention rules

---

## 15. FINAL AI COMMAND (COPY THIS EXACTLY)

```text
Act as a senior architect and full-stack engineer.

Build a complete Gold Loan Tracking & Optimization Web App using React.js (TypeScript), NestJS, and MongoDB.

Follow the specification EXACTLY as provided in this document.
Generate:
- MongoDB schemas
- NestJS modules, services, controllers
- Simulation algorithm
- Gold rate integration
- React UI components
- Forms, tables, filters
- Base64 image upload handling
- Sorting and searching
- Clear comments and explanations

Deliver clean, production-ready code.
```

8XIzAQG7bOV9DHOA
bala43337_db_user