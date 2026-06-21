# نظام تراخيص ومعاينات الحماية المدنية - Angular Mock

مشروع Angular Standalone كامل لتجربة نظام الحماية المدنية قبل ربط الباك إند.

النسخة الحالية مبنية على الرسم الورقي المرسل وتشمل:

- شاشة Login.
- Auth Service + Auth Guard.
- صفحة رئيسية للحماية المدنية.
- نموذج **إضافة ترخيص جديد** مقسوم مثل الورقة:
  - بيانات الرخصة والطلب.
  - بيانات صاحب الطلب.
  - بيانات المنشأة / النشاط.
  - المرفقات.
- جدول الطلبات.
- مسار الإدارات داخل الجدول:
  - الإدارة الهندسية.
  - إدارة البحوث.
  - أملاك الدولة.
  - الشئون القانونية.
  - الحماية المدنية.
  - الإدارة المختصة.
- إجراء المعاينة وتقرير المعاينة.
- الموافقة النهائية.
- الرفض.
- الأرشيف العام.
- بحث وفلترة.
- حفظ مؤقت في `localStorage`.
- قراءة أولية من JSON داخل `assets/mock`.

---

## بيانات الدخول التجريبية

### Admin

```text
username: admin
password: admin123
```

### User

```text
username: civil
password: civil123
```

---

## التشغيل

افتحي فولدر المشروع ثم نفذي:

```bash
npm install
npm start
```

بعد التشغيل افتحي:

```text
http://localhost:4200
```

أو:

```text
http://localhost:4200/login
```

---

## الاستراكتشر المهم

```text
src/app/auth
├── components/login
├── guards/auth.guard.ts
├── models/auth-user.model.ts
└── services/auth.service.ts

src/app/civil-defense
├── components
│   ├── civil-defense-page
│   ├── request-form
│   ├── requests-table
│   └── inspection-form
├── models/civil-defense-request.model.ts
└── services/civil-defense-mock.service.ts

src/assets/mock
├── civil-defense-requests.json
├── activity-types.json
├── hazard-levels.json
└── inspection-checklist.json
```

---

## الفكرة البرمجية

حاليًا المشروع لا يستخدم باك إند. أول مرة الصفحة تفتح تقرأ البيانات من:

```text
src/assets/mock/civil-defense-requests.json
```

بعد أي إضافة أو تعديل، البيانات تتحفظ مؤقتًا في:

```text
localStorage
```

لما الباك إند يجهز، هنغير `CivilDefenseMockService` فقط ونبدل التخزين المؤقت بـ API حقيقي.

---

## APIs المقترحة عند الربط بالباك إند

```text
POST   /api/auth/login
GET    /api/civil-defense/requests
GET    /api/civil-defense/requests/{id}
POST   /api/civil-defense/requests
PUT    /api/civil-defense/requests/{id}
DELETE /api/civil-defense/requests/{id}
PATCH  /api/civil-defense/requests/{id}/status
POST   /api/civil-defense/requests/{id}/inspection
POST   /api/civil-defense/requests/{id}/attachments
```

---

## ملاحظات مهمة

- رفع الملفات في النسخة الحالية يحفظ اسم الملف فقط، لأن رفع الملفات الحقيقي يحتاج باك إند.
- زر **استرجاع بيانات JSON** يمسح بيانات `localStorage` ويرجع الداتا التجريبية.
- لو غيرتي الداتا في JSON ولم تظهر، اضغطي **استرجاع بيانات JSON** أو امسحي localStorage من المتصفح.
