"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePaths(path: string): Promise<void> {
  "use server";
  revalidatePath(path, "page");
}
