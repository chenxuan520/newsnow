interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  // 目标URL：中央社（CNA）两岸新闻列表页
  const targetUrl = `https://www.cna.com.tw/list/acn.aspx`
  // 为了模拟浏览器访问，添加User-Agent头，避免网站反爬机制
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
  }

  // 获取中央社新闻列表页的HTML内容
  const html = await myFetch(targetUrl, { headers })

  const result: HotItem[] = []

  // 首先，匹配包含新闻列表的 <ul id="jsMainList"> 标签的整个内容
  const mainListRegex = /<ul id="jsMainList"[^>]*>([\s\S]*?)<\/ul>/
  const mainListMatch = mainListRegex.exec(html)

  if (mainListMatch && mainListMatch[1]) {
    const mainListContent = mainListMatch[1]

    // 然后，在这个内容中匹配CNA新闻列表项结构
    // 目标是 <li> 标签内部的每一个 <a> 标签，其中包含文章链接和标题。
    // 解释：
    //   - <li[^>]*>                       : 匹配 <li> 标签的开始，允许有其他属性。
    //   - [\s\S]*?                       : 非贪婪匹配，跳过 <li> 内部到达 <a> 之前的内容。
    //   - <a href="([^"]+)"[^>]*>        : 捕获文章的 URL (Group 1)，允许 <a> 标签有其他属性。
    //   - [\s\S]*?                       : 非贪婪匹配，跳过 <a> 内部到达 <h2> 之前的内容（可能包含图片或其他div）。
    //   - <h2><span>([\s\S]+?)<\/span><\/h2> : 捕获 <span> 标签内的标题文本 (Group 2)。
    //   - [\s\S]*?                       : 非贪婪匹配，跳过 </h2> 之后到达当前 <a> 闭合标签的内容。
    //   - <\/a>                          : 匹配 </a> 闭合标签。
    //   - [\s\S]*?<\/li>                 : 非贪婪匹配，跳过 </a> 之后到达当前 <li> 闭合标签的内容。
    //   - /g                             : 全局匹配标志，查找所有匹配项。
    const itemRegex = /<li[^>]*>[\s\S]*?<a href="([^"]+)"[^>]*>[\s\S]*?<h2><span>([\s\S]+?)<\/span><\/h2>[\s\S]*?<\/a>[\s\S]*?<\/li>/g

    let match: RegExpExecArray | null // 声明 match 变量，并允许它为 null

    // 循环查找所有匹配项
    while (true) {
      match = itemRegex.exec(mainListContent) // 在 mainListContent 中进行匹配
      if (match === null) { // 判断是否匹配成功
        break
      }

      // 正则表达式的捕获组现在是 1 (URL) 和 2 (Title)
      const [, relativeItemUrl, rawTitleContent] = match

      // CNA的 href 是根相对路径 (e.g., /news/acn/...). 需要与 targetUrl 拼接成完整的 URL
      // 使用 new URL(relativeItemUrl, targetUrl) 会自动处理相对路径和基准URL的拼接
      const fullItemUrl = new URL(relativeItemUrl, targetUrl).href

      // 从完整URL中提取路径作为ID。
      // 例如: https://www.cna.com.tw/news/acn/202510240166.aspx -> /news/acn/202510240166.aspx
      const urlObject = new URL(fullItemUrl)
      const id = urlObject.pathname

      // 清理标题：
      // 1. 移除所有HTML标签（如果有的话，但CNA的标题通常是纯文本）。
      // 2. 移除标题前后的空白字符。
      const title = rawTitleContent.replace(/<[^>]+>/g, "").trim()

      result.push({
        id,
        title, // 使用清理后的纯文本标题
        url: fullItemUrl,
        mobileUrl: fullItemUrl, // 假设CNA采用响应式设计，PC端URL也适用于移动端
      })
    }
  }

  return result
})
