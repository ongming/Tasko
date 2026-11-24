import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore - checkAuth deduplication', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('gọi /auth/refresh đúng 1 lần khi checkAuth được kích hoạt đồng thời (React StrictMode)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: { id: 'u-1', email: 'minh@tasko.dev', fullName: 'Minh' },
          accessToken: 'new-access-token',
        },
      }),
    })
    globalThis.fetch = mockFetch as unknown as typeof fetch

    const [res1, res2] = await Promise.all([
      useAuthStore.getState().checkAuth(),
      useAuthStore.getState().checkAuth(),
    ])

    expect(res1).toBe(true)
    expect(res2).toBe(true)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(useAuthStore.getState().accessToken).toBe('new-access-token')
  })
})
