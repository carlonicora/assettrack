import { DataClass } from "@/jsonApi/DataClass";
import { Modules } from "@/modules/modules";

export class DataBootstrapper {
  private static _isBootstrapped = false;

  static bootstrap(): void {
    if (this._isBootstrapped) return;

    const data = Object.getOwnPropertyNames(Modules)
      .filter((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(Modules, key);
        return descriptor && typeof descriptor.get === "function";
      })
      .map((key) => (Modules as any)[key]);

    data.forEach((item) => {
      DataClass.registerObjectClass(item, (item as any).model);
    });

    this._isBootstrapped = true;
  }
}
