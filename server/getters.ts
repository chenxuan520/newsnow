import type { SourceID } from "@shared/types"
import * as x from "glob:./sources/{_*.ts,*.ts,**/index.ts}"
import type { SourceGetter } from "./types"

export const getters = (function () {
  const getters = {} as Record<SourceID, SourceGetter>
  typeSafeObjectEntries(x).forEach(([id, x]) => {
    const normalizedId = id.startsWith("_") ? id.substring(1) : id
    if (x.default instanceof Function) {
      Object.assign(getters, { [normalizedId]: x.default })
    } else {
      Object.assign(getters, x.default)
    }
  })
  return getters
})()
