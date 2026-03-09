# 🧠 AI BRAIN RULES — Barbershop PWA

## PROJECT NAME
**Barbershop PWA – El Braddock**

## OBJECTIVE
Create and maintain a Progressive Web App for barbershop management with client scheduling, financial control, customer ranking, and analytics.

---

## CORE STACK
| Layer | Technology |
|-------|------------|
| Frontend | React + Vite + TailwindCSS v4 |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) |
| PWA | vite-plugin-pwa |
| Deployment | Linux VPS + Nginx + PM2 |

---

## 🧠 1 — SYSTEM PRINCIPLES

A IA deve sempre seguir estes princípios:

1. Código simples e modular
2. Separação clara entre frontend e backend
3. APIs REST padronizadas
4. Componentes reutilizáveis
5. Interface mobile-first
6. **Design premium preto e dourado**
7. Performance e carregamento rápido

---

## 🧠 2 — CORE FEATURES

### CLIENT AREA
- Cadastro de cliente
- Agendamento de horário
- Histórico de cortes
- Programa de fidelidade
- Instalação como aplicativo PWA

### ADMIN AREA
- Dashboard financeiro
- Agenda completa
- Ranking de clientes
- Controle de caixa
- Gerenciamento de serviços
- Configurações do sistema

---

## 🧠 3 — DATABASE STRUCTURE

### Collections
- `clients`
- `appointments`
- `services`
- `cashflow`
- `settings`
- `rankings`

### CLIENTS
```json
{ "name": "", "phone": "", "email": "", "totalCuts": 0, "totalSpent": 0, "points": 0, "createdAt": "" }
```

### APPOINTMENTS
```json
{ "clientId": "", "serviceId": "", "date": "", "time": "", "status": "scheduled|completed|cancelled|no-show", "price": 0, "createdAt": "" }
```

### SERVICES
```json
{ "name": "", "price": 0, "duration": 30, "active": true }
```

### CASHFLOW
```json
{ "type": "income|expense", "value": 0, "description": "", "paymentMethod": "", "date": "" }
```

---

## 🧠 4 — FRONTEND STRUCTURE

```
frontend/src
  components/
  pages/
  hooks/
  services/
  context/
  styles/
  utils/
```

### Pages obrigatórias
- `Home`
- `BookAppointment`
- `ClientProfile`
- `History`
- `AdminDashboard`
- `AdminAgenda`
- `AdminCash`
- `AdminRanking`
- `AdminSettings`

---

## 🧠 5 — BACKEND STRUCTURE

```
backend/src
  controllers/
  models/
  routes/
  services/
  middlewares/
  utils/
  config/
```

---

## 🧠 6 — API PATTERN

```
GET    /clients
POST   /clients

GET    /appointments
POST   /appointments
PUT    /appointments/:id
DELETE /appointments/:id

GET    /cashflow
POST   /cashflow

GET    /ranking
GET    /dashboard
```

---

## 🧠 7 — UI DESIGN RULES

### Tema visual

| Token | Value |
|-------|-------|
| Primary | Black `#0f0f0f` |
| Secondary | Gold `#cba052` |
| Accent | Dark Gold `#a67d36` |
| Gold Light | `#dfb974` |
| Card Background | `#1a1a1a` |
| Border | `#2a2a2a` |

### CSS Variables (Tailwind v4 `@theme`)
```css
--color-barber-black: #111111;
--color-barber-dark: #1a1a1a;
--color-barber-light: #2a2a2a;
--color-barber-gold: #cba052;
--color-barber-gold-light: #dfb974;
--color-barber-gold-dark: #a67d36;
--color-barber-gray: #888888;
```

### Required Design Elements
- Micro animations
- Hover effects
- Fade transitions
- Glass effect
- Premium cards

---

## 🧠 8 — PWA RULES

Sempre garantir:
- `manifest.json`
- Service Worker
- Offline caching
- Install prompt
- Mobile optimization

### manifest base
```json
{
  "name": "El Braddock Barber",
  "short_name": "Braddock",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#000000"
}
```

---

## 🧠 9 — ANALYTICS

Dashboard deve calcular:
- Daily revenue
- Weekly revenue
- Monthly revenue
- Total cuts
- Top clients
- Average ticket

---

## 🧠 10 — SECURITY

Sempre implementar:
- JWT authentication
- Input validation
- Rate limiting
- Password hashing (bcryptjs)
- CORS protection

---

## 🧠 11 — AUTOMATION FEATURES

O sistema deve suportar:
- WhatsApp reminders
- Loyalty rewards
- Auto confirmations
- Cancelation management

---

## 🧠 12 — PERFORMANCE

Sempre otimizar:
- Lazy loading
- API caching
- Database indexes
- Compressed assets
- PWA caching

---

## 🧠 13 — FUTURE EXPANSION

Sistema deve ser preparado para:
- Multi barbers
- Multi barbershops
- SaaS version
- Payment integrations
- Client mobile login
- QR check-in

---

## 🧠 14 — CODE QUALITY

Sempre aplicar:
- Clean code
- Consistent naming (camelCase JS, kebab-case CSS)
- Modular functions
- Error handling
- Logging

---

## 🧠 15 — DEVELOPMENT MODE

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MongoDB | mongodb://localhost:27017/barbershop |

---

## 🧠 16 — DEPLOYMENT

Produção deve usar:
- Linux VPS
- Nginx reverse proxy
- PM2 process manager
- SSL certificate (Let's Encrypt)
- MongoDB Atlas

---

## 🧠 17 — AI DEVELOPMENT BEHAVIOR

A IA deve:
- **Nunca quebrar funcionalidades existentes**
- Criar código escalável
- Manter consistência de design (sempre preto e dourado)
- Criar APIs reutilizáveis
- Documentar endpoints
- Sempre usar `@theme` do Tailwind v4 para definir cores

---

## 🧠 18 — SYSTEM GOAL

> O objetivo final do sistema é:
> **Ser o melhor aplicativo de gestão para barbearias**
> com foco em simplicidade, automação e lucro.
