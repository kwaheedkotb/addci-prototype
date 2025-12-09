import { NextRequest, NextResponse } from 'next/server'

// Mock AI Sector-Specific ESG Templates endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sector, locale = 'en' } = body

    if (!sector) {
      return NextResponse.json(
        { error: 'Sector is required' },
        { status: 400 }
      )
    }

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 400))

    const isArabic = locale === 'ar'
    const template = getSectorTemplate(sector, isArabic)

    return NextResponse.json({
      success: true,
      sector,
      ...template
    })
  } catch (error) {
    console.error('Sector template API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sector template' },
      { status: 500 }
    )
  }
}

interface SectorTemplate {
  environmentalTemplate: string
  environmentalExamples: string[]
  socialTemplate: string
  socialExamples: string[]
  governanceTemplate: string
  governanceExamples: string[]
  commonKPIs: string[]
}

function getSectorTemplate(sector: string, isArabic: boolean): SectorTemplate {
  const templates: Record<string, { en: SectorTemplate; ar: SectorTemplate }> = {
    'Manufacturing': {
      en: {
        environmentalTemplate: 'For manufacturing, focus on emissions reduction, waste management, and resource efficiency. Key areas include energy consumption per unit, water usage optimization, and circular economy practices.',
        environmentalExamples: [
          'Reduce carbon emissions by 25% through energy-efficient machinery',
          'Implement zero-waste-to-landfill program',
          'Use 50% recycled materials in production',
          'Install solar panels for 30% of energy needs'
        ],
        socialTemplate: 'Manufacturing social responsibility centers on worker safety, fair labor practices, and community impact. Focus on workplace conditions and supply chain ethics.',
        socialExamples: [
          'Achieve zero workplace injuries through safety training',
          '100% of suppliers audited for labor practices',
          'Provide 40+ training hours per employee annually',
          'Support 5 local community development programs'
        ],
        governanceTemplate: 'Manufacturing governance should address supply chain transparency, quality control, and regulatory compliance. Board oversight of ESG matters is essential.',
        governanceExamples: [
          'Establish ESG committee with quarterly reviews',
          'Publish annual supply chain transparency report',
          'Maintain ISO 14001 environmental certification',
          'Conduct third-party ESG audits annually'
        ],
        commonKPIs: [
          'Energy intensity (kWh per unit)',
          'Water consumption (liters per unit)',
          'Waste recycling rate (%)',
          'Lost time injury frequency rate',
          'Supplier ESG compliance rate'
        ]
      },
      ar: {
        environmentalTemplate: 'للتصنيع، ركز على تقليل الانبعاثات وإدارة النفايات وكفاءة الموارد. تشمل المجالات الرئيسية استهلاك الطاقة لكل وحدة وتحسين استخدام المياه وممارسات الاقتصاد الدائري.',
        environmentalExamples: [
          'تقليل انبعاثات الكربون بنسبة 25% من خلال الآلات الموفرة للطاقة',
          'تنفيذ برنامج صفر نفايات إلى المكبات',
          'استخدام 50% مواد معاد تدويرها في الإنتاج',
          'تركيب ألواح شمسية لـ 30% من احتياجات الطاقة'
        ],
        socialTemplate: 'تتمحور المسؤولية الاجتماعية للتصنيع حول سلامة العمال وممارسات العمل العادلة والأثر المجتمعي. التركيز على ظروف العمل وأخلاقيات سلسلة التوريد.',
        socialExamples: [
          'تحقيق صفر إصابات في مكان العمل من خلال التدريب على السلامة',
          '100% من الموردين خضعوا لتدقيق ممارسات العمل',
          'توفير 40+ ساعة تدريب لكل موظف سنوياً',
          'دعم 5 برامج تنمية مجتمعية محلية'
        ],
        governanceTemplate: 'يجب أن تتناول حوكمة التصنيع شفافية سلسلة التوريد ومراقبة الجودة والامتثال التنظيمي. إشراف مجلس الإدارة على مسائل ESG ضروري.',
        governanceExamples: [
          'إنشاء لجنة ESG مع مراجعات ربع سنوية',
          'نشر تقرير شفافية سلسلة التوريد السنوي',
          'الحفاظ على شهادة ISO 14001 البيئية',
          'إجراء تدقيقات ESG من طرف ثالث سنوياً'
        ],
        commonKPIs: [
          'كثافة الطاقة (كيلوواط/ساعة لكل وحدة)',
          'استهلاك المياه (لتر لكل وحدة)',
          'معدل إعادة تدوير النفايات (%)',
          'معدل تكرار إصابات الوقت الضائع',
          'معدل امتثال الموردين لـ ESG'
        ]
      }
    },
    'Healthcare': {
      en: {
        environmentalTemplate: 'Healthcare environmental focus includes medical waste management, energy efficiency in facilities, and sustainable procurement of medical supplies.',
        environmentalExamples: [
          'Proper segregation and disposal of 100% medical waste',
          'Reduce facility energy consumption by 20%',
          'Use eco-friendly cleaning and sanitization products',
          'Implement paperless patient records system'
        ],
        socialTemplate: 'Healthcare social responsibility emphasizes patient care quality, staff welfare, community health programs, and equitable access to services.',
        socialExamples: [
          'Provide free health screenings to underserved communities',
          'Maintain patient satisfaction score above 90%',
          'Offer mental health support for all staff',
          'Train 100% of staff on patient safety protocols'
        ],
        governanceTemplate: 'Healthcare governance must address patient privacy, medical ethics, regulatory compliance, and quality assurance frameworks.',
        governanceExamples: [
          'Full compliance with healthcare data protection regulations',
          'Establish ethics committee for medical decisions',
          'Conduct annual quality accreditation reviews',
          'Transparent reporting of clinical outcomes'
        ],
        commonKPIs: [
          'Medical waste recycling rate',
          'Patient satisfaction score',
          'Hospital-acquired infection rate',
          'Staff training completion rate',
          'Regulatory compliance score'
        ]
      },
      ar: {
        environmentalTemplate: 'يشمل التركيز البيئي للرعاية الصحية إدارة النفايات الطبية وكفاءة الطاقة في المرافق والمشتريات المستدامة للمستلزمات الطبية.',
        environmentalExamples: [
          'فرز والتخلص السليم من 100% من النفايات الطبية',
          'تقليل استهلاك طاقة المنشأة بنسبة 20%',
          'استخدام منتجات تنظيف وتعقيم صديقة للبيئة',
          'تنفيذ نظام سجلات المرضى بدون أوراق'
        ],
        socialTemplate: 'تؤكد المسؤولية الاجتماعية للرعاية الصحية على جودة رعاية المرضى ورفاهية الموظفين وبرامج صحة المجتمع والوصول العادل للخدمات.',
        socialExamples: [
          'توفير فحوصات صحية مجانية للمجتمعات المحرومة',
          'الحفاظ على درجة رضا المرضى فوق 90%',
          'تقديم دعم الصحة النفسية لجميع الموظفين',
          'تدريب 100% من الموظفين على بروتوكولات سلامة المرضى'
        ],
        governanceTemplate: 'يجب أن تتناول حوكمة الرعاية الصحية خصوصية المريض والأخلاقيات الطبية والامتثال التنظيمي وأطر ضمان الجودة.',
        governanceExamples: [
          'الامتثال الكامل للوائح حماية بيانات الرعاية الصحية',
          'إنشاء لجنة أخلاقيات للقرارات الطبية',
          'إجراء مراجعات اعتماد الجودة السنوية',
          'الإبلاغ الشفاف عن النتائج السريرية'
        ],
        commonKPIs: [
          'معدل إعادة تدوير النفايات الطبية',
          'درجة رضا المرضى',
          'معدل العدوى المكتسبة في المستشفى',
          'معدل إتمام تدريب الموظفين',
          'درجة الامتثال التنظيمي'
        ]
      }
    },
    'Energy': {
      en: {
        environmentalTemplate: 'Energy sector environmental responsibility focuses on transitioning to renewables, reducing operational emissions, and minimizing environmental impact of energy production.',
        environmentalExamples: [
          'Increase renewable energy portfolio to 40%',
          'Reduce methane leakage by 50%',
          'Implement carbon capture technology',
          'Restore 100 hectares of impacted land'
        ],
        socialTemplate: 'Energy sector social focus includes community engagement around energy projects, ensuring energy access, and supporting just transition for workers.',
        socialExamples: [
          'Provide affordable energy access programs',
          'Retrain workers for green energy jobs',
          'Engage local communities in project planning',
          'Support STEM education in operational areas'
        ],
        governanceTemplate: 'Energy governance must address climate risk disclosure, long-term transition planning, and stakeholder engagement on environmental matters.',
        governanceExamples: [
          'Publish TCFD-aligned climate risk reports',
          'Set science-based emissions reduction targets',
          'Board-level oversight of climate strategy',
          'Annual stakeholder engagement on ESG matters'
        ],
        commonKPIs: [
          'Renewable energy percentage',
          'Scope 1, 2, 3 emissions',
          'Energy access beneficiaries',
          'Carbon intensity per unit',
          'Climate risk exposure'
        ]
      },
      ar: {
        environmentalTemplate: 'تركز المسؤولية البيئية لقطاع الطاقة على التحول إلى الطاقة المتجددة وتقليل الانبعاثات التشغيلية وتقليل الأثر البيئي لإنتاج الطاقة.',
        environmentalExamples: [
          'زيادة محفظة الطاقة المتجددة إلى 40%',
          'تقليل تسرب الميثان بنسبة 50%',
          'تنفيذ تقنية احتجاز الكربون',
          'استعادة 100 هكتار من الأراضي المتأثرة'
        ],
        socialTemplate: 'يشمل التركيز الاجتماعي لقطاع الطاقة مشاركة المجتمع حول مشاريع الطاقة وضمان الوصول للطاقة ودعم التحول العادل للعمال.',
        socialExamples: [
          'توفير برامج الوصول للطاقة بأسعار معقولة',
          'إعادة تدريب العمال لوظائف الطاقة الخضراء',
          'إشراك المجتمعات المحلية في تخطيط المشاريع',
          'دعم تعليم العلوم والتكنولوجيا في مناطق العمليات'
        ],
        governanceTemplate: 'يجب أن تتناول حوكمة الطاقة الإفصاح عن مخاطر المناخ والتخطيط للتحول طويل المدى ومشاركة أصحاب المصلحة في المسائل البيئية.',
        governanceExamples: [
          'نشر تقارير مخاطر المناخ المتوافقة مع TCFD',
          'تحديد أهداف خفض الانبعاثات القائمة على العلم',
          'إشراف مجلس الإدارة على استراتيجية المناخ',
          'مشاركة سنوية لأصحاب المصلحة في مسائل ESG'
        ],
        commonKPIs: [
          'نسبة الطاقة المتجددة',
          'انبعاثات النطاق 1 و 2 و 3',
          'المستفيدون من الوصول للطاقة',
          'كثافة الكربون لكل وحدة',
          'التعرض لمخاطر المناخ'
        ]
      }
    }
  }

  // Default template for sectors not in the list
  const defaultTemplate: SectorTemplate = isArabic ? {
    environmentalTemplate: 'ركز على تقليل البصمة البيئية من خلال كفاءة الطاقة وإدارة النفايات والممارسات المستدامة ذات الصلة بقطاعك.',
    environmentalExamples: [
      'تقليل استهلاك الطاقة بنسبة 20%',
      'تنفيذ برنامج إعادة التدوير',
      'استخدام مواد صديقة للبيئة',
      'تقليل انبعاثات الكربون'
    ],
    socialTemplate: 'عالج رفاهية الموظفين ومشاركة المجتمع والممارسات الأخلاقية في عملياتك.',
    socialExamples: [
      'توفير بيئة عمل آمنة وشاملة',
      'دعم مبادرات المجتمع المحلي',
      'ضمان ممارسات العمل العادلة',
      'الاستثمار في تطوير الموظفين'
    ],
    governanceTemplate: 'أنشئ هياكل حوكمة واضحة مع إشراف مجلس الإدارة على مسائل ESG والإبلاغ الشفاف.',
    governanceExamples: [
      'إنشاء لجنة ESG على مستوى مجلس الإدارة',
      'تنفيذ إطار إدارة المخاطر',
      'إجراء عمليات تدقيق منتظمة',
      'نشر تقارير ESG سنوية'
    ],
    commonKPIs: [
      'استهلاك الطاقة',
      'معدل إعادة تدوير النفايات',
      'رضا الموظفين',
      'ساعات التدريب',
      'درجة امتثال الحوكمة'
    ]
  } : {
    environmentalTemplate: 'Focus on reducing environmental footprint through energy efficiency, waste management, and sustainable practices relevant to your sector.',
    environmentalExamples: [
      'Reduce energy consumption by 20%',
      'Implement recycling program',
      'Use eco-friendly materials',
      'Reduce carbon emissions'
    ],
    socialTemplate: 'Address employee welfare, community engagement, and ethical practices in your operations.',
    socialExamples: [
      'Provide safe and inclusive workplace',
      'Support local community initiatives',
      'Ensure fair labor practices',
      'Invest in employee development'
    ],
    governanceTemplate: 'Establish clear governance structures with board oversight of ESG matters and transparent reporting.',
    governanceExamples: [
      'Create board-level ESG committee',
      'Implement risk management framework',
      'Conduct regular audits',
      'Publish annual ESG reports'
    ],
    commonKPIs: [
      'Energy consumption',
      'Waste recycling rate',
      'Employee satisfaction',
      'Training hours',
      'Governance compliance score'
    ]
  }

  const sectorTemplate = templates[sector]
  if (sectorTemplate) {
    return isArabic ? sectorTemplate.ar : sectorTemplate.en
  }

  return defaultTemplate
}
