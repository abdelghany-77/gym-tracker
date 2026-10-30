import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AngleCoverageBadge from './AngleCoverageBadge';
import { exercisesDatabase } from '../data/exercises';

describe('AngleCoverageBadge Component (Requirement 1)', () => {
  const exMap = new Map(exercisesDatabase.map((e) => [e.id, e]));

  it('renders amber warning chip when critical angle is missing', () => {
    // Missing lower lats (unilateral_row)
    const routine = [
      exMap.get('back_wide_lat_pulldown'),
      exMap.get('back_bb_bent_over_row'),
      exMap.get('back_straight_arm_pulldown'),
      exMap.get('back_face_pulls'),
    ];

    render(<AngleCoverageBadge exercises={routine} programContext="back_day" />);

    // Should indicate missing angle
    expect(screen.getByText(/Missing:/i)).toBeInTheDocument();
    expect(screen.getByText(/Unilateral Row/i)).toBeInTheDocument();
    // Should render suggested exercise
    expect(screen.getByText(/Suggested:/i)).toBeInTheDocument();
  });

  it('triggers onSelectSuggestion callback when user clicks suggested exercise', () => {
    const routine = [
      exMap.get('back_wide_lat_pulldown'),
      exMap.get('back_bb_bent_over_row'),
      exMap.get('back_straight_arm_pulldown'),
      exMap.get('back_face_pulls'),
    ];
    const onSelect = vi.fn();

    render(
      <AngleCoverageBadge
        exercises={routine}
        programContext="back_day"
        onSelectSuggestion={onSelect}
      />
    );

    const suggestBtn = screen.getByText(/Suggested:/i).closest('button');
    expect(suggestBtn).toBeInTheDocument();
    fireEvent.click(suggestBtn);

    expect(onSelect).toHaveBeenCalledWith(
      'unilateral_row',
      expect.objectContaining({ id: 'back_db_single_arm_row' })
    );
  });

  it('renders green 100% coverage badge when all angles are covered', () => {
    const completeRoutine = [
      exMap.get('back_wide_lat_pulldown'),
      exMap.get('back_bb_bent_over_row'),
      exMap.get('back_db_single_arm_row'),
      exMap.get('back_straight_arm_pulldown'),
      exMap.get('back_face_pulls'),
    ];

    render(<AngleCoverageBadge exercises={completeRoutine} programContext="back_day" />);

    expect(screen.getByText(/100% Angle Coverage/i)).toBeInTheDocument();
  });
});
