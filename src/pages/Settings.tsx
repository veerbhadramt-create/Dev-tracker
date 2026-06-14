import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Sparkles, X, Plus, Save, LogOut, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export const Settings: React.FC = () => {
  const { profile, updateProfile, signOut } = useAuth();

  // Profile Form state
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [githubUsername, setGithubUsername] = useState(profile?.githubUsername || '');
  const [isPublic, setIsPublic] = useState(profile?.isPublic ?? true);
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  // Upgrade state
  const [upgrading, setUpgrading] = useState(false);

  // Photo Crop states
  const [uploadingImageSrc, setUploadingImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [showCropModal, setShowCropModal] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (base64Url) {
          setUploadingImageSrc(base64Url);
          setZoom(1);
          setOffsetX(0);
          setOffsetY(0);
          setShowCropModal(true);
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCrop = () => {
    if (!uploadingImageSrc) return;
    
    const img = new Image();
    img.src = uploadingImageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 160, 160);
        
        // Fill white background for safety
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 160, 160);
        
        const scaleWidth = 160 / img.width;
        const scaleHeight = 160 / img.height;
        const fitScale = Math.max(scaleWidth, scaleHeight);
        
        const renderWidth = img.width * fitScale;
        const renderHeight = img.height * fitScale;
        
        ctx.save();
        
        // Center on canvas
        ctx.translate(80, 80);
        
        // Apply slider translation offsets
        ctx.translate(offsetX, offsetY);
        
        // Apply Zoom scale
        ctx.scale(zoom, zoom);
        
        // Draw image centered at origin
        ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
        
        ctx.restore();
        
        try {
          const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(croppedDataUrl);
          setShowCropModal(false);
          setUploadingImageSrc(null);
          toast.success('Photo adjusted and applied! Click Save Settings at the bottom to save.');
        } catch (err) {
          console.error(err);
          toast.error('Failed to process photo crop');
        }
      }
    };
    img.onerror = () => {
      toast.error('Failed to load image element');
    };
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (skills.map(s => s.toLowerCase()).includes(newSkill.trim().toLowerCase())) {
      toast.error('Skill already exists');
      return;
    }
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !username.trim()) {
      toast.error('Display Name and Username are required');
      return;
    }

    try {
      await updateProfile({
        displayName,
        username,
        bio,
        avatarUrl,
        githubUsername,
        isPublic,
        skills
      });
    } catch (err: any) {
      toast.error('Update failed: ' + err.message);
    }
  };

  const handleSimulateUpgrade = async () => {
    setUpgrading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      await updateProfile({ plan: 'pro' });
      toast.success('Successfully upgraded to Pro!');
    } catch (err: any) {
      toast.error('Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const handleSimulateDowngrade = async () => {
    try {
      await updateProfile({ plan: 'free' });
      toast.success('Simulated plan reset to Free');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Update your public credentials and career preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Details Form */}
        <div className="glass-card p-6">
          <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-primary" /> Profile Settings
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {/* Display name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Display Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="Your Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Username
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            {/* Photo Upload & GitHub Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-secondary/5 rounded-xl border border-border/25">
              {/* Profile Photo Upload Field */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Profile Photo (URL or Drag & Drop)
                </label>
                <div className="flex items-center gap-4">
                  {/* Photo Preview */}
                  <img 
                    src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"}
                    alt="Profile Avatar"
                    className="w-16 h-16 rounded-full object-cover border border-primary/20 shrink-0 bg-background"
                  />
                  
                  {/* Drag and Drop Upload Area */}
                  <div className="relative flex-1 border border-dashed border-border/40 hover:border-primary/50 transition-all rounded-lg p-2.5 text-center bg-background/50 cursor-pointer flex flex-col items-center justify-center min-h-[64px]">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <UploadCloud className="w-4 h-4 text-muted-foreground mb-0.5" />
                    <span className="text-[11px] font-semibold text-foreground/80">Upload Photo File</span>
                    <span className="text-[9px] text-muted-foreground">Drag & drop or click</span>
                  </div>
                </div>
                {/* Fallback image URL input */}
                <input 
                  type="url" 
                  placeholder="Or paste image URL..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-background border border-border/40 text-foreground text-xs rounded-lg px-3 py-2 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                />
              </div>

              {/* GitHub Username Field */}
              <div className="flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    GitHub Username
                  </label>
                  <input 
                    type="text" 
                    placeholder="username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 md:mt-0 leading-tight">
                  Adding your GitHub username synchronizes your commits, pull requests, and activity directly to the GitHub Activity visualizer board.
                </p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Bio Description
              </label>
              <textarea 
                rows={3}
                placeholder="Share your goals and technology focuses..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none resize-none"
              />
            </div>

            {/* Skills Chips */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Technical Skills
              </label>
              
              <div className="flex gap-2 mb-3">
                <input 
                  type="text" 
                  placeholder="Add skill tag (e.g. NextJS)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-secondary hover:bg-secondary/90 text-foreground border border-border/40 p-2 rounded-lg font-semibold flex items-center justify-center shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[40px] bg-secondary/10 p-3 rounded-lg border border-border/15">
                {skills.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">No skills added. Add skills above.</span>
                ) : (
                  skills.map(skill => (
                    <span 
                      key={skill} 
                      className="text-xs font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 shrink-0"
                    >
                      {skill}
                      <button 
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Is Public Profile Toggle */}
            <div className="flex items-center gap-3 pt-2 bg-secondary/20 p-4 rounded-xl border border-border/20">
              <input 
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
              />
              <div>
                <label htmlFor="isPublic" className="font-bold text-sm text-foreground cursor-pointer block select-none">
                  Make Portfolio Profile Public
                </label>
                <span className="text-xs text-muted-foreground">Allows other developers to view your portfolio page at `/profile/{username || 'username'}`</span>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 px-6 rounded-lg text-sm shadow-md transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Pro Upgrades Block */}
        <div className="glass-card p-6 border-primary/25 bg-primary/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/15 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" /> Plan Status
          </h3>
          <p className="text-xs text-muted-foreground mb-5">
            Upgrade your plan to unlock full AI Career capabilities.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-background/60 p-4 rounded-xl border border-border/40">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Active Plan</span>
              <h4 className="text-xl font-black text-foreground capitalize mt-0.5">
                {profile?.plan === 'pro' ? 'Pro Access Tier 💎' : 'Free Tier'}
              </h4>
            </div>

            {profile?.plan === 'pro' ? (
              <button
                onClick={handleSimulateDowngrade}
                className="bg-secondary hover:bg-secondary/90 text-foreground py-2 px-4 rounded-lg text-xs font-semibold border border-border transition-all"
              >
                Reset to Free
              </button>
            ) : (
              <button
                onClick={handleSimulateUpgrade}
                disabled={upgrading}
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2 px-5 rounded-lg text-xs transition-all disabled:opacity-50"
              >
                {upgrading ? 'Connecting Stripe...' : 'Upgrade to Pro — $9/mo'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Crop Adjustment Modal */}
      <AnimatePresence>
        {showCropModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowCropModal(false);
                setUploadingImageSrc(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            {/* Modal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl p-6 shadow-2xl z-10 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border/20 pb-3">
                <h3 className="text-lg font-bold text-foreground">Adjust Profile Photo</h3>
                <button 
                  type="button"
                  onClick={() => {
                    setShowCropModal(false);
                    setUploadingImageSrc(null);
                  }}
                  className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Viewport Circle */}
              <div className="flex justify-center py-4 bg-secondary/10 rounded-xl border border-border/10">
                <div className="w-40 h-40 rounded-full overflow-hidden border-2 border-primary/50 relative bg-background/50 shadow-inner flex items-center justify-center">
                  {uploadingImageSrc && (
                    <img 
                      src={uploadingImageSrc}
                      alt="Crop View"
                      className="object-cover pointer-events-none select-none"
                      style={{
                        transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                        transformOrigin: 'center center',
                        maxWidth: 'none',
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Control Sliders */}
              <div className="space-y-4">
                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>Zoom Scale</span>
                    <span className="font-mono text-primary">{zoom.toFixed(2)}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Horizontal Position (X) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>Horizontal Slide (X)</span>
                    <span className="font-mono text-primary">{offsetX}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-150" 
                    max="150" 
                    step="1"
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Vertical Position (Y) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>Vertical Slide (Y)</span>
                    <span className="font-mono text-primary">{offsetY}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="-150" 
                    max="150" 
                    step="1"
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                {/* Center / Reset */}
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setOffsetX(0);
                      setOffsetY(0);
                    }}
                    className="text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3.5 py-1.5 rounded-lg border border-primary/20 transition-all"
                  >
                    Center & Reset offsets
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-border/20">
                <button
                  type="button"
                  onClick={() => {
                    setShowCropModal(false);
                    setUploadingImageSrc(null);
                  }}
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-foreground font-semibold py-2.5 px-4 rounded-lg text-sm border border-border/40 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="flex-1 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-2.5 px-4 rounded-lg text-sm transition-all shadow-md"
                >
                  Apply & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
