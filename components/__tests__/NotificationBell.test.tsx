import { render } from '@testing-library/react'
import NotificationBell from '../NotificationBell'

describe('NotificationBell Component', () => {
  it('renders notification count', () => {
    const { container } = render(<NotificationBell unread={5} />)
    expect(container.textContent).toContain('5')
  })

  it('renders zero notifications', () => {
    const { container } = render(<NotificationBell unread={0} />)
    expect(container).toBeInTheDocument()
  })

  it('handles large notification counts', () => {
    const { container } = render(<NotificationBell unread={99} />)
    expect(container.textContent).toContain('99')
  })
})
