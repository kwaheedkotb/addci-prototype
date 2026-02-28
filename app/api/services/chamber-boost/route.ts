import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { logActivity } from '@/lib/activity-log'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.dealId || !body.dealTitle || !body.dealType || !body.vendorName || !body.category || !body.companyName || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: dealId, dealTitle, dealType, vendorName, category, companyName, email' },
        { status: 400 }
      )
    }

    // For LIMITED deals, intended use is required
    if (body.dealType === 'LIMITED' && !body.intendedUse) {
      return NextResponse.json(
        { success: false, error: 'Intended use is required for limited deals' },
        { status: 400 }
      )
    }

    // Generate voucher code for unlimited deals
    const voucherCode = body.dealType === 'UNLIMITED'
      ? `ADCCI-${body.vendorName.toUpperCase().replace(/\s+/g, '').slice(0, 4)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      : null

    // Wrap both creates in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create BaseApplication
      const base = await tx.baseApplication.create({
        data: {
          serviceType: 'CHAMBER_BOOST',
          status: body.dealType === 'UNLIMITED' ? 'APPROVED' : 'SUBMITTED',
          submittedBy: body.companyName,
          submittedByEmail: body.email,
          memberTier: body.memberTier ?? 'Standard',
          ...(body.dealType === 'UNLIMITED' ? { reviewedAt: new Date() } : {}),
        },
      })

      // 2. Create linked ChamberBoostApplication
      const cbApp = await tx.chamberBoostApplication.create({
        data: {
          baseApplicationId: base.id,
          dealId: body.dealId,
          dealTitle: body.dealTitle,
          dealTitleAr: body.dealTitleAr ?? null,
          dealType: body.dealType,
          vendorName: body.vendorName,
          vendorNameAr: body.vendorNameAr ?? null,
          category: body.category,
          categoryAr: body.categoryAr ?? null,
          companySize: body.companySize ?? null,
          intendedUse: body.intendedUse ?? null,
          additionalNotes: body.additionalNotes ?? null,
          voucherCode,
          fulfilledAt: body.dealType === 'UNLIMITED' ? new Date() : null,
        },
      })

      return { base, cbApp }
    })

    // 3. Log activity (outside transaction — non-critical)
    const actionText = body.dealType === 'UNLIMITED'
      ? `Unlimited deal claimed — voucher auto-generated for ${body.dealTitle}`
      : `Limited deal request submitted for ${body.dealTitle}`

    await logActivity(
      result.base.id,
      'CHAMBER_BOOST',
      actionText,
      body.companyName
    )

    return NextResponse.json(
      {
        success: true,
        applicationId: result.base.id,
        dealType: body.dealType,
        voucherCode: result.cbApp.voucherCode ?? null,
        vendorRedirectUrl: null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating chamber boost application:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
