---
title: Pembuatan Route & Validasi OpenAPI
description: Cara membuat endpoint API baru menggunakan router Hono, validasi Zod, dan dokumentasi OpenAPI otomatis.
---

Biawak memadukan **Hono Router** dan **Hono OpenAPI** untuk memberikan pengalaman pembuatan route yang sangat kuat. Setiap endpoint yang Anda buat secara otomatis tervalidasi oleh Zod dan langsung didokumentasikan ke dalam Swagger UI.

---

## ⚡ Pembuatan Route Instan via CLI
Gunakan Biawak Generator untuk membuat route kosong baru secara instan:
```bash
bun run make route product
```
*Hasil*: Membuat berkas template route baru di `src/routes/product.ts`.

---

## 📝 Struktur Penulisan Route
Berikut adalah contoh struktur route yang dihasilkan dengan validasi request body Zod dan dokumentasi OpenAPI:

```typescript
import { Hono } from "hono";
import { describeRoute, resolver } from "hono-openapi";
import z from "zod";

const productRouter = new Hono();

// Definisikan Skema Zod
const CreateProductSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  price: z.number().positive("Harga harus lebih dari 0"),
});

productRouter.post(
  "/",
  describeRoute({
    tags: ["Product"],
    summary: "Tambah produk baru",
    description: "Membuat data produk baru ke dalam database",
    validate: {
      body: resolver(CreateProductSchema), // Validasi otomatis request body
    },
    responses: {
      201: {
        description: "Produk berhasil dibuat",
        content: {
          "application/json": {
            schema: resolver(
              z.object({
                success: z.boolean(),
                id: z.string(),
              })
            ),
          },
        },
      },
    },
  }),
  async (c) => {
    const body = await c.req.json();
    
    // Body dijamin valid karena telah melewati middleware resolver Zod di atas
    return c.json({
      success: true,
      id: "prod_12345",
    }, 201);
  }
);

export default productRouter;
```

---

## 🔗 Memasang (Mount) Route ke Aplikasi
Agar route dapat diakses oleh client, mount router baru tersebut ke dalam router utama di `src/routes/index.ts`:

```typescript
import { Hono } from "hono";
import productRouter from "./product.js";

const apiRouter = new Hono();

// Daftarkan route baru dengan prefiks path
apiRouter.route("/products", productRouter);

export default apiRouter;
```

Dengan mendaftarkan route ke `apiRouter`, endpoint tersebut kini otomatis terdokumentasi dan dapat dicoba secara interaktif di **Swagger UI** (`http://localhost:8000/api/doc`).
