/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Star, 
  Users, 
  TrendingUp, 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Shirt, 
  Camera, 
  Settings,
  ChevronRight,
  HandHeart,
  Store,
  Sparkles,
  Wallet,
  ExternalLink,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { ethers } from 'ethers';
import { UserState, Mission, Skin, MissionType } from './types';
import { INITIAL_STATS, SKINS, INITIAL_MISSIONS } from './constants';

const WYDA_CONTRACT_ADDRESS = '0xd84b7e8b295d9fa9656527ac33bf4f683ae7d2c4';
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
];

export default function App() {
  const [user, setUser] = useState<UserState>({
    museName: 'Yada',
    level: 1,
    exp: 0,
    stats: INITIAL_STATS,
    wydaBalance: '0',
    walletAddress: null,
    ownedSkins: ['casual_1'],
    activeSkinId: 'casual_1',
    missions: INITIAL_MISSIONS,
  });

  const [activeTab, setActiveTab] = useState<'main' | 'missions' | 'wardrobe'>('main');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // MetaMask Logic
  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setErrorMessage('MetaMask is not installed. Please install it to continue.');
      return;
    }

    try {
      setIsConnecting(true);
      setErrorMessage(null);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];

      setUser(prev => ({ ...prev, walletAddress: address }));
      await updateWydaBalance(address);
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      setErrorMessage(error.message || 'Failed to connect wallet.');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = () => {
    setUser(prev => ({ ...prev, walletAddress: null, wydaBalance: '0' }));
  };

  const updateWydaBalance = async (address: string) => {
    if (!address || typeof window.ethereum === 'undefined') return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(WYDA_CONTRACT_ADDRESS, ERC20_ABI, provider);
      
      const balance = await contract.balanceOf(address);
      const decimals = await contract.decimals();
      
      const formattedBalance = ethers.formatUnits(balance, decimals);
      setUser(prev => ({ ...prev, wydaBalance: formattedBalance }));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setUser(prev => ({ ...prev, walletAddress: accounts[0] }));
        updateWydaBalance(accounts[0]);
      }
    };

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined' && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Derived properties
  const currentSkin = useMemo(() => 
    SKINS.find(s => s.id === user.activeSkinId) || SKINS[0], 
    [user.activeSkinId]
  );

  const expToNextLevel = useMemo(() => user.level * 1000, [user.level]);
  const progressPercent = useMemo(() => (user.exp / expToNextLevel) * 100, [user.exp, expToNextLevel]);

  const characterStyles = useMemo(() => {
    if (user.level <= 30) return { scale: 0.8, mood: 'Adorable Child' };
    if (user.level <= 50) return { scale: 0.9, mood: 'Bright Teen' };
    return { scale: 1.0, mood: 'Rising Star' };
  }, [user.level]);

  // Actions
  const handleRename = () => {
    const newName = prompt('Enter your Muse\'s name:', user.museName);
    if (newName && newName.trim()) {
      setUser(prev => ({ ...prev, museName: newName.trim() }));
    }
  };

  const handleSimulateAction = (type: 'donation' | 'visit' | 'recurring') => {
    setUser(prev => {
      const newMissions = prev.missions.map(m => {
        if (m.isCompleted) return m;
        
        if (type === 'donation') {
          if (m.id === 'daily_1') return { ...m, currentProgress: Math.min(m.requirement, m.currentProgress + 1) };
          if (m.id === 'daily_2') return { ...m, currentProgress: Math.min(m.requirement, m.currentProgress + 25) };
          if (m.id === 'weekly_1') return { ...m, currentProgress: Math.min(m.requirement, m.currentProgress + 100) };
          if (m.id === 'weekly_2') return { ...m, currentProgress: Math.min(m.requirement, m.currentProgress + 1) };
          if (m.id === 'achieve_1') return { ...m, currentProgress: Math.min(m.requirement, m.currentProgress + 100) };
        }
        
        if (type === 'visit' && m.id === 'daily_3') {
          return { ...m, currentProgress: Math.min(m.requirement, m.currentProgress + 1) };
        }

        if (type === 'recurring' && m.id === 'daily_4') {
          return { ...m, currentProgress: 1 };
        }

        return m;
      });

      return { ...prev, missions: newMissions };
    });
  };

  const handleCompleteMission = (missionId: string) => {
    const mission = user.missions.find(m => m.id === missionId);
    if (!mission || mission.isCompleted) return;

    if (mission.currentProgress < mission.requirement) return;

    setUser(prev => ({
      ...prev,
      exp: prev.exp + (mission.rewardWYDA / 2),
      missions: prev.missions.map(m => m.id === missionId ? { ...m, isCompleted: true } : m),
      ownedSkins: mission.type !== 'daily' ? [...Array.from(new Set([...prev.ownedSkins, SKINS[Math.floor(Math.random() * SKINS.length)].id]))] : prev.ownedSkins
    }));
  };

  const handleApplySkin = (skinId: string) => {
    if (!user.ownedSkins.includes(skinId)) return;
    setUser(prev => ({ ...prev, activeSkinId: skinId }));
  };

  useEffect(() => {
    setUser(prev => ({
      ...prev,
      missions: prev.missions.map(m => {
        if (m.id === 'achieve_2') {
          return { ...m, currentProgress: prev.level };
        }
        return m;
      })
    }));
  }, [user.level]);

  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    if (user.exp >= expToNextLevel && user.level < 100) {
      setUser(prev => ({
        ...prev,
        level: prev.level + 1,
        exp: prev.exp - expToNextLevel,
        stats: {
          charm: prev.stats.charm + 2,
          talent: prev.stats.talent + 2,
          fanbase: prev.stats.fanbase + 3,
        }
      }));
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  }, [user.exp, expToNextLevel, user.level]);

  return (
    <div className="min-h-screen bg-muse-bg overflow-x-hidden pb-24 selection:bg-muse-pink/30 font-sans">
      <AnimatePresence>
        {showLevelUp && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-[4rem] shadow-[0_0_100px_rgba(255,105,180,0.4)] border-4 border-muse-pink flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-muse-pink rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                <Trophy size={48} />
              </div>
              <h2 className="text-4xl text-muse-pink">LEVEL UP!</h2>
              <p className="text-xl font-bold">Now Level {user.level}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs font-bold text-muse-pink uppercase tracking-widest">+2 Charm</span>
                <span className="text-xs font-bold text-muse-purple uppercase tracking-widest">+2 Talent</span>
                <span className="text-xs font-bold text-muse-blue uppercase tracking-widest">+3k Fans</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Simulation Overlay (For Prototype Testing) */}
      <div className="fixed top-24 right-4 z-[60] flex flex-col gap-2 scale-75 origin-top-right">
        <button 
          onClick={() => handleSimulateAction('donation')}
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-muse-pink/20 hover:bg-muse-pink hover:text-white transition-all group"
          title="Simulate WYDA Donation"
        >
          <HandHeart size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        <button 
          onClick={() => handleSimulateAction('visit')}
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-muse-blue/20 hover:bg-muse-blue hover:text-white transition-all group"
          title="Simulate Visit"
        >
          <Users size={20} className="group-hover:scale-110 transition-transform" />
        </button>
        {user.walletAddress && (
          <button 
            onClick={() => updateWydaBalance(user.walletAddress!)}
            className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-muse-purple/20 hover:bg-muse-purple hover:text-white transition-all group"
            title="Refresh WYDA Balance"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        )}
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-white/40 backdrop-blur-lg border-b border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muse-pink flex items-center justify-center text-white shadow-lg overflow-hidden">
             <img src="/muse_lv1_default.png" alt="logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg leading-none text-muse-pink font-display">Yabamate Muse</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 underline decoration-muse-pink">Web3 Muse Growth</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.walletAddress ? (
            <div className="flex items-center gap-4 bg-white/60 px-4 py-2 rounded-2xl shadow-sm border border-white/40">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">WYDA Balance</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-muse-yellow rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/50">
                    W
                  </div>
                  <span className="font-display font-bold text-sm text-gray-700">{parseFloat(user.wydaBalance).toFixed(2)}</span>
                </div>
              </div>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex flex-col items-start group relative">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Account</span>
                <span className="font-display font-bold text-sm text-muse-purple">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
                <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <div className="bg-white shadow-xl rounded-xl p-2 border border-gray-100 flex flex-col gap-1 min-w-[120px]">
                        <button 
                          onClick={disconnectWallet}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg text-xs text-red-500 w-full text-left"
                        >
                            <LogOut size={12} /> Disconnect
                        </button>
                    </div>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-muse-pink px-4 py-2 rounded-2xl shadow-md text-white font-display font-bold text-sm transform active:scale-95 transition-all hover:brightness-105 disabled:bg-gray-300"
            >
              <Wallet size={16} />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm flex items-center gap-3"
            >
                <div className="w-2 h-2 rounded-full bg-red-400" />
                {errorMessage}
            </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              {/* Character Stage */}
              <div className="relative aspect-[3/4] w-full max-w-sm mx-auto group">
                {/* Background Aura */}
                <div className="absolute inset-0 bg-gradient-to-t from-muse-pink/20 to-transparent rounded-full blur-3xl" />
                
                {/* Character Image */}
                <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden rounded-[3rem] border-4 border-white shadow-2xl bg-white/50">
                  <motion.img 
                    animate={{ scale: characterStyles.scale }}
                    src={currentSkin.image} 
                    alt={user.museName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay Labels */}
                  <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-muse-pink shadow-sm">
                      {characterStyles.mood}
                    </span>
                    <span className="bg-muse-pink/90 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg">
                      {currentSkin.name}
                    </span>
                  </div>

                  <button className="absolute bottom-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-muse-pink shadow-lg hover:bg-muse-pink hover:text-white transition-all transform active:scale-90">
                    <Camera size={20} />
                  </button>
                </div>

                {/* Sparkling particles representation */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-4 z-0 pointer-events-none"
                >
                  <Sparkles className="absolute top-0 left-1/2 text-muse-yellow/40" size={24} />
                  <Sparkles className="absolute bottom-0 left-1/4 text-muse-pink/40" size={16} />
                  <Sparkles className="absolute right-0 top-1/3 text-muse-blue/40" size={20} />
                </motion.div>
              </div>

              {/* Muse Info Card */}
              <div className="glass-panel text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-muse-pink" />
                <div className="flex items-center justify-center gap-2 group">
                  <h2 className="text-3xl mb-1">{user.museName}</h2>
                  <button 
                    onClick={handleRename}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-muse-pink"
                  >
                    <Settings size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm font-medium mb-6">
                  <span className="uppercase tracking-widest text-[10px] font-bold">Dreamer Rank</span>
                  <div className="h-1 w-1 rounded-full bg-gray-300" />
                  <span className="flex items-center gap-1">Lv.{user.level} <ChevronRight size={10} className="text-gray-300" /> Lv.{user.level + 1}</span>
                </div>

                <div className="space-y-2 mb-8">
                  <div className="flex justify-between text-[11px] font-bold uppercase text-gray-400 px-1">
                    <span>Experience to Growth</span>
                    <span>{Math.floor(progressPercent)}%</span>
                  </div>
                  <div className="progress-bar-container bg-gray-100 h-3">
                    <motion.div 
                      className="progress-bar-fill shadow-[0_0_10px_rgba(255,105,180,0.3)] bg-gradient-to-r from-muse-pink to-muse-purple" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-muse-pink/5 border border-muse-pink/10 transition-colors hover:bg-muse-pink/10">
                    <Heart className="text-muse-pink mb-2" size={18} />
                    <span className="text-[10px] font-bold uppercase text-gray-500 mb-1">Charm</span>
                    <span className="font-display font-bold text-xl">{user.stats.charm}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-muse-purple/5 border border-muse-purple/10 transition-colors hover:bg-muse-purple/10">
                    <Star className="text-muse-purple mb-2" size={18} />
                    <span className="text-[10px] font-bold uppercase text-gray-500 mb-1">Talent</span>
                    <span className="font-display font-bold text-xl">{user.stats.talent}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-muse-blue/5 border border-muse-blue/10 transition-colors hover:bg-muse-blue/10">
                    <Users className="text-muse-blue mb-2" size={18} />
                    <span className="text-[10px] font-bold uppercase text-gray-500 mb-1">Fans</span>
                    <span className="font-display font-bold text-xl">{user.stats.fanbase}k</span>
                  </div>
                </div>
              </div>

              {/* Action Quick Links */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab('missions')}
                  className="flex items-center gap-4 p-5 glass-panel hover:bg-white transition-all active:scale-95 text-left group"
                >
                  <div className="bg-muse-yellow/20 p-3 rounded-xl group-hover:bg-muse-yellow/30 transition-colors">
                    <Trophy className="text-muse-yellow" size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Quest Board</h3>
                    <p className="text-[11px] text-gray-500 font-medium">Earn Growth Rewards</p>
                  </div>
                </button>
                <button 
                  onClick={() => setActiveTab('wardrobe')}
                  className="flex items-center gap-4 p-5 glass-panel hover:bg-white transition-all active:scale-95 text-left group"
                >
                  <div className="bg-muse-purple/20 p-3 rounded-xl group-hover:bg-muse-purple/30 transition-colors">
                    <Shirt className="text-muse-purple" size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">The Wardrobe</h3>
                    <p className="text-[11px] text-gray-500 font-medium">Change Muse Outfits</p>
                  </div>
                </button>
              </div>

              {/* BSC Contract Quick Link */}
              <div className="p-4 bg-gray-900 rounded-2xl flex items-center justify-between text-white shadow-lg overflow-hidden relative">
                  <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-muse-purple/20 to-transparent" />
                  <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <ExternalLink size={18} className="text-muse-pink-light" />
                      </div>
                      <div>
                          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">WYDA Token BSC</p>
                          <p className="text-xs font-mono text-muse-pink-light">0xd8...d2c4</p>
                      </div>
                  </div>
                  <a 
                    href={`https://bscscan.com/token/${WYDA_CONTRACT_ADDRESS}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors relative z-10"
                  >
                      <ChevronRight size={16} />
                  </a>
              </div>
            </motion.div>
          )}

          {activeTab === 'missions' && (
            <motion.div 
              key="missions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl">Quest Board</h2>
                <div className="status-badge bg-muse-pink/10 text-muse-pink px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-muse-pink/20">
                  Updated Daily
                </div>
              </div>

              {/* Mission Categories */}
              {['daily', 'weekly', 'achievement'].map((type) => (
                <div key={type} className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <div className={`w-1 h-3 rounded-full ${type === 'daily' ? 'bg-muse-blue' : type === 'weekly' ? 'bg-muse-purple' : 'bg-muse-yellow'}`} />
                    <h3 className="text-xs uppercase font-black tracking-widest text-gray-400">{type} Missions</h3>
                  </div>

                  <div className="space-y-3">
                    {user.missions.filter(m => m.type === type).map((mission) => (
                      <div 
                        key={mission.id}
                        className={`p-4 glass-panel border-l-4 ${mission.isCompleted ? 'border-l-green-400 bg-green-50/20' : 'border-l-gray-300'} flex items-center justify-between gap-4 transition-all duration-300`}
                      >
                        <div className="flex-1">
                          <h4 className="text-sm font-bold mb-0.5">{mission.title}</h4>
                          <p className="text-[11px] text-gray-500 mb-3 font-medium line-clamp-1">{mission.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-gray-100 flex items-center gap-1 shadow-sm text-muse-pink">
                              <span className="text-muse-yellow">W</span> {mission.rewardWYDA} Reward
                            </span>
                            <div className="flex-1 max-w-[100px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${mission.isCompleted ? 'bg-green-400' : 'bg-muse-blue'}`}
                                style={{ width: `${mission.isCompleted ? 100 : (mission.currentProgress / mission.requirement) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleCompleteMission(mission.id)}
                          disabled={mission.isCompleted || mission.currentProgress < mission.requirement}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            mission.isCompleted 
                            ? 'bg-green-100 text-green-500 border border-green-200' 
                            : (mission.currentProgress >= mission.requirement)
                                ? 'bg-muse-pink text-white shadow-lg active:scale-90 hover:brightness-110'
                                : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {mission.isCompleted ? <CheckCircle2 size={24} /> : <TrendingUp size={24} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'wardrobe' && (
            <motion.div 
              key="wardrobe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl">The Wardrobe</h2>
                <div className="text-[10px] bg-white border border-gray-100 p-2 rounded-xl shadow-sm font-bold uppercase tracking-wider text-gray-500">
                  {user.ownedSkins.length} / {SKINS.length} Collections
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-8">
                {SKINS.map((skin) => {
                  const isLocked = user.level < skin.unlockLevel;
                  const isActive = user.activeSkinId === skin.id;

                  return (
                    <div 
                      key={skin.id}
                      className={`relative aspect-[3/4] rounded-3xl overflow-hidden border-2 transition-all duration-300 ${
                        isActive ? 'border-muse-pink ring-4 ring-muse-pink/20 shadow-2xl' : 'border-white'
                      }`}
                    >
                      <img 
                        src={skin.image} 
                        alt={skin.name}
                        className={`w-full h-full object-cover transition-all duration-500 ${isLocked ? 'blur-md grayscale scale-110' : 'hover:scale-105'}`}
                        referrerPolicy="no-referrer"
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                      <div className="absolute bottom-4 left-4 right-4 z-10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muse-pink-light mb-0.5">
                          {skin.category}
                        </p>
                        <h4 className="text-white text-sm mb-2 font-bold line-clamp-1">{skin.name}</h4>
                        
                        {isLocked ? (
                          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md rounded-lg p-2 border border-white/10">
                            <Settings size={12} className="text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Unlock at Lv.{skin.unlockLevel}</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleApplySkin(skin.id)}
                            className={`w-full py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                              isActive 
                              ? 'bg-muse-pink text-white shadow-inner' 
                              : 'bg-white text-gray-900 hover:bg-muse-pink hover:text-white shadow-lg'
                            }`}
                          >
                            {isActive ? 'Current Outfit' : 'Equip Outfit'}
                          </button>
                        )}
                      </div>

                      {isLocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                          <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white border border-white/30">
                            <Settings size={20} className="animate-spin-slow" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-gray-100 px-8 flex items-center justify-between pb-4">
        <button 
          onClick={() => setActiveTab('main')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'main' ? 'text-muse-pink' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'main' ? 'bg-muse-pink/10' : 'hover:bg-gray-50'}`}>
            <Sparkles size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">My Muse</span>
        </button>

        <button 
          onClick={() => setActiveTab('missions')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'missions' ? 'text-muse-pink' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'missions' ? 'bg-muse-pink/10' : 'hover:bg-gray-50'}`}>
            <Calendar size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Growth Quests</span>
        </button>

        <button 
          onClick={() => setActiveTab('wardrobe')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'wardrobe' ? 'text-muse-pink' : 'text-gray-400'}`}
        >
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'wardrobe' ? 'bg-muse-pink/10' : 'hover:bg-gray-50'}`}>
            <Shirt size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Collection</span>
        </button>

        <button 
          className="flex flex-col items-center gap-1 text-gray-400 opacity-50 cursor-not-allowed"
        >
          <div className="p-2">
            <HandHeart size={24} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Yabamate</span>
        </button>
      </nav>
    </div>
  );
}
