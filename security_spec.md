# Security Specification & Threat Model (TDD)

## 1. Data Invariants

- **Config Access**: Only authenticated staff (or anyone authenticated if we don't have separate role collections, but let's restrict write operations to authenticated users or administrators) should be able to update configurations.
- **Client Ownership**: Clients can only write or modify their own profiles if logged in, or staff can modify client cards.
- **Appointment Integrity**: Appointments can only be created by signed-in users or public booking, but once a status is cancelled or completed, it cannot be modified arbitrarily without authorization.
- **Inventory Safety**: Product stock and price fields must be numeric and non-negative, and only authenticated staff should be allowed to modify product listings.
- **Timestamp Integrity**: Whenever data changes, client profiles, appointments, or visit records must maintain correct dates/timestamps where applicable.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent direct attempts to breach data integrity, bypass authorization, or poison resources:

1. **Unauthenticated Config Write**
   - *Target*: `config/barbershop`
   - *Payload*: `{ "name": "Hacked Barbershop", "phone": "911", "address": "Nowhere", "logo": "malicious_url", "workingHours": [], "services": [], "barbers": [] }`
   - *Constraint*: Rejected because user is not authenticated or not authorized as owner.

2. **Privilege Escalation on User Profile**
   - *Target*: `clients/c1`
   - *Payload*: `{ "id": "c1", "points": 999999, "tier": "VIP", "visitsCount": 500 }` (attempted by a standard user trying to spoof points)
   - *Constraint*: Must verify incoming update doesn't arbitrarily elevate points/tier if not authorized.

3. **Orphaned Appointment Creation**
   - *Target*: `appointments/a_bad`
   - *Payload*: `{ "id": "a_bad", "clientId": "non_existent_client", "clientName": "Ghost", "clientPhone": "0000", "serviceId": "invalid", "serviceName": "Unknown", "price": -500, "duration": -30, "date": "2020-01-01", "timeSlot": "99:99", "barberId": "invalid", "status": "confirmed" }`
   - *Constraint*: Must reject negative values and invalid formats/empty UIDs.

4. **Shadow Update (Ghost Fields Injection)**
   - *Target*: `products/p1`
   - *Payload*: `{ "id": "p1", "name": "Cera Premium Mate", "category": "Estilizado", "stock": 15, "minStock": 5, "cost": 120, "price": 220, "provider": "BarberPro", "isFreeProduct": true, "extraPrivileges": "granted" }`
   - *Constraint*: Rejected because of strict keys size/presence check.

5. **Resource Poisoning (ID Injection)**
   - *Target*: `appointments/A_VERY_LONG_STRING_THAT_EXCEEDS_128_CHARACTERS_TO_POISON_THE_DATABASE_AND_EXHAUST_QUOTA_RESOURCES_DUE_TO_WALLET_EXHAUSTION_ATTACKS_...`
   - *Payload*: `{ "id": "...", "clientId": "c1", "clientName": "Test", "clientPhone": "123", "serviceId": "s1", "serviceName": "Corte", "price": 250, "duration": 45, "date": "2026-07-03", "timeSlot": "12:00", "barberId": "b1", "status": "pending" }`
   - *Constraint*: ID is validated through `isValidId()` which limits size to 128 characters and enforces standard characters.

6. **State Machine Bypass on Appointment**
   - *Target*: `appointments/a1`
   - *Payload*: Transitioning appointment from `completed` back to `pending` by unauthorized accounts, or modifying `price` after completion.
   - *Constraint*: Transition restricted once status is terminal.

7. **PII Blanket Read Exposure**
   - *Target*: `clients` collection query without matching authentication details or requesting all private user info as an anonymous guest.
   - *Constraint*: List read queries must match auth filter.

8. **Malicious Negative Expense**
   - *Target*: `expenses/e_bad`
   - *Payload*: `{ "id": "e_bad", "date": "2026-07-03", "description": "Fake Refund", "category": "Refund", "amount": -100000 }`
   - *Constraint*: Must reject negative amounts or invalid expense entries.

9. **Visit Record Rating Flooding**
   - *Target*: `visit_records/vr_bad`
   - *Payload*: `{ "id": "vr_bad", "clientId": "c1", "date": "2026-07-03", "barberId": "b1", "barberName": "Alex", "serviceName": "Corte", "price": 250, "productsUsed": [], "rating": 500 }`
   - *Constraint*: Enforce `rating >= 1 && rating <= 5` limits.

10. **Timestamp Manipulation (Client Spoofing)**
    - *Target*: `appointments/a1`
    - *Payload*: Setting `createdAt` of a new appointment to a future date or backdating historical records to bypass scheduling rules.
    - *Constraint*: Leverage server timestamps `request.time` where appropriate.

11. **Malicious Negative Product Pricing**
    - *Target*: `products/p_neg`
    - *Payload*: `{ "id": "p_neg", "name": "Free Stuff", "category": "Estilizado", "stock": 100, "minStock": 2, "cost": -50, "price": -100, "provider": "Bad" }`
    - *Constraint*: Rejected via validation.

12. **Double-Deduct Stock Bypass**
    - *Target*: `products/p1`
    - *Payload*: Attempting to change `stock` arbitrarily without a corresponding visit record write.
    - *Constraint*: Securely check and authorize writes.

---

## 3. Test Runner Structure (Reference)

```typescript
// firestore.rules.test.ts
// Automated checks asserting that each malicious attempt returns PERMISSION_DENIED.
// Tested using the Firebase Local Emulator Suite.
```
