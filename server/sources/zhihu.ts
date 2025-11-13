interface Res {
  data: {
    type: "hot_list_feed"
    style_type: "1"
    feed_specific: {
      answer_count: 411
    }
    target: {
      title_area: {
        text: string
      }
      excerpt_area: {
        text: string
      }
      image_area: {
        url: string
      }
      metrics_area: {
        text: string
        font_color: string
        background: string
        weight: string
      }
      label_area: {
        type: "trend"
        trend: number
        night_color: string
        normal_color: string
      }
      link: {
        url: string
      }
    }
  }[]
}

export default defineSource({
  zhihu: async () => {
    const url = "https://www.zhihu.com/api/v3/feed/topstory/hot-list-web?limit=20&desktop=true"
    // 增强请求头模拟真实浏览器，提高反爬通过率
    const headers = {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Referer": "https://www.zhihu.com/",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    }
    const res: Res = await myFetch(url, { headers })
    return res.data
      .map((k) => {
        return {
          id: k.target.link.url.match(/(\d+)$/)?.[1] ?? k.target.link.url,
          title: k.target.title_area.text,
          extra: {
            info: k.target.metrics_area.text,
            hover: k.target.excerpt_area.text,
          },
          url: k.target.link.url,
        }
      })
  },
})
