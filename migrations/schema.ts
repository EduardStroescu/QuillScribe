import {
  pgTable,
  pgEnum,
  text,
  uuid,
  jsonb,
  integer,
  boolean,
  timestamp,
  bigint,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { relations, sql } from "drizzle-orm";
export const keyStatus = pgEnum("key_status", [
  "default",
  "valid",
  "invalid",
  "expired",
]);
export const keyType = pgEnum("key_type", [
  "aead-ietf",
  "aead-det",
  "hmacsha512",
  "hmacsha256",
  "auth",
  "shorthash",
  "generichash",
  "kdf",
  "secretbox",
  "secretstream",
  "stream_xchacha20",
]);
export const factorType = pgEnum("factor_type", ["totp", "webauthn"]);
export const factorStatus = pgEnum("factor_status", ["unverified", "verified"]);
export const aalLevel = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethod = pgEnum("code_challenge_method", [
  "s256",
  "plain",
]);
export const pricingType = pgEnum("pricing_type", ["one_time", "recurring"]);
export const pricingPlanInterval = pgEnum("pricing_plan_interval", [
  "day",
  "week",
  "month",
  "year",
]);
export const subscriptionStatus = pgEnum("subscription_status", [
  "trialing",
  "active",
  "canceled",
  "incomplete",
  "incomplete_expired",
  "past_due",
  "unpaid",
]);
export const equalityOp = pgEnum("equality_op", [
  "eq",
  "neq",
  "lt",
  "lte",
  "gt",
  "gte",
  "in",
]);
export const action = pgEnum("action", [
  "INSERT",
  "UPDATE",
  "DELETE",
  "TRUNCATE",
  "ERROR",
]);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    status: subscriptionStatus("status"),
    metadata: jsonb("metadata"),
    priceId: text("price_id").references(() => prices.id),
    quantity: integer("quantity"),
    cancelAtPeriodEnd: boolean("cancel_at_period_end"),
    created: timestamp("created", { withTimezone: true, mode: "string" })
      .default(sql`now()`)
      .notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
      mode: "string",
    })
      .default(sql`now()`)
      .notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
      mode: "string",
    })
      .default(sql`now()`)
      .notNull(),
    endedAt: timestamp("ended_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`now()`),
    cancelAt: timestamp("cancel_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`now()`),
    canceledAt: timestamp("canceled_at", {
      withTimezone: true,
      mode: "string",
    }).default(sql`now()`),
    trialStart: timestamp("trial_start", {
      withTimezone: true,
      mode: "string",
    }).default(sql`now()`),
    trialEnd: timestamp("trial_end", {
      withTimezone: true,
      mode: "string",
    }).default(sql`now()`),
  },
  (table) => [
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_price_id_idx").on(table.priceId),
  ]
);

export const collaborators = pgTable(
  "collaborators",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("collaborators_workspace_id_idx").on(table.workspaceId),
    index("collaborators_user_id_idx").on(table.userId),
    unique("collaborators_workspace_user_id_idx").on(
      table.workspaceId,
      table.userId
    ),
  ]
);

export const files = pgTable(
  "files",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .$onUpdate(() => sql`now()`)
      .notNull(),
    title: text("title").notNull(),
    iconId: text("icon_id").notNull(),
    data: text("data"),
    inTrash: text("in_trash"),
    bannerUrl: text("banner_url"),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    folderId: uuid("folder_id")
      .notNull()
      .references(() => folders.id, {
        onDelete: "cascade",
      }),
    // Metadata column added to not rerender unnecessarily on mutations done by the same client
    lastModifiedBy: uuid("last_modified_by"),
  },
  (table) => [
    index("files_workspace_id_idx").on(table.workspaceId),
    index("files_folder_id_idx").on(table.folderId),
  ]
);

export const folders = pgTable(
  "folders",
  {
    id: uuid("id").defaultRandom().primaryKey().notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .$onUpdate(() => sql`now()`)
      .notNull(),
    title: text("title").notNull(),
    iconId: text("icon_id").notNull(),
    data: text("data"),
    inTrash: text("in_trash"),
    bannerUrl: text("banner_url"),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, {
        onDelete: "cascade",
      }),
    // Metadata column added to not rerender unnecessarily on mutations done by the same client
    lastModifiedBy: uuid("last_modified_by"),
  },
  (table) => [index("folders_workspace_id_idx").on(table.workspaceId)]
);

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .$onUpdate(() => sql`now()`)
    .notNull(),
  workspaceOwner: uuid("workspace_owner").notNull(),
  title: text("title").notNull(),
  iconId: text("icon_id").notNull(),
  data: text("data"),
  inTrash: text("in_trash"),
  logo: text("logo"),
  bannerUrl: text("banner_url"),
  // Metadata column added to not rerender unnecessarily on mutations done by the same client
  lastModifiedBy: uuid("last_modified_by"),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  billingAddress: jsonb("billing_address"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .$onUpdate(() => sql`now()`)
    .notNull(),
  paymentMethod: jsonb("payment_method"),
  email: text("email").notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().notNull(),
  stripeCustomerId: text("stripe_customer_id"),
});

export const products = pgTable("products", {
  id: text("id").primaryKey().notNull(),
  active: boolean("active"),
  name: text("name"),
  description: text("description"),
  image: text("image"),
  metadata: jsonb("metadata"),
});

export const prices = pgTable(
  "prices",
  {
    id: text("id").primaryKey().notNull(),
    productId: text("product_id").references(() => products.id),
    active: boolean("active"),
    description: text("description"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    unitAmount: bigint("unit_amount", { mode: "number" }),
    currency: text("currency"),
    type: pricingType("type"),
    interval: pricingPlanInterval("interval"),
    intervalCount: integer("interval_count"),
    trialPeriodDays: integer("trial_period_days"),
    metadata: jsonb("metadata"),
  },
  (table) => [index("prices_product_id_idx").on(table.productId)]
);

export const productsRelations = relations(products, ({ many }) => ({
  prices: many(prices),
}));

export const pricesRelations = relations(prices, ({ one }) => ({
  product: one(products, {
    fields: [prices.productId],
    references: [products.id],
  }),
}));
