// Assuming `defineSource` and `myFetch` are available in your environment.
// CRITICAL ASSUMPTION: `myFetch` returns a JSON *string*, not a parsed object.

interface HuxiuArticle {
  aid: string
  title: string
  summary: string
  url: string
  pic_path: string
  // Add other fields you might need from datalist items, or omit if not used.
}

// This interface describes the *parsed* JSON object structure
interface HuxiuResponse {
  success: boolean
  data: {
    name: string
    datalist: HuxiuArticle[]
    last_id: string
    share_info: any
  }
  message: string
}

export default defineSource(async () => {
  console.log("Fetching Huxiu data...")

  const url = "https://api-article.huxiu.com/web/channel/articleListV1"

  const requestBody = new URLSearchParams({
    platform: "m",
    channel_id: "107",
    last_id: "0",
    pagesize: "10",
  }).toString()

  let rawResponseString: string // To hold the string returned by myFetch
  let parsedResponse: HuxiuResponse // To hold the parsed JSON object

  try {
    // myFetch is now assumed to return a JSON string
    rawResponseString = await myFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: requestBody,
    })

    // Log the raw string to confirm
    console.log("--- Received raw string from myFetch ---")
    console.log(rawResponseString)
    console.log("----------------------------------------")

    // CRITICAL FIX: Parse the JSON string into a JavaScript object
    parsedResponse = JSON.parse(rawResponseString)

    // Log the parsed object for verification
    console.log("--- Successfully parsed JSON object ---")
    console.log(JSON.stringify(parsedResponse, null, 2)) // Use pretty print for object
    console.log("---------------------------------------")
  } catch (error: any) {
    console.error("Error during myFetch call or JSON parsing:", error)
    throw new Error(`Failed to fetch or parse Huxiu data from API: ${error.message || String(error)}`)
  }

  // Now, all checks will be performed on the actual JavaScript object.
  if (!parsedResponse.success) {
    console.error("API specific error: parsedResponse.success is false", parsedResponse)
    throw new Error("Huxiu API did not report success (parsedResponse.success is false).")
  }
  if (!parsedResponse.data) {
    console.error("API specific error: parsedResponse.data is null or undefined", parsedResponse)
    throw new Error("Huxiu API returned no \"data\" object.")
  }
  if (!Array.isArray(parsedResponse.data.datalist) || parsedResponse.data.datalist.length === 0) {
    console.error("API specific error: parsedResponse.data.datalist is not an array or is empty", parsedResponse)
    throw new Error("Huxiu API returned no \"datalist\" or an empty \"datalist\" array.")
  }

  console.log("Huxiu data successfully fetched, parsed, and validated.")

  return parsedResponse.data.datalist.map((item) => {
    return {
      id: `huxiu-${item.aid}`,
      title: item.title,
      url: item.url,
    }
  })
})
