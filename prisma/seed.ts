import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing data
  await prisma.certificate.deleteMany()
  await prisma.reviewNote.deleteMany()
  await prisma.application.deleteMany()
  await prisma.service.deleteMany()

  // Create 5 sample applications with different statuses
  const applications = await Promise.all([
    // Application 1: SUBMITTED
    prisma.application.create({
      data: {
        applicantName: 'Ahmed Al-Rashid',
        organizationName: 'Green Energy Solutions LLC',
        email: 'ahmed@greenenergy.ae',
        sector: 'Energy',
        description: 'Our company focuses on renewable energy solutions including solar panel installations and wind turbine maintenance. We have reduced carbon emissions by 40% in our operations through LED lighting and smart building management systems.',
        status: 'SUBMITTED',
        aiPrecheckResult: 'Application appears complete. Strong environmental metrics provided. Consider adding social impact data such as employee training programs or community initiatives.',
        reviewNotes: {
          create: [
            {
              authorType: 'SYSTEM',
              note: 'Application submitted for ESG certification review.',
            },
          ],
        },
      },
    }),

    // Application 2: UNDER_REVIEW
    prisma.application.create({
      data: {
        applicantName: 'Sara Mohammed',
        organizationName: 'Sustainable Textiles Co.',
        email: 'sara@sustainabletextiles.com',
        sector: 'Manufacturing',
        description: 'We manufacture eco-friendly textiles using organic cotton and recycled materials. Our water recycling system saves 1 million liters annually. We employ 200 workers with fair wages and comprehensive health benefits.',
        status: 'UNDER_REVIEW',
        aiPrecheckResult: 'Excellent application with comprehensive ESG data. Environmental and social metrics are well-documented. Governance structure could be elaborated further.',
        reviewNotes: {
          create: [
            {
              authorType: 'SYSTEM',
              note: 'Application submitted for ESG certification review.',
            },
            {
              authorType: 'STAFF',
              note: 'Strong application overall. Reviewing environmental claims against industry benchmarks.',
            },
          ],
        },
      },
    }),

    // Application 3: CORRECTIONS_REQUESTED
    prisma.application.create({
      data: {
        applicantName: 'Khalid Ibrahim',
        organizationName: 'Desert Construction Group',
        email: 'khalid@desertconstruction.ae',
        sector: 'Construction',
        description: 'Major construction firm focusing on green building practices.',
        status: 'CORRECTIONS_REQUESTED',
        aiPrecheckResult: 'Application needs more detail. Missing specific environmental KPIs, carbon footprint data, and waste management metrics. Social responsibility section is incomplete.',
        reviewNotes: {
          create: [
            {
              authorType: 'SYSTEM',
              note: 'Application submitted for ESG certification review.',
            },
            {
              authorType: 'STAFF',
              note: 'Please provide more details on your green building certifications, waste reduction metrics, and worker safety programs. Include specific numbers and targets.',
            },
          ],
        },
      },
    }),

    // Application 4: APPROVED
    prisma.application.create({
      data: {
        applicantName: 'Fatima Al-Hassan',
        organizationName: 'Clean Water Technologies',
        email: 'fatima@cleanwater.ae',
        sector: 'Utilities',
        description: 'We provide water purification and desalination services using solar-powered systems. Our technology reduces energy consumption by 60% compared to traditional methods. We have trained 500+ local engineers and support 10 community water projects annually.',
        status: 'APPROVED',
        aiPrecheckResult: 'Outstanding application with comprehensive ESG metrics. All three pillars (Environmental, Social, Governance) are well-addressed with quantifiable data.',
        reviewNotes: {
          create: [
            {
              authorType: 'SYSTEM',
              note: 'Application submitted for ESG certification review.',
            },
            {
              authorType: 'STAFF',
              note: 'Excellent documentation of environmental impact. Social initiatives are impressive.',
            },
            {
              authorType: 'STAFF',
              note: 'Application approved. ESG certificate issued.',
            },
          ],
        },
        certificate: {
          create: {
            certificateNumber: 'ESG-2024-001',
            issuedAt: new Date('2024-11-15'),
          },
        },
      },
    }),

    // Application 5: REJECTED
    prisma.application.create({
      data: {
        applicantName: 'Omar Sayed',
        organizationName: 'Industrial Chemicals Ltd',
        email: 'omar@indchem.com',
        sector: 'Chemicals',
        description: 'Chemical manufacturing company seeking ESG certification.',
        status: 'REJECTED',
        aiPrecheckResult: 'Application lacks substantial ESG commitments. No environmental impact reduction plans. Missing waste management and emission data. Social responsibility metrics absent.',
        reviewNotes: {
          create: [
            {
              authorType: 'SYSTEM',
              note: 'Application submitted for ESG certification review.',
            },
            {
              authorType: 'STAFF',
              note: 'Application lacks required environmental data and sustainability commitments.',
            },
            {
              authorType: 'STAFF',
              note: 'Application rejected due to insufficient ESG documentation. Applicant may reapply with comprehensive sustainability plan.',
            },
          ],
        },
      },
    }),
  ])

  // Create one more approved application with certificate
  const approvedApp2 = await prisma.application.create({
    data: {
      applicantName: 'Layla Noor',
      organizationName: 'Organic Farms Emirates',
      email: 'layla@organicfarms.ae',
      sector: 'Agriculture',
      description: 'Organic farming operation using sustainable practices including drip irrigation, composting, and natural pest control. Zero chemical pesticides. We employ 150 local farmers with fair trade practices and provide agricultural training to the community.',
      status: 'APPROVED',
      aiPrecheckResult: 'Excellent application demonstrating strong commitment to environmental and social sustainability. Governance structures are well-defined.',
      reviewNotes: {
        create: [
          {
            authorType: 'SYSTEM',
            note: 'Application submitted for ESG certification review.',
          },
          {
            authorType: 'STAFF',
            note: 'Verified organic certification and sustainable farming practices.',
          },
          {
            authorType: 'STAFF',
            note: 'Application approved. ESG certificate issued.',
          },
        ],
      },
      certificate: {
        create: {
          certificateNumber: 'ESG-2024-002',
          issuedAt: new Date('2024-12-01'),
        },
      },
    },
  })

  console.log('Seed data created successfully!')
  console.log(`Created ${applications.length + 1} applications`)

  // Seed Service Hub data
  const services = await Promise.all([
    // ADC Platform - INTERNAL services
    prisma.service.create({
      data: {
        dept: 'Business Development',
        platform: 'ADC Platform',
        name: 'Policy Advocacy',
        nameAr: 'الدعوة للسياسات',
        description: 'Engage with policymakers to advocate for business-friendly policies and regulations.',
        descriptionAr: 'التواصل مع صانعي السياسات للدعوة إلى سياسات ولوائح صديقة للأعمال.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['policy', 'advocacy', 'regulations', 'government', 'business']),
        tagsAr: JSON.stringify(['سياسة', 'دعوة', 'لوائح', 'حكومة', 'أعمال']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Training & Development',
        platform: 'ADC Platform',
        name: 'Upskilling Programs',
        nameAr: 'برامج تطوير المهارات',
        description: 'Professional development and training programs to enhance business skills and capabilities.',
        descriptionAr: 'برامج التطوير المهني والتدريب لتعزيز مهارات وقدرات الأعمال.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['training', 'skills', 'development', 'courses', 'learning', 'upskill']),
        tagsAr: JSON.stringify(['تدريب', 'مهارات', 'تطوير', 'دورات', 'تعلم']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Business Support',
        platform: 'ADC Platform',
        name: 'Chamber Boost',
        nameAr: 'دعم الغرفة',
        description: 'Comprehensive support program to accelerate business growth and market expansion.',
        descriptionAr: 'برنامج دعم شامل لتسريع نمو الأعمال والتوسع في السوق.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['boost', 'growth', 'support', 'acceleration', 'business']),
        tagsAr: JSON.stringify(['دعم', 'نمو', 'تسريع', 'أعمال']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Business Development',
        platform: 'ADC Platform',
        name: 'Chamber Business Matchmaking',
        nameAr: 'التوفيق بين الأعمال',
        description: 'Connect with potential business partners, investors, and collaborators through our matchmaking service.',
        descriptionAr: 'تواصل مع شركاء الأعمال المحتملين والمستثمرين والمتعاونين من خلال خدمة التوفيق لدينا.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['matchmaking', 'partners', 'investors', 'networking', 'collaboration', 'B2B']),
        tagsAr: JSON.stringify(['توفيق', 'شركاء', 'مستثمرين', 'تواصل', 'تعاون']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Sustainability',
        platform: 'ADC Platform',
        name: 'Chamber ESG Label',
        nameAr: 'شهادة ESG من الغرفة',
        description: 'Apply for ESG (Environmental, Social, Governance) certification to demonstrate your commitment to sustainable business practices.',
        descriptionAr: 'تقدم بطلب للحصول على شهادة ESG (البيئة والمجتمع والحوكمة) لإثبات التزامك بممارسات الأعمال المستدامة.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['ESG', 'sustainability', 'environment', 'social', 'governance', 'certificate', 'green', 'sustainable']),
        tagsAr: JSON.stringify(['ESG', 'استدامة', 'بيئة', 'مجتمع', 'حوكمة', 'شهادة', 'أخضر', 'مستدام']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Business Development',
        platform: 'ADC Platform',
        name: 'Business Development Services',
        nameAr: 'خدمات تطوير الأعمال',
        description: 'Strategic consulting and support services to help grow and develop your business.',
        descriptionAr: 'خدمات استشارية ودعم استراتيجي للمساعدة في نمو وتطوير أعمالك.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['development', 'consulting', 'strategy', 'growth', 'business']),
        tagsAr: JSON.stringify(['تطوير', 'استشارات', 'استراتيجية', 'نمو', 'أعمال']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Advisory Services',
        platform: 'ADC Platform',
        name: 'Business Enablement Advisory',
        nameAr: 'استشارات تمكين الأعمال',
        description: 'Expert advisory services to enable and support business operations and growth initiatives.',
        descriptionAr: 'خدمات استشارية متخصصة لتمكين ودعم عمليات الأعمال ومبادرات النمو.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['advisory', 'enablement', 'consulting', 'support', 'operations']),
        tagsAr: JSON.stringify(['استشارات', 'تمكين', 'دعم', 'عمليات']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Knowledge Services',
        platform: 'ADC Platform',
        name: 'Expert Library',
        nameAr: 'مكتبة الخبراء',
        description: 'Access a comprehensive library of expert resources, guides, and knowledge materials.',
        descriptionAr: 'الوصول إلى مكتبة شاملة من موارد الخبراء والأدلة والمواد المعرفية.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['library', 'resources', 'knowledge', 'guides', 'research', 'experts']),
        tagsAr: JSON.stringify(['مكتبة', 'موارد', 'معرفة', 'أدلة', 'بحث', 'خبراء']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Trade Services',
        platform: 'ADC Platform',
        name: 'Global Tenders Hub',
        nameAr: 'مركز المناقصات العالمية',
        description: 'Access international tender opportunities and procurement notices from around the world.',
        descriptionAr: 'الوصول إلى فرص المناقصات الدولية وإعلانات المشتريات من جميع أنحاء العالم.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['tenders', 'procurement', 'international', 'opportunities', 'global', 'contracts']),
        tagsAr: JSON.stringify(['مناقصات', 'مشتريات', 'دولي', 'فرص', 'عالمي', 'عقود']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Research & Analytics',
        platform: 'ADC Platform',
        name: 'Data Hub',
        nameAr: 'مركز البيانات',
        description: 'Access comprehensive business data, analytics, and market insights for informed decision-making.',
        descriptionAr: 'الوصول إلى بيانات الأعمال الشاملة والتحليلات ورؤى السوق لاتخاذ قرارات مستنيرة.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['data', 'analytics', 'insights', 'market', 'research', 'statistics']),
        tagsAr: JSON.stringify(['بيانات', 'تحليلات', 'رؤى', 'سوق', 'بحث', 'إحصاءات']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Research & Analytics',
        platform: 'ADC Platform',
        name: 'Flagship & Sectoral Reports',
        nameAr: 'التقارير الرئيسية والقطاعية',
        description: 'Access in-depth flagship reports and sector-specific analysis for strategic planning.',
        descriptionAr: 'الوصول إلى التقارير الرئيسية المتعمقة والتحليلات الخاصة بالقطاعات للتخطيط الاستراتيجي.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['reports', 'analysis', 'sectors', 'research', 'insights', 'strategy']),
        tagsAr: JSON.stringify(['تقارير', 'تحليل', 'قطاعات', 'بحث', 'رؤى', 'استراتيجية']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Trade Services',
        platform: 'ADC Platform',
        name: 'Market Directory',
        nameAr: 'دليل السوق',
        description: 'Comprehensive directory of businesses, suppliers, and market participants in Abu Dhabi.',
        descriptionAr: 'دليل شامل للشركات والموردين والمشاركين في سوق أبوظبي.',
        channelType: 'INTERNAL',
        tags: JSON.stringify(['directory', 'businesses', 'suppliers', 'market', 'listings', 'companies']),
        tagsAr: JSON.stringify(['دليل', 'شركات', 'موردين', 'سوق', 'قوائم']),
      },
    }),

    // TAMM Platform - EXTERNAL services
    prisma.service.create({
      data: {
        dept: 'Legal Services',
        platform: 'TAMM',
        name: 'Legal Consultancy',
        nameAr: 'الاستشارات القانونية',
        description: 'Professional legal consultation services for businesses and individuals.',
        descriptionAr: 'خدمات الاستشارات القانونية المهنية للشركات والأفراد.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/legal-consultancy',
        tags: JSON.stringify(['legal', 'consultancy', 'lawyer', 'law', 'advice']),
        tagsAr: JSON.stringify(['قانوني', 'استشارات', 'محامي', 'قانون', 'نصيحة']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Legal Services',
        platform: 'TAMM',
        name: 'Contract Guard',
        nameAr: 'حماية العقود',
        description: 'Contract protection and verification services to secure your business agreements.',
        descriptionAr: 'خدمات حماية العقود والتحقق منها لتأمين اتفاقياتك التجارية.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/contract-guard',
        tags: JSON.stringify(['contract', 'protection', 'verification', 'legal', 'agreements']),
        tagsAr: JSON.stringify(['عقد', 'حماية', 'تحقق', 'قانوني', 'اتفاقيات']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Legal Services',
        platform: 'TAMM',
        name: 'Conciliation and Mediation',
        nameAr: 'التوفيق والوساطة',
        description: 'Alternative dispute resolution services through conciliation and mediation.',
        descriptionAr: 'خدمات حل النزاعات البديلة من خلال التوفيق والوساطة.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/conciliation-mediation',
        tags: JSON.stringify(['mediation', 'conciliation', 'dispute', 'resolution', 'arbitration']),
        tagsAr: JSON.stringify(['وساطة', 'توفيق', 'نزاع', 'حل', 'تحكيم']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Membership Services',
        platform: 'TAMM',
        name: 'Non-Membership Certificate',
        nameAr: 'شهادة عدم العضوية',
        description: 'Obtain a certificate confirming non-membership status with Abu Dhabi Chamber.',
        descriptionAr: 'الحصول على شهادة تؤكد حالة عدم العضوية في غرفة أبوظبي.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/non-membership-certificate',
        tags: JSON.stringify(['non-membership', 'certificate', 'verification', 'status', 'proof']),
        tagsAr: JSON.stringify(['عدم عضوية', 'شهادة', 'تحقق', 'حالة', 'إثبات']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Membership Services',
        platform: 'TAMM',
        name: 'Membership Registration – Industrial Areas',
        nameAr: 'تسجيل العضوية - المناطق الصناعية',
        description: 'Register for chamber membership for businesses located in industrial areas.',
        descriptionAr: 'التسجيل للحصول على عضوية الغرفة للشركات الموجودة في المناطق الصناعية.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/membership-industrial',
        tags: JSON.stringify(['membership', 'registration', 'industrial', 'areas', 'join']),
        tagsAr: JSON.stringify(['عضوية', 'تسجيل', 'صناعي', 'مناطق', 'انضمام']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Trade Documentation',
        platform: 'TAMM',
        name: 'Certificate of Origin',
        nameAr: 'شهادة المنشأ',
        description: 'Obtain certificates of origin for your exported goods and products.',
        descriptionAr: 'الحصول على شهادات المنشأ للسلع والمنتجات المصدرة.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/certificate-of-origin',
        tags: JSON.stringify(['origin', 'certificate', 'export', 'trade', 'goods', 'products']),
        tagsAr: JSON.stringify(['منشأ', 'شهادة', 'تصدير', 'تجارة', 'سلع', 'منتجات']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Membership Services',
        platform: 'TAMM',
        name: 'Membership Cancellation – Free Zones',
        nameAr: 'إلغاء العضوية - المناطق الحرة',
        description: 'Cancel your chamber membership for businesses in free zones.',
        descriptionAr: 'إلغاء عضويتك في الغرفة للشركات في المناطق الحرة.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/membership-cancellation-freezone',
        tags: JSON.stringify(['cancellation', 'membership', 'free zone', 'terminate', 'cancel']),
        tagsAr: JSON.stringify(['إلغاء', 'عضوية', 'منطقة حرة', 'إنهاء']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Membership Services',
        platform: 'TAMM',
        name: 'Updating Membership – Free Zones',
        nameAr: 'تحديث العضوية - المناطق الحرة',
        description: 'Update your chamber membership details for businesses in free zones.',
        descriptionAr: 'تحديث تفاصيل عضويتك في الغرفة للشركات في المناطق الحرة.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/membership-update-freezone',
        tags: JSON.stringify(['update', 'membership', 'free zone', 'modify', 'change']),
        tagsAr: JSON.stringify(['تحديث', 'عضوية', 'منطقة حرة', 'تعديل', 'تغيير']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Membership Services',
        platform: 'TAMM',
        name: 'Membership Renewal – Free Zones',
        nameAr: 'تجديد العضوية - المناطق الحرة',
        description: 'Renew your chamber membership for businesses in free zones.',
        descriptionAr: 'تجديد عضويتك في الغرفة للشركات في المناطق الحرة.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/membership-renewal-freezone',
        tags: JSON.stringify(['renewal', 'membership', 'free zone', 'renew', 'extend']),
        tagsAr: JSON.stringify(['تجديد', 'عضوية', 'منطقة حرة', 'تمديد']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Documentation Services',
        platform: 'TAMM',
        name: 'Certified Membership Translation',
        nameAr: 'ترجمة العضوية المعتمدة',
        description: 'Get certified translations of your membership documents.',
        descriptionAr: 'احصل على ترجمات معتمدة لوثائق عضويتك.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/membership-translation',
        tags: JSON.stringify(['translation', 'certified', 'membership', 'documents', 'official']),
        tagsAr: JSON.stringify(['ترجمة', 'معتمد', 'عضوية', 'وثائق', 'رسمي']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Membership Services',
        platform: 'TAMM',
        name: 'Branch Membership Registration – Industrial Areas',
        nameAr: 'تسجيل عضوية الفرع - المناطق الصناعية',
        description: 'Register branch membership for businesses in industrial areas.',
        descriptionAr: 'تسجيل عضوية الفرع للشركات في المناطق الصناعية.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/branch-membership-industrial',
        tags: JSON.stringify(['branch', 'membership', 'registration', 'industrial', 'areas']),
        tagsAr: JSON.stringify(['فرع', 'عضوية', 'تسجيل', 'صناعي', 'مناطق']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Documentation Services',
        platform: 'TAMM',
        name: 'Businessman Certificate',
        nameAr: 'شهادة رجل أعمال',
        description: 'Obtain a certificate verifying your status as a registered businessman.',
        descriptionAr: 'الحصول على شهادة تثبت حالتك كرجل أعمال مسجل.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/businessman-certificate',
        tags: JSON.stringify(['businessman', 'certificate', 'verification', 'status', 'business owner']),
        tagsAr: JSON.stringify(['رجل أعمال', 'شهادة', 'تحقق', 'حالة', 'صاحب عمل']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Documentation Services',
        platform: 'TAMM',
        name: 'To Whom It May Concern Certificate',
        nameAr: 'شهادة لمن يهمه الأمر',
        description: 'Obtain a general-purpose certificate for various official requirements.',
        descriptionAr: 'الحصول على شهادة عامة الغرض للمتطلبات الرسمية المختلفة.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/to-whom-it-may-concern',
        tags: JSON.stringify(['certificate', 'official', 'general', 'letter', 'verification']),
        tagsAr: JSON.stringify(['شهادة', 'رسمي', 'عام', 'خطاب', 'تحقق']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Membership Services',
        platform: 'TAMM',
        name: 'Membership Renewal – Industrial Areas',
        nameAr: 'تجديد العضوية - المناطق الصناعية',
        description: 'Renew your chamber membership for businesses in industrial areas.',
        descriptionAr: 'تجديد عضويتك في الغرفة للشركات في المناطق الصناعية.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.tamm.abudhabi/services/membership-renewal-industrial',
        tags: JSON.stringify(['renewal', 'membership', 'industrial', 'areas', 'renew']),
        tagsAr: JSON.stringify(['تجديد', 'عضوية', 'صناعي', 'مناطق']),
      },
    }),

    // Affiliates Platform - EXTERNAL services
    prisma.service.create({
      data: {
        dept: 'Skills & Education',
        platform: 'Affiliates Platform',
        name: 'SKEA',
        nameAr: 'سكيا',
        description: 'Skills and Education Academy offering professional development and training programs.',
        descriptionAr: 'أكاديمية المهارات والتعليم تقدم برامج التطوير المهني والتدريب.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://skea.ae',
        tags: JSON.stringify(['skills', 'education', 'academy', 'training', 'professional', 'development']),
        tagsAr: JSON.stringify(['مهارات', 'تعليم', 'أكاديمية', 'تدريب', 'مهني', 'تطوير']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Securities & Finance',
        platform: 'Affiliates Platform',
        name: 'ADSM & UAE Academy',
        nameAr: 'سوق أبوظبي للأوراق المالية وأكاديمية الإمارات',
        description: 'Abu Dhabi Securities Market and UAE Academy for financial education and investment services.',
        descriptionAr: 'سوق أبوظبي للأوراق المالية وأكاديمية الإمارات للتعليم المالي وخدمات الاستثمار.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://www.adx.ae',
        tags: JSON.stringify(['securities', 'market', 'finance', 'investment', 'stocks', 'academy']),
        tagsAr: JSON.stringify(['أوراق مالية', 'سوق', 'مالية', 'استثمار', 'أسهم', 'أكاديمية']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Youth Programs',
        platform: 'Affiliates Platform',
        name: 'Abu Dhabi Youth Business Council',
        nameAr: 'مجلس أبوظبي لرجال الأعمال الشباب',
        description: 'Support and networking platform for young entrepreneurs and business professionals.',
        descriptionAr: 'منصة دعم وتواصل لرواد الأعمال الشباب والمهنيين.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://abudhabichamber.ae/youth-council',
        tags: JSON.stringify(['youth', 'entrepreneurs', 'young', 'business', 'networking', 'startups']),
        tagsAr: JSON.stringify(['شباب', 'رواد أعمال', 'أعمال', 'تواصل', 'شركات ناشئة']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Women Programs',
        platform: 'Affiliates Platform',
        name: 'Abu Dhabi Businesswomen Council',
        nameAr: 'مجلس سيدات أعمال أبوظبي',
        description: 'Empowering women in business through networking, mentorship, and development programs.',
        descriptionAr: 'تمكين المرأة في الأعمال من خلال التواصل والإرشاد وبرامج التطوير.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://abudhabichamber.ae/businesswomen-council',
        tags: JSON.stringify(['women', 'businesswomen', 'empowerment', 'networking', 'mentorship']),
        tagsAr: JSON.stringify(['نساء', 'سيدات أعمال', 'تمكين', 'تواصل', 'إرشاد']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Family Business',
        platform: 'Affiliates Platform',
        name: 'Family Business',
        nameAr: 'الأعمال العائلية',
        description: 'Support services for family-owned businesses including succession planning and governance.',
        descriptionAr: 'خدمات دعم للشركات العائلية بما في ذلك تخطيط التعاقب والحوكمة.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://abudhabichamber.ae/family-business',
        tags: JSON.stringify(['family', 'business', 'succession', 'governance', 'legacy', 'inheritance']),
        tagsAr: JSON.stringify(['عائلة', 'أعمال', 'تعاقب', 'حوكمة', 'إرث', 'وراثة']),
      },
    }),
    prisma.service.create({
      data: {
        dept: 'Franchise Services',
        platform: 'Affiliates Platform',
        name: 'Franchise',
        nameAr: 'الامتياز التجاري',
        description: 'Franchise development and support services for businesses looking to expand through franchising.',
        descriptionAr: 'خدمات تطوير ودعم الامتياز التجاري للشركات التي تتطلع للتوسع من خلال الامتياز.',
        channelType: 'EXTERNAL',
        externalUrl: 'https://abudhabichamber.ae/franchise',
        tags: JSON.stringify(['franchise', 'expansion', 'licensing', 'business model', 'growth']),
        tagsAr: JSON.stringify(['امتياز', 'توسع', 'ترخيص', 'نموذج عمل', 'نمو']),
      },
    }),
  ])

  console.log(`Created ${services.length} services`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
