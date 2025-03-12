export class TimeUtils {
  static formatSeconds(seconds: number): string {
    let remainingSeconds = seconds

    const hours = Math.floor(remainingSeconds / 3600)
    remainingSeconds %= 3600

    const minutes = Math.floor(remainingSeconds / 60)
    remainingSeconds %= 60

    const parts: string[] = []
    if (hours > 0) parts.push(`${hours}h`)
    if (minutes > 0) parts.push(`${minutes}m`)
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`)

    return parts.join('')
  }
}
