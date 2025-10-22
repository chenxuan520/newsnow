interface HotItem {
  id: string
  title: string
  url: string
  mobileUrl: string
}

export default defineSource(async () => {
  const targetUrl = `https://www.qbitai.com/page/1`
  // 为了模拟浏览器访问，添加User-Agent头，避免网站反爬机制
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0",
  }

  // 获取量子位首页的HTML内容
  const html = await myFetch(targetUrl, { headers })

  const result: HotItem[] = []

  // 正则表达式匹配文章列表项结构
  // 目标是 <div class="article_list"> 内部的每一个 <div class="picture_text"> 块。
  // 在每个 <div class="picture_text"> 中，我们寻找 <h4> 标签内的 <a> 链接。
  // 解释：
  //   - <div class="picture_text">：匹配文章项的开始容器。
  //   - [\s\S]*?：非贪婪匹配所有字符（包括换行符），用于跳过 <div class="picture"> 部分，直到找到下一个匹配项。
  //   - <h4[^>]*>：匹配 <h4> 标签，并允许其有属性。
  //   - <a href="([^"]+)"[^>]*>：捕获文章的完整 URL (Group 1)，并允许 <a> 标签有其他属性。
  //   - ([\s\S]+?)：捕获 <a> 标签内的所有内容 (Group 2)，包括可能的HTML子标签或额外空白，非贪婪匹配。
  //   - <\/a><\/h4>：匹配 <a> 和 </h4> 闭合标签。
  const regex = /<div class="picture_text">[\s\S]*?<h4[^>]*><a href="([^"]+)"[^>]*>([\s\S]+?)<\/a><\/h4>/g

  let match: RegExpExecArray | null // 声明 match 变量，并允许它为 null

  // 修复 no-cond-assign 警告：将赋值操作移到循环内部，并在之后进行判断
  while (true) {
    match = regex.exec(html) // 赋值操作
    if (match === null) { // 判断是否匹配成功
      break
    }

    const [, fullItemUrl, rawTitleContent] = match

    // 从完整URL中提取路径作为ID，与示例中的 id: path 逻辑保持一致。
    // 使用 URL 对象解析路径更健壮。
    const urlObject = new URL(fullItemUrl)
    const id = urlObject.pathname // 例如: /2025/10/344334.html

    // 清理标题：
    // 1. 移除所有HTML标签（<p>, <b>, <em> 等），以确保标题是纯文本。
    // 2. 移除标题前后的空白字符。
    const title = rawTitleContent.replace(/<[^>]+>/g, "").trim()

    result.push({
      id,
      title, // 使用清理后的纯文本标题
      url: fullItemUrl,
      mobileUrl: fullItemUrl, // 假设量子位采用响应式设计，PC端URL也适用于移动端，所以mobileUrl与url相同
    })
  }

  return result
})
