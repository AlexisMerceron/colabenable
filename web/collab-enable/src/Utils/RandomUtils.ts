export class RandomUtils {
  static seededRandom(seed: number) {
    let state = seed
    return () => {
      state = (state * 9301 + 49297) % 233280
      return state / 233280
    }
  }
}
