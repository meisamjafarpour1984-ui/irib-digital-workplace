/**
 * IRIB Digital Workplace Platform - Database Seed (SQLite Compatible)
 *
 * Designer & Developer: میثم جعفرپور آلانق
 * Education: Master of Software Engineering
 * Position: Audio and Video Expert Level 4
 * Client: Technical Deputy of IRIB East Azerbaijan Center
 * All rights reserved © 2026
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Admin User
  const hashedPassword = '$2b$10$BEDcctzsJs08aiU3BrFLp.mjH4BQtiFMGBln2MnhywEpluuFakJCa' // bcrypt hash for 'admin123'
  const admin = await prisma.user.upsert({
    where: { personnelCode: 'ADMIN001' },
    update: {},
    create: {
      personnelCode: 'ADMIN001',
      nationalCode: '1234567890',
      mobile: '09123456789',
      email: 'admin@irib.ir',
      name: 'مدیر سیستم',
      nameFa: 'مدیر سیستم',
      passwordHash: hashedPassword,
      status: 'ACTIVE',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create Regular Users
  const user1 = await prisma.user.upsert({
    where: { personnelCode: 'EMP001' },
    update: {},
    create: {
      personnelCode: 'EMP001',
      nationalCode: '1234567891',
      mobile: '09123456788',
      email: 'user1@irib.ir',
      name: 'علی محمدی',
      nameFa: 'علی محمدی',
      passwordHash: '$2b$10$wRPEFpywLfEVS29ktEuchuxxMZ1Z0lQAXVcsYQ8vRHjjPLVlgNCJi', // bcrypt hash for 'user123'
      status: 'ACTIVE',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { personnelCode: 'EMP002' },
    update: {},
    create: {
      personnelCode: 'EMP002',
      nationalCode: '1234567892',
      mobile: '09123456787',
      email: 'user2@irib.ir',
      name: 'مریم رضایی',
      nameFa: 'مریم رضایی',
      passwordHash: '$2b$10$ISngr9ezFLakLZcEGO193ex25g32s/jjZANH2KUWQp5lCcIxDdcUO', // bcrypt hash for 'user223'
      status: 'ACTIVE',
    },
  })
  console.log('✅ Regular users created')

  // Create Global Permissions for Content Operations
  console.log('Creating global permissions...')
  const contentReadPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Content', action: 'READ' } },
    update: {},
    create: {
      entity: 'Content',
      action: 'READ',
      description: 'Read any content globally',
    },
  })

  const contentCreatePermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Content', action: 'CREATE' } },
    update: {},
    create: {
      entity: 'Content',
      action: 'CREATE',
      description: 'Create content in any department',
    },
  })

  const contentUpdatePermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Content', action: 'UPDATE' } },
    update: {},
    create: {
      entity: 'Content',
      action: 'UPDATE',
      description: 'Update any content globally',
    },
  })

  const contentDeletePermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Content', action: 'DELETE' } },
    update: {},
    create: {
      entity: 'Content',
      action: 'DELETE',
      description: 'Delete any content globally',
    },
  })

  const analyticsReadPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Analytics', action: 'READ' } },
    update: {},
    create: {
      entity: 'Analytics',
      action: 'READ',
      description: 'Read analytics dashboard data',
    },
  })

  const userReadPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'User', action: 'READ' } },
    update: {},
    create: {
      entity: 'User',
      action: 'READ',
      description: 'Read user information',
    },
  })

  const themeReadPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Theme', action: 'READ' } },
    update: {},
    create: {
      entity: 'Theme',
      action: 'READ',
      description: 'Read theme configuration',
    },
  })

  const storageReadPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Storage', action: 'READ' } },
    update: {},
    create: {
      entity: 'Storage',
      action: 'READ',
      description: 'Read storage statistics',
    },
  })

  const auditReadPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'AuditLog', action: 'READ' } },
    update: {},
    create: {
      entity: 'AuditLog',
      action: 'READ',
      description: 'Read audit logs',
    },
  })

  const mediaReadPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Media', action: 'READ' } },
    update: {},
    create: {
      entity: 'Media',
      action: 'READ',
      description: 'Read media assets',
    },
  })

  const userCreatePermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'User', action: 'CREATE' } },
    update: {},
    create: {
      entity: 'User',
      action: 'CREATE',
      description: 'Create new users',
    },
  })

  const contentPublishPermission = await prisma.atomicPermission.upsert({
    where: { entity_action: { entity: 'Content', action: 'PUBLISH' } },
    update: {},
    create: {
      entity: 'Content',
      action: 'PUBLISH',
      description: 'Publish content',
    },
  })
  console.log('✅ Global permissions created')

  // Create Roles
  const adminRole = await prisma.role.upsert({
    where: { code: 'ADMIN' },
    update: {},
    create: {
      code: 'ADMIN',
      name: { fa: 'مدیر سیستم', en: 'System Administrator' },
      description: 'دسترسی کامل به سیستم',
    },
  })

  // Link permissions to admin role
  console.log('Linking permissions to admin role...')
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        connect: [
          { id: contentReadPermission.id },
          { id: contentCreatePermission.id },
          { id: contentUpdatePermission.id },
          { id: contentDeletePermission.id },
          { id: contentPublishPermission.id },
          { id: analyticsReadPermission.id },
          { id: userReadPermission.id },
          { id: userCreatePermission.id },
          { id: themeReadPermission.id },
          { id: storageReadPermission.id },
          { id: auditReadPermission.id },
          { id: mediaReadPermission.id },
        ],
      },
    },
  })
  console.log('✅ Global permissions linked to admin role')

  const editorRole = await prisma.role.upsert({
    where: { code: 'EDITOR' },
    update: {},
    create: {
      code: 'EDITOR',
      name: { fa: 'ویرایشگر محتوا', en: 'Content Editor' },
      description: 'مدیریت محتوا و رسانه',
    },
  })

  const userRole = await prisma.role.upsert({
    where: { code: 'USER' },
    update: {},
    create: {
      code: 'USER',
      name: { fa: 'کاربر عادی', en: 'Regular User' },
      description: 'دسترسی محدود به سیستم',
    },
  })
  console.log('✅ Roles created')

  // Assign Roles to Users
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId_scopeType: {
        userId: admin.id,
        roleId: adminRole.id,
        scopeType: 'GLOBAL',
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
      scopeType: 'GLOBAL',
      scopeIds: [], // Empty for GLOBAL scope
    },
  })

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId_scopeType: {
        userId: user1.id,
        roleId: editorRole.id,
        scopeType: 'GLOBAL',
      },
    },
    update: {},
    create: {
      userId: user1.id,
      roleId: editorRole.id,
      scopeType: 'GLOBAL',
    },
  })

  await prisma.userRoleAssignment.upsert({
    where: {
      userId_roleId_scopeType: {
        userId: user2.id,
        roleId: userRole.id,
        scopeType: 'GLOBAL',
      },
    },
    update: {},
    create: {
      userId: user2.id,
      roleId: userRole.id,
      scopeType: 'GLOBAL',
    },
  })
  console.log('✅ User roles assigned')

  // Create Department Units
  const dept1 = await prisma.department.upsert({
    where: { slug: 'technical-deputy' },
    update: {},
    create: {
      slug: 'technical-deputy',
      name: { fa: 'معاونت فنی', en: 'Technical Deputy' },
      type: 'DEPARTMENT',
      parentId: null,
    },
  })

  const dept2 = await prisma.department.upsert({
    where: { slug: 'it-department' },
    update: {},
    create: {
      slug: 'it-department',
      name: { fa: 'دایره فناوری اطلاعات', en: 'IT Department' },
      type: 'UNIT',
      parentId: dept1.id,
    },
  })

  const dept3 = await prisma.department.upsert({
    where: { slug: 'network-department' },
    update: {},
    create: {
      slug: 'network-department',
      name: { fa: 'دایره شبکه', en: 'Network Department' },
      type: 'UNIT',
      parentId: dept2.id,
    },
  })
  console.log('✅ Department units created')

  // Assign Users to Departments
  await prisma.userDepartmentScope.upsert({
    where: {
      userId_departmentId: {
        userId: admin.id,
        departmentId: dept1.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      departmentId: dept1.id,
      isPrimary: true,
    },
  })

  await prisma.userDepartmentScope.upsert({
    where: {
      userId_departmentId: {
        userId: user1.id,
        departmentId: dept2.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      departmentId: dept2.id,
      isPrimary: true,
    },
  })
  console.log('✅ Users assigned to departments')

  // Create Sample Content (News)
  const news1 = await prisma.content.upsert({
    where: { slug: 'news-1' },
    update: {},
    create: {
      slug: 'news-1',
      contentType: 'NEWS',
      title: { fa: 'برگزاری همایش فناوری اطلاعات', en: 'IT Conference Held' },
      excerpt: {
        fa: 'همایش بزرگ فناوری اطلاعات با حضور مدیران ارشد برگزار شد.',
        en: 'Major IT conference held with senior executives in attendance.',
      },
      body: {
        fa: 'همایش بزرگ فناوری اطلاعات و ارتباطات صبح امروز با حضور مدیران ارشد سازمان و کارشناسان خبره در این حوزه برگزار شد. در این همایش آخرین دستاوردها و چشم‌اندازهای آینده فناوری در سازمان مورد بررسی قرار گرفت.',
        en: 'The major IT and communications conference was held this morning with senior organization executives and expert specialists in attendance. Latest achievements and future technology prospects in the organization were discussed.',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
    },
  })

  // Create Content Scope for news1
  await prisma.contentScope.upsert({
    where: { contentId_departmentId: { contentId: news1.id, departmentId: dept1.id } },
    update: {},
    create: { contentId: news1.id, departmentId: dept1.id },
  })

  const news2 = await prisma.content.upsert({
    where: { slug: 'news-2' },
    update: {},
    create: {
      slug: 'news-2',
      contentType: 'NEWS',
      title: { fa: 'ارتقای سیستم‌های شبکه', en: 'Network Systems Upgrade' },
      excerpt: {
        fa: 'سیستم‌های شبکه سازمان به‌روزرسانی و ارتقا یافت.',
        en: 'Organization network systems have been updated and upgraded.',
      },
      body: {
        fa: 'پروژه ارتقای سیستم‌های شبکه سازمان با موفقیت به اتمام رسید. با این ارتقا، سرعت و پایداری شبکه به میزان قابل توجهی افزایش یافته است.',
        en: 'The organization network systems upgrade project has been successfully completed. With this upgrade, network speed and stability have significantly improved.',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user1.id,
    },
  })

  await prisma.contentScope.upsert({
    where: { contentId_departmentId: { contentId: news2.id, departmentId: dept2.id } },
    update: {},
    create: { contentId: news2.id, departmentId: dept2.id },
  })

  const news3 = await prisma.content.upsert({
    where: { slug: 'news-3' },
    update: {},
    create: {
      slug: 'news-3',
      contentType: 'NEWS',
      title: { fa: 'آموزش کار با سامانه جدید', en: 'New System Training' },
      excerpt: {
        fa: 'دوره‌های آموزشی سامانه جدید شروع شد.',
        en: 'Training courses for the new system have begun.',
      },
      body: {
        fa: 'برای آشنایی کاربران با سامانه جدید اداری، دوره‌های آموزشی در نظر گرفته شده است. کاربران می‌توانند با مراجعه به سامانه آموزشی، زمان‌بندی مناسب را انتخاب کنند.',
        en: 'Training courses have been scheduled to familiarize users with the new administrative system. Users can visit the training system to select suitable times.',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user1.id,
    },
  })

  await prisma.contentScope.upsert({
    where: { contentId_departmentId: { contentId: news3.id, departmentId: dept2.id } },
    update: {},
    create: { contentId: news3.id, departmentId: dept2.id },
  })

  // Create Sample Content (Announcements)
  const announcement1 = await prisma.content.upsert({
    where: { slug: 'announcement-1' },
    update: {},
    create: {
      slug: 'announcement-1',
      contentType: 'ANNOUNCEMENT',
      title: { fa: 'اطلاعیه تعطیلات', en: 'Holiday Announcement' },
      excerpt: {
        fa: 'ساعات کاری هفته آینده تغییر می‌کند.',
        en: 'Working hours for next week will change.',
      },
      body: {
        fa: 'به اطلاع کلیه کارکنان می‌رساند که در هفته آینده به مناسبت تعطیلات رسمی، ساعات کاری از ساعت ۸ تا ۱۴ خواهد بود.',
        en: 'All employees are informed that due to official holidays next week, working hours will be from 8 AM to 2 PM.',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: admin.id,
    },
  })

  await prisma.contentScope.upsert({
    where: { contentId_departmentId: { contentId: announcement1.id, departmentId: dept1.id } },
    update: {},
    create: { contentId: announcement1.id, departmentId: dept1.id },
  })

  const announcement2 = await prisma.content.upsert({
    where: { slug: 'announcement-2' },
    update: {},
    create: {
      slug: 'announcement-2',
      contentType: 'ANNOUNCEMENT',
      title: { fa: 'فراخوان دوره آموزشی', en: 'Training Course Call' },
      excerpt: {
        fa: 'ثبت‌نام دوره‌های آموزشی تخصصی آغاز شد.',
        en: 'Registration for specialized training courses has begun.',
      },
      body: {
        fa: 'دوره‌های آموزشی تخصصی در حوزه‌های مختلف فناوری اطلاعات برگزار می‌شود. علاقه‌مندان می‌توانند تا پایان هفته ثبت‌نام کنند.',
        en: 'Specialized training courses in various IT fields will be held. Interested parties can register until the end of the week.',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorId: user1.id,
    },
  })

  await prisma.contentScope.upsert({
    where: { contentId_departmentId: { contentId: announcement2.id, departmentId: dept2.id } },
    update: {},
    create: { contentId: announcement2.id, departmentId: dept2.id },
  })

  console.log('✅ Sample content created (3 news, 2 announcements)')

  // Seed Widget Manifests
  const widgets = [
    {
      widgetKey: 'hero-media',
      name: { fa: 'مدیا اصلی', en: 'Hero Media' },
      category: 'Hero',
      defaultSize: { cols: 12, rows: 8 },
      resizable: false,
      draggable: false,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/hero-media',
    },
    {
      widgetKey: 'quick-access',
      name: { fa: 'دسترسی سریع', en: 'Quick Access' },
      category: 'Navigation',
      defaultSize: { cols: 4, rows: 6 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/quick-access',
    },
    {
      widgetKey: 'internet-login',
      name: { fa: 'لاگین اینترنت سازمانی', en: 'Internet Login' },
      category: 'Auth',
      defaultSize: { cols: 4, rows: 6 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/portal/login-card',
    },
    {
      widgetKey: 'news-timeline',
      name: { fa: 'جدول زمانی اخبار', en: 'News Timeline' },
      category: 'Content',
      defaultSize: { cols: 8, rows: 10 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/news-timeline',
    },
    {
      widgetKey: 'dept-announcements',
      name: { fa: 'اطلاعیه‌های واحدها', en: 'Department Announcements' },
      category: 'Content',
      defaultSize: { cols: 6, rows: 8 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/dept-announcements',
    },
    {
      widgetKey: 'media-gallery',
      name: { fa: 'گالری رویدادها', en: 'Media Gallery' },
      category: 'Media',
      defaultSize: { cols: 6, rows: 8 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/portal/gallery',
    },
    {
      widgetKey: 'it-services',
      name: { fa: 'سرویس‌های IT', en: 'IT Services' },
      category: 'Services',
      defaultSize: { cols: 4, rows: 10 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/portal/it-info',
    },
    {
      widgetKey: 'dept-announcements-basic',
      name: { fa: 'اطلاعیه‌های اداری', en: 'Basic Announcements' },
      category: 'Content',
      defaultSize: { cols: 6, rows: 8 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/portal/announcements',
    },
    {
      widgetKey: 'research-highlights',
      name: { fa: 'برجسته‌های پژوهش', en: 'Research Highlights' },
      category: 'Knowledge',
      defaultSize: { cols: 4, rows: 8 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/research-highlights',
    },
    {
      widgetKey: 'calendar-prayer',
      name: { fa: 'تقویم و اوقات شرعی', en: 'Calendar & Prayer Times' },
      category: 'Utility',
      defaultSize: { cols: 4, rows: 6 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/calendar-prayer',
    },
    {
      widgetKey: 'weather',
      name: { fa: 'وضعیت آب و هوای تبریز', en: 'Tabriz Weather' },
      category: 'Utility',
      defaultSize: { cols: 3, rows: 4 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/weather',
    },
    {
      widgetKey: 'admin-kpi',
      name: { fa: 'شاخص‌های کلیدی عملکرد', en: 'Admin KPI Stats' },
      category: 'Admin',
      defaultSize: { cols: 12, rows: 4 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: ['Analytics.READ'],
      componentPath: '@/components/widgets/admin-kpi',
    },
    {
      widgetKey: 'services-grid',
      name: { fa: 'شبکه خدمات', en: 'Services Grid' },
      category: 'Services',
      defaultSize: { cols: 12, rows: 6 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/portal/services-grid',
    },
    {
      widgetKey: 'help-cards',
      name: { fa: 'کارت‌های راهنما', en: 'Help Cards' },
      category: 'Support',
      defaultSize: { cols: 12, rows: 4 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/portal/help-cards',
    },
    {
      widgetKey: 'occasion-banner',
      name: { fa: 'بنر مناسبتی', en: 'Occasion Banner' },
      category: 'Content',
      defaultSize: { cols: 12, rows: 3 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/portal/occasion-banner',
    },
    {
      widgetKey: 'dept-document-center',
      name: { fa: 'مرکز اسناد', en: 'Department Document Center' },
      category: 'Department',
      defaultSize: { cols: 12, rows: 8 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/dept-document-center',
    },
    {
      widgetKey: 'dept-forms-center',
      name: { fa: 'مرکز فرم‌ها', en: 'Department Forms Center' },
      category: 'Department',
      defaultSize: { cols: 6, rows: 8 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/dept-forms-center',
    },
    {
      widgetKey: 'dept-experts-directory',
      name: { fa: 'فهرست کارشناسان', en: 'Department Experts Directory' },
      category: 'Department',
      defaultSize: { cols: 6, rows: 8 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/dept-experts-directory',
    },
    {
      widgetKey: 'dept-service-cards',
      name: { fa: 'کارت‌های خدمات', en: 'Department Service Cards' },
      category: 'Department',
      defaultSize: { cols: 12, rows: 6 },
      resizable: true,
      draggable: true,
      ssr: true,
      configSchema: {},
      requiredPermissions: [],
      componentPath: '@/components/widgets/dept-service-cards',
    },
  ]

  for (const widget of widgets) {
    await prisma.widgetManifest.upsert({
      where: { widgetKey: widget.widgetKey },
      update: {},
      create: widget,
    })
  }
  console.log('✅ Widget manifests seeded')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
