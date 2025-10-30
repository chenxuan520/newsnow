import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  const targetUrl = `https://thehackernews.com/`
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
  }

  const html = await myFetch(targetUrl, { headers })
  console.log("Fetched HTML from TheHackerNews", html)

  const result: HotItem[] = []

  const itemRegex = /<a class='story-link' href="([^"]+)">[\s\S]*?<h2 class='home-title'>([^<]+)<\/h2>/g

  let match: RegExpExecArray | null = itemRegex.exec(html)

  while (match !== null) {
    const [, url, title] = match
    const id = url.match(/(\d{4}\/\d{2}\/[^.]+)\.html$/)?.[1] || url

    console.log("Parsed item:", { id, title, url })
    result.push({
      id,
      title: title.trim(),
      url,
      mobileUrl: url,
    })
    match = itemRegex.exec(html)
  }

  return result
})
