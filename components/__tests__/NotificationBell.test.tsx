import { render, screen } from '@testing-library/react'
import NotificationBell from '../NotificationBell'
import { useNotifications } from '../NotificationsProvider'

// Mock the useNotifications hook
jest.mock('../NotificationsProvider', () => ({
  useNotifications: jest.fn(),
}))

describe('NotificationBell Component', () => {
  it('renders notification count badge when unread > 0', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unread: 5,
      refresh: jest.fn(),
    })

    render(<NotificationBell />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not render badge when unread is 0', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unread: 0,
      refresh: jest.fn(),
    })

    const { container } = render(<NotificationBell />)
    expect(container.querySelector('.bg-red-600')).not.toBeInTheDocument()
  })

  it('handles large notification counts', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      unread: 99,
      refresh: jest.fn(),
    })

    render(<NotificationBell />)
    expect(screen.getByText('99')).toBeInTheDocument()
  })
})
