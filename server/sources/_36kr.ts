interface Res {
  data: {
    itemId: string
    templateMaterial: {
      widgetTitle: string
    }
  }[]
}

export default defineSource(async () => {
  console.log(1234)
  const url = `https://api.iyuns.com/api/hot36kr`
  const res: Res = await myFetch(url)
  console.log(res)
  return res.data.map((k) => {
    const url = `https://www.36kr.com/p/${k.itemId}`
    return {
      id: `36kr-${k.itemId}`,
      title: k.templateMaterial.widgetTitle,
      url,
    }
  })
})
