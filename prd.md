# Product Requirements Document (PRD)
**Project Name:** Family Tree Web Application  
**Document Version:** 1.0  
**Status:** Finalized Blueprint  

## 1. Background & Product Objectives
An interactive web-based application designed to visualize an extended family lineage in a clean, structured, and accessible layout across all generations. The application allows family members to explore the family tree, learn about each member's origins and background, and automatically calculate specific kinship relationships between any two selected individuals without requiring login barriers for general viewing.

## 2. Target Users & Access Roles
1. **General Visitors / Family Members (Public / Read-Only):**
   * No login or account creation is required to view and interact with the family tree.
   * Can explore the interactive canvas, view individual profile details, search for members, and use the Relationship Finder feature.
2. **Family Admin / Editor (Authenticated):**
   * Logs in via a dedicated **"Edit Mode"** button using registered admin credentials.
   * Holds full permissions to add new family members, edit profiles/photos, manage lineage relationships (parents, spouses, children), and delete records.

## 3. Core Feature Specifications

### A. Interactive Family Tree Canvas
* **Nodes & Edges Layout:** Adapts a clean aesthetic featuring circular profile avatars, clear name/role labels underneath, and orthogonal (right-angled) connector lines distinguishing marriage links (horizontal between spouses) and lineage links (vertical to children).
* **Navigation Controls:** Supports smooth *panning* (free canvas dragging), *zoom in/out*, and a *"Reset View"* button to recenter on the root ancestors.
* **Responsiveness:** Fully usable across both desktop and mobile viewports.

### B. Member Profile Detail Panel (Drawer / Modal)
Clicking on a member's circular avatar (in standard view mode) opens a detailed profile panel displaying:
* High-resolution profile photo.
* Full Name & Nickname.
* Gender.
* Place & Date of Birth (plus Date of Death, if applicable).
* Place of Origin & Current City of Residence.
* Family position (e.g., *2nd child of X & Y*).
* Short Biography / Origin notes.

### C. "Relationship Finder" Feature (2-Person Selector)
* **Selection Mechanism:** Users toggle **"Check Relationship"** mode, then select **Person A** and **Person B** either by clicking their circular nodes directly on the canvas or choosing them via a searchable dropdown menu.
* **Relationship Calculation Engine:** The system traverses the family graph and outputs:
  * **Kinship Title:** Accurate relationship terminology (e.g., *Parent, Child, Sibling, Grandparent, Grandchild, Uncle/Aunt, Niece/Nephew, Cousin, In-Laws*).
  * **Lineage Path:** Step-by-step connection path linking Person A to Person B.
  * **Visual Canvas Highlight:** Highlights the active nodes and connecting edges between the two selected individuals while subtly dimming unrelated branches.

### D. Quick Search & Auto-Focus
* A search bar located in the top navigation bar.
* Selecting a person from the search results smoothly pans and zooms the canvas camera to focus on and highlight that specific member.

### E. Lineage Data Management (Edit Mode - Admin Only)
* **Admin Authentication:** Triggered via a lock icon / **"Edit Mode"** button.
* **Member CRUD:** Create new member records, update profile fields, upload/replace profile photos (with circular framing), and delete records.
* **Relationship Linking:** Attach a new member directly as a Spouse, Child, or Parent of an existing node so connector lines render automatically.

## 4. Technical Architecture (Tech Stack)
* **Frontend Framework:** Next.js (App Router) with **TypeScript**.
* **Styling:** Tailwind CSS.
* **Graph / Tree Visualization:** React Flow (`@xyflow/react`) for custom circular nodes and orthogonal edges.
* **Auto-Layout Engine:** Dagre or custom hierarchical tree positioning algorithm to prevent node overlap.
* **Backend & Database:** Supabase (PostgreSQL for relational data, Supabase Storage for avatar uploads, and Supabase Auth for admin login).

## 5. Database Schema
Primary table: `family_members`
* `id` (UUID, Primary Key)
* `full_name` (String, Required)
* `nickname` (String, Optional)
* `gender` (Enum: `'male'`, `'female'`, Required)
* `birth_place` (String, Optional)
* `birth_date` (Date, Optional)
* `death_date` (Date, Optional)
* `origin_city` (String, Optional)
* `current_city` (String, Optional)
* `bio` (Text, Optional)
* `photo_url` (String, Optional)
* `father_id` (UUID, Foreign Key -> `family_members.id`, Nullable)
* `mother_id` (UUID, Foreign Key -> `family_members.id`, Nullable)
* `spouse_id` (UUID, Foreign Key -> `family_members.id`, Nullable)
* `created_at` & `updated_at` (Timestamp)

## 6. Acceptance Criteria
1. Public users can load the web app and explore the complete family tree immediately without a login screen.
2. All marital and generational connector lines render cleanly without overlapping nodes.
3. Selecting any two members in the Relationship Finder accurately computes their kinship term (up to cousins, nieces/nephews, grandparents/grandchildren, and in-laws) and visually highlights their path on the canvas.
4. Create, update, and delete operations are strictly restricted to authenticated Admin sessions.