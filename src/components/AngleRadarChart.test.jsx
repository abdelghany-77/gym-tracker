import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AngleRadarChart from './AngleRadarChart';
import useWorkoutStore from '../store/workoutStore';

describe('AngleRadarChart Component (Requirement 1)', () => {
  beforeEach(() => {
    localStorage.clear();
    useWorkoutStore.setState({
      history: [
        {
          id: 'test_1',
          date: new Date().toLocaleDateString('en-CA'),
          exercises: [
            {
              exerciseId: 'chest_bb_flat_bench', // mid_chest
              sets: [{ weight: 100, reps: 10 }, { weight: 100, reps: 10 }, { weight: 100, reps: 10 }],
            },
            {
              exerciseId: 'chest_db_incline_press', // upper_chest
              sets: [{ weight: 36, reps: 10 }, { weight: 36, reps: 10 }, { weight: 36, reps: 10 }],
            },
          ],
        },
      ],
    });
  });

  it('renders radar chart header and toggle buttons', () => {
    render(<AngleRadarChart />);
    expect(screen.getByText('Biomechanical Angle Radar')).toBeInTheDocument();
    expect(screen.getByText('Macro Balance')).toBeInTheDocument();
    expect(screen.getByText('Micro Angles')).toBeInTheDocument();
  });

  it('toggles between macro balance and micro angle views', () => {
    render(<AngleRadarChart />);
    const microBtn = screen.getByText('Micro Angles');
    fireEvent.click(microBtn);

    // Micro angles filter buttons should appear (Chest, Back, Shoulders, Legs, Arms, Core)
    expect(screen.getByRole('button', { name: 'Chest' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Shoulders' })).toBeInTheDocument();
  });

  it('detects and flags neglected angles with warning badge and exercise recommendations', () => {
    render(<AngleRadarChart />);
    const microBtn = screen.getByText('Micro Angles');
    fireEvent.click(microBtn);

    // In Chest, lower_chest and inner_chest have 0 sets in 14d, so they should be flagged as neglected
    const underTrainedBadges = screen.getAllByText(/Under-Trained/i);
    expect(underTrainedBadges.length).toBeGreaterThan(0);

    // Prescription recommendations should be shown
    expect(screen.getAllByText(/Prescription:/i).length).toBeGreaterThan(0);
  });
});
