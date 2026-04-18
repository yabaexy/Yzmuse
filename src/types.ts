/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MuseStats {
  charm: number;
  talent: number;
  fanbase: number;
}

export type MissionType = 'daily' | 'weekly' | 'achievement';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  rewardYMP: number;
  requirement: number;
  currentProgress: number;
  isCompleted: boolean;
}

export interface Skin {
  id: string;
  name: string;
  category: 'Casual' | 'School' | 'Idol' | 'Summer' | 'Special';
  image: string;
  unlockLevel: number;
}

export interface UserState {
  museName: string;
  level: number;
  exp: number;
  stats: MuseStats;
  ymp: number; // Currency
  ownedSkins: string[];
  activeSkinId: string;
  missions: Mission[];
}
