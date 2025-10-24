import ReactDOM from "react-dom/client"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react" // Import React and useState
import { routeTree } from "./routeTree.gen"

const ENABLE_PASSWORD_PROTECTION = true // Set to false to disable password protection
const PASSWORD = "123456" // Hardcoded password

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})

const rootElement = document.getElementById("app")!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />) // Render the App component
}

function App() {
  // Check localStorage for authentication status on initial load
  const initialAuthStatus = ENABLE_PASSWORD_PROTECTION
    ? localStorage.getItem("isAuthenticated") === "true"
    : true
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthStatus)
  const [passwordInput, setPasswordInput] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (passwordInput === PASSWORD) {
      setIsAuthenticated(true)
      setError("")
      if (ENABLE_PASSWORD_PROTECTION) {
        localStorage.setItem("isAuthenticated", "true") // Store authentication status
      }
    } else {
      setError("Incorrect password")
    }
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <h1 style={{ color: "#666", marginBottom: "10px", fontSize: "28px", fontWeight: "bold" }}>Enter Password</h1>
          <input
            type="password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleLogin()
              }
            }}
            style={{
              padding: "12px 15px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ddd",
              width: "250px",
              boxSizing: "border-box",
            }}
            placeholder="Password"
          />
          <button
            onClick={handleLogin}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#0056b3")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#007bff")}
            style={{
              padding: "12px 25px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              cursor: "pointer",
              transition: "background-color 0.3s ease",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            }}
          >
            Login
          </button>
          {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
