interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  // 目标URL：纽约时报中文网“中国”专题页面
  const targetUrl = `https://cn.nytimes.com/china/`
  // 为了模拟浏览器访问，添加User-Agent头，避免网站反爬机制
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
  }

  // 获取纽约时报中文网“中国”专题页面的HTML内容
  const html = await myFetch(targetUrl, { headers })

  const result: HotItem[] = []

  // 修正后的正则表达式：确保匹配完整的 <li> 块，并在其中提取标题和链接
  // 解释：
  //   - <li class="autoListStory[^>]*>  : 匹配文章项的开始容器，允许有额外类名。
  //   - [\s\S]*?                      : 非贪婪匹配，跳过 <li> 内部到达 <h3> 之前的内容。
  //   - (?: ... )                     : 非捕获组，将标题和链接的匹配作为一个整体。
  //   - <h3 class="regularSummaryHeadline"> : 匹配包含文章标题的 H3 标签。
  //   - <a[^>]*href="([^"]+)"[^>]*>   : 捕获文章的 URL (Group 1)，允许 <a> 标签有其他属性。
  //   - ([\s\S]+?)                    : 捕获 <a> 标签内的标题文本 (Group 2)。
  //   - <\/a><\/h3>                   : 匹配 <a> 和 </h3> 闭合标签。
  //   - [\s\S]*?<\/li>                : 非贪婪匹配，跳过 </h3> 之后到达当前 <li> 闭合标签的内容。
  //   - /g                             : 全局匹配标志，查找所有匹配项。
  const regex = /<li class="autoListStory[^>]*>[\s\S]*?<h3 class="regularSummaryHeadline"><a[^>]*href="([^"]+)"[^>]*>([\s\S]+?)<\/a><\/h3>[\s\S]*?<\/li>/g

  let match: RegExpExecArray | null // 声明 match 变量，并允许它为 null

  // 循环查找所有匹配项
  while (true) {
    match = regex.exec(html) // 赋值操作
    if (match === null) { // 判断是否匹配成功
      break
    }

    // 正则表达式的捕获组现在是 1 和 2
    const [, relativeItemUrl, rawTitleContent] = match

    // 纽约时报的 href 是根相对路径 (e.g., /world/...), 需要与 targetUrl 拼接成完整的 URL
    // 使用 new URL(relativeItemUrl, targetUrl) 会自动处理相对路径和基准URL的拼接
    const fullItemUrl = new URL(relativeItemUrl, targetUrl).href

    // 从完整URL中提取路径作为ID。
    // 例如: https://cn.nytimes.com/world/20251024/cuba-chinese-man-mexico-drugs/ -> /world/20251024/cuba-chinese-man-mexico-drugs/
    const urlObject = new URL(fullItemUrl)
    const id = urlObject.pathname

    // 清理标题：
    // 1. 移除所有HTML标签（如果有的话，如<b>, <em>等）。
    // 2. 移除标题前后的空白字符。
    const title = rawTitleContent.replace(/<[^>]+>/g, "").trim()

    result.push({
      id,
      title, // 使用清理后的纯文本标题
      url: fullItemUrl,
      mobileUrl: fullItemUrl, // 假设纽约时报中文网采用响应式设计，PC端URL也适用于移动端
    })
  }

  return result
})
