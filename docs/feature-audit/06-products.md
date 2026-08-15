# 06 — Products

Source: `Products` nav item → `/admin/products`

## Purpose
Product/service catalog used as reusable line items across Invoices, Proposals, and Deals — a lightweight CPQ (configure-price-quote) layer: Products + Discounts + Price Books.

## List view (`Products Dashboard`)
- Header: "Products Dashboard" + "View and manage your products and services from here."
- Toolbar: search, **Filter**, **Customize**, **Add Product** (primary), **Add Discount**, **Create Pricebook**.
- Table columns: Product Name, Code, Family, Type, Unit, Status, Created At, Updated At, Actions.
- Empty state: "No products found. Get started by adding your first product or service to the system." + **Add Your First Product**.

## Create — "Add New Product" (right-side drawer)
- Product Name * (text)
- Product Family (text, optional — a free-text grouping/category)
- Product Code * (text — SKU-like identifier)
- Product Type * (select, default "Product" — likely also has "Service" as an option, matching "products and services" copy)
- Unit of Measure * (select, default "Each")
- Description (textarea, optional)
- No price field on the product itself — **pricing lives in Price Books** (see below), implying a product can have different prices per price book/currency/client segment.

## Create — "Add Discount" (centered modal)
- Discount Type (select, default "Percentage (%)" — likely also "Fixed Amount")
- Discount Value (number, with inline unit suffix e.g. "%")
- Helper text: "Enter the percentage discount (e.g. 10 for 10%)."
- Single button: Create Discount.

## Create — "Create Price Book" (centered modal)
- Price Book Name * (text)
- Description (textarea, optional)
- Single button: Create.

## Data model (inferred)
**Product**: id, name, code, family, type (Product/Service), unit_of_measure, description, status, created_at, updated_at.
**Discount**: id, type (percentage/fixed), value.
**PriceBook**: id, name, description; likely has many **PriceBookEntries** (product_id, price_book_id, unit_price, currency) — the join that actually assigns prices to products, though this wasn't directly opened (no products existed to attach a price to).
Relationships: Products/Discounts are referenced as line items when building Invoices/Proposals (see 10-proposals.md, 11-invoices.md).

## Open questions
- Full Product Type and Discount Type option lists.
- Price Book entry UI (how a price gets attached to a product within a book) — not reachable without an existing product.
- Whether multiple price books represent multi-currency support or customer-tier pricing (e.g. wholesale vs retail).
