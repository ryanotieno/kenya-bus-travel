import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

const dataFile = path.join(process.cwd(), "data", "companies.json")

export async function GET() {
  try {
    const data = await fs.readFile(dataFile, "utf-8")
    const companies = JSON.parse(data)
    return NextResponse.json(companies)
  } catch (err) {
    return NextResponse.json({ error: "Could not read companies data." }, { status: 500 })
  }
}

// POST body: { ownerEmail, saccoName, route, vehicles }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ownerEmail, saccoName, route, vehicles } = body
    if (!ownerEmail || !saccoName || typeof route !== 'string' || !Array.isArray(vehicles)) {
      return NextResponse.json({ error: "Invalid data." }, { status: 400 })
    }
    let companies = []
    try {
      const data = await fs.readFile(dataFile, "utf-8")
      companies = JSON.parse(data)
    } catch {}
    // Find or create company for owner
    let company = companies.find((c: any) => c.ownerEmail === ownerEmail)
    if (!company) {
      company = { ownerEmail, saccos: [] }
      companies.push(company)
    }
    // Find or create sacco
    let sacco = company.saccos.find((s: any) => s.saccoName === saccoName)
    if (!sacco) {
      sacco = { saccoName, route, vehicles }
      company.saccos.push(sacco)
    } else {
      sacco.route = route
      sacco.vehicles = vehicles
    }
    await fs.writeFile(dataFile, JSON.stringify(companies, null, 2))
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Could not save company data." }, { status: 500 })
  }
} 