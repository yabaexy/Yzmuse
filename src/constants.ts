/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mission, Skin } from './types';

export const INITIAL_STATS = {
  charm: 10,
  talent: 10,
  fanbase: 10,
};

export const SKINS: Skin[] = [
  { id: 'casual_1', name: 'Basic Casual', category: 'Casual', image: '/muse_lv1_default.png', unlockLevel: 1 },
  { id: 'casual_2', name: 'Morning Walk', category: 'Casual', image: 'https://picsum.photos/seed/muse_casual2/600/800', unlockLevel: 5 },
  { id: 'school_1', name: 'Academy Uniform', category: 'School', image: 'https://picsum.photos/seed/muse_school1/600/800', unlockLevel: 10 },
  { id: 'school_2', name: 'After School', category: 'School', image: 'https://picsum.photos/seed/muse_school2/600/800', unlockLevel: 15 },
  { id: 'idol_1', name: 'Dreamy Stage', category: 'Idol', image: 'https://picsum.photos/seed/muse_idol1/600/800', unlockLevel: 25 },
  { id: 'idol_2', name: 'Starry Night', category: 'Idol', image: 'https://picsum.photos/seed/muse_idol2/600/800', unlockLevel: 40 },
  { id: 'summer_1', name: 'Tropical Peach', category: 'Summer', image: 'https://picsum.photos/seed/muse_summer1/600/800', unlockLevel: 50 },
  { id: 'summer_2', name: 'Sun & Surf', category: 'Summer', image: 'https://picsum.photos/seed/muse_summer2/600/800', unlockLevel: 65 },
  { id: 'special_1', name: 'Celestial Deity', category: 'Special', image: 'https://picsum.photos/seed/muse_special1/600/800', unlockLevel: 80 },
  { id: 'special_2', name: 'Infinite Muse', category: 'Special', image: 'https://picsum.photos/seed/muse_special2/600/800', unlockLevel: 100 },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'daily_1',
    type: 'daily',
    title: 'Daily Support (3x)',
    description: 'Support any creator on Yabamate 3 times.',
    rewardWYDA: 450,
    requirement: 3,
    currentProgress: 0,
    isCompleted: false,
  },
  {
    id: 'daily_2',
    type: 'daily',
    title: 'Generous Supporter',
    description: 'Total support amount reaches 250 WYDA.',
    rewardWYDA: 650,
    requirement: 250,
    currentProgress: 0,
    isCompleted: false,
  },
  {
    id: 'daily_3',
    type: 'daily',
    title: 'Muse Community',
    description: 'Visit 5 other Muse pages and cheer.',
    rewardWYDA: 350,
    requirement: 5,
    currentProgress: 0,
    isCompleted: false,
  },
  {
    id: 'daily_4',
    type: 'daily',
    title: 'Recurring Loyalty',
    description: 'Maintain your recurring support settings.',
    rewardWYDA: 900,
    requirement: 1,
    currentProgress: 0,
    isCompleted: false,
  },
  {
    id: 'weekly_1',
    type: 'weekly',
    title: 'Weekly MVP',
    description: 'Total weekly support exceeds 1,800 WYDA.',
    rewardWYDA: 9000,
    requirement: 1800,
    currentProgress: 0,
    isCompleted: false,
  },
  {
    id: 'weekly_2',
    type: 'weekly',
    title: 'Spreading Love',
    description: 'Support 10 or more different creators.',
    rewardWYDA: 7500,
    requirement: 10,
    currentProgress: 0,
    isCompleted: false,
  },
  {
    id: 'achieve_1',
    type: 'achievement',
    title: 'Supporter Legend',
    description: 'Cumulative lifetime support of 5,000 WYDA.',
    rewardWYDA: 15000,
    requirement: 5000,
    currentProgress: 0,
    isCompleted: false,
  },
  {
    id: 'achieve_2',
    type: 'achievement',
    title: 'Rising Star',
    description: 'Reach Muse Level 50.',
    rewardWYDA: 10000,
    requirement: 50,
    currentProgress: 1,
    isCompleted: false,
  }
];
