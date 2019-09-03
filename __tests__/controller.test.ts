import Controller from '../libs/controller'

describe('libs/contorller.ts', () => {
  describe('constructor', () => {
    it('should not be throw error', () => {
      expect(() => {
        new Controller('LambdaARN', 'viewer-request')
      }).not.toThrow()
    })
  })
})
