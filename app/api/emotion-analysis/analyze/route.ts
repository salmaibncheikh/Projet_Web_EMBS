import { NextResponse } from "next/server"
import { spawn } from "child_process"
import { join } from "path"
import { existsSync } from "fs"

export async function POST() {
  try {
    // Use project .venv Python (has all required packages)
    const pythonPath = join(
      process.cwd(),
      "backend",
      ".venv",
      "Scripts",
      "python.exe"
    )

    const scriptPath = join(
      process.cwd(),
      "backend",
      "emotional_classification",
      "model",
      "backend_app",
      "full_flow_runner.py"
    )

    const workingDir = join(
      process.cwd(),
      "backend",
      "emotional_classification",
      "model"
    )

    const inputImagePath = join(
      workingDir,
      "shared_memory",
      "0_BE_input",
      "original_input.png"
    )

    // Verify input image exists
    if (!existsSync(inputImagePath)) {
      console.error("Input image not found at:", inputImagePath)
      return NextResponse.json(
        { success: false, error: "Input image not found. Please upload an image first." },
        { status: 400 }
      )
    }

    console.log("Starting emotion analysis...")
    console.log("Python path:", pythonPath)
    console.log("Script path:", scriptPath)
    console.log("Working dir:", workingDir)

    return new Promise((resolve) => {
      const pythonProcess = spawn(pythonPath, [scriptPath], {
        cwd: workingDir,
        env: { 
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
          PYTHONLEGACYWINDOWSSTDIO: 'utf-8'
        },
        stdio: ['ignore', 'pipe', 'pipe']
      })

      let output = ""
      let errorOutput = ""

      // Set timeout for analysis (5 minutes max)
      const timeout = setTimeout(() => {
        pythonProcess.kill()
        resolve(
          NextResponse.json(
            { success: false, error: "Analysis timed out after 5 minutes" },
            { status: 408 }
          )
        )
      }, 5 * 60 * 1000)

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString()
        console.log("[ANALYSIS]:", data.toString())
      })

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString()
        console.error("[ANALYSIS ERROR]:", data.toString())
      })

      pythonProcess.on("error", (error) => {
        clearTimeout(timeout)
        console.error("Failed to start Python process:", error)
        resolve(
          NextResponse.json(
            { success: false, error: `Failed to start analysis: ${error.message}` },
            { status: 500 }
          )
        )
      })

      pythonProcess.on("close", (code) => {
        clearTimeout(timeout)
        console.log(`Python process exited with code: ${code}`)
        
        if (code === 0) {
          // Verify PDF was created
          const pdfPath = join(workingDir, "shared_memory", "7_PDFG_out", "full_analysis_report.pdf")
          if (existsSync(pdfPath)) {
            console.log("PDF report created successfully")
            resolve(
              NextResponse.json({
                success: true,
                message: "Analysis completed successfully"
              })
            )
          } else {
            console.error("PDF not found after analysis")
            resolve(
              NextResponse.json(
                { success: false, error: "Analysis completed but PDF not generated" },
                { status: 500 }
              )
            )
          }
        } else {
          console.error(`Analysis failed with code ${code}`)
          console.error("Error output:", errorOutput)
          resolve(
            NextResponse.json(
              {
                success: false,
                error: `Analysis failed with code ${code}`,
                details: errorOutput || output
              },
              { status: 500 }
            )
          )
        }
      })
    })
  } catch (error) {
    console.error("Error running analysis:", error)
    return NextResponse.json(
      { success: false, error: "Failed to run analysis" },
      { status: 500 }
    )
  }
}
