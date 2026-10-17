import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkoutReceiptModal from './WorkoutReceiptModal';

describe('WorkoutReceiptModal Component (Requirement 2)', () => {
  const mockSession = {
    id: 'tx_12345678',
    programName: 'Push Day Overload',
    date: '2026-10-17',
    startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
    finishedAt: new Date().toISOString(),
    exercises: [
      {
        exerciseId: 'chest_bb_flat_bench',
        sets: [
          { weight: 100, reps: 10 },
          { weight: 110, reps: 8 },
        ],
      },
      {
        exerciseId: 'chest_db_incline_press',
        sets: [
          { weight: 40, reps: 10 },
        ],
      },
    ],
  };

  const mockPreviousPRs = {
    chest_bb_flat_bench: 105, // 110 was hit today -> NEW PR!
    chest_db_incline_press: 45, // 40 was hit -> Not a PR
  };

  it('renders Cyberpunk Workout Receipt with volume, sets, reps, and title', () => {
    const onClose = vi.fn();
    render(
      <WorkoutReceiptModal
        isOpen={true}
        session={mockSession}
        previousPRs={mockPreviousPRs}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Push Day Overload')).toBeInTheDocument();
    expect(screen.getByText('Cyber Receipt')).toBeInTheDocument();
    // Total Volume: 100*10 + 110*8 + 40*10 = 1000 + 880 + 400 = 2,280 kg
    expect(screen.getByText('2,280')).toBeInTheDocument();
    // Total Sets: 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('highlights broken PRs with amber badge and diff', () => {
    render(
      <WorkoutReceiptModal
        isOpen={true}
        session={mockSession}
        previousPRs={mockPreviousPRs}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/New PRs Broken Today/i)).toBeInTheDocument();
    // 110 kg with +5 kg diff
    expect(screen.getByText(/110 kg/)).toBeInTheDocument();
    expect(screen.getByText(/\(\+5\.0\)/)).toBeInTheDocument();
  });

  it('displays angles hit in the session', () => {
    render(
      <WorkoutReceiptModal
        isOpen={true}
        session={mockSession}
        previousPRs={mockPreviousPRs}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Angles Hit This Session')).toBeInTheDocument();
    // Mid Chest and Upper Chest should be listed
    expect(screen.getByText('Mid Chest')).toBeInTheDocument();
    expect(screen.getByText('Upper Chest')).toBeInTheDocument();
  });

  it('calls onClose when Done button is clicked', () => {
    const onClose = vi.fn();
    render(
      <WorkoutReceiptModal
        isOpen={true}
        session={mockSession}
        previousPRs={mockPreviousPRs}
        onClose={onClose}
      />
    );

    const doneBtn = screen.getByRole('button', { name: /Done & Return to Dashboard/i });
    fireEvent.click(doneBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
