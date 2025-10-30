import { defineSource } from "../utils/source"
import { myFetch } from "../utils/fetch"

interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  const targetUrl = `https://tophub.today/n/4MdArgGexD`
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
  }

  const html = await myFetch(targetUrl, { headers })

  const result: HotItem[] = []

  // 匹配所有文章项
  const itemRegex = /<td><a href="([^"]+)" target="_blank" rel="nofollow" itemid="\d+">([^<]+)<\/a><\/td>/g

  let match: RegExpExecArray | null = null // Initialize match to null

  while (true) {
    match = itemRegex.exec(html)
    if (match === null) {
      break
    }
    const [, url, title] = match
    const id = url.split("/").pop() || url

    result.push({
      id,
      title: title.trim(),
      url,
      mobileUrl: url, // Assuming the same URL for mobile
    })
  }

  return result
})
