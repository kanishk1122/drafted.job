# Drafting Operations Flow (PLATFORM_INTEGRATION)

This mission-plan outlines the exact tactical flow and file locations for connecting **Drafting Platforms** (LinkedIn, Naukri, etc.) to the **drafted.jobs** Backend.

---

### **1. Frontend Tactical Toggle**
- **Location**: `frontend/app/patrol/page.tsx`
- **Action**: User toggles the `Switch` component on a Platform Card.
- **Payload**: `{ "platform": "linkedin", "active": true }`
- **API Target**: `POST /api/v1/platforms/toggle`

### **2. API Gateway (FastAPI)**
- **Location**: `backend/app/main.py` (Router inclusion) -> `backend/app/modules/platform/router.py`
- **Responsibility**: Authenticates the request and hands off to the **PlatformService**.

### **3. Service Intelligence Layer (Business Logic)**
- **Location**: `backend/app/modules/platform/service.py`
- **Flow**:
  1.  **Check Connection**: Verifies if the user's credentials for the platform exist in the **Vault**.
  2.  **Initiate Setup**: If credentials are missing, returns `status: "PENDING_SETUP"`.
  3.  **Start Scraper**: If credentials exist, triggers the **Scraper Engine** (Playwright) to begin a background sweep.
  4.  **Emit Event**: Updates the user's `JobSearchState` to "ACTIVE".

### **4. Repository / Persistence Layer**
- **Location**: `backend/app/modules/platform/repository.py`
- **Data Model**: `UserPlatformConnection` (Table)
  - `user_id` (UUID)
  - `platform_name` (Enum)
  - `is_connected` (Boolean)
  - `last_sync_at` (DateTime)
  - `credentials_vault_id` (UUID - Link to encrypted vault)

---

### **5. Scraper Engine (Background Worker)**
- **Location**: `backend/app/modules/job/scraper_engine.py` (New Module)
- **Action**: Uses **Playwright** to execute the drafting mission on requested platforms.
- **Results**: Discovered jobs are saved to `backend/app/modules/job/repository.py`.

---

> [!IMPORTANT]
> **Mission Goal**: Ensure the frontend `Switch` state reflects the real-time health of the backend scraper. Use WebSockets or Long-Polling for "Mission Discovery" notifications.
