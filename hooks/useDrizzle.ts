import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export function useDrizzle() {
  const sqlite = useSQLiteContext();
  return drizzle(sqlite);
}
