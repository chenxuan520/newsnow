interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  // BBC中文网中国主题页面（简体中文）
  const targetUrl = "https://www.bbc.com/zhongwen/topics/ckr7mn6r003t/simp"
  // 增强请求头模拟真实浏览器，提高反爬通过率
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    "Referer": "https://www.bbc.com/",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
  }

  // 获取页面HTML内容
  const html = await myFetch(targetUrl, { headers })

  const result: HotItem[] = []

  // 正则表达式解析文章列表：
  // 目标结构：<li class="bbc-t44f9r"> 下的 <h2> 标签内的 <a> 链接
  // 解析逻辑：
  // 1. 匹配文章列表项容器 <li class="bbc-t44f9r">
  // 2. 非贪婪匹配到 <h2> 标签（跳过图片等无关内容）
  // 3. 捕获 <a> 标签的 href 属性（文章URL）和文本内容（标题）
  const regex = /<li class="bbc-t44f9r">[\s\S]*?<h2[^>]*><a href="([^"]+)"[^>]*>([\s\S]+?)<\/a><\/h2>/g

  let match: RegExpExecArray | null

  // 循环匹配所有文章项（修复 no-cond-assign 警告）
  while (true) {
    match = regex.exec(html)
    if (!match) break

    const [, fullItemUrl, rawTitleContent] = match

    // 解析URL获取ID（使用路径作为唯一标识，与示例逻辑一致）
    const urlObject = new URL(fullItemUrl)
    const id = urlObject.pathname // 格式示例：/zhongwen/articles/c24lq1r208lo/simp

    // 清理标题：移除HTML标签和前后空白
    const title = rawTitleContent.replace(/<[^>]+>/g, "").trim()

    // 构建响应数据（BBC移动端使用同一URL，故mobileUrl与url一致）
    result.push({
      id,
      title,
      url: fullItemUrl,
      mobileUrl: fullItemUrl,
    })
  }

  return result
})
