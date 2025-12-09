import {
  mysqlTable,
  serial,
  text,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";

export const submissions = mysqlTable("submissions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  formData: json("form_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
