import { NextRequest, NextResponse } from 'next/server'

// Mock OCR/ICR processing and AI review for uploaded documents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileName, documentType } = body

    if (!fileName || !documentType) {
      return NextResponse.json(
        { error: 'fileName and documentType are required' },
        { status: 400 }
      )
    }

    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate mock OCR text based on document type
    const ocrTexts: Record<string, string> = {
      ESG_POLICY: `ENVIRONMENTAL, SOCIAL & GOVERNANCE POLICY

Effective Date: January 2024
Organization: [Extracted Organization Name]

1. ENVIRONMENTAL COMMITMENT
We are committed to reducing our environmental footprint through:
- Carbon neutrality targets by 2030
- 100% renewable energy usage
- Zero-waste manufacturing processes

2. SOCIAL RESPONSIBILITY
Our social initiatives include:
- Diversity and inclusion programs
- Community engagement partnerships
- Employee wellness programs

3. GOVERNANCE STANDARDS
We adhere to:
- Transparent reporting practices
- Independent board oversight
- Ethical business conduct`,

      SUSTAINABILITY_REPORT: `ANNUAL SUSTAINABILITY REPORT 2023

Executive Summary:
This report details our organization's sustainability performance across environmental, social, and governance dimensions.

Key Highlights:
- 25% reduction in carbon emissions
- 40% increase in workforce diversity
- 100% compliance with regulatory requirements

Environmental Metrics:
- GHG Emissions: 15,000 tCO2e (down 25%)
- Energy Intensity: 0.5 GJ/unit (down 15%)
- Water Usage: 2.5 ML (down 10%)

Social Metrics:
- Employee Satisfaction: 85%
- Training Hours: 40 hours/employee
- Community Investment: $2.5M`,

      CARBON_AUDIT: `CARBON FOOTPRINT AUDIT REPORT

Audit Period: FY 2023
Auditor: [Certified Auditing Firm]

Scope 1 Emissions: 5,000 tCO2e
Scope 2 Emissions: 8,000 tCO2e
Scope 3 Emissions: 12,000 tCO2e

Total Carbon Footprint: 25,000 tCO2e

Reduction Recommendations:
1. Transition to renewable energy sources
2. Implement energy efficiency measures
3. Optimize supply chain logistics`,

      ISO_CERTIFICATE: `ISO CERTIFICATION

Certificate Number: ISO-14001-2023-XXXXX
Standard: ISO 14001:2015 Environmental Management

Certified Organization: [Organization Name]
Scope: Environmental management system covering all operations

Certification Date: March 15, 2023
Expiry Date: March 14, 2026

Certified By: [Certification Body]`,

      FINANCIAL_REPORT: `ANNUAL FINANCIAL REPORT

Fiscal Year: 2023

ESG-Related Disclosures:
- Sustainability investments: $5.2M
- Environmental compliance costs: $1.8M
- Social programs budget: $3.1M

Risk Management:
- Climate risk assessment completed
- Transition risks identified and mitigated
- Physical risks insurance coverage secured`,

      GOVERNANCE_CHARTER: `CORPORATE GOVERNANCE CHARTER

Board Composition:
- Independent Directors: 7 of 10 (70%)
- Female Directors: 4 of 10 (40%)
- Average Tenure: 5 years

Committees:
- Audit Committee
- Risk Management Committee
- ESG/Sustainability Committee
- Compensation Committee

Key Governance Practices:
- Annual board effectiveness review
- Director independence assessment
- Stakeholder engagement policy`,

      OTHER: `SUPPORTING DOCUMENTATION

This document contains supplementary information relevant to the ESG certification application.

Key sections identified:
- Policy statements
- Compliance declarations
- Performance metrics
- Third-party attestations`
    }

    // Generate AI review based on document type
    const aiReviews: Record<string, { status: 'valid' | 'warning' | 'review', message: string, confidence: number }> = {
      ESG_POLICY: {
        status: 'valid',
        message: 'ESG policy document verified. Contains comprehensive environmental, social, and governance commitments with measurable targets. Document structure aligns with international standards.',
        confidence: 92
      },
      SUSTAINABILITY_REPORT: {
        status: 'valid',
        message: 'Sustainability report appears complete. GRI-aligned disclosures identified. Quantitative metrics and year-over-year comparisons present.',
        confidence: 88
      },
      CARBON_AUDIT: {
        status: 'valid',
        message: 'Carbon audit report validated. Scope 1, 2, and 3 emissions documented. Third-party verification indicators detected.',
        confidence: 95
      },
      ISO_CERTIFICATE: {
        status: 'valid',
        message: 'ISO certification verified. Certificate appears valid with appropriate scope and certification body credentials.',
        confidence: 97
      },
      FINANCIAL_REPORT: {
        status: 'warning',
        message: 'Financial report received. ESG-specific disclosures detected but may require additional context. Recommend highlighting sustainability investments section.',
        confidence: 75
      },
      GOVERNANCE_CHARTER: {
        status: 'valid',
        message: 'Governance charter validated. Board composition and committee structures documented. Independence metrics meet international standards.',
        confidence: 90
      },
      OTHER: {
        status: 'review',
        message: 'Supporting document received. Content requires manual review to assess relevance and completeness for ESG certification.',
        confidence: 60
      }
    }

    const ocrText = ocrTexts[documentType] || ocrTexts.OTHER
    const aiReview = aiReviews[documentType] || aiReviews.OTHER

    return NextResponse.json({
      success: true,
      fileName,
      documentType,
      ocrResult: {
        text: ocrText,
        pageCount: Math.floor(Math.random() * 10) + 1,
        extractionConfidence: Math.floor(Math.random() * 15) + 85, // 85-100%
      },
      aiReview: {
        ...aiReview,
        suggestedTags: getSuggestedTags(documentType),
        keyEntities: extractKeyEntities(documentType),
      }
    })
  } catch (error) {
    console.error('OCR Review error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}

function getSuggestedTags(documentType: string): string[] {
  const tags: Record<string, string[]> = {
    ESG_POLICY: ['policy', 'commitment', 'strategy', 'targets'],
    SUSTAINABILITY_REPORT: ['annual-report', 'gri', 'metrics', 'disclosure'],
    CARBON_AUDIT: ['emissions', 'carbon', 'audit', 'ghg'],
    ISO_CERTIFICATE: ['iso', 'certification', 'standards', 'compliance'],
    FINANCIAL_REPORT: ['financial', 'investment', 'esg-disclosure'],
    GOVERNANCE_CHARTER: ['governance', 'board', 'committee', 'independence'],
    OTHER: ['supporting', 'documentation'],
  }
  return tags[documentType] || tags.OTHER
}

function extractKeyEntities(documentType: string): { type: string; value: string }[] {
  const entities: Record<string, { type: string; value: string }[]> = {
    ESG_POLICY: [
      { type: 'date', value: 'January 2024' },
      { type: 'target', value: 'Carbon neutrality by 2030' },
      { type: 'target', value: '100% renewable energy' },
    ],
    SUSTAINABILITY_REPORT: [
      { type: 'metric', value: '25% emission reduction' },
      { type: 'metric', value: '40% diversity increase' },
      { type: 'metric', value: '100% compliance' },
    ],
    CARBON_AUDIT: [
      { type: 'emission', value: 'Scope 1: 5,000 tCO2e' },
      { type: 'emission', value: 'Scope 2: 8,000 tCO2e' },
      { type: 'emission', value: 'Total: 25,000 tCO2e' },
    ],
    ISO_CERTIFICATE: [
      { type: 'standard', value: 'ISO 14001:2015' },
      { type: 'date', value: 'Valid until March 2026' },
    ],
    FINANCIAL_REPORT: [
      { type: 'investment', value: 'Sustainability: $5.2M' },
      { type: 'budget', value: 'Social programs: $3.1M' },
    ],
    GOVERNANCE_CHARTER: [
      { type: 'metric', value: '70% independent directors' },
      { type: 'metric', value: '40% female directors' },
    ],
    OTHER: [],
  }
  return entities[documentType] || entities.OTHER
}
