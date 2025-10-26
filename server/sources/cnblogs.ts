import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  const targetUrl = `https://www.cnblogs.com/pick/`
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
  }

  const html = await myFetch(targetUrl, { headers })

  const result: HotItem[] = []

  // 匹配所有文章项
  const itemRegex = /<article class="post-item" data-post-id="(\d+)">[\s\S]*?<a class="post-item-title" href="([^"]+)" target="_blank">([^<]+)<\/a>[\s\S]*?<\/article>/g

  let match: RegExpExecArray | null = null // Initialize match to null

  while (true) {
    match = itemRegex.exec(html)
    if (match === null) {
      break
    }
    const [, id, url, title] = match

    result.push({
      id,
      title: title.trim(),
      url,
      mobileUrl: url, // Assuming the same URL for mobile
    })
  }

  return result
})
