import { render, screen } from '@testing-library/react'
import Pie from '../Pie'

describe('Pie Component', () => {
  it('renders without crashing', () => {
    const mockData = { categoria1: 100, categoria2: 200 }
    const mockCategories = [
      { id: 'categoria1', nome: 'Categoria 1', cor: '#FF0000' },
      { id: 'categoria2', nome: 'Categoria 2', cor: '#00FF00' },
    ]

    render(<Pie data={mockData} categories={mockCategories} />)
    
    // Check if component renders
    expect(screen.getByText(/Categoria 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Categoria 2/i)).toBeInTheDocument()
  })

  it('calculates percentages correctly', () => {
    const mockData = { cat1: 100, cat2: 200 }
    const mockCategories = [
      { id: 'cat1', nome: 'Cat 1', cor: '#FF0000' },
      { id: 'cat2', nome: 'Cat 2', cor: '#00FF00' },
    ]

    render(<Pie data={mockData} categories={mockCategories} />)
    
    // Total = 300, cat1 = 33.3%, cat2 = 66.7%
    expect(screen.getByText(/33\.3%/)).toBeInTheDocument()
    expect(screen.getByText(/66\.7%/)).toBeInTheDocument()
  })

  it('handles empty data gracefully', () => {
    const mockData = {}
    const mockCategories = []

    const { container } = render(<Pie data={mockData} categories={mockCategories} />)
    
    // Should render without errors
    expect(container).toBeInTheDocument()
  })
})
