src/
│
├── middleware.ts
│
├── app
│   ├── login/
│   │   ├── page.tsx
│   │   └── LoginForm.tsx
│   │
│   └── users/
│       ├── page.tsx
│       ├── actions.ts
│       └── types/
│           ├── user.form.type.ts
│           └── user.table.type.ts
│
├── components/
│   ├── forms/UserForm.tsx
│   └── table/UserTable.tsx
│
├── types/
│   ├── user.type.ts
│   └── response.type.ts
│
└── server/
    ├── auth/
    │   ├── config.ts
    │   ├── session.ts
    │   └── user.repo.ts
    │
    ├── validators/user.validator.ts
    ├── mappers/user.mapper.ts
    │
    ├── db/
    │   ├── prisma.ts
    │   └── queries/user.query.ts
    │
    ├── services/user.service.ts
    └── types/user.server.type.ts
