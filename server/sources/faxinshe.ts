interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  // RFI中文网首页地址
  const targetUrl = "https://www.rfi.fr/cn/"
  // 完善请求头信息，提升反爬兼容性
  const headers = {
  }

  // 获取页面HTML内容
  const html = await myFetch(targetUrl, { headers })

  const result: HotItem[] = []
  const baseUrl = "https://www.rfi.fr" // RFI基础域名，用于拼接相对路径

  // 正则表达式解析文章列表：
  // 目标结构：<div class="o-layout-list__item"> 下的 <article__title> 内的 <a> 链接
  // 解析逻辑：
  // 1. 匹配文章列表项容器 <div class="o-layout-list__item ...">
  // 2. 非贪婪匹配到 <div class="article__title ">（跳过图片等无关内容）
  // 3. 捕获 <a> 标签的 href 属性（相对路径URL）和 <h2> 内的标题文本
  const regex = /<div class="o-layout-list__item[^>]*>[\s\S]*?<div class="article__title "><a href="([^"]+)"[^>]*>[\s\S]*?<h2 aria-level="3">([\s\S]+?)<\/h2>/g

  let match: RegExpExecArray | null

  // 循环匹配所有文章项
  while (true) {
    match = regex.exec(html)
    if (!match) break

    const [, relativeUrl, rawTitleContent] = match

    // 拼接完整的绝对URL（处理相对路径）
    const fullItemUrl = new URL(relativeUrl, baseUrl).href

    // 解析URL获取ID（使用路径作为唯一标识）
    const urlObject = new URL(fullItemUrl)
    const id = urlObject.pathname // 格式示例：/cn/%E7%BE%8E%E6%B4%B2/20251023-...

    // 清理标题：移除前后空白（RFI标题已无额外HTML标签，简化清理逻辑）
    const title = rawTitleContent.trim()

    // 构建响应数据（RFI移动端使用同一URL）
    result.push({
      id,
      title,
      url: fullItemUrl,
      mobileUrl: fullItemUrl,
    })
  }

  return result
})
