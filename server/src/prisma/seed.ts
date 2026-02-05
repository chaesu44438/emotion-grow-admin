import { PrismaClient, SubscriptionTier, AiService, StoryStatus, SubscriptionStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ============ 헬퍼 함수들 ============

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number, decimals: number = 4): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) return items[i]
  }
  return items[items.length - 1]
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// 성장 곡선을 위한 날짜 생성 (최근일수록 더 많이)
function growthCurveDate(start: Date, end: Date): Date {
  const random = Math.pow(Math.random(), 0.5) // 제곱근으로 최근 쪽 편향
  return new Date(start.getTime() + random * (end.getTime() - start.getTime()))
}

// 주말에 더 많은 날짜 생성
function weekendBiasedDate(start: Date, end: Date): Date {
  let date: Date
  do {
    date = randomDate(start, end)
    const day = date.getDay()
    // 주말(0, 6)이면 70% 확률로 선택, 평일이면 30% 확률
    if ((day === 0 || day === 6) && Math.random() < 0.7) break
    if (day !== 0 && day !== 6 && Math.random() < 0.3) break
  } while (Math.random() > 0.5)
  return date
}

// ============ 데이터 상수들 ============

const KOREAN_SURNAMES = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '류', '홍']
const KOREAN_NAMES = ['민준', '서준', '도윤', '예준', '시우', '하준', '지호', '주원', '지후', '준서', '서연', '서윤', '지우', '서현', '민서', '하은', '하린', '윤서', '지민', '채원', '수아', '지아', '다은', '예은', '수빈', '유진', '지원', '소율', '예린', '시은']
const CHILD_NAMES = ['하늘', '바다', '소율', '지우', '서연', '도윤', '시우', '하준', '지호', '예준', '민준', '서준', '지민', '수아', '지아', '다은', '예은', '수빈', '유진', '하린', '채원', '지원', '예린', '시은', '윤서', '하은', '민서', '서현', '은우', '시현', '연우', '현우', '준호', '태민', '승민', '유준', '건우', '지훈', '성민', '동현']

const PROVIDERS = ['google', 'kakao', 'naver', 'apple']
const PROVIDER_WEIGHTS = [40, 30, 20, 10]

const EMOTIONS = ['happy', 'sad', 'angry', 'anxious', 'tired', 'grateful', 'proud', 'frustrated']
const CONTEXTS = ['육아', '직장', '관계', '건강', '재정', '가사']

const STORY_TITLES = [
  '숲속의 작은 친구들', '용감한 작은 곰', '별빛 요정의 선물', '무지개 나라 여행',
  '꿈꾸는 아기 구름', '마법의 정원', '작은 영웅의 모험', '달님의 자장가',
  '용기를 찾아서', '친구와 함께하는 하루', '행복한 가족 나들이', '숲속 음악회',
  '바다 속 보물찾기', '하늘을 나는 꿈', '사랑을 배우는 아이', '마음이 자라는 시간',
  '무서운 밤을 이기는 법', '화가 났을 때', '슬픔을 나누면', '기쁨을 전해요',
  '작은 씨앗의 꿈', '무지개 다리 건너기', '별들의 이야기', '구름 위의 성',
  '마법 양탄자 여행', '요정의 날개', '용의 알을 찾아서', '마녀와 친구되기',
  '눈 내리는 밤', '봄이 오는 소리', '여름 바다 이야기', '가을 숲의 비밀',
  '겨울왕국 탐험', '엄마 아빠 사랑해요', '할머니의 선물', '우리 집 강아지'
]

const NARRATIVE_TYPES = ['growth', 'adventure', 'friendship', 'healing', 'courage', 'family', 'empathy', 'dream']

const AI_ACTIONS: Record<AiService, string[]> = {
  OPENAI_CHAT: ['coaching', 'story_generation', 'emotion_analysis'],
  OPENAI_TTS: ['tts_narration', 'story_audio'],
  GOOGLE_TTS: ['tts_narration', 'feedback_audio'],
  RECRAFT: ['illustration', 'character_design', 'scene_generation']
}

const ERROR_SOURCES = ['ai_service', 'firebase_sync', 'payment', 'auth']
const ERROR_MESSAGES = [
  { level: 'ERROR', source: 'ai_service', message: 'OpenAI API 응답 타임아웃', stack: 'TimeoutError: Request timed out after 30000ms' },
  { level: 'ERROR', source: 'ai_service', message: 'Recraft 이미지 생성 실패', stack: 'Error: Image generation failed - content policy violation' },
  { level: 'ERROR', source: 'ai_service', message: 'TTS 변환 중 오류 발생', stack: 'Error: Audio conversion failed' },
  { level: 'ERROR', source: 'firebase_sync', message: '사용자 데이터 동기화 실패', stack: 'FirebaseError: Permission denied' },
  { level: 'ERROR', source: 'firebase_sync', message: 'Firebase 인증 토큰 만료', stack: 'FirebaseError: Token expired' },
  { level: 'WARN', source: 'firebase_sync', message: '데이터 동기화 지연', stack: null },
  { level: 'ERROR', source: 'payment', message: '결제 처리 중 오류', stack: 'PaymentError: Card declined' },
  { level: 'ERROR', source: 'payment', message: '구독 갱신 실패', stack: 'SubscriptionError: Payment method invalid' },
  { level: 'WARN', source: 'payment', message: '결제 재시도 중', stack: null },
  { level: 'CRITICAL', source: 'payment', message: '결제 시스템 연결 불가', stack: 'ConnectionError: Payment gateway unreachable' },
  { level: 'ERROR', source: 'auth', message: '로그인 시도 횟수 초과', stack: 'AuthError: Too many login attempts' },
  { level: 'WARN', source: 'auth', message: '비정상적인 로그인 패턴 감지', stack: null },
  { level: 'CRITICAL', source: 'auth', message: 'JWT 검증 키 오류', stack: 'JWTError: Invalid signature' },
  { level: 'ERROR', source: 'ai_service', message: 'Rate limit 초과', stack: 'RateLimitError: Too many requests' },
  { level: 'WARN', source: 'ai_service', message: 'API 응답 지연 경고', stack: null }
]

// ============ 날짜 범위 설정 ============

const START_DATE = new Date('2025-11-01')
const END_DATE = new Date('2026-02-05')
const ONE_WEEK_AGO = new Date(END_DATE.getTime() - 7 * 24 * 60 * 60 * 1000)
const ONE_MONTH_AGO = new Date(END_DATE.getTime() - 30 * 24 * 60 * 60 * 1000)

// ============ 메인 시드 함수 ============

async function main() {
  console.log('🗑️  기존 데이터 삭제 중...')

  // 순서 중요: 외래키 의존성 역순으로 삭제
  await prisma.errorLog.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.aiUsageLog.deleteMany()
  await prisma.story.deleteMany()
  await prisma.emotionRecord.deleteMany()
  await prisma.child.deleteMany()
  await prisma.user.deleteMany()
  await prisma.admin.deleteMany()

  console.log('✅ 기존 데이터 삭제 완료\n')

  // ============ 1. Admin 생성 ============
  console.log('👤 Admin 생성 중...')
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@emotiongrow.com',
      password: hashedPassword,
      name: '관리자',
      role: 'SUPER_ADMIN',
    },
  })
  console.log(`   ✅ Admin: ${admin.email}`)

  // ============ 2. Users 생성 (80명) ============
  console.log('\n👥 사용자 80명 생성 중...')

  const userConfigs: { tier: SubscriptionTier; count: number }[] = [
    { tier: 'FREE', count: 50 },
    { tier: 'BASIC', count: 20 },
    { tier: 'PREMIUM', count: 10 },
  ]

  const users: Array<{ id: string; subscriptionTier: SubscriptionTier; createdAt: Date }> = []
  let userIndex = 0

  for (const config of userConfigs) {
    for (let i = 0; i < config.count; i++) {
      const surname = randomPick(KOREAN_SURNAMES)
      const name = randomPick(KOREAN_NAMES)
      const fullName = surname + name
      const provider = weightedPick(PROVIDERS, PROVIDER_WEIGHTS)
      const isActive = Math.random() < 0.9
      const createdAt = growthCurveDate(START_DATE, END_DATE)
      const lastLoginAt = isActive
        ? randomDate(ONE_WEEK_AGO, END_DATE)
        : randomDate(ONE_MONTH_AGO, ONE_WEEK_AGO)

      const user = await prisma.user.create({
        data: {
          firebaseUid: `firebase-uid-${userIndex + 1}`,
          email: `user${userIndex + 1}@${provider}.com`,
          displayName: fullName,
          provider,
          subscriptionTier: config.tier,
          isActive,
          lastLoginAt,
          createdAt,
          updatedAt: createdAt,
        },
      })

      users.push({ id: user.id, subscriptionTier: user.subscriptionTier, createdAt: user.createdAt })
      userIndex++
    }
  }
  console.log(`   ✅ 사용자 ${users.length}명 생성 완료`)

  // ============ 3. Children 생성 (100명) ============
  console.log('\n👶 아이 100명 생성 중...')

  const children: Array<{ id: string; userId: string }> = []
  let childIndex = 0
  const ageGroups = ['0-1', '1-3', '3-5', '5-7']

  // 각 사용자에게 1~2명의 아이 배정
  for (const user of users) {
    const childCount = childIndex < 100 ? (Math.random() < 0.6 ? 1 : 2) : 0

    for (let i = 0; i < childCount && childIndex < 100; i++) {
      const child = await prisma.child.create({
        data: {
          userId: user.id,
          name: randomPick(CHILD_NAMES),
          birthDate: randomDate(new Date('2018-01-01'), new Date('2025-06-01')),
          gender: Math.random() < 0.5 ? 'male' : 'female',
          ageGroup: randomPick(ageGroups),
          createdAt: user.createdAt,
        },
      })
      children.push({ id: child.id, userId: user.id })
      childIndex++
    }
  }
  console.log(`   ✅ 아이 ${children.length}명 생성 완료`)

  // ============ 4. Emotion Records 생성 (500건) ============
  console.log('\n💭 감정 기록 500건 생성 중...')

  for (let i = 0; i < 500; i++) {
    const user = randomPick(users)
    const userChildren = children.filter(c => c.userId === user.id)
    const child = userChildren.length > 0 ? randomPick(userChildren) : null
    const createdAt = weekendBiasedDate(START_DATE, END_DATE)

    await prisma.emotionRecord.create({
      data: {
        userId: user.id,
        childId: child?.id || null,
        emotion: randomPick(EMOTIONS),
        intensity: randomInt(1, 5),
        note: `${randomPick(CONTEXTS)}에서 느낀 감정`,
        context: randomPick(CONTEXTS),
        createdAt,
      },
    })
  }
  console.log('   ✅ 감정 기록 500건 생성 완료')

  // ============ 5. Stories 생성 (150건) - BASIC/PREMIUM만 ============
  console.log('\n📖 동화 150건 생성 중...')

  const paidUsers = users.filter(u => u.subscriptionTier !== 'FREE')

  for (let i = 0; i < 150; i++) {
    const user = randomPick(paidUsers)
    const userChildren = children.filter(c => c.userId === user.id)
    const child = userChildren.length > 0 ? randomPick(userChildren) : null
    const createdAt = growthCurveDate(START_DATE, END_DATE)

    // status 비율: COMPLETED 90%, GENERATING 5%, FAILED 5%
    const statusRandom = Math.random()
    let status: StoryStatus = 'COMPLETED'
    if (statusRandom > 0.95) status = 'FAILED'
    else if (statusRandom > 0.90) status = 'GENERATING'

    await prisma.story.create({
      data: {
        userId: user.id,
        childId: child?.id || null,
        title: randomPick(STORY_TITLES),
        content: status === 'COMPLETED' ? '옛날 옛적에 작은 마을에 한 아이가 살았어요...' : null,
        emotion: randomPick(EMOTIONS),
        narrativeType: randomPick(NARRATIVE_TYPES),
        illustrationCount: status === 'COMPLETED' ? randomInt(3, 6) : 0,
        ttsGenerated: status === 'COMPLETED' && Math.random() < 0.7,
        status,
        createdAt,
      },
    })
  }
  console.log('   ✅ 동화 150건 생성 완료')

  // ============ 6. AI Usage Logs 생성 (800건) ============
  console.log('\n🤖 AI 사용 로그 800건 생성 중...')

  const services: AiService[] = ['OPENAI_CHAT', 'RECRAFT', 'GOOGLE_TTS', 'OPENAI_TTS']
  const serviceWeights = [40, 25, 20, 15]

  const costRanges: Record<AiService, [number, number]> = {
    OPENAI_CHAT: [0.002, 0.015],
    RECRAFT: [0.01, 0.04],
    GOOGLE_TTS: [0.001, 0.005],
    OPENAI_TTS: [0.005, 0.02],
  }

  for (let i = 0; i < 800; i++) {
    const user = randomPick(users)
    const service = weightedPick(services, serviceWeights)
    const action = randomPick(AI_ACTIONS[service])
    const createdAt = growthCurveDate(START_DATE, END_DATE)
    const isSuccess = Math.random() < 0.95

    const [minCost, maxCost] = costRanges[service]

    await prisma.aiUsageLog.create({
      data: {
        userId: user.id,
        service,
        action,
        model: service === 'OPENAI_CHAT' ? 'gpt-4-turbo' :
               service === 'OPENAI_TTS' ? 'tts-1-hd' :
               service === 'GOOGLE_TTS' ? 'ko-KR-Wavenet-A' : 'recraft-v3',
        inputTokens: service === 'OPENAI_CHAT' ? randomInt(500, 2000) : null,
        outputTokens: service === 'OPENAI_CHAT' ? randomInt(200, 1500) : null,
        cost: randomFloat(minCost, maxCost, 6),
        status: isSuccess ? 'success' : 'error',
        errorMessage: isSuccess ? null : 'API 요청 처리 중 오류 발생',
        responseTime: randomInt(500, 5000),
        createdAt,
      },
    })
  }
  console.log('   ✅ AI 사용 로그 800건 생성 완료')

  // ============ 7. Subscriptions 생성 (40건) ============
  console.log('\n💳 구독 이력 40건 생성 중...')

  const basicPremiumUsers = users.filter(u => u.subscriptionTier !== 'FREE')

  for (let i = 0; i < 40; i++) {
    const user = randomPick(basicPremiumUsers)
    const tier = Math.random() < 0.6 ? 'BASIC' : 'PREMIUM'
    const startDate = randomDate(START_DATE, END_DATE)

    // status 비율
    const statusRandom = Math.random()
    let status: SubscriptionStatus = 'ACTIVE'
    let endDate: Date | null = null

    if (statusRandom > 0.85) {
      status = 'CANCELLED'
      endDate = randomDate(startDate, END_DATE)
    } else if (statusRandom > 0.75) {
      status = 'EXPIRED'
      endDate = randomDate(startDate, END_DATE)
    }

    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier,
        startDate,
        endDate,
        amount: tier === 'BASIC' ? 9900 : 14900,
        status,
        createdAt: startDate,
      },
    })
  }
  console.log('   ✅ 구독 이력 40건 생성 완료')

  // ============ 8. Error Logs 생성 (30건) ============
  console.log('\n⚠️  에러 로그 30건 생성 중...')

  for (let i = 0; i < 30; i++) {
    const errorConfig = randomPick(ERROR_MESSAGES)
    const createdAt = randomDate(START_DATE, END_DATE)

    await prisma.errorLog.create({
      data: {
        level: errorConfig.level,
        source: errorConfig.source,
        message: errorConfig.message,
        stack: errorConfig.stack,
        metadata: {
          timestamp: createdAt.toISOString(),
          environment: 'production',
          version: '1.0.0',
        },
        createdAt,
      },
    })
  }
  console.log('   ✅ 에러 로그 30건 생성 완료')

  // ============ 결과 요약 ============
  console.log('\n' + '='.repeat(50))
  console.log('📊 시드 데이터 생성 완료!')
  console.log('='.repeat(50))

  const counts = await Promise.all([
    prisma.admin.count(),
    prisma.user.count(),
    prisma.child.count(),
    prisma.emotionRecord.count(),
    prisma.story.count(),
    prisma.aiUsageLog.count(),
    prisma.subscription.count(),
    prisma.errorLog.count(),
  ])

  console.log(`
   👤 Admins:          ${counts[0]}
   👥 Users:           ${counts[1]}
   👶 Children:        ${counts[2]}
   💭 Emotion Records: ${counts[3]}
   📖 Stories:         ${counts[4]}
   🤖 AI Usage Logs:   ${counts[5]}
   💳 Subscriptions:   ${counts[6]}
   ⚠️  Error Logs:      ${counts[7]}
  `)

  // 추가 통계
  const tierStats = await prisma.user.groupBy({
    by: ['subscriptionTier'],
    _count: true,
  })
  console.log('   📈 구독 티어별 사용자:')
  tierStats.forEach(s => console.log(`      - ${s.subscriptionTier}: ${s._count}명`))

  const providerStats = await prisma.user.groupBy({
    by: ['provider'],
    _count: true,
  })
  console.log('\n   🔐 Provider별 사용자:')
  providerStats.forEach(s => console.log(`      - ${s.provider}: ${s._count}명`))

  const serviceStats = await prisma.aiUsageLog.groupBy({
    by: ['service'],
    _count: true,
  })
  console.log('\n   🤖 AI 서비스별 사용량:')
  serviceStats.forEach(s => console.log(`      - ${s.service}: ${s._count}건`))

  console.log('\n✨ 시드 완료!')
  console.log('   로그인: admin@emotiongrow.com / admin123')
}

main()
  .catch((e) => {
    console.error('❌ 시드 실행 중 오류:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
