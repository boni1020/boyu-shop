import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get supabase client
  const getSupabase = () => {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL;

    const supabaseKey =
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return null;
    }
    return createClient(supabaseUrl, supabaseKey);
  };

  // Supabase connection test endpoint
  app.get("/api/test-supabase", async (req, res) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({
          error: "Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_ANON_KEY in Secrets.",
        });
      }

      const { data, error } = await supabase
        .from("categories")
        .select("id,name")
        .limit(5);

      if (error) {
        return res.status(500).json({
          error: error.message,
          details: error,
        });
      }

      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || "Unknown server error",
      });
    }
  });

  // Get active categories ordered by sort_order
  app.get("/api/categories", async (req, res) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({
          error: "Missing Supabase configuration.",
        });
      }

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        return res.status(500).json({
          error: error.message,
          details: error,
        });
      }

      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || "Unknown server error",
      });
    }
  });

  // Get active brands
  app.get("/api/brands", async (req, res) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({
          error: "Missing Supabase configuration.",
        });
      }

      // Check if sort_order column exists, or order by name / id
      let query = supabase.from("brands").select("*").eq("is_active", true);

      const { data, error } = await query;

      if (error) {
        return res.status(500).json({
          error: error.message,
          details: error,
        });
      }

      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || "Unknown server error",
      });
    }
  });

  // Get active products with product_variants
  app.get("/api/products", async (req, res) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({
          error: "Missing Supabase configuration.",
        });
      }

      // Fetch products and active variants in parallel
      const [productsRes, variantsRes] = await Promise.all([
        supabase
          .from("products")
          .select(`
            *,
            categories (*),
            brands (*)
          `)
          .eq("is_active", true),
        supabase
          .from("product_variants")
          .select(`
            id,
            product_id,
            name,
            weight,
            price,
            clearance_price,
            is_new,
            is_sale,
            option_values,
            is_active
          `)
          .eq("is_active", true),
      ]);

      if (productsRes.error) {
        return res.status(500).json({
          error: productsRes.error.message,
          details: productsRes.error,
        });
      }

      const products = productsRes.data || [];
      const variants = variantsRes.data || [];

      // Group variants by product_id (strictly whitelist public variant fields only)
      const variantsByProductId = new Map<string, any[]>();
      for (const variant of variants) {
        const pId = String(variant.product_id);
        if (!variantsByProductId.has(pId)) {
          variantsByProductId.set(pId, []);
        }
        variantsByProductId.get(pId)!.push({
          id: String(variant.id),
          product_id: String(variant.product_id),
          name: variant.name || '',
          weight: variant.weight != null ? Number(variant.weight) : null,
          price: variant.price != null ? Number(variant.price) : 0,
          clearance_price: variant.clearance_price != null ? Number(variant.clearance_price) : null,
          is_new: Boolean(variant.is_new),
          is_sale: Boolean(variant.is_sale),
          option_values: variant.option_values || null,
        });
      }

      // Strictly return public product fields, with zero cost fields
      const productsWithVariants = products.map((prod) => {
        const prodVariants = variantsByProductId.get(String(prod.id)) || [];
        const hasVariants = prodVariants.length > 0;

        const isNew = hasVariants
          ? prodVariants.some((v: any) => Boolean(v.is_new))
          : Boolean(prod.is_new);
        const isSale = hasVariants
          ? prodVariants.some((v: any) => Boolean(v.is_sale))
          : Boolean(prod.is_sale);

        // For multi-variant: primary variant price if available, else product price
        const primaryVariant = hasVariants ? prodVariants[0] : null;
        const effectivePrice = primaryVariant
          ? (primaryVariant.is_sale && primaryVariant.clearance_price != null
              ? primaryVariant.clearance_price
              : primaryVariant.price)
          : (isSale && prod.clearance_price != null
              ? Number(prod.clearance_price)
              : prod.price != null
              ? Number(prod.price)
              : 0);

        const weight = primaryVariant && primaryVariant.weight != null
          ? primaryVariant.weight
          : prod.weight != null
          ? Number(prod.weight)
          : null;

        return {
          id: String(prod.id),
          name: prod.name || '',
          description: prod.description || null,
          brand_id: prod.brand_id ? String(prod.brand_id) : null,
          category_id: prod.category_id ? String(prod.category_id) : null,
          price: effectivePrice,
          clearance_price: prod.clearance_price != null ? Number(prod.clearance_price) : null,
          img: prod.img || null,
          hover_img: prod.hover_img || null,
          weight: weight,
          expiry_date: prod.expiry_date || null,
          origin: prod.origin || null,
          is_active: Boolean(prod.is_active),
          is_new: isNew,
          is_sale: isSale,
          isNewArrival: isNew,
          isClearance: isSale,
          categories: prod.categories || null,
          brands: prod.brands || null,
          product_variants: prodVariants,
          variants: prodVariants,
        };
      });

      return res.json(productsWithVariants);
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || "Unknown server error",
      });
    }
  });

  // Recalculate product prices endpoint
  app.post("/api/recalculate-prices", async (req, res) => {
    try {
      const supabase = getSupabase();
      if (!supabase) {
        return res.status(500).json({
          error: "Missing Supabase configuration.",
        });
      }

      const { data, error } = await supabase.rpc("recalculate_product_prices");
      if (error) {
        return res.status(500).json({
          error: error.message,
          details: error,
        });
      }

      return res.json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({
        error: err?.message || "Unknown server error",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
