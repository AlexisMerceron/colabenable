export class RandomUtils {
  static setInitSeed(seed: number): void {
    window.localStorage.setItem('init_seed', seed.toString())
    window.localStorage.setItem('seed', seed.toString())
  }

  static getInitSeed(): number {
    return +(window.localStorage.getItem('init_seed') ?? 0)
  }

  static isRandomSeed(): boolean {
    return window.localStorage.getItem('is_random_seed') === 'true'
  }

  static activeRandom() {
    window.localStorage.setItem('is_random_seed', 'true')
  }

  static disabledRandom() {
    window.localStorage.setItem('is_random_seed', 'false')
  }

  static resetSeed(): void {
    const initSeed = window.localStorage.getItem('init_seed') ?? '100'
    if (initSeed !== null) {
      window.localStorage.setItem('seed', initSeed)
    }
  }

  static getNumber(): number {
    if (RandomUtils.isRandomSeed()) {
      return Math.random()
    }

    const seed = window.localStorage.getItem('seed')
    let state = seed !== null && seed !== '' ? Number(seed) : 1000

    state = (state * 9301 + 49297) % 233280
    const randomValue = state / 233280

    window.localStorage.setItem('seed', state.toString())
    return randomValue
  }
}
