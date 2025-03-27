export class RandomUtils {
  static setSeed(seed: number) {
    window.localStorage.setItem('init_seed', seed.toString())
  }

  static seededRandom(seed: number) {
    let state = seed
    return () => {
      state = (state * 9301 + 49297) % 233280
      return state / 233280
    }
  }
}
