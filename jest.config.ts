module.exports = {
    preset: 'ts-jest',
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    modulePaths: ['<rootDir>'],
    roots: ['<rootDir>'],
    moduleNameMapper: {
        'src/(.*)': '<rootDir>/src/$1',
    },
};
