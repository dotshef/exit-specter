/**
 * KST(한국 표준시) 기준으로 현재가 주말(토요일 또는 일요일)인지 확인합니다.
 * @returns true if current KST time is Saturday or Sunday
 */
export function isWeekendKST(): boolean {
  const now = new Date();
  const kstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  const dayOfWeek = kstDate.getDay();
  // 0 = 일요일, 6 = 토요일
  return dayOfWeek === 0 || dayOfWeek === 6;
}
