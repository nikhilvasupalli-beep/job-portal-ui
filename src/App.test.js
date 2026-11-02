import { fireEvent, render, screen } from '@testing-library/react';
import JobPortal from './JobPortal';

describe('JobPortal', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test('adds a job locally when the backend fetch fails', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to fetch')));

    render(<JobPortal />);

    fireEvent.change(screen.getByPlaceholderText(/Candidate \/ Job Name/i), {
      target: { name: 'name', value: 'Alice Johnson' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Job Title/i), {
      target: { name: 'title', value: 'Software Engineer' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Company/i), {
      target: { name: 'company', value: 'Contoso' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Location/i), {
      target: { name: 'location', value: 'Remote' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Salary/i), {
      target: { name: 'salary', value: '120000' }
    });

    fireEvent.click(screen.getByRole('button', { name: /add job/i }));

    expect(await screen.findByText(/Software Engineer/i)).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('jobPortalJobs') || '[]')).toHaveLength(1);
  });
});
