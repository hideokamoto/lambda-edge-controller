import Controller from '../libs/index'

describe('libs/index.ts', () => {
  describe('constructor', () => {
    it('should not be throw error', () => {
      expect(() => {
        new Controller('LambdaARN', 'viewer-request')
      }).not.toThrow()
    })
  })
})
