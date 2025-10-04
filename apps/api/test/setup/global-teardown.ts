import { TestSetup } from "./global-setup";

export default async (): Promise<void> => {
  try {
    await TestSetup.teardown();

    // Allow a brief moment for cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  } catch (error) {
    console.error("❌ Error in Jest global teardown:", error);
  }
};
