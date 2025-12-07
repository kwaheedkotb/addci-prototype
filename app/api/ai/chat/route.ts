import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Mock AI Chat endpoint for service discovery and ESG guidance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, conversationHistory = [], locale = 'en' } = body

    if (!message) {
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      )
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800))

    const response = generateAIResponse(message.toLowerCase(), locale, conversationHistory)

    return NextResponse.json({
      success: true,
      response,
      suggestedActions: getSuggestedActions(message.toLowerCase(), locale),
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    )
  }
}

function generateAIResponse(message: string, locale: string, history: ChatMessage[]): string {
  const isArabic = locale === 'ar'

  // ESG Certificate related queries
  if (message.includes('esg') || message.includes('certificate') || message.includes('شهادة') || message.includes('استدامة')) {
    if (message.includes('how') || message.includes('apply') || message.includes('كيف') || message.includes('تقديم')) {
      return isArabic
        ? `للحصول على شهادة ESG، اتبع الخطوات التالية:

1. **انتقل إلى صفحة الخدمات** وابحث عن "شهادة ESG"
2. **انقر على "بدء الطلب"** لفتح نموذج الطلب
3. **أكمل الخطوات الأربع:**
   - معلومات مقدم الطلب والمؤسسة
   - ملف ESG (البيئة، الاجتماعية، الحوكمة)
   - تحميل المستندات الداعمة
   - مراجعة وإرسال الطلب

هل تريد أن أوجهك إلى صفحة تقديم الطلب؟`
        : `To obtain an ESG Certificate, follow these steps:

1. **Go to the Services page** and search for "ESG Certificate"
2. **Click "Start Application"** to open the application form
3. **Complete the 4 steps:**
   - Applicant & Organization Information
   - ESG Profile (Environmental, Social, Governance)
   - Upload Supporting Documents
   - Review and Submit

Would you like me to direct you to the application page?`
    }

    if (message.includes('document') || message.includes('مستند') || message.includes('require') || message.includes('متطلب')) {
      return isArabic
        ? `المستندات المطلوبة لشهادة ESG تشمل:

📋 **المستندات الإلزامية:**
- سياسة ESG للمؤسسة
- تقرير الاستدامة السنوي

📄 **المستندات الموصى بها:**
- تقرير تدقيق الكربون
- شهادات ISO (14001، 45001)
- ميثاق الحوكمة المؤسسية

💡 نظام المراجعة الذكي يحلل مستنداتك تلقائياً ويقدم ملاحظات فورية.`
        : `Documents required for ESG Certificate include:

📋 **Mandatory Documents:**
- Organization ESG Policy
- Annual Sustainability Report

📄 **Recommended Documents:**
- Carbon Audit Report
- ISO Certificates (14001, 45001)
- Corporate Governance Charter

💡 Our AI review system automatically analyzes your documents and provides instant feedback.`
    }

    if (message.includes('status') || message.includes('track') || message.includes('حالة') || message.includes('تتبع')) {
      return isArabic
        ? `لمتابعة حالة طلبك:

1. انتقل إلى **بوابة ESG** من القائمة الرئيسية
2. ستجد قائمة بجميع طلباتك مع حالة كل منها
3. انقر على أي طلب لرؤية التفاصيل والملاحظات

**حالات الطلب:**
- 🔵 مُقدَّم - تم استلام طلبك
- 🟡 قيد المراجعة - يتم مراجعة طلبك
- 🟠 مطلوب تصحيحات - يرجى تحديث طلبك
- 🟢 مُعتمد - تم إصدار الشهادة
- 🔴 مرفوض - لم يتم اعتماد الطلب`
        : `To track your application status:

1. Go to **ESG Portal** from the main menu
2. You'll see a list of all your applications with their status
3. Click any application to see details and notes

**Application Statuses:**
- 🔵 Submitted - Your application was received
- 🟡 Under Review - Being reviewed by staff
- 🟠 Corrections Requested - Please update your application
- 🟢 Approved - Certificate issued
- 🔴 Rejected - Application not approved`
    }

    // General ESG info
    return isArabic
      ? `شهادة ESG من غرفة أبوظبي تؤكد التزام مؤسستك بمعايير الاستدامة البيئية والمسؤولية الاجتماعية والحوكمة الرشيدة.

**المميزات:**
✅ اعتراف رسمي بممارسات ESG
✅ تعزيز السمعة المؤسسية
✅ متوافق مع المعايير الدولية

كيف يمكنني مساعدتك اليوم؟`
      : `The ESG Certificate from Abu Dhabi Chamber validates your organization's commitment to Environmental, Social, and Governance standards.

**Benefits:**
✅ Official recognition of ESG practices
✅ Enhanced corporate reputation
✅ Aligned with international standards

How can I help you today?`
  }

  // Trade license queries
  if (message.includes('trade license') || message.includes('رخصة تجارية') || message.includes('license')) {
    return isArabic
      ? `للحصول على خدمات الرخصة التجارية:

🔗 هذه الخدمة متوفرة عبر منصة **TAMM**
📍 انتقل إلى صفحة الخدمات واختر "خدمات الرخص التجارية"

يمكنك أيضاً تجديد أو تعديل رخصتك التجارية عبر نفس المنصة.`
      : `For Trade License services:

🔗 This service is available through **TAMM** platform
📍 Go to Services page and select "Trade License Services"

You can also renew or modify your trade license through the same platform.`
  }

  // Membership queries
  if (message.includes('membership') || message.includes('عضوية') || message.includes('member')) {
    return isArabic
      ? `عضوية غرفة أبوظبي:

**المميزات:**
- الوصول إلى خدمات الأعمال الحصرية
- المشاركة في الفعاليات والمعارض
- شبكة العلاقات التجارية
- خدمات الدعم والاستشارات

📍 للتسجيل، انتقل إلى صفحة الخدمات واختر "تسجيل العضوية"`
      : `Abu Dhabi Chamber Membership:

**Benefits:**
- Access to exclusive business services
- Participation in events and exhibitions
- Business networking opportunities
- Support and consultation services

📍 To register, go to Services page and select "Membership Registration"`
  }

  // Help and guidance
  if (message.includes('help') || message.includes('مساعدة') || message.includes('guide') || message.includes('دليل')) {
    return isArabic
      ? `أنا هنا لمساعدتك! يمكنني المساعدة في:

🌿 **شهادة ESG** - التقديم والمتطلبات والمتابعة
📋 **الخدمات** - استكشاف خدمات غرفة أبوظبي
🔍 **البحث** - إيجاد الخدمة المناسبة لاحتياجاتك
❓ **الأسئلة** - الإجابة على استفساراتك

ما الذي تحتاج مساعدة فيه؟`
      : `I'm here to help! I can assist with:

🌿 **ESG Certificate** - Application, requirements, and tracking
📋 **Services** - Explore Abu Dhabi Chamber services
🔍 **Search** - Find the right service for your needs
❓ **Questions** - Answer your inquiries

What do you need help with?`
  }

  // Services discovery
  if (message.includes('service') || message.includes('خدم')) {
    return isArabic
      ? `خدمات غرفة أبوظبي تشمل:

**منصة غرفة أبوظبي:**
- شهادة ESG
- شهادات المنشأ
- تصديق الوثائق

**منصة TAMM:**
- الرخص التجارية
- التصاريح والموافقات

**منصة الشركاء:**
- التمويل الإسلامي
- خدمات التأمين

📍 انتقل إلى صفحة الخدمات لاستكشاف جميع الخدمات المتاحة.`
      : `Abu Dhabi Chamber services include:

**ADC Platform:**
- ESG Certificate
- Certificate of Origin
- Document Attestation

**TAMM Platform:**
- Trade Licenses
- Permits and Approvals

**Affiliates Platform:**
- Islamic Finance
- Insurance Services

📍 Go to the Services page to explore all available services.`
  }

  // Default response
  return isArabic
    ? `شكراً لتواصلك! أنا مساعدك الذكي من غرفة أبوظبي.

يمكنني مساعدتك في:
- التقديم على شهادة ESG
- استكشاف الخدمات المتاحة
- الإجابة على استفساراتك

كيف يمكنني مساعدتك اليوم؟`
    : `Thank you for reaching out! I'm your AI assistant from Abu Dhabi Chamber.

I can help you with:
- Applying for ESG Certificate
- Exploring available services
- Answering your questions

How can I assist you today?`
}

function getSuggestedActions(message: string, locale: string): { label: string; action: string }[] {
  const isArabic = locale === 'ar'

  if (message.includes('esg') || message.includes('certificate') || message.includes('شهادة')) {
    return [
      { label: isArabic ? 'بدء طلب ESG' : 'Start ESG Application', action: '/services/1' },
      { label: isArabic ? 'عرض طلباتي' : 'View My Applications', action: '/customer' },
    ]
  }

  if (message.includes('service') || message.includes('خدم')) {
    return [
      { label: isArabic ? 'استكشاف الخدمات' : 'Explore Services', action: '/services' },
    ]
  }

  return [
    { label: isArabic ? 'صفحة الخدمات' : 'Services Page', action: '/services' },
    { label: isArabic ? 'بوابة ESG' : 'ESG Portal', action: '/customer' },
  ]
}
