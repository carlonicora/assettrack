"use server";

import { revalidateTag } from "next/cache";

export default async function cacheTagCleaner(tag?: string): Promise<void> {
  if (!tag) return;
  revalidateTag(tag);
}
